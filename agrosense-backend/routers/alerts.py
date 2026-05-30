from fastapi import APIRouter, HTTPException, Query, Request

from db.connections import get_connection
from models import AlertRuleIn
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["alerts"])
VALID_METRICS = {"soil_moisture", "temperature", "humidity", "ph", "drought_risk_score"}
VALID_OPS = {"<", ">", "<=", ">="}


@router.get("/rules")
def rules(request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM alert_rules WHERE user_id=%s ORDER BY created_at DESC", (user["id"],))
        return cur.fetchall()


@router.post("/rules")
def create_rule(payload: AlertRuleIn, request: Request):
    user = get_current_user(request)
    if payload.metric not in VALID_METRICS or payload.operator not in VALID_OPS:
        raise HTTPException(status_code=400, detail="Invalid alert rule")
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO alert_rules (user_id,metric,operator,threshold,alert_type,message_template) VALUES (%s,%s,%s,%s,%s,%s)",
            (user["id"], payload.metric, payload.operator, payload.threshold, payload.alert_type, payload.message_template),
        )
        return {"id": cur.lastrowid, **payload.model_dump()}


@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM alert_rules WHERE id=%s AND user_id=%s", (rule_id, user["id"]))
    return {"ok": True}


@router.get("/events")
def events(request: Request, unacknowledged: bool = Query(default=False)):
    user = get_current_user(request)
    where = "user_id=%s AND acknowledged=0" if unacknowledged else "user_id=%s"
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(f"SELECT * FROM alert_events WHERE {where} ORDER BY fired_at DESC LIMIT 50", (user["id"],))
        rows = cur.fetchall()
    return rows


@router.post("/events/{event_id}/acknowledge")
def acknowledge(event_id: int, request: Request):
    user = get_current_user(request)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE alert_events SET acknowledged=1 WHERE id=%s AND user_id=%s", (event_id, user["id"]))
    return {"ok": True}
