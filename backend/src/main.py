from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.router import api_router
from src.config import settings
from src.database import Base, engine

# crea las tablas en la db al arrancar la aplicación si no existen aún
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configuración de CORS para permitir peticiones desde el frontend sin bloqueos de navegador
app.add_middleware(
    CORSMiddleware,         # filtro por peticion
    allow_origins=["*"],    # MODIFICAR AL LLEVAR A GCP
    allow_credentials=True,
    allow_methods=["*"],    # permite todos los metodos HTTP (GET, POST, PUT, DELETE)
    allow_headers=["*"],    # acepta todos los headers que vengan
)

# ingresamos todas las rutas de v1 como /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)