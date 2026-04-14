import { api } from "./api";
import type { LoginDTO, LoginResponse } from "../types/auth";

const TOKEN_STORAGE_KEY = "access_token";

async function attemptLogin(url: string, credentials: LoginDTO): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>(url, null, {
      params: {
        username: credentials.username,
        password: credentials.password,
      },
    });

    return response.data;
  } catch {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await api.post<LoginResponse>(url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  }
}

export async function login(credentials: LoginDTO): Promise<LoginResponse> {
  const endpoints = ["/auth/login", "/login", "/token"];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return await attemptLogin(endpoint, credentials);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}