import { api } from "./api";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../types/usuario";

export async function getUsers(): Promise<Usuario[]> {
  const response = await api.get("/usuario/all");
  return response.data;
}

export async function getUserById(id: number): Promise<Usuario> {
  const response = await api.get(`/usuario/${id}`);
  return response.data;
}

export async function createUser(data: CreateUsuarioDTO): Promise<Usuario> {
  const response = await api.post("/usuario", data);
  return response.data;
}

export async function updateUser(id: number, data: UpdateUsuarioDTO): Promise<Usuario> {
  const response = await api.put(`/usuario/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/usuario/${id}`);
  return response.data;
}