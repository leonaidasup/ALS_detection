from pydantic import BaseModel, Field
from pydantic import BaseModel


class PredictionInput(BaseModel):
    biomarkers: dict[str, float] # Diccionario {biomarcadores: numericos}


class PredictionOutput(BaseModel):
    prediction_label: str
    probability: float
    top_biomarkers: dict[str, float] # 5 biomarcadores ordenados por magnitud de SHAP
    all_biomarkers: dict[str, float] # biomarcadores ordenados por magnitud de SHAP