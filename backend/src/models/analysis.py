from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from src.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # resultado de la prediccion
    prediction = Column(String, nullable=False)
    probability = Column(Float, nullable=False)
    
    # datos de entrada del modelo
    input_data = Column(JSON, nullable=True)
    
    # fecha de creacion
    created_at = Column(DateTime, default=datetime.utcnow)

    # un paciente a muchos analisis [1: n]
    patient = relationship("Patient", back_populates="analyses")