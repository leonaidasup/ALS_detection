from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.core.security import create_access_token, verify_password
from src.database import get_db
from src.models.user import User
from src.schemas.token import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """OAuth2 compatible token login, obtiene un token de acceso para futuras peticiones."""
    user = db.query(User).filter_by(email=form_data.username).first()

    # se aplica str para evitar problemas mypyc con la comparación de bytes y str
    if not user or not verify_password(form_data.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo electronico o contraseña incorrectos",
        )

    if not getattr(user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo",
        )

    return Token(access_token=create_access_token(subject=user.id), token_type="bearer")