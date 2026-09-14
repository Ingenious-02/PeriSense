import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User
from backend.app.schemas import UserRegister

# Cryptographic and JWT Configuration
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "perisense-clinical-auth-secret-key-maternal-health-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a unique salt.
    Returns (hashed_password, salt).
    """
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return hashed, salt


def verify_password(plain_password: str, hashed_password: str, salt: Optional[str] = None) -> bool:
    """
    Verifies a plain password against the stored hash and salt.
    Supports PBKDF2 salted hash, with fallback to legacy sha256 for demo accounts.
    """
    if not hashed_password:
        return False

    # Check salted PBKDF2 if salt is present
    if salt:
        expected_hash, _ = hash_password(plain_password, salt)
        if secrets.compare_digest(expected_hash, hashed_password):
            return True

    # Fallback to legacy SHA-256 or demo password check for smooth transition
    legacy_sha256 = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if secrets.compare_digest(legacy_sha256, hashed_password):
        return True

    if plain_password == "password123" and ("adeyemi" in hashed_password or "okoye" in hashed_password):
        return True

    return False


def create_access_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a cryptographically signed JWT access token for an authenticated clinician.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": user.email,
        "user_id": user.id,
        "name": user.name,
        "role": user.role,
        "title": user.title,
        "department": user.department or "Maternal-Fetal Medicine",
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "iss": "perisense-api"
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates signature and expiration of a JWT access token.
    Raises HTTPException 401 if invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"verify_exp": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Validates user credentials against database.
    """
    clean_email = email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()

    # If demo user not yet in DB, seed on the fly
    if not user:
        if clean_email == "adeyemi@perisense.health" and password == "password123":
            hashed, salt = hash_password(password)
            user = User(
                name="Dr. Adeyemi",
                email="adeyemi@perisense.health",
                title="Dr.",
                role="Lead Obstetrician",
                department="Maternal-Fetal Medicine",
                clinic_name="PeriSense Care Center",
                hashed_password=hashed,
                salt=salt,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        elif clean_email == "okoye@perisense.health" and password == "password123":
            hashed, salt = hash_password(password)
            user = User(
                name="Nurse Okoye",
                email="okoye@perisense.health",
                title="Nurse",
                role="Maternal Health Specialist",
                department="Antenatal Triage Clinic",
                clinic_name="PeriSense Care Center",
                hashed_password=hashed,
                salt=salt,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        return None

    if verify_password(password, user.hashed_password, user.salt):
        user.last_login = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        return user

    return None


def register_user(db: Session, user_data: UserRegister) -> User:
    """
    Registers a new clinician with validated password hashing.
    """
    clean_email = user_data.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A clinician with this email address already exists."
        )

    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    hashed, salt = hash_password(user_data.password)
    new_user = User(
        name=user_data.name.strip(),
        email=clean_email,
        title=user_data.title or "Dr.",
        role=user_data.role or "Clinician",
        department=user_data.department or "Maternal-Fetal Medicine",
        clinic_name=user_data.clinic_name or "PeriSense Care Center",
        hashed_password=hashed,
        salt=salt,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to extract and verify JWT Bearer token and return active clinician.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_token(credentials.credentials)
    user_email = payload.get("sub")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    FastAPI dependency for endpoints that can optionally accept authenticated user.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_email = payload.get("sub")
        if not user_email:
            return None
        return db.query(User).filter(User.email.ilike(user_email)).first()
    except Exception:
        return None
