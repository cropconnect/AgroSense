from fastapi import APIRouter, Request

from db.connections import get_connection
from models import PumpRuntimeIn, RelayStatusIn, TimerIn
from services.auth_service import get_current_user
from services.water_service import log_pump_session

router = APIRouter(prefix="/api/pumps", tags=["pumps"])


@router.get("")
def list_pumps(request: Request):
    user = get_current_user(request)
    try:
        with get_connection() as conn:
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT * FROM current_pump_state WHERE user_id=%s ORDER BY pump_id", (user["id"],))
            rows = cur.fetchall()
    except Exception:
        rows = []
    return rows or [{"pump_id": "main", "is_on": False, "runtime_minutes": 0, "updated_at": None}]


@router.post("/{pump_id}/on")
def pump_on(pump_id: str, payload: PumpRuntimeIn, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO pump_states (user_id,pump_id,is_on,runtime_minutes) VALUES (%s,%s,1,%s)",
            (user["id"], pump_id, payload.runtime_minutes),
        )
        cur.execute(
            """
            INSERT INTO current_pump_state (user_id,pump_id,is_on,runtime_minutes)
            VALUES (%s,%s,1,%s) ON DUPLICATE KEY UPDATE is_on=1,runtime_minutes=VALUES(runtime_minutes)
            """,
            (user["id"], pump_id, payload.runtime_minutes),
        )
    water = log_pump_session(user["id"], pump_id, payload.runtime_minutes)
    return {"pump_id": pump_id, "is_on": True, **water}


@router.post("/{pump_id}/off")
def pump_off(pump_id: str, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO current_pump_state (user_id,pump_id,is_on,runtime_minutes)
            VALUES (%s,%s,0,0) ON DUPLICATE KEY UPDATE is_on=0,runtime_minutes=0
            """,
            (user["id"], pump_id),
        )
    return {"pump_id": pump_id, "is_on": False}


@router.get("/{pump_id}/command")
def pump_command(pump_id: str):
    return {"pump_id": pump_id, "is_on": False, "runtime_minutes": 0}


@router.put("/{pump_id}/relay-status")
def relay_status(pump_id: str, payload: RelayStatusIn):
    return {"pump_id": pump_id, "device_id": payload.device_id, "is_on": payload.is_on}


@router.get("/{pump_id}/timers")
def list_timers(pump_id: str, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM pump_timers WHERE user_id=%s AND pump_id=%s", (user["id"], pump_id))
        return cur.fetchall()


@router.post("/{pump_id}/timers")
def add_timer(pump_id: str, payload: TimerIn, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO pump_timers (user_id,pump_id,timer_key,start_time,duration_minutes,days,active)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE start_time=VALUES(start_time),duration_minutes=VALUES(duration_minutes),days=VALUES(days),active=VALUES(active)
            """,
            (user["id"], pump_id, payload.timer_key, payload.start_time, payload.duration_minutes, str(payload.days), payload.active),
        )
    return {"ok": True}


@router.delete("/{pump_id}/timers/{timer_key}")
def delete_timer(pump_id: str, timer_key: str, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM pump_timers WHERE user_id=%s AND pump_id=%s AND timer_key=%s", (user["id"], pump_id, timer_key))
    return {"ok": True}
