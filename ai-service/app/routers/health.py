from fastapi import APIRouter
from app import config

router = APIRouter()


@router.get("/health")
def health():
    configured = bool(
        (config.AI_PROVIDER == "groq" and config.GROQ_API_KEY)
        or (config.AI_PROVIDER == "openai" and config.OPENAI_API_KEY)
    )
    return {"status": "ok", "provider": config.AI_PROVIDER, "providerConfigured": configured}

