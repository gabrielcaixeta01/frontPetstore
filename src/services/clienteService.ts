import { api } from "./api";
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from "../types/cliente";

export async function getClientes(): Promise<Cliente[]> {
  const response = await api.get("/cliente/all");
  return response.data;
}

export async function getClienteById(usuarioId: number): Promise<Cliente> {
  const response = await api.get(`/cliente/${usuarioId}`);
  return response.data;
}

export async function createCliente(data: CreateClienteDTO): Promise<Cliente> {
  const response = await api.post("/cliente", data);
  return response.data;
}

export async function updateCliente(usuarioId: number, data: UpdateClienteDTO): Promise<Cliente> {
  const response = await api.put(`/cliente/${usuarioId}`, data);
  return response.data;
}

export async function deleteCliente(usuarioId: number): Promise<{ message: string }> {
  const response = await api.delete(`/cliente/${usuarioId}`);
  return response.data;
}
