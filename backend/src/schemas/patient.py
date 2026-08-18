from pydantic import BaseModel, ConfigDict


class PatientBase(BaseModel):
    cedula: str
    full_name: str


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: int

    model_config = ConfigDict(from_attributes=True)