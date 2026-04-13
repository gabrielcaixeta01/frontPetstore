import { api } from "./api";
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from "../types/usuario";

export async function getUsuarios(): Promise<Usuario[]> {
  const response = await api.get("/usuario/all");
  return response.data;
}

export async function getUsuarioById(id: number): Promise<Usuario> {
  const response = await api.get(`/usuario/${id}`);
  return response.data;
}

export async function createUsuario(data: CreateUsuarioDTO): Promise<Usuario> {
  const response = await api.post("/usuario", data);
  return response.data;
}

export async function updateUsuario(id: number, data: UpdateUsuarioDTO): Promise<Usuario> {
  const response = await api.put(`/usuario/${id}`, data);
  return response.data;
}

export async function deleteUsuario(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/usuario/${id}`);
  return response.data;
}
