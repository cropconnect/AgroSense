from fastapi import APIRouter, Header, HTTPException, Query, Request

from config import settings
from models import TelemetryIn
from services.alert_service import check_and_fire_alerts
from services.auth_service import get_current_user
from services.sensor_service import insert_reading, latest_for_device, history_for_device

router = APIRouter(tags=["sensors"])


@router.post("/api/telemetry/ingest")
def ingest(payload: TelemetryIn, x_api_key: str = Header(default="")):
    if x_api_key != settings.telemetry_api_key:
        raise HTTPException(status_code=401, detail="Invalid telemetry API key")
    data = payload.model_dump()
    insert_reading(data)
    fired = check_and_fire_alerts(payload.device_id, data)
    return {"ok": True, "alerts_fired": fired}


@router.get("/api/sensors/latest")
def latest(request: Request):
    user = get_current_user(request)
    return latest_for_device(user.get("sensor_device_id"))


@router.get("/api/sensors/history")
def history(request: Request, hours: int = Query(default=24, ge=1, le=720)):
    user = get_current_user(request)
    return history_for_device(user.get("sensor_device_id"), hours)


@router.get("/api/public/sensors/latest")
def public_latest():
    return latest_for_device(settings.public_landing_sensor_device_id or None)
