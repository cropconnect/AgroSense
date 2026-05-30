from fastapi import APIRouter, Request

from config import settings
from models import ChatIn, CropRecommendIn, DroughtRiskIn, WaterAdviceIn
from services.ai_service import ask_gemini, parse_json_response
from services.rate_limit import enforce_rate_limit

router = APIRouter(prefix="/api/ai", tags=["ai"])


def system_context(sensor_data, weather_data, location):
    return (
        "You are AgroSense AI, a climate-aware agricultural advisor. "
        f"Current sensor readings: {sensor_data}. Current weather: {weather_data}. Location: {location}. "
        "Focus on water conservation, climate adaptation, and sustainable farming practices."
    )


@router.post("/chat")
def chat(payload: ChatIn, request: Request):
    enforce_rate_limit(request, "ai", 10, 60)
    reply = ask_gemini(f"{system_context(payload.sensor_data, payload.weather_data, payload.location)} Farmer asks: {payload.message}")
    return {"reply": reply, "model": settings.gemini_model}


@router.post("/water-advice")
def water_advice(payload: WaterAdviceIn, request: Request):
    enforce_rate_limit(request, "ai", 10, 60)
    prompt = f"{system_context(payload.sensor_data, payload.weather_data, '')} Give water advice for {payload.crop_type} on {payload.land_size_acres} acres. Return practical schedule and liters."
    text = ask_gemini(prompt)
    return {
        "advice": text,
        "estimated_daily_liters": round(payload.land_size_acres * 1200, 1),
        "irrigation_schedule": "Two short dawn cycles, skip if rainfall forecast exceeds 5 mm.",
        "water_saving_tips": ["Check soil moisture before pump start", "Use mulch on exposed beds", "Irrigate before heat peak"],
    }


@router.post("/drought-risk")
def drought_risk(payload: DroughtRiskIn, request: Request):
    enforce_rate_limit(request, "ai", 10, 60)
    text = ask_gemini(f"{system_context(payload.sensor_data, payload.weather_data, payload.location)} Return JSON drought risk for {payload.crop_type}.")
    return parse_json_response(
        text,
        {
            "risk_level": "medium",
            "risk_score": 48,
            "explanation": text,
            "recommendations": ["Prioritize drip zones", "Irrigate at dawn", "Track soil moisture twice daily"],
            "days_until_critical": 9,
        },
    )


@router.post("/crop-recommend")
def crop_recommend(payload: CropRecommendIn, request: Request):
    enforce_rate_limit(request, "ai", 10, 60)
    text = ask_gemini(f"{system_context(payload.sensor_data, {}, payload.location)} Recommend crops for {payload.season}.")
    return {
        "summary": text,
        "crops": [
            {"name": "Millet", "water_requirement_mm": 350, "climate_suitability_score": 88, "planting_advice": "Strong fit for low-water seasons."},
            {"name": "Pigeon pea", "water_requirement_mm": 450, "climate_suitability_score": 81, "planting_advice": "Use wider spacing and moisture checks."},
        ],
    }
