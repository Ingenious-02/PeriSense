import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def get_auth_header():
    res = client.post(
        "/api/auth/login",
        json={"email": "adeyemi@perisense.health", "password": "password123"}
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_standard_prediction():
    # Test High Risk case (Fatima Bello vitals)
    payload = {
        "Age": 28,
        "SystolicBP": 135,
        "DiastolicBP": 88,
        "BS": 11.0,
        "BodyTemp": 98.0,
        "HeartRate": 78
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "risk_level" in data
    assert "confidence" in data
    assert "probabilities" in data
    assert data["risk_level"] == "high risk"


def test_enhanced_prediction():
    payload = {
        "Age": 25,
        "SystolicBP": 110,
        "DiastolicBP": 75,
        "BS": 6.5,
        "BodyTemp": 98.0,
        "HeartRate": 72
    }
    res = client.post("/api/predict?patient_name=Grace%20Eze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "priority_label" in data
    assert "flags" in data
    assert "clinical_directives" in data
    assert len(data["clinical_directives"]) > 0


def test_patients_endpoints():
    headers = get_auth_header()
    res = client.get("/api/patients", headers=headers)
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 4
    # Check patient codes
    codes = [p["patient_code"] for p in patients]
    assert "PS-1048" in codes or "PS-1046" in codes


def test_analytics_endpoint():
    headers = get_auth_header()
    res = client.get("/api/analytics", headers=headers)
    assert res.status_code == 200
    analytics = res.json()
    assert analytics["total_patients"] > 0
    assert "cohort_correlation" in analytics


def test_notifications_endpoint():
    headers = get_auth_header()
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    notifications = res.json()
    assert len(notifications) > 0


def test_model_info_endpoint():
    res = client.get("/api/model-info")
    assert res.status_code == 200
    info = res.json()
    assert "feature_importances" in info
    assert "metrics_comparison" in info
