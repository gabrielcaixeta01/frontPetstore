import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`);
      }
    }
    return parts.join("&");
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || "");
    const isAuthLoginRequest = requestUrl.includes("/auth/login");

    if (error.response?.status === 401 && !isAuthLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);

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