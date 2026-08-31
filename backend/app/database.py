import os
import json
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = os.environ.get("DATABASE_URL", "sqlite:///./perisense.db")

engine = create_engine(
    DB_PATH,
    connect_args={"check_same_thread": False} if "sqlite" in DB_PATH else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_initial_data(db):
    from backend.app.models import User, Patient, Assessment, Notification

    # Seed Clinician Users
    if db.query(User).count() == 0:
        demo_users = [
            User(
                name="Dr. Adeyemi",
                email="adeyemi@perisense.health",
                title="Dr.",
                role="Lead Obstetrician",
                hashed_password=hash_password("password123")
            ),
            User(
                name="Nurse Okoye",
                email="okoye@perisense.health",
                title="Nurse",
                role="Maternal Health Specialist",
                hashed_password=hash_password("password123")
            )
        ]
        db.add_all(demo_users)
        db.commit()

    # Seed Initial Patients
    if db.query(Patient).count() == 0:
        now = datetime.utcnow()
        demo_patients = [
            Patient(
                name="Amina Yusuf",
                patient_code="PS-1048",
                age=29,
                gestational_age="16 Weeks",
                phone="+234 801 234 5678",
                latest_risk_status="Moderate",
                latest_assessment_date=now - timedelta(minutes=48),
                notes="Patient reports mild intermittent headaches. Blood sugar slightly elevated."
            ),
            Patient(
                name="Grace Eze",
                patient_code="PS-1047",
                age=25,
                gestational_age="20 Weeks",
                phone="+234 802 345 6789",
                latest_risk_status="Low",
                latest_assessment_date=now - timedelta(days=1),
                notes="Routine second trimester checkup. Normal fetal movement and normotensive."
            ),
            Patient(
                name="Fatima Bello",
                patient_code="PS-1046",
                age=34,
                gestational_age="24 Weeks",
                phone="+234 803 456 7890",
                latest_risk_status="High",
                latest_assessment_date=now - timedelta(minutes=12),
                notes="High blood pressure flagged (140/95 mmHg) and elevated BS (12.0 mmol/L). Immediate follow-up required."
            ),
            Patient(
                name="Chidinma Okafor",
                patient_code="PS-1045",
                age=31,
                gestational_age="31 Weeks",
                phone="+234 804 567 8901",
                latest_risk_status="Low",
                latest_assessment_date=now - timedelta(days=2),
                notes="Third trimester screening. Well maintained gestational health."
            ),
            Patient(
                name="Zainab Abba",
                patient_code="PS-1044",
                age=22,
                gestational_age="12 Weeks",
                phone="+234 805 678 9012",
                latest_risk_status="Low",
                latest_assessment_date=now - timedelta(days=3),
                notes="First trimester registration. Healthy baseline vitals."
            ),
            Patient(
                name="Isaac Ruth",
                patient_code="PS-1043",
                age=28,
                gestational_age="28 Weeks",
                phone="+234 806 789 0123",
                latest_risk_status="High",
                latest_assessment_date=now - timedelta(hours=3),
                notes="Model confidence: 100.0%. Review the complete clinical context before action."
            )
        ]
        db.add_all(demo_patients)
        db.commit()

        # Seed initial assessments for these patients
        p_fatima = db.query(Patient).filter(Patient.patient_code == "PS-1046").first()
        p_amina = db.query(Patient).filter(Patient.patient_code == "PS-1048").first()
        p_ruth = db.query(Patient).filter(Patient.patient_code == "PS-1043").first()

        assessments = [
            Assessment(
                patient_id=p_fatima.id if p_fatima else None,
                patient_name="Fatima Bello",
                age=34,
                systolic_bp=140,
                diastolic_bp=95,
                blood_sugar=12.0,
                body_temp=98.6,
                heart_rate=88,
                risk_level="high risk",
                confidence=0.9412,
                priority_label="High priority",
                probabilities_json=json.dumps({"high risk": 0.9412, "mid risk": 0.0463, "low risk": 0.0125}),
                clinical_notes="Hypertension stage 2 and hyperglycemia detected.",
                created_at=now - timedelta(minutes=12)
            ),
            Assessment(
                patient_id=p_amina.id if p_amina else None,
                patient_name="Amina Yusuf",
                age=29,
                systolic_bp=125,
                diastolic_bp=82,
                blood_sugar=8.5,
                body_temp=98.4,
                heart_rate=76,
                risk_level="mid risk",
                confidence=0.7450,
                priority_label="Moderate priority",
                probabilities_json=json.dumps({"high risk": 0.1250, "mid risk": 0.7450, "low risk": 0.1300}),
                clinical_notes="Moderate risk. Blood sugar slightly elevated. Advise dietary regulation.",
                created_at=now - timedelta(minutes=48)
            ),
            Assessment(
                patient_id=p_ruth.id if p_ruth else None,
                patient_name="Isaac Ruth",
                age=28,
                systolic_bp=135,
                diastolic_bp=88,
                blood_sugar=11.0,
                body_temp=98.0,
                heart_rate=78,
                risk_level="high risk",
                confidence=0.9070,
                priority_label="High priority",
                probabilities_json=json.dumps({"high risk": 0.9070, "mid risk": 0.0930, "low risk": 0.0000}),
                clinical_notes="Elevated systolic and blood glucose levels require close supervision.",
                created_at=now - timedelta(hours=3)
            )
        ]
        db.add_all(assessments)
        db.commit()

    # Seed Initial Notifications (matching Figure 4.16)
    if db.query(Notification).count() == 0:
        now = datetime.utcnow()
        notifications = [
            Notification(
                title="Review recommended for Fatima Bello",
                subtitle="High-priority signal · 12 minutes ago",
                priority="high",
                is_read=False,
                created_at=now - timedelta(minutes=12)
            ),
            Notification(
                title="Amina Yusuf completed a check-in",
                subtitle="Moderate-priority signal · 48 minutes ago",
                priority="moderate",
                is_read=False,
                created_at=now - timedelta(minutes=48)
            ),
            Notification(
                title="Weekly care summary is ready",
                subtitle="Your team completed 37 assessments this week.",
                priority="info",
                is_read=False,
                created_at=now - timedelta(hours=4)
            ),
            Notification(
                title="New patient record added",
                subtitle="Ngozi Nwosu was added by Nurse Okoye.",
                priority="info",
                is_read=True,
                created_at=now - timedelta(days=1)
            )
        ]
        db.add_all(notifications)
        db.commit()


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
