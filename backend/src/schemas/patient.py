from pydantic import BaseModel, ConfigDict


class PatientBase(BaseModel):
    """Esquema base de un paciente"""

    cedula: str
    full_name: str
    year_old: int


class PatientCreate(PatientBase):
    """Esquema al registrar un nuevo paciente"""
    pass


class PatientResponse(PatientBase):
    """Esquema de salida devuelto"""
    id: int

    model_config = ConfigDict(from_attributes=True)