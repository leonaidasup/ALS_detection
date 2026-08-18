from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class AnalysisBase(BaseModel):
    """Esquema base de un analisis"""
    input_data: Optional[Dict[str, Any]]


class AnalysisCreate(AnalysisBase):
    """Esquema al registrar un nuevo analisis"""
    patient_id: int
    

class AnalysisResponse(AnalysisBase):
    """Esquema de salida devuelto"""
    id: int
    patient_id: int
    doctor_id: int
    created_at: datetime

    prediction: str
    probability: float
    shap_values: Optional[Dict[str, float]]

    model_config = ConfigDict(from_attributes=True) 