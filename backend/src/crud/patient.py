from typing import List, Optional
from sqlalchemy.orm import Session
from src.models.patient import Patient
from src.schemas.patient import PatientCreate


def get_patient_by_id(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_patient_by_cedula(db: Session, cedula: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.cedula == cedula).first()


def get_patients(db: Session, skip: int = 0, limit: int = 100) -> List[Patient]:
    return db.query(Patient).offset(skip).limit(limit).all()


def create_patient(db: Session, patient: PatientCreate) -> Patient:
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient