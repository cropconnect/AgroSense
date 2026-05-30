from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_database: str = "agrosense"
    mysql_pool_size: int = 5
    secret_key: str = "dev_only_change_this_secret_key_please"
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"
    frontend_origins: str = "http://localhost:3000,http://localhost:5173"
    telemetry_api_key: str = "dev-esp32-key"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    data_gov_api_key: str = ""
    pump_flow_rate_lpm: float = 15.0
    traditional_irrigation_lpm: float = 40.0
    public_landing_sensor_device_id: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins(self) -> list[str]:
        return [item.strip() for item in self.frontend_origins.split(",") if item.strip()]


settings = Settings()
