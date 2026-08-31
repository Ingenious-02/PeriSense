from typing import Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# Core Model Inference Schemas (matches PDF spec)
class PatientData(BaseModel):
    Age: float = Field(gt=0, description="Patient's age in years", examples=[28])
    SystolicBP: float = Field(gt=0, description="Systolic blood pressure in mmHg", examples=[135])
    DiastolicBP: float = Field(gt=0, description="Diastolic blood pressure in mmHg", examples=[88])
    BS: float = Field(gt=0, description="Blood sugar level in mmol/L", examples=[11.0])
    BodyTemp: float = Field(gt=0, description="Body temperature in Fahrenheit", examples=[98.0])
    HeartRate: float = Field(gt=0, description="Heart rate in bpm", examples=[78])


class PredictionResponse(BaseModel):
    risk_level: str
    confidence: float
    probabilities: Dict[str, float]


class ClinicalFlag(BaseModel):
    vital: str
    value: float
    unit: str
    status: str  # 'Normal', 'Elevated', 'High', 'Critical'
    reference_range: str
    message: str


class EnhancedPredictionResponse(PredictionResponse):
    priority_label: str  # 'High priority', 'Moderate priority', 'Low priority'
    badge_variant: str   # 'High', 'Moderate', 'Low'
    flags: List[ClinicalFlag]
    clinical_directives: List[str]
    patient_name: Optional[str] = None
    gestational_age: Optional[str] = None


class BatchPredictionItem(BaseModel):
    row_id: int
    patient_name: Optional[str] = "Unknown Patient"
    Age: float
    SystolicBP: float
    DiastolicBP: float
    BS: float
    BodyTemp: float
    HeartRate: float
    risk_level: str
    confidence: float
    priority_label: str


class BatchPredictionResponse(BaseModel):
    total_processed: int
    high_risk_count: int
    mid_risk_count: int
    low_risk_count: int
    results: List[BatchPredictionItem]


# Database Entities Schemas
class PatientBase(BaseModel):
    name: str
    patient_code: str
    age: int
    gestational_age: Optional[str] = "20 Weeks"
    phone: Optional[str] = None
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class AssessmentBase(BaseModel):
    patient_id: Optional[int] = None
    patient_name: str
    age: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    body_temp: float
    heart_rate: float
    risk_level: str
    confidence: float
    priority_label: str
    probabilities_json: str
    clinical_notes: Optional[str] = None


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentResponse(AssessmentBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PatientResponse(PatientBase):
    id: int
    latest_risk_status: Optional[str] = "Low"
    latest_assessment_date: Optional[datetime] = None
    created_at: datetime
    assessments: List[AssessmentResponse] = []
    model_config = ConfigDict(from_attributes=True)


# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    subtitle: str
    priority: str  # 'high', 'moderate', 'info'
    is_read: bool
    created_at: datetime
    target_patient_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


# Analytics & Model Info
class AnalyticsSummary(BaseModel):
    total_patients: int
    screenings_this_week: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    cohort_correlation: str
    recent_assessments: List[AssessmentResponse]


class ModelMetric(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float


class ModelInfoResponse(BaseModel):
    model_name: str
    algorithm: str
    target_classes: List[str]
    features: List[str]
    feature_importances: Dict[str, float]
    metrics_comparison: List[ModelMetric]
    classification_report: Dict[str, Dict[str, float]]
    confusion_matrices: Dict[str, List[List[int]]]


# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    title: Optional[str] = "Dr."
    role: Optional[str] = "Obstetrician"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    title: str
    role: str
    model_config = ConfigDict(from_attributes=True)
