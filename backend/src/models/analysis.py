import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from src.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    input_data = Column(JSON, nullable=False)
    prediction = Column(String, nullable=False)
    probability = Column(Float, nullable=False)
    shap_values = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    patient = relationship("Patient", back_populates="analyses")
    doctor = relationship("User", back_populates="analyses")