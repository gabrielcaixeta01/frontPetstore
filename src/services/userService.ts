import { api } from "./api";
import type { CreateUserDTO, UpdateUserDTO, User } from "../types/user";

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/usuario/all");
  return response.data;
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get(`/usuario/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserDTO): Promise<User> {
  const response = await api.post("/usuario", data);
  return response.data;
}

export async function updateUser(id: number, data: UpdateUserDTO): Promise<User> {
  const response = await api.put(`/usuario/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/usuario/${id}`);
  return response.data;
}