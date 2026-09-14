from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    title = Column(String, default="Dr.")
    role = Column(String, default="Lead Obstetrician")
    department = Column(String, default="Maternal-Fetal Medicine", nullable=True)
    clinic_name = Column(String, default="PeriSense Care Center", nullable=True)
    hashed_password = Column(String, nullable=False)
    salt = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gestational_age = Column(String, default="24 Weeks")
    phone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    latest_risk_status = Column(String, default="Low")
    latest_assessment_date = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    assessments = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    patient_name = Column(String, nullable=False)
    age = Column(Float, nullable=False)
    systolic_bp = Column(Float, nullable=False)
    diastolic_bp = Column(Float, nullable=False)
    blood_sugar = Column(Float, nullable=False)
    body_temp = Column(Float, nullable=False)
    heart_rate = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    priority_label = Column(String, nullable=False)
    probabilities_json = Column(Text, nullable=False)
    clinical_notes = Column(Text, nullable=True)
    recorded_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="assessments")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=False)
    priority = Column(String, default="info")  # high, moderate, info
    is_read = Column(Boolean, default=False)
    target_patient_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utc_now)
