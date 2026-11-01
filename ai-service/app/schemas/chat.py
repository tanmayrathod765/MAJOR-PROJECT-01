from typing import Optional
from pydantic import BaseModel, Field


class Location(BaseModel):
    city: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    country: Optional[str] = Field(default=None, max_length=100)


class ChatContext(BaseModel):
    userRole: Optional[str] = Field(default=None, max_length=30)
    disasterType: Optional[str] = Field(default=None, max_length=40)


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=2000)
    location: Optional[Location] = None
    context: Optional[ChatContext] = None


class ChatResponse(BaseModel):
    answer: str
    category: Optional[str] = None
    riskSummary: Optional[str] = None
    preventiveActions: list[str] = []
    emergencyPrecautions: list[str] = []
    sources: list[str] = []
    isFallback: bool = False

