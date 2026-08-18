from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from src.core.dependencies import get_current_user
from src.models.user import User
from src.schemas.prediction import PredictionInput, PredictionOutput
from src.services.ml_service import ml_service

router = APIRouter()


@router.post("/", response_model=PredictionOutput)
def predict_als(
    input_data: PredictionInput,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Evalua los biomarcadores clinicos enviados aplicando ml_service.py"""
    try:
        (label, prob, top_bio, all_bio) = ml_service.predict(input_data.biomarkers)

        return PredictionOutput(
            prediction_label=label,
            probability=prob,
            top_biomarkers=top_bio,
            all_biomarkers=all_bio,
        )

    except ValueError as err:
        # captura si faltan biomarcadores requeridos por el artefacto .joblib
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la predicción: {str(err)}",
        )