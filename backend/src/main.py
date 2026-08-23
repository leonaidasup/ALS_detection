from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.router import api_router
from src.config import settings
from src.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# ENDPOINT DE CONFIG (accesible como /api/config)
@app.get("/api/config")
def get_config():
    return {
        "apiUrl": "https://als-backend-612025190132.us-central1.run.app"
    }

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://als-frontend-612025190132.us-central1.run.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ingresamos todas las rutas de v1 como /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)