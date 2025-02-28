# FarmFriend

FarmFriend is a comprehensive web application designed for cattle health monitoring and LSD (Lumpy Skin Disease) assessment. The platform integrates state-of-the-art machine learning models for image analysis and weather data processing, allowing farmers to quickly assess cattle health conditions based on uploaded images and live weather information.

## Features

- **Cattle Health Assessment:**  
  Upload a cattle image and input additional health parameters to get an AI-powered health assessment.
  
- **Weather Integration:**  
  Fetch real-time weather data based on location (using the OpenWeatherMap API and GoMaps API for geocoding) to improve the assessment accuracy.
  
- **RT-PCR Results Submission:**  
  Update historical assessments with RT-PCR results for comprehensive tracking.
  
- **User Authentication & Profile Management:**  
  Secure login, registration, and password recovery using Firebase.

- **Real-Time Database:**  
  All assessment data is stored in Firebase for easy retrieval and tracking.

## Technologies Used

- **Front-End:**  
  - React with TypeScript
  - Vite (for development/build tool)
  - Tailwind CSS for styling
  - Framer Motion for animations

- **Back-End:**  
  - FastAPI for the API
  - Uvicorn as the ASGI server
  - Python for model integration and API development

- **Machine Learning:**  
  - YOLOv5 (PyTorch) for image-based cattle health assessment  
  - RandomForestClassifier (scikit-learn) for weather-based risk analysis  
  - Models are stored in `best.pt` and `random_forest_model_weather_data.pkl`

- **Other Tools:**  
  - Firebase for authentication and real-time database
  - OpenWeatherMap API & GoMaps API for geocoding and weather data

## Project Structure
[Project Structure](structure.txt)

## Setup and Installation

### Prerequisites

- Node.js and npm installed  
- Python 3.11 (or later) with pip installed  
- Git installed  
- A Firebase account with your project configuration  
- API keys for Google Maps and OpenWeatherMap

### Steps

1. **Clone the Repository:**
   git clone https://github.com/yourusername/FarmFriend.git
   cd FarmFriend
2. **Set Up the Backend:**
  Create and activate a virtual environment:
    python -m venv venv
    venv\Scripts\activate    # On Windows
  Install Python dependencies:
    pip install -r requirements.txt
  Create a .env file in the root folder with your API keys and Firebase configuration.
3. **Set Up the Front-End:**
  Navigate to the front-end folder (if separate) or remain in the project root (if combined):
    npm install 
  Update environment variables in a .env file (e.g., VITE_GOOGLE_MAPS_API_KEY, VITE_WEATHER_API_KEY, etc.).
4. **Run the Project Locally:**
  Start the backend server:
    uvicorn api:app --reload
  Start the front-end dev server:
    npm run dev

## Deployment
  - Front-End Deployment
    - Vercel or Netlify:
    - Push your front-end code to GitHub and connect the repository to Vercel or Netlify. Follow their guides to deploy a Vite/React app.
  - Back-End Deployment
    - Render, Railway, or Heroku:
    - Push your backend (FastAPI) code to GitHub and deploy it using a free tier on one of these platforms. Use the command:
      - uvicorn api:app --host 0.0.0.0 --port $PORT
      - And set your environment variables in the service's dashboard.

## Usage
  - User Registration & Login:
    - Users can register and log in using Firebase authentication.
  - Assessment:
    - Navigate to the Dashboard, upload a cattle image, enter additional health data, and fetch weather data. The system will then process the input and provide an       assessment.
  - RT-PCR Update:
    - Use the RT-PCR section to update an assessment with laboratory test results.

## Contributing
- Contributions are welcome! Please fork the repository, make changes, and open a pull request. Make sure to follow any coding guidelines provided.

## Acknowledgments
- Ultralytics YOLOv5
-  Firebase
- OpenWeatherMap
- Vite
- React

 
