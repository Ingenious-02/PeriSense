import io
import csv
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from backend.app.schemas import (
    PatientData,
    PredictionResponse,
    EnhancedPredictionResponse,
    BatchPredictionResponse,
    BatchPredictionItem,
    ModelInfoResponse
)
from backend.app.services.ml_service import ml_service

router = APIRouter(tags=["ML Prediction"])


@router.post("/predict", response_model=PredictionResponse, summary="Core Random Forest Risk Prediction")
def predict_standard(data: PatientData):
    """
    Standard prediction endpoint conforming to the PeriSense API specification.
    Accepts maternal clinical measurements and returns predicted risk level, confidence, and probability distribution.
    """
    try:
        res = ml_service.predict(data)
        return PredictionResponse(
            risk_level=res.risk_level,
            confidence=res.confidence,
            probabilities=res.probabilities
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/api/predict", response_model=EnhancedPredictionResponse, summary="Enhanced Clinical Risk Assessment")
def predict_enhanced(
    data: PatientData,
    patient_name: Optional[str] = Query(default="Unknown Patient"),
    gestational_age: Optional[str] = Query(default="24 Weeks")
):
    """
    Enhanced prediction endpoint providing maternal risk level, probability distribution,
    clinical vital range flags, and actionable obstetric triage directives.
    """
    try:
        return ml_service.predict(data, patient_name=patient_name, gestational_age=gestational_age)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhanced inference error: {str(e)}")


@router.post("/api/batch-predict", response_model=BatchPredictionResponse, summary="Batch Maternal Risk Screening")
async def batch_predict(file: UploadFile = File(...)):
    """
    Accepts a CSV file containing columns: Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate (and optionally Name / PatientID)
    and executes batch screening.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV format (.csv)")

    content = await file.read()
    try:
        text_stream = io.StringIO(content.decode("utf-8-sig"))
        reader = csv.DictReader(text_stream)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV file: {str(e)}")

    results = []
    high_count = 0
    mid_count = 0
    low_count = 0

    for idx, row in enumerate(reader, start=1):
        try:
            # Case-insensitive column key matching
            normalized_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
            
            age = float(normalized_row.get("age", 25))
            systolic = float(normalized_row.get("systolicbp", normalized_row.get("systolic", 120)))
            diastolic = float(normalized_row.get("diastolicbp", normalized_row.get("diastolic", 80)))
            bs = float(normalized_row.get("bs", normalized_row.get("bloodsugar", 7.0)))
            temp = float(normalized_row.get("bodytemp", normalized_row.get("temperature", 98.0)))
            hr = float(normalized_row.get("heartrate", normalized_row.get("hr", 75)))
            name = normalized_row.get("name", normalized_row.get("patient_name", f"Patient #{idx}"))

            data = PatientData(
                Age=age,
                SystolicBP=systolic,
                DiastolicBP=diastolic,
                BS=bs,
                BodyTemp=temp,
                HeartRate=hr
            )

            pred = ml_service.predict(data, patient_name=name)

            if "high" in pred.risk_level.lower():
                high_count += 1
            elif "mid" in pred.risk_level.lower() or "mod" in pred.risk_level.lower():
                mid_count += 1
            else:
                low_count += 1

            results.append(BatchPredictionItem(
                row_id=idx,
                patient_name=name,
                Age=age,
                SystolicBP=systolic,
                DiastolicBP=diastolic,
                BS=bs,
                BodyTemp=temp,
                HeartRate=hr,
                risk_level=pred.risk_level,
                confidence=pred.confidence,
                priority_label=pred.priority_label
            ))
        except Exception:
            continue

    if not results:
        raise HTTPException(status_code=400, detail="No valid patient rows could be parsed from the CSV.")

    return BatchPredictionResponse(
        total_processed=len(results),
        high_risk_count=high_count,
        mid_risk_count=mid_count,
        low_risk_count=low_count,
        results=results
    )


@router.get("/api/model-info", summary="Model Diagnostics & Performance Metrics")
def get_model_info():
    """
    Returns model architecture metadata, evaluation metrics, feature importances, and confusion matrix diagnostics.
    """
    return ml_service.get_model_diagnostics()
