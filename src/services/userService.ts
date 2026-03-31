import { api } from "./api";
import type { CreateUserDTO, UpdateUserDTO, User } from "../types/user";

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/user");
  return response.data;
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get(`/user/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserDTO): Promise<User> {
  const response = await api.post("/user", data);
  return response.data;
}

export async function updateUser(id: number, data: UpdateUserDTO): Promise<User> {
  const response = await api.put(`/user/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/user/${id}`);
  return response.data;
}