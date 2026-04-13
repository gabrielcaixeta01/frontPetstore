import { api } from "./api";
import type { Funcionario, CreateFuncionarioDTO, UpdateFuncionarioDTO } from "../types/funcionario";

export async function getFuncionarios(): Promise<Funcionario[]> {
  const response = await api.get("/funcionario/all");
  return response.data;
}

export async function getFuncionarioById(usuarioId: number): Promise<Funcionario> {
  const response = await api.get(`/funcionario/${usuarioId}`);
  return response.data;
}

export async function createFuncionario(data: CreateFuncionarioDTO): Promise<Funcionario> {
  const response = await api.post("/funcionario", data);
  return response.data;
}

export async function updateFuncionario(usuarioId: number, data: UpdateFuncionarioDTO): Promise<Funcionario> {
  const response = await api.put(`/funcionario/${usuarioId}`, data);
  return response.data;
}

export async function deleteFuncionario(usuarioId: number): Promise<{ message: string }> {
  const response = await api.delete(`/funcionario/${usuarioId}`);
  return response.data;
}
