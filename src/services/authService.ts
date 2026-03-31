import { api } from "./api";
import type { LoginDTO, LoginResponse } from "../types/auth";

export async function login(data: LoginDTO): Promise<LoginResponse> {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function isAuthenticated() {
  return !!getToken();
}