import json
from typing import Any

from config import settings


def _fallback(prompt: str) -> str:
    return (
        "AgroSense analysis: soil moisture and forecast should drive irrigation. "
        "Irrigate in short dawn cycles, pause before expected rainfall, and inspect pH/NPK drift weekly. "
        "Link Gemini credentials for live generative advice."
    )


def ask_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        return _fallback(prompt)
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        response = model.generate_content(prompt)
        return response.text or _fallback(prompt)
    except Exception:
        return _fallback(prompt)


def parse_json_response(text: str, fallback: dict[str, Any]) -> dict[str, Any]:
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception:
        return fallback
