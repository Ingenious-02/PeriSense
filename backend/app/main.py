import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.database import init_db
from backend.app.routers import (
    prediction,
    patients,
    assessments,
    notifications,
    analytics,
    auth
)

# Initialize database schema and seeds
init_db()

app = FastAPI(
    title="PeriSense Maternal Health Risk Prediction API",
    description="Intelligent Maternal Risk Decision Support & Assessment Service using Random Forest Classifier.",
    version="1.0.0",
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(prediction.router)
app.include_router(patients.router)
app.include_router(assessments.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(auth.router)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "PeriSense API",
        "version": "1.0.0"
    }


# Serve built frontend static files if present
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
