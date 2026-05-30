from typing import Any

from pydantic import BaseModel, Field


class TelemetryIn(BaseModel):
    device_id: str = Field(min_length=1, max_length=80)
    soil_moisture: float | None = Field(default=None, ge=0, le=100)
    humidity: float | None = Field(default=None, ge=0, le=100)
    temperature: float | None = Field(default=None, ge=-20, le=80)
    ph: float | None = Field(default=None, ge=0, le=14)
    nitrogen: float | None = Field(default=None, ge=0)
    phosphorus: float | None = Field(default=None, ge=0)
    potassium: float | None = Field(default=None, ge=0)


class SignupIn(BaseModel):
    email: str
    password: str = Field(min_length=8)
    name: str = ""
    phone: str = ""
    state: str = ""
    location: str = ""
    district: str = ""
    land_size: float | None = None
    sensor_device_id: str = ""


class LoginIn(BaseModel):
    email: str
    password: str


class ForgotPasswordIn(BaseModel):
    email: str


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=64, max_length=64)
    new_password: str = Field(min_length=8)


class ProfileIn(BaseModel):
    name: str | None = None
    phone: str | None = None
    state: str | None = None
    location: str | None = None
    district: str | None = None
    land_size: float | None = None
    sensor_device_id: str | None = None


class PumpRuntimeIn(BaseModel):
    runtime_minutes: int = Field(default=15, ge=0, le=1440)


class RelayStatusIn(BaseModel):
    device_id: str
    is_on: bool


class TimerIn(BaseModel):
    timer_key: str
    start_time: str
    duration_minutes: int = Field(ge=1)
    days: list[str] = Field(default_factory=list)
    active: bool = True


class WaterSessionIn(BaseModel):
    pump_id: str = "main"
    runtime_minutes: int = Field(ge=1)
    soil_moisture_before: float | None = None
    soil_moisture_after: float | None = None


class AlertRuleIn(BaseModel):
    metric: str
    operator: str
    threshold: float
    alert_type: str = "warning"
    message_template: str = ""


class ChatIn(BaseModel):
    message: str
    language: str = "en"
    sensor_data: dict[str, Any] = Field(default_factory=dict)
    weather_data: dict[str, Any] = Field(default_factory=dict)
    market_data: dict[str, Any] = Field(default_factory=dict)
    location: str = ""
    history: list[dict[str, str]] = Field(default_factory=list)


class WaterAdviceIn(BaseModel):
    sensor_data: dict[str, Any] = Field(default_factory=dict)
    weather_data: dict[str, Any] = Field(default_factory=dict)
    land_size_acres: float = 1
    crop_type: str = "mixed vegetables"


class DroughtRiskIn(BaseModel):
    sensor_data: dict[str, Any] = Field(default_factory=dict)
    weather_data: dict[str, Any] = Field(default_factory=dict)
    location: str = ""
    crop_type: str = "current crop"


class CropRecommendIn(BaseModel):
    sensor_data: dict[str, Any] = Field(default_factory=dict)
    location: str = ""
    season: str = "current"
