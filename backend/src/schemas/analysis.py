from uuid import UUID
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class AnalysisBase(BaseModel):
    """Esquema base de un analisis"""
    input_data: Optional[Dict[str, Any]]


class AnalysisCreate(AnalysisBase):
    """Esquema al registrar un nuevo analisis"""
    patient_id: int
    biomarkers: dict[str, float]
    

class AnalysisResponse(AnalysisBase):
    """Esquema de salida devuelto"""
    id: UUID
    patient_id: int
    doctor_id: int
    input_data: dict[str, float]
    prediction: str
    probability: float
    top_biomarkers: dict[str, float] # 5 biomarcadores ordenados por magnitud de SHAP
    all_biomarkers: dict[str, float] # biomarcadores ordenados por magnitud de SHAP
    shap_values: dict[str, float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)