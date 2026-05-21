"""
Authentication endpoints: register, login, get current user.
"""
import uuid
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.database import get_db
from models.user import User
from services.auth_service import AuthService, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    phone: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "budi@warungpakbudi.id",
                "username": "pakbudi",
                "full_name": "Budi Santoso",
                "password": "rahasia123",
                "business_name": "Warung Pak Budi",
                "business_type": "Warung Makan",
                "phone": "+62812345678",
            }
        }
    }


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    business_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str
    user_id: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new UMKM user account",
)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    auth = AuthService()

    # Check email uniqueness
    existing_email = await auth.get_user_by_email(db, payload.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Check username uniqueness
    existing_username = await auth.get_user_by_username(db, payload.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=auth.hash_password(payload.password),
        business_name=payload.business_name,
        business_type=payload.business_type,
        phone=payload.phone,
        is_active=True,
        is_verified=True,  # auto-verify for demo
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("New user registered: %s (%s)", user.email, user.id)
    return MessageResponse(message="Registration successful", user_id=user.id)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and receive JWT access token",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    auth = AuthService()

    # Support both email and username as `username` field
    user = await auth.get_user_by_email(db, form_data.username)
    if not user:
        user = await auth.get_user_by_username(db, form_data.username)

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    token = auth.create_token(user)
    logger.info("User logged in: %s", user.email)

    return LoginResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        business_name=user.business_name,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
