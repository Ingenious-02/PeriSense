from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import UserLogin, UserRegister, UserResponse
from backend.app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse, summary="Clinician Login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Use demo account or register."
        )
    return user


@router.post("/register", response_model=UserResponse, summary="Register New Clinician")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    try:
        user = register_user(db, payload)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me", response_model=UserResponse, summary="Get Current Clinician Session")
def get_current_user(email: str = "adeyemi@perisense.health", db: Session = Depends(get_db)):
    from backend.app.models import User
    user = db.query(User).filter(User.email.ilike(email.strip())).first()
    if not user:
        # Return default clinician Dr. Adeyemi
        return UserResponse(
            id=1,
            name="Dr. Adeyemi",
            email="adeyemi@perisense.health",
            title="Dr.",
            role="Lead Obstetrician"
        )
    return user
