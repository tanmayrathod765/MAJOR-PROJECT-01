from fastapi import APIRouter
from app.schemas.chat import Location
from app.services.llm_service import build_risk_profile

router = APIRouter()


@router.post("/risk-profile")
def risk_profile(location: Location | None = None):
    return build_risk_profile(location or Location())
