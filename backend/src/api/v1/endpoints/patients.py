from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.dependencies import get_current_user
from src.database import get_db
from src.models.patient import Patient
from src.models.user import User
from src.schemas.patient import PatientCreate, PatientResponse

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


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Consulta la informacion detallada de un paciente especifico"""
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.doctor_id == current_user.id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )
    return patient