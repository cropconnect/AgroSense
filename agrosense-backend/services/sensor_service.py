from datetime import datetime, timedelta
from typing import Any

from db.connections import get_connection

DEMO_READING = {
    "device_id": "AGRO-DEMO-01",
    "soil_moisture": 36.8,
    "humidity": 61.4,
    "temperature": 31.2,
    "ph": 6.7,
    "nitrogen": 44,
    "phosphorus": 21,
    "potassium": 37,
    "recorded_at": datetime.utcnow().isoformat(),
}


def insert_reading(data: dict[str, Any]) -> None:
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT IGNORE INTO devices (device_id, display_name) VALUES (%s, %s)",
            (data["device_id"], data["device_id"]),
        )
        cur.execute(
            """
            INSERT INTO sensor_readings
              (device_id, soil_moisture, humidity, temperature, ph, nitrogen, phosphorus, potassium, raw_payload)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                data["device_id"],
                data.get("soil_moisture"),
                data.get("humidity"),
                data.get("temperature"),
                data.get("ph"),
                data.get("nitrogen"),
                data.get("phosphorus"),
                data.get("potassium"),
                str(data),
            ),
        )


def latest_for_device(device_id: str | None) -> dict[str, Any]:
    if not device_id:
        return DEMO_READING
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM sensor_readings WHERE device_id=%s ORDER BY recorded_at DESC LIMIT 1", (device_id,))
        row = cur.fetchone()
        return row or {**DEMO_READING, "device_id": device_id}


def history_for_device(device_id: str | None, hours: int) -> list[dict[str, Any]]:
    if not device_id:
        now = datetime.utcnow()
        return [
            {
                **DEMO_READING,
                "recorded_at": (now - timedelta(hours=i)).isoformat(),
                "soil_moisture": 30 + (i % 9),
                "temperature": 28 + (i % 6),
                "humidity": 58 + (i % 11),
                "ph": 6.3 + (i % 5) / 10,
            }
            for i in range(min(hours, 48), 0, -2)
        ]
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM sensor_readings WHERE device_id=%s AND recorded_at >= NOW() - INTERVAL %s HOUR ORDER BY recorded_at",
            (device_id, hours),
        )
        return cur.fetchall()
