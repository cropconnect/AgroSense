# AgroSense

AI-powered climate monitoring and water resource intelligence for sustainable farming.

## Features

- ESP32 telemetry ingest for soil moisture, temperature, humidity, pH, and NPK
- Smart water analytics with liters saved, efficiency, and carbon impact
- Climate monitoring with Open-Meteo forecasts and drought risk scoring
- Configurable alert rules for farm climate thresholds
- Gemini-backed AI advisor for water advice, drought risk, and crop planning
- Mandi market price proxy

## Quick Start

```bash
cp agrosense-backend/.env.example agrosense-backend/.env
cp agrosense-frontend/.env.example agrosense-frontend/.env
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:8001/api/health
