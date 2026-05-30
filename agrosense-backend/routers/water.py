from fastapi import APIRouter, Query, Request

from models import WaterSessionIn
from services.auth_service import get_current_user
from services.water_service import demo_daily, log_pump_session, water_summary

router = APIRouter(prefix="/api/water", tags=["water"])


@router.get("/summary")
def summary(request: Request):
    user = get_current_user(request)
    return water_summary(user["id"])


@router.get("/usage-history")
def usage_history(request: Request, days: int = Query(default=30, ge=1, le=365)):
    get_current_user(request)
    return demo_daily(days)


@router.post("/log-session")
def log_session(payload: WaterSessionIn, request: Request):
    user = get_current_user(request)
    return log_pump_session(user["id"], payload.pump_id, payload.runtime_minutes, payload.soil_moisture_before, payload.soil_moisture_after)
