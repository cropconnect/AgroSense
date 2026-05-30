import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  withCredentials: true,
});

export async function safeGet(path, fallback) {
  try {
    const { data } = await api.get(path);
    return data;
  } catch {
    return fallback;
  }
}
