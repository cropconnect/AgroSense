from fastapi import APIRouter, Query, Request

from db.connections import get_connection
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
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            f"""
            SELECT session_date date, SUM(liters_used) liters_used, SUM(liters_saved) liters_saved
            FROM water_usage_log
            WHERE user_id=%s AND session_date >= CURDATE() - INTERVAL {days} DAY
            GROUP BY session_date ORDER BY session_date
            """,
            (user["id"],),
        )
        rows = cur.fetchall()
    return rows or [{**item, "is_demo": True} for item in demo_daily(days)]


@router.post("/log-session")
def log_session(payload: WaterSessionIn, request: Request):
    user = get_current_user(request)
    return log_pump_session(user["id"], payload.pump_id, payload.runtime_minutes, payload.soil_moisture_before, payload.soil_moisture_after)
