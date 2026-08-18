from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class AnalysisBase(BaseModel):
    prediction: str
    probability: float
    input_data: Optional[Dict[str, Any]] = None


class AnalysisCreate(AnalysisBase):
    patient_id: int


class AnalysisResponse(AnalysisBase):
    id: int
    patient_id: int
    doctor_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True) 