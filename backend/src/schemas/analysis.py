from uuid import UUID
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict

class PatientShortResponse(BaseModel):
    """Informacion basica del paciente adjunta al analisis"""
    id: UUID
    cedula: str
    full_name: str

    model_config = ConfigDict(from_attributes=True)

class AnalysisBase(BaseModel):
    """Esquema base de un analisis"""
    input_data: Optional[Dict[str, Any]] = None


class AnalysisCreate(BaseModel):
    """Esquema al registrar un nuevo analisis"""
    patient_id: UUID 
    biomarkers: Dict[str, float]


class AnalysisResponse(AnalysisBase):
    """Esquema de respuesta devuelto al frontend"""
    id: int
    patient_id: UUID
    doctor_id: int
    patient: Optional[PatientShortResponse] = None
    input_data: Dict[str, float]
    prediction: str
    probability: float
    top_biomarkers: Optional[Dict[str, float]] = None
    all_biomarkers: Optional[Dict[str, float]] = None
    shap_values: Dict[str, float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)