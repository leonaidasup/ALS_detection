from fastapi import APIRouter
from src.api.v1.endpoints import analyses, auth, patients, users

api_router = APIRouter()

# ingresamos todos los endpoints del modulo v1
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(analyses.router, prefix="/analyses", tags=["analyses"])