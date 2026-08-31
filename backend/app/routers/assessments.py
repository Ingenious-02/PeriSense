from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database import get_db
from backend.app.models import Assessment, Patient, Notification
from backend.app.schemas import AssessmentCreate, AssessmentResponse

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


@router.get("", response_model=List[AssessmentResponse], summary="List Clinical Assessments")
def get_assessments(
    search: Optional[str] = Query(None, description="Search by patient name"),
    risk: Optional[str] = Query(None, description="Filter by risk level"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Assessment)

    if search:
        query = query.filter(Assessment.patient_name.ilike(f"%{search.strip()}%"))

    if risk and risk.lower() != "all":
        query = query.filter(Assessment.risk_level.ilike(f"%{risk}%"))

    return query.order_by(Assessment.created_at.desc()).limit(limit).all()


@router.post("", response_model=AssessmentResponse, summary="Save Assessment Record")
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)):
    assessment = Assessment(
        patient_id=payload.patient_id,
        patient_name=payload.patient_name,
        age=payload.age,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        blood_sugar=payload.blood_sugar,
        body_temp=payload.body_temp,
        heart_rate=payload.heart_rate,
        risk_level=payload.risk_level,
        confidence=payload.confidence,
        priority_label=payload.priority_label,
        probabilities_json=payload.probabilities_json,
        clinical_notes=payload.clinical_notes,
        created_at=datetime.utcnow()
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Update patient's latest risk status if patient exists
    patient = None
    if payload.patient_id:
        patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    elif payload.patient_name:
        patient = db.query(Patient).filter(Patient.name.ilike(payload.patient_name.strip())).first()

    risk_label = "Low"
    if "high" in payload.risk_level.lower():
        risk_label = "High"
    elif "mid" in payload.risk_level.lower() or "mod" in payload.risk_level.lower():
        risk_label = "Moderate"

    if patient:
        patient.latest_risk_status = risk_label
        patient.latest_assessment_date = datetime.utcnow()
        db.commit()

    # Generate a notification if high or moderate risk
    if risk_label == "High":
        notif = Notification(
            title=f"Review recommended for {payload.patient_name}",
            subtitle="High-priority signal · Just now",
            priority="high",
            is_read=False,
            target_patient_id=patient.id if patient else None
        )
        db.add(notif)
        db.commit()
    elif risk_label == "Moderate":
        notif = Notification(
            title=f"{payload.patient_name} completed a check-in",
            subtitle="Moderate-priority signal · Just now",
            priority="moderate",
            is_read=False,
            target_patient_id=patient.id if patient else None
        )
        db.add(notif)
        db.commit()

    return assessment


@router.get("/{assessment_id}", response_model=AssessmentResponse, summary="Get Assessment By ID")
def get_assessment_detail(assessment_id: int, db: Session = Depends(get_db)):
    record = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return record
