from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database import get_db
from backend.app.models import Patient, Assessment
from backend.app.schemas import PatientCreate, PatientResponse, PatientBase

router = APIRouter(prefix="/api/patients", tags=["Patients Directory"])


@router.get("", response_model=List[PatientResponse], summary="List Patients")
def get_patients(
    search: Optional[str] = Query(None, description="Search by patient name or code"),
    risk_filter: Optional[str] = Query(None, description="Filter by risk status: 'High', 'Moderate', 'Low'"),
    db: Session = Depends(get_db)
):
    query = db.query(Patient)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.name.ilike(search_term),
                Patient.patient_code.ilike(search_term)
            )
        )

    if risk_filter and risk_filter.lower() != "all":
        query = query.filter(Patient.latest_risk_status.ilike(f"%{risk_filter}%"))

    patients = query.order_by(Patient.latest_assessment_date.desc()).all()
    return patients


@router.post("", response_model=PatientResponse, summary="Register New Patient")
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(Patient.patient_code == payload.patient_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="A patient with this ID code already exists.")

    new_patient = Patient(
        name=payload.name,
        patient_code=payload.patient_code,
        age=payload.age,
        gestational_age=payload.gestational_age or "20 Weeks",
        phone=payload.phone,
        notes=payload.notes,
        latest_risk_status="Low"
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@router.get("/{patient_id}", response_model=PatientResponse, summary="Get Patient Details")
def get_patient_detail(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.delete("/{patient_id}", summary="Delete Patient Record")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"message": "Patient record deleted successfully", "id": patient_id}
