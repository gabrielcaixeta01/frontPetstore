import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) config.headers = {} as any;
      // ensure Authorization header is set as expected by the backend
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore localStorage errors in non-browser environments
  }

  return config;
});