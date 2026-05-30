from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import ai, alerts, auth, market, public, pumps, sensors, water, weather

app = FastAPI(title="AgroSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(sensors.router)
app.include_router(pumps.router)
app.include_router(weather.router)
app.include_router(market.router)
app.include_router(ai.router)
app.include_router(water.router)
app.include_router(alerts.router)


def create_app():
    return app
