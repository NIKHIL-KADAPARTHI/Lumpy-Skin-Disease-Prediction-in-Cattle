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
import pandas as pd
from ultralytics import YOLO

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API is running."}

# Setup CORS so that your Vite + React front-end can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in production
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
        # Load the YOLOv8 model from best.pt using ultralytics YOLO API
        yolo_model = YOLO("best.pt")
    return yolo_model

def load_weather_model():
    global weather_model
    if weather_model is None:
        weather_model = joblib.load("random_forest_model_weather_data.pkl")
    return weather_model

# 2. Weather Prediction and Label Drawing Functions

def get_weather_prediction(tmp: float, vap: float, pre: float, cld: float):
    """
    Return (rf_pred, rf_proba) from the random forest model.
    rf_pred is the binary 0/1 classification,
    rf_proba is the model's probability of LSD risk (class=1).
    """
    model = load_weather_model()
    # Convert to DataFrame with feature names matching the training data
    X = pd.DataFrame([[tmp, vap, pre, cld]], columns=["tmp", "vap", "pre", "cld"])
    rf_pred = model.predict(X)[0]
    rf_proba = model.predict_proba(X)[0][1]
    return rf_pred, rf_proba

def draw_custom_label(image, box, label_text, color=(0, 255, 0)):
    """
    Draw bounding box with a multi-line label *inside* the rectangle.
    """
    (x_min, y_min, x_max, y_max) = box
    cv2.rectangle(image, (x_min, y_min), (x_max, y_max), color, 2)

    box_w = x_max - x_min
    box_h = y_max - y_min
    font_scale = max(0.3, min(0.8, (min(box_w, box_h) / 300.0)))
    font_face = cv2.FONT_HERSHEY_SIMPLEX
    thickness = 1

    lines = label_text.split("\n")
    text_x = x_min + 5
    text_y = y_min + 20

    for line in lines:
        cv2.putText(image, line, (text_x, text_y),
                    font_face, font_scale, color, thickness, cv2.LINE_AA)
        text_size, _ = cv2.getTextSize(line, font_face, font_scale, thickness)
        text_y += text_size[1] + 5

def run_inference(image_cv2, tmp, vap, pre, cld):
    # 1. Get random forest results (rf_pred, rf_proba)
    rf_pred, rf_proba = get_weather_prediction(tmp, vap, pre, cld)

    # 2. YOLO inference using YOLOv8 API
    model = load_yolo_model()
    results = model(image_cv2)
    
    # Extract bounding box data from YOLOv8 results.
    boxes_tensor = results[0].boxes.data
    if boxes_tensor is None or boxes_tensor.shape[0] == 0:
        df = pd.DataFrame()  # No detections
    else:
        # The tensor columns: [xmin, ymin, xmax, ymax, confidence, class_id]
        df = pd.DataFrame(boxes_tensor.cpu().numpy(), 
                          columns=["xmin", "ymin", "xmax", "ymax", "confidence", "class_id"])

    # If no bounding boxes => handle "no detection" case.
    if df.empty:
        if rf_pred == 1:
            label = "No LSD detection\nHigh Risk"
            text_color = (0, 0, 255)    # red
        else:
            label = "No LSD detection\nLow Risk"
            text_color = (0, 255, 0)    # green
        x_t, y_t = 20, 40
        font_face = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.7
        thickness = 2
        for line in label.split("\n"):
            cv2.putText(image_cv2, line, (x_t, y_t),
                        font_face, font_scale, text_color,
                        thickness, cv2.LINE_AA)
            text_size, _ = cv2.getTextSize(line, font_face, font_scale, thickness)
            y_t += text_size[1] + 10

        model_assessment = "no detection | high" if rf_pred == 1 else "no detection | low"
        return image_cv2, model_assessment

    # Process each detected bounding box.
    model_assessment = None
    for i, row in df.iterrows():
        x_min = int(row['xmin'])
        y_min = int(row['ymin'])
        x_max = int(row['xmax'])
        y_max = int(row['ymax'])
        yolo_conf = row['confidence']
        class_id = int(row['class_id'])
        # Get the class name using YOLOv8's names mapping.
        yolo_class = results[0].names[class_id]

        label = ""
        color = (0, 255, 0)
        # Six-case logic:
        if yolo_class.lower() == "infected":
            color = (0, 0, 255)  # red
            if rf_pred == 1:
                label = f"Infected (High)\nY={yolo_conf:.2f} R={rf_proba:.2f}"
                model_assessment = "infected | high"
            else:
                label = f"Infected (Low)\nY={yolo_conf:.2f} R={rf_proba:.2f}"
                model_assessment = "infected | low"
        else:
            if rf_pred == 1:
                color = (255, 0, 255)  # purple
                label = f"Suspected (High)\nY={yolo_conf:.2f} R={rf_proba:.2f}"
                model_assessment = "suspected | high"
            else:
                color = (0, 255, 0)    # green
                label = f"Healthy (Low)\nY={yolo_conf:.2f} R={rf_proba:.2f}"
                model_assessment = "healthy | low"

        draw_custom_label(image_cv2, (x_min, y_min, x_max, y_max), label, color=color)

    return image_cv2, model_assessment or "unknown"

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
    
    # Extract weather parameters in the order: tmp, vap, pre, cld
    tmp = weather_info["temperature"]
    vap = weather_info["vapor_pressure"]
    pre = weather_info["precipitation"]
    cld = weather_info["cloud_cover"]

    # Run the combined inference logic
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
