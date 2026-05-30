import { useEffect, useState } from 'react';
import { safeGet } from '../api/client';

export function useAlerts(pollInterval = 30000) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    function loadAlerts() {
      safeGet('/api/alerts/events?unacknowledged=true', []).then(setEvents);
    }
    loadAlerts();
    const id = setInterval(loadAlerts, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  return events;
}
