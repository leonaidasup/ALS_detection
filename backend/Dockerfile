FROM python:3.12

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt-get/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn uvicorn

COPY . .

# Cloud Run inyecta automáticamente la variable PORT
ENV PORT=8080

CMD exec gunicorn -w 1 -k uvicorn.workers.UvicornWorker --timeout 300 -b 0.0.0.0:$PORT src.main:app