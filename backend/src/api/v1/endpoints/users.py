from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.dependencies import get_current_user
from src.core.security import get_password_hash
from src.database import get_db
from src.models.user import User
from src.schemas.user import UserCreate, UserResponse, UserUpdate

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


@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Actualiza la información del usuario autenticado."""

    # Validar si intenta cambiar el correo a uno que ya pertenece a otro usuario
    if user_in.email and user_in.email != current_user.email:
        if db.query(User).filter_by(email=user_in.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está en uso por otro usuario",
            )
        current_user.email = user_in.email  # type: ignore[assignment]

    # Validar nombre completo si viene en la petición
    if user_in.full_name is not None:
        if not user_in.full_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre completo no puede estar vacío.",
            )
        current_user.full_name = user_in.full_name  # type: ignore[assignment]

    # Si envía contraseña nueva, se encripta de nuevo
    if user_in.password:
        current_user.hashed_password = get_password_hash(user_in.password)  # type: ignore[assignment]

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    current_user.is_active = False  # type: ignore[assignment]
    db.add(current_user)
    db.commit()
    return {"message": "Cuenta desactivada exitosamente"}