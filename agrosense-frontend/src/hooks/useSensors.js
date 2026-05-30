import { useEffect, useState } from 'react';
import { safeGet } from '../api/client';

const latestFallback = { soil_moisture: 36.8, temperature: 31.2, humidity: 61.4, ph: 6.7, nitrogen: 44, phosphorus: 21, potassium: 37 };

export function useSensors(hours = 24) {
  const [latest, setLatest] = useState(latestFallback);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      safeGet('/api/sensors/latest', latestFallback),
      safeGet(`/api/sensors/history?hours=${hours}`, []),
    ]).then(([nextLatest, nextHistory]) => {
      setLatest(nextLatest || latestFallback);
      setHistory(nextHistory.length ? nextHistory : Array.from({ length: 12 }, (_, i) => ({
        recorded_at: `${i}:00`,
        soil_moisture: 31 + (i % 6),
        temperature: 27 + (i % 8),
        humidity: 56 + (i % 10),
        ph: 6.2 + (i % 4) / 10,
        nitrogen: 36 + i,
        phosphorus: 18 + (i % 6),
        potassium: 30 + (i % 9),
      })));
      setLoading(false);
    });
  }, [hours]);
  return { latest, history, loading };
}
