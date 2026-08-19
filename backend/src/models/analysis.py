
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # datos de entrada del modelo
    input_data = Column(JSON, nullable=False)
    
    # resultado de la prediccion
    prediction = Column(String, nullable=False)
    probability = Column(Float, nullable=False)
    shap_values = Column(JSON, nullable=False)

    # fecha de creacion
    created_at = Column(DateTime, default=datetime.utcnow)

    # Muchos análisis pertenecen a un paciente [n: 1]
    patient = relationship("Patient", back_populates="analyses")

    # Muchos análisis son realizados por un doctor [n: 1]
    doctor = relationship("User", back_populates="analyses")