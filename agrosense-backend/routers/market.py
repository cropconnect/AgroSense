from fastapi import APIRouter, Query
import httpx

from config import settings

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/prices")
async def prices(state: str = Query(default="Maharashtra"), commodity: str = Query(default="Tomato")):
    if not settings.data_gov_api_key:
        return [
            {"market": "Pune", "commodity": commodity, "min_price": 1200, "max_price": 1800, "modal_price": 1500, "date": "demo"},
            {"market": "Nashik", "commodity": commodity, "min_price": 1100, "max_price": 1700, "modal_price": 1420, "date": "demo"},
        ]
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    params = {"api-key": settings.data_gov_api_key, "format": "json", "filters[state]": state, "filters[commodity]": commodity, "limit": 25}
    async with httpx.AsyncClient(timeout=15) as client:
        data = (await client.get(url, params=params)).json()
    return [
        {
            "market": row.get("market"),
            "commodity": row.get("commodity"),
            "min_price": row.get("min_price"),
            "max_price": row.get("max_price"),
            "modal_price": row.get("modal_price"),
            "date": row.get("arrival_date"),
        }
        for row in data.get("records", [])
    ]
