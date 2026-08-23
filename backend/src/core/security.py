from datetime import datetime, timedelta, timezone
from typing import Any
from jose import jwt # type: ignore[import-untyped]
from passlib.context import CryptContext # type: ignore[import-untyped]
from src.config import settings

# configuracion del hasheo para contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Genera un hash de la contraseña usando bcrypt"""
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña en texto plano con su hash en BD sin
     variaciones de tiempo en la comparacion, evitamos ataques de timing"""
    return pwd_context.verify(plain_password[:72], hashed_password)

def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Genera un token JWT firmado codificando el ID del usuario y su tiempo de expiracion"""
    # permitimos un expires_delta para poder generar tokens de acceso con diferentes tiempos de expiracion
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)