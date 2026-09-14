import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_login_success_and_jwt():
    res = client.post(
        "/api/auth/login",
        json={"email": "adeyemi@perisense.health", "password": "password123"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "adeyemi@perisense.health"
    assert data["user"]["role"] == "Lead Obstetrician"



def test_login_invalid_password():
    res = client.post(
        "/api/auth/login",
        json={"email": "adeyemi@perisense.health", "password": "wrongpassword"}
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


import uuid


def test_registration_and_jwt():
    unique_email = f"sarah.{uuid.uuid4().hex[:6]}@perisense.health"
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Dr. Sarah Johnson",
            "email": unique_email,
            "password": "SecurePassword123!",
            "title": "Dr.",
            "role": "Consultant Obstetrician",
            "department": "Fetal Assessment Unit",
            "clinic_name": "Lagos University Teaching Hospital"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["name"] == "Dr. Sarah Johnson"
    assert data["user"]["email"] == unique_email



def test_registration_short_password():
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Dr. Weak Password",
            "email": "weak@perisense.health",
            "password": "short"
        }
    )
    assert res.status_code in [400, 422]


def test_protected_routes_require_token():
    # Attempting to access patients without token must return 401
    res = client.get("/api/patients")
    assert res.status_code == 401

    # Attempting to access analytics without token must return 401
    res = client.get("/api/analytics")
    assert res.status_code == 401

    # Attempting to access notifications without token must return 401
    res = client.get("/api/notifications")
    assert res.status_code == 401


def test_protected_routes_with_bearer_token():
    # Login to obtain token
    login_res = client.post(
        "/api/auth/login",
        json={"email": "adeyemi@perisense.health", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify /api/auth/me returns current user
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Dr. Adeyemi"

    # Verify /api/patients succeeds with token
    patients_res = client.get("/api/patients", headers=headers)
    assert patients_res.status_code == 200
    assert len(patients_res.json()) >= 1

    # Verify /api/analytics succeeds with token
    analytics_res = client.get("/api/analytics", headers=headers)
    assert analytics_res.status_code == 200

    # Verify /api/notifications succeeds with token
    notifs_res = client.get("/api/notifications", headers=headers)
    assert notifs_res.status_code == 200


def test_token_refresh():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "adeyemi@perisense.health", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    refresh_res = client.post("/api/auth/refresh", headers=headers)
    assert refresh_res.status_code == 200
    new_token = refresh_res.json()["access_token"]
    assert new_token is not None
