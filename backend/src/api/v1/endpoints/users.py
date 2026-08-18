from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.dependencies import get_current_user
from src.core.security import get_password_hash
from src.database import get_db
from src.models.user import User
from src.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Registra un nuevo usuario en la base de datos."""
    # validacion de duplicados por email
    if db.query(User).filter_by(email=user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado",
        )

    # validacion de duplicados por cedula
    if db.query(User).filter_by(cedula=user_in.cedula).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cedula ya está registrada",
        )

    if not user_in.full_name or not user_in.full_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se necesita registrar un usuario con nombre completo.",
        )

    db_user = User(
        cedula=user_in.cedula,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Devuelve el perfil del usuario autenticado"""
    return current_user