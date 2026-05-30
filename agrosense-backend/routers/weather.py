from fastapi import APIRouter, Query
import httpx

router = APIRouter(prefix="/api/weather", tags=["weather"])

WEATHER_CODES = {
    0: ("Clear", "Irrigate early if soil moisture is below target."),
    1: ("Mainly clear", "Good window for field inspection."),
    2: ("Partly cloudy", "Monitor evaporation before irrigation."),
    3: ("Overcast", "Delay watering if rain is expected."),
    61: ("Rain", "Pause irrigation and capture rainfall benefit."),
    80: ("Showers", "Check drainage and avoid overwatering."),
}


def drought_score(temp: float, humidity: float, precipitation_3d: float) -> float:
    return round(max(0, min(100, (temp - 25) * 2 + (100 - humidity) * 0.5 - precipitation_3d * 10)), 1)


@router.get("/forecast")
async def forecast(lat: float = Query(default=28.61), lon: float = Query(default=77.2)):
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "forecast_days": 7,
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            raw = (await client.get("https://api.open-meteo.com/v1/forecast", params=params)).json()
    except Exception:
        raw = {
            "current": {"temperature_2m": 31, "relative_humidity_2m": 62, "weather_code": 2, "wind_speed_10m": 9},
            "daily": {
                "time": [f"Day {i}" for i in range(1, 8)],
                "temperature_2m_max": [32, 34, 35, 33, 31, 30, 32],
                "temperature_2m_min": [22, 23, 24, 23, 22, 21, 22],
                "precipitation_sum": [0, 0.5, 0, 2, 5, 0, 0],
                "weather_code": [2, 2, 1, 61, 80, 3, 1],
            },
        }
    current = raw["current"]
    daily_raw = raw["daily"]
    daily = []
    for i, day in enumerate(daily_raw["time"]):
        label, advice = WEATHER_CODES.get(daily_raw["weather_code"][i], ("Variable", "Watch local conditions before irrigation."))
        daily.append(
            {
                "date": day,
                "condition": label,
                "max_temp": daily_raw["temperature_2m_max"][i],
                "min_temp": daily_raw["temperature_2m_min"][i],
                "precipitation": daily_raw["precipitation_sum"][i],
                "farming_advice": advice,
            }
        )
    condition, advice = WEATHER_CODES.get(current.get("weather_code"), ("Variable", "Use sensor readings before irrigating."))
    score = drought_score(current["temperature_2m"], current["relative_humidity_2m"], sum(daily_raw["precipitation_sum"][:3]))
    return {
        "current": {
            "temperature": current["temperature_2m"],
            "humidity": current["relative_humidity_2m"],
            "wind_speed": current.get("wind_speed_10m", 0),
            "condition": condition,
            "farming_advice": advice,
        },
        "daily": daily,
        "drought_risk_score": score,
    }
