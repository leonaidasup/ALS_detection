from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import numpy as np

from src.core.dependencies import get_current_user
from src.database import get_db
from src.models.analysis import Analysis
from src.models.user import User
from src.schemas.analysis import AnalysisCreate, AnalysisResponse
from src.services.ml_service import ml_service

router = APIRouter()


@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def create_analysis(
    analysis_in: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Ejecuta la inferencia, calcula SHAP y registra el análisis clínico."""
    try:
        label, prob, top_bio, all_bio = ml_service.predict(analysis_in.biomarkers)

        db_analysis = Analysis(
            patient_id=analysis_in.patient_id,
            doctor_id=current_user.id,
            input_data=analysis_in.biomarkers,
            prediction=label,
            probability=prob,
            shap_values=all_bio,
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)

        db_analysis.top_biomarkers = top_bio
        db_analysis.all_biomarkers = all_bio

        return db_analysis

    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )


@router.get("/history", response_model=List[AnalysisResponse])
def get_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Retorna el historial de análisis realizados por el médico autenticado."""
    return (
        db.query(Analysis)
        .filter(Analysis.doctor_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

@router.get("/biomarkers", response_model=list[str])
def get_required_biomarkers():
    """Retorna la lista exacta de biomarcadores que requiere el pickle del modelo ML."""
    return ml_service.required_variables