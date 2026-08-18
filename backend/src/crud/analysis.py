from typing import List, Optional
from sqlalchemy.orm import Session
from src.models.analysis import Analysis
from src.schemas.analysis import AnalysisCreate


def create_analysis(
    db: Session,
    analysis_in: AnalysisCreate,
    user_id: int,
    prediction_label: str,
    probability: float,
    top_biomarkers: dict,
) -> Analysis:
    db_analysis = Analysis(
        patient_id=analysis_in.patient_id,
        user_id=user_id,
        biomarkers_data=analysis_in.biomarkers_data,
        prediction_label=prediction_label,
        probability=probability,
        top_biomarkers=top_biomarkers,
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis


def get_analyses_by_patient(db: Session, patient_id: int) -> List[Analysis]:
    return (
        db.query(Analysis)
        .filter(Analysis.patient_id == patient_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


def get_analysis_by_id(db: Session, analysis_id: int) -> Optional[Analysis]:
    return db.query(Analysis).filter(Analysis.id == analysis_id).first()