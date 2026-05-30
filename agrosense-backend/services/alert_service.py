from operator import ge, gt, le, lt
from typing import Any

from db.connections import get_connection

OPS = {">": gt, "<": lt, ">=": ge, "<=": le}


def check_and_fire_alerts(device_id: str, reading: dict[str, Any]) -> int:
    fired = 0
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id FROM users WHERE sensor_device_id=%s LIMIT 1", (device_id,))
        user = cur.fetchone()
        if not user:
            return 0
        cur.execute("SELECT * FROM alert_rules WHERE user_id=%s AND active=1", (user["id"],))
        for rule in cur.fetchall():
            value = reading.get(rule["metric"])
            op = OPS.get(rule["operator"])
            if value is None or op is None or not op(float(value), float(rule["threshold"])):
                continue
            message = rule["message_template"] or f"{rule['metric']} is {value}, crossing {rule['operator']} {rule['threshold']}"
            cur.execute(
                """
                INSERT INTO alert_events (user_id, rule_id, metric, value, message, severity)
                VALUES (%s,%s,%s,%s,%s,%s)
                """,
                (user["id"], rule["id"], rule["metric"], value, message, rule["alert_type"]),
            )
            fired += 1
    return fired
