"""
Authentication service: JWT creation/verification, password hashing.
Supports both local HS256 JWT and Supabase-issued JWT tokens.
"""
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.database import get_db
from models.user import User

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "securepay-vision-secret-key-2024")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

# Supabase JWT secret — from Supabase Dashboard > Settings > API > JWT Settings
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=JWT_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token_attempt(token: str, secret: str, algorithms: list) -> Optional[dict]:
    try:
        return jwt.decode(token, secret, algorithms=algorithms)
    except JWTError:
        return None


def decode_token(token: str) -> dict:
    # Try local JWT first
    payload = _decode_token_attempt(token, JWT_SECRET, [JWT_ALGORITHM])

    # Try Supabase JWT if local fails and secret is configured
    if payload is None and SUPABASE_JWT_SECRET:
        payload = _decode_token_attempt(token, SUPABASE_JWT_SECRET, ["HS256"])

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah kedaluwarsa",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# FastAPI dependency: get current user from token
# ---------------------------------------------------------------------------

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    user_id: Optional[str] = payload.get("sub")
    email: Optional[str] = payload.get("email")

    if not user_id:
        raise credentials_exception

    # Try lookup by primary key (works for both local and Supabase UUIDs)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    # Fallback: Supabase UUID may differ from our DB — try by email
    if not user and email:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    # Auto-provision user from Supabase token if not yet in local DB
    if not user and email:
        full_name = (
            payload.get("user_metadata", {}).get("full_name")
            or email.split("@")[0]
        )
        user = User(
            id=user_id,
            email=email,
            name=full_name,
            password_hash="",
            role="user",
            is_active=True,
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
            logger.info("Auto-provisioned user from Supabase token: %s", email)
        except Exception as exc:
            await db.rollback()
            logger.error("Failed to auto-provision user: %s", exc)
            raise credentials_exception

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun Anda telah dinonaktifkan",
        )

    return user


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return hash_password(password)

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return verify_password(plain, hashed)

    @staticmethod
    def create_token(user: User) -> str:
        return create_access_token({"sub": user.id, "email": user.email})

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
