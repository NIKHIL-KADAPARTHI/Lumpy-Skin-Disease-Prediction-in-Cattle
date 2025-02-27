import os
import io
import base64
import cv2
import numpy as np
import torch
import joblib
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
@app.get("/")
def read_root():
    return {"message": "API is running."}
# Setup CORS so that your Vite + React front-end can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; later, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to cache loaded models
yolo_model = None
weather_model = None

# 1. Model Loading Functions
def load_yolo_model():
    global yolo_model
    if yolo_model is None:
        # This uses torch.hub to load your custom YOLOv5 model from a local directory.
        yolo_model = torch.hub.load('./yolov5', 'custom', path='best.pt', source='local', force_reload=True)
    return yolo_model

def load_weather_model():
    global weather_model
    if weather_model is None:
        weather_model = joblib.load("random_forest_model_weather_data.pkl")
    return weather_model

# 2. Helper Functions for Inference
def get_weather_risk(tmp, vap, pre, cld):
    model = load_weather_model()
    X = np.array([[tmp, vap, pre, cld]], dtype=float)
    prediction = model.predict(X)[0]
    return prediction

def decide_label(class_name, confidence, weather_risk, risk_str, lsd_conf_threshold):
    if class_name.lower() == "infected":
        if confidence >= lsd_conf_threshold:
            label_text = "LSD Confirmed"
        else:
            label_text = "LSD Suspected" if weather_risk == 1 else "Healthy"
    else:
        label_text = "Healthy" if confidence >= lsd_conf_threshold else ("LSD Suspected" if weather_risk == 1 else "Healthy")
    label_text += f" | Weather: {risk_str}"
    if confidence < lsd_conf_threshold:
        label_text += f" (conf: {confidence:.2f})"
    return label_text

def annotate_image_cv2(img_cv2, weather_risk, risk_str, yolo_conf_threshold=0.25, lsd_conf_threshold=0.6):
    model = load_yolo_model()
    model.conf = yolo_conf_threshold
    results = model(img_cv2)
    detections = results.xyxy[0].cpu().numpy()
    if len(detections) == 0:
        fallback_label = "No Visual Detection: " + ("LSD Suspected" if weather_risk == 1 else "Likely Healthy")
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(img_cv2, fallback_label, (10, 30), font, 0.7, (255, 255, 255), 2)
    else:
        for det in detections:
            x1, y1, x2, y2, conf, cls = det
            x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
            confidence = float(conf)
            class_idx = int(cls)
            class_name = model.names[class_idx]
            label_text = decide_label(class_name, confidence, weather_risk, risk_str, lsd_conf_threshold)
            # Choose bounding box color
            if "Confirmed" in label_text:
                color = (0, 0, 255)  # Red
            elif "Suspected" in label_text:
                color = (128, 0, 128)  # Purple
            elif "Healthy" in label_text:
                color = (0, 255, 0)  # Green
            else:
                color = (255, 255, 255)
            text_y = y1 - 5 if (y1 - 5) > 10 else y1 + 20
            cv2.rectangle(img_cv2, (x1, y1), (x2, y2), color, 2)
            cv2.putText(img_cv2, label_text, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return img_cv2

def run_inference(image_cv2, tmp, vap, pre, cld, yolo_conf_threshold=0.25, lsd_conf_threshold=0.6):
    weather_risk = get_weather_risk(tmp, vap, pre, cld)
    risk_str = "High" if weather_risk == 1 else "Low"
    annotated_img = annotate_image_cv2(image_cv2.copy(), weather_risk, risk_str, yolo_conf_threshold, lsd_conf_threshold)
    results = load_yolo_model()(image_cv2)
    detections = results.xyxy[0].cpu().numpy()
    if len(detections) == 0:
        model_assessment = "likely lsd" if weather_risk == 1 else "likely healthy"
    else:
        max_idx = int(np.argmax(detections[:, 4]))
        best_det = detections[max_idx]
        _, _, _, _, conf, cls = best_det
        confidence = float(conf)
        class_idx = int(cls)
        class_name = load_yolo_model().names[class_idx]
        label_text = decide_label(class_name, confidence, weather_risk, risk_str, lsd_conf_threshold)
        if "Confirmed" in label_text:
            model_assessment = "lsd detected"
        elif "Suspected" in label_text:
            model_assessment = "lsd suspected"
        elif "Healthy" in label_text:
            model_assessment = "healthy"
        else:
            model_assessment = label_text.lower()
    return annotated_img, model_assessment

# 3. Helper Functions for External API Calls
def get_coordinates(address: str):
    google_api_key = os.getenv("VITE_GOOGLE_MAPS_API_KEY")
    geocoding_url = f"https://maps.gomaps.pro/maps/api/geocode/json?address={address}&key={google_api_key}"
    response = requests.get(geocoding_url).json()
    if response.get("status") == "OK":
        location = response["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]
    else:
        raise HTTPException(status_code=400, detail="Failed to get coordinates")


def get_weather(lat: float, lon: float):
    weather_api_key = os.getenv("VITE_WEATHER_API_KEY")
    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_api_key}&units=metric"
    response = requests.get(weather_url).json()
    if response.get("cod") == 200:
        return {
            "temperature": response["main"]["temp"],
            "humidity": response["main"]["humidity"],
            "precipitation": response.get("rain", {}).get("1h", 0),
            "cloud_cover": response["clouds"]["all"],
            "vapor_pressure": response["main"].get("pressure", 1013)
        }
    else:
        raise HTTPException(status_code=400, detail="Failed to fetch weather data")

# 4. Define the /predict Endpoint
@app.post("/predict")
async def predict(
    address: str = Form(...),
    image: UploadFile = File(...)
):
    # Read the uploaded file into an OpenCV image
    contents = await image.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img_cv2 = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img_cv2 is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    try:
        # Get coordinates and weather info from the address
        lat, lon = get_coordinates(address)
        weather_info = get_weather(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Extract weather parameters
    tmp = weather_info["temperature"]
    pre = weather_info["precipitation"]
    cld = weather_info["cloud_cover"]
    vap = weather_info["vapor_pressure"]

    # Run the inference combining image and weather data
    annotated_img, model_assessment = run_inference(img_cv2, tmp, vap, pre, cld)
    
    # Convert the annotated image to a base64 string to send over HTTP
    _, buffer = cv2.imencode('.jpg', annotated_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return {
        "assessment": model_assessment,
        "annotated_image": img_base64
    }

# Run the API with uvicorn when this script is executed directly
if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
