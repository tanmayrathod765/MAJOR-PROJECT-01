import httpx
from app import config


SAFETY_SYSTEM = (
    "You are DisasterReady, an educational disaster-safety assistant. "
    "Give concise, age-appropriate, actionable guidance. Prioritize immediate safety, "
    "following local authorities and emergency services. Never invent live warnings, "
    "claim to contact emergency services, or provide speculative rescue instructions. "
    "Mention that advice is educational when current official information is needed."
)


def fallback_answer(message: str) -> dict:
    text = message.lower()
    if "earthquake" in text:
        answer = "During an earthquake, Drop, Cover, and Hold On. Stay away from windows and do not use lifts. After shaking stops, follow your evacuation plan and official instructions."
        category = "earthquake"
    elif "fire" in text:
        answer = "Raise the alarm, leave by the nearest safe exit, stay low in smoke, and never use a lift. Call local emergency services when safe and do not re-enter."
        category = "fire"
    elif "flood" in text:
        answer = "Move to higher ground, avoid walking or driving through floodwater, and follow official evacuation instructions. Keep drinking water and essential medicines with you."
        category = "flood"
    elif "heat" in text:
        answer = "During a heatwave, drink water regularly, avoid strenuous activity in peak heat, use shade or cool rooms, and check on vulnerable people."
        category = "heatwave"
    else:
        answer = "Prepare an emergency kit, know two exits, keep emergency contacts accessible, and follow official local alerts. For an immediate threat, contact local emergency services."
        category = "general"
    return {
        "answer": answer,
        "category": category,
        "riskSummary": "This is general educational guidance, not a live warning.",
        "preventiveActions": ["Review your evacuation plan", "Keep an emergency kit ready"],
        "emergencyPrecautions": ["Follow local authorities", "Contact emergency services for immediate danger"],
        "sources": ["https://www.ndma.gov.in/"],
        "isFallback": True,
    }


async def generate_answer(request) -> dict:
    key = config.GROQ_API_KEY if config.AI_PROVIDER == "groq" else config.OPENAI_API_KEY
    if not key:
        return fallback_answer(request.message)
    if config.AI_PROVIDER not in {"groq", "openai"}:
        return fallback_answer(request.message)

    url = (
        "https://api.groq.com/openai/v1/chat/completions"
        if config.AI_PROVIDER == "groq"
        else "https://api.openai.com/v1/chat/completions"
    )
    model = config.GROQ_MODEL if config.AI_PROVIDER == "groq" else config.OPENAI_MODEL
    location = request.location.model_dump(exclude_none=True) if request.location else {}
    user_prompt = f"Question: {request.message}\nLocation context: {location}"
    async with httpx.AsyncClient(timeout=12) as client:
        response = await client.post(
            url,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "temperature": 0.2,
                "messages": [
                    {"role": "system", "content": SAFETY_SYSTEM},
                    {"role": "user", "content": user_prompt},
                ],
            },
        )
        response.raise_for_status()
        data = response.json()
    answer = data["choices"][0]["message"]["content"].strip()
    return {
        "answer": answer,
        "category": request.context.disasterType if request.context else None,
        "riskSummary": "AI-generated educational guidance; verify current conditions with official authorities.",
        "preventiveActions": [],
        "emergencyPrecautions": ["Follow official local instructions", "Contact emergency services for immediate danger"],
        "sources": ["https://www.ndma.gov.in/"],
        "isFallback": False,
    }


def build_risk_profile(location) -> dict:
    place = ", ".join(
        value for value in [location.city, location.state, location.country] if value
    ) or "Selected location"
    return {
        "location": place,
        "riskLevel": "Moderate",
        "hazards": ["flooding", "heatwaves", "lightning", "earthquake"],
        "explanation": (
            "This is a preliminary preparedness profile based on broad regional hazards. "
            "It is not an official hazard map or an active warning."
        ),
        "precautions": [
            "Review local evacuation routes and emergency contacts",
            "Monitor official weather and disaster-management bulletins",
            "Keep water, medicines, a torch, and essential documents ready",
        ],
        "source": "https://www.ndma.gov.in/",
        "lastUpdatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "dataQuality": "preliminary",
    }
