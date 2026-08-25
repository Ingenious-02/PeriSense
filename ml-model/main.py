from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

app = FastAPI(
    title="Maternal Health Risk Prediction API",
    description="Random Forest Based Model API for Perisense maternal health risk prediction",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the trained model
model_package = joblib.load("maternal_health_risk_model.joblib")

model = model_package["model"]
label_encoder = model_package["label_encoder"]


class PatientData(BaseModel):
    Age: float = Field(gt=0)
    SystolicBP: float = Field(gt=0)
    DiastolicBP: float = Field(gt=0)
    BS: float = Field(gt=0)
    BodyTemp: float = Field(gt=0)
    HeartRate: float = Field(gt=0)


@app.get("/")
def root():
    return {
        "message": "Maternal Health Risk Prediction API",
        "status": "running",
    }


@app.post("/predict")
def predict(data: PatientData):

    input_data = pd.DataFrame([{
        "Age": data.Age,
        "SystolicBP": data.SystolicBP,
        "DiastolicBP": data.DiastolicBP,
        "BS": data.BS,
        "BodyTemp": data.BodyTemp,
        "HeartRate": data.HeartRate,
    }])

    prediction = model.predict(input_data)

    risk_level = label_encoder.inverse_transform(prediction)[0]

    probabilities = model.predict_proba(input_data)[0]

    class_probabilities = dict(zip(
         label_encoder.classes_,
            probabilities
    ))

    predicted_class_index = prediction[0]
    confidence = probabilities[predicted_class_index]


    return {
        "risk_level": risk_level,
        "confidence": round(float(confidence), 4),
        "probabilities": {
            key: round(float(value), 4)
            for key, value in class_probabilities.items()
        }        
    }
