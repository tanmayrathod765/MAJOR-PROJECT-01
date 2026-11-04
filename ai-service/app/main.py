from fastapi import FastAPI
from app.routers import chat, health, risk

app = FastAPI(title="DisasterReady AI Service", version="1.0.0")
app.include_router(health.router)
app.include_router(chat.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
