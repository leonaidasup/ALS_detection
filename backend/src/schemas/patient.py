from pydantic import BaseModel, ConfigDict
from uuid import UUID


class PatientBase(BaseModel):
    """Esquema base de un paciente"""

    cedula: str
    full_name: str
    year_old: int


class PatientCreate(PatientBase):
    """Esquema al registrar un nuevo paciente"""
    pass

class PatientUpdate(BaseModel):
    """Esquema para actualizar datos de un paciente"""
    cedula: str | None = None
    full_name: str | None = None
    year_old: int | None = None

class PatientResponse(PatientBase):
    """Esquema de salida devuelto"""
    id: UUID
    doctor_id: int

    class Config:
        from_attributes = True