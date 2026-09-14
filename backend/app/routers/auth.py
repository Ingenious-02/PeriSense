from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User
from backend.app.schemas import UserLogin, UserRegister, UserResponse, TokenResponse
from backend.app.services.auth_service import (
    authenticate_user,
    register_user,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse, summary="Clinician Login with JWT")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates clinician credentials and issues a signed JSON Web Token (JWT).
    """
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/register", response_model=TokenResponse, summary="Register New Clinician with JWT")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new clinician account and issues a signed JWT access token.
    """
    user = register_user(db, payload)
    access_token = create_access_token(user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated Clinician")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated clinician profile verified by Bearer JWT token.
    """
    return UserResponse.model_validate(current_user)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh JWT Access Token")
def refresh_token(current_user: User = Depends(get_current_user)):
    """
    Issues a refreshed access token for an active clinician session.
    """
    access_token = create_access_token(current_user)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(current_user)
    )
