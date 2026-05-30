import { useEffect, useState } from 'react';
import { safeGet } from '../api/client';

const fallback = {
  current: { temperature: 31, humidity: 62, wind_speed: 9, condition: 'Partly cloudy', farming_advice: 'Use sensor readings before irrigating.' },
  drought_risk_score: 46,
  daily: Array.from({ length: 7 }, (_, i) => ({ date: `Day ${i + 1}`, condition: 'Variable', max_temp: 31 + i % 4, min_temp: 22 + i % 3, precipitation: i === 3 ? 4 : 0, farming_advice: 'Adjust irrigation to rainfall and soil moisture.' })),
};

export function useWeather(lat = 28.61, lon = 77.2) {
  const [weather, setWeather] = useState(fallback);
  useEffect(() => {
    safeGet(`/api/weather/forecast?lat=${lat}&lon=${lon}`, fallback).then(setWeather);
  }, [lat, lon]);
  return weather;
}
