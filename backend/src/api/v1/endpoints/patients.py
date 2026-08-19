from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from src.core.dependencies import get_current_user
from src.database import get_db
from src.models.patient import Patient
from src.core.security import get_password_hash
from src.models.user import User
from src.schemas.user import UserCreate, UserResponse, UserUpdate
from src.schemas.patient import PatientCreate, PatientResponse, PatientUpdate

router = APIRouter()


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Registra un nuevo paciente en el sistema asociado al medico autenticado."""
    # verificadmos si ya existe un paciente con la misma cedula
    existing = (db.query(Patient).filter(Patient.cedula == patient_in.cedula).first())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un paciente registrado con esta identificacion",
        )

    db_patient = Patient(
        **patient_in.model_dump(),
        doctor_id=current_user.id,
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/", response_model=List[PatientResponse])
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Obtiene la lista de pacientes pertenecientes al medico autenticado"""
    return (
        db.query(Patient)
        .filter(Patient.doctor_id == current_user.id)
        .order_by(Patient.id.desc())
        .all()
    )


@router.get("/{cedula}", response_model=PatientResponse)
def get_patient(
    cedula: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Consulta la informacion detallada de un paciente especifico"""
    patient = (
        db.query(Patient)
        .filter(Patient.cedula == cedula, Patient.doctor_id == current_user.id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )
    return patient


@router.put("/{cedula}", response_model=PatientResponse)
def update_patient(
    cedula: str,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Por normatividad medica, los registros de pacientes no pueden ser editados"
    )
    """
    patient = (
        db.query(Patient)
        .filter(Patient.cedula == cedula, Patient.doctor_id == current_user.id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )

    # Validar si intenta cambiar la cédula a una que ya le pertenece a otro paciente
    if patient_in.cedula and patient_in.cedula != patient.cedula:
        existing = db.query(Patient).filter(Patient.cedula == patient_in.cedula).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe otro paciente registrado con esa nueva cedula.",
            )
        patient.cedula = patient_in.cedula  # type: ignore[assignment]

    # Validar nombre
    if patient_in.full_name is not None:
        if not patient_in.full_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre completo del paciente no puede estar vacio.",
            )
        patient.full_name = patient_in.full_name  # type: ignore[assignment]

    # Validar edad
    if patient_in.year_old is not None:
        patient.year_old = patient_in.year_old  # type: ignore[assignment]

    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

    """
@router.delete("/{cedula}")
def delete_patient():
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Por normatividad medica, los registros de pacientes no pueden ser eliminados"
    )