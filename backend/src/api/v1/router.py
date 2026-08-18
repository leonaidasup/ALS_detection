from fastapi import APIRouter
from src.api.v1.endpoints import auth, predict, users

api_router = APIRouter()

# ingresamos todos los endpoints del modulo v1
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(predict.router, prefix="/predict", tags=["predict"])