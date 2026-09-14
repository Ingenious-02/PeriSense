# PeriSense: Maternal Health Care Intelligence & Risk Prediction Platform

PeriSense is an intelligent clinical decision support and maternal health monitoring web application. It integrates a Random Forest machine learning classifier with a FastAPI backend, SQLite database, secure JWT authentication, and a responsive, modern React dashboard designed specifically for antenatal care triage, patient registry management, and mass community screening.

---

## Key Features

1. **AI/ML Maternal Risk Decision Engine**:
   - Random Forest Classifier (Accuracy: 86.6%, Precision: 87.0%, Recall: 86.6%, F1: 86.5%).
   - Multi-class classification: **High Risk**, **Moderate / Mid Risk**, **Low Risk**.
   - Confidence scoring and full probability distribution.
   - Automated clinical flags benchmarking against WHO / ACOG obstetric safe ranges (Age, Systolic BP, Diastolic BP, Blood Sugar, Temperature, Heart Rate).
   - Automated action directives (emergency referral protocols, glycemic & hypertension management).

2. **Frontend Clinical Dashboard (`React` + `Vite` + `Tailwind CSS`)**:
   - **Clinician Portal**: Secure authentication gateway with 1-click demo access for Dr. Adeyemi (Lead Obstetrician) and Nurse Okoye (Maternal Health Specialist).
   - **Overview**: Real-time cohort risk ratio, screening volume, high-risk flags, recent activity ledger.
   - **New Risk Assessment Modal**: Interactive clinical input form with 1-click test presets, real-time calculation, probability distribution bars, clinical alerts, and printable report export.
   - **Patients Directory**: Searchable, filterable patient registry with risk status tags and detailed patient record modals.
   - **Assessments Registry**: Comprehensive screening records and exportable patient logs.
   - **Batch Screening Tool**: CSV drag-and-drop mass screening with template download and scored CSV export.
   - **Notifications Feed**: Real-time triage alerts (high-priority, moderate check-ins, team summaries).
   - **Model Intelligence & Diagnostics**: Model comparison charts, Random Forest feature importance rankings (BS: 35.2%, SystolicBP: 19.3%, Age: 15.8%, etc.), and interactive confusion matrix viewer.

3. **Backend API (`FastAPI` + `SQLAlchemy` + `SQLite`)**:
   - `POST /predict`: Core inference endpoint matching standard specification.
   - `POST /api/predict`: Enhanced clinical assessment endpoint with flags and directives.
   - `POST /api/batch-predict`: High-throughput CSV screening endpoint.
   - `GET /api/patients`, `POST /api/patients`, `GET /api/patients/{id}`: Patient registry CRUD.
   - `GET /api/assessments`, `POST /api/assessments`: Screening history management.
   - `GET /api/notifications`: Clinician activity and alert notifications.
   - `GET /api/analytics`: Population health statistics.
   - `GET /api/model-info`: Model architecture, evaluation metrics, and feature importances.
   - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/refresh`: Clinician JWT authentication.

---

## Quick Start Guide

### 1. Launch Everything (Backend + Frontend) with 1 Command:
```bash
./run.sh
```

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Manual Startup:

#### Start Backend:
```bash
source .venv/bin/activate
PYTHONPATH=. uvicorn backend.app.main:app --port 8000 --reload
```

#### Start Frontend:
```bash
cd frontend
npm run dev
```

---

## Running Automated Tests:
```bash
PYTHONPATH=. .venv/bin/pytest backend/tests/ -v
```
