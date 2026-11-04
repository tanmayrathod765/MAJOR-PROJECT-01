from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import generate_answer

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        return await generate_answer(request)
    except Exception as exc:
        if isinstance(exc, (ValueError, KeyError)):
            raise HTTPException(status_code=502, detail="AI provider returned an invalid response")
        raise HTTPException(status_code=503, detail="AI provider is temporarily unavailable")

