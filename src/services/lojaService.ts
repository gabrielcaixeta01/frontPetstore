import { api } from "./api";
import type { Loja, CreateLojaDTO, UpdateLojaDTO } from "../types/loja";

export async function getLojas(): Promise<Loja[]> {
  const response = await api.get("/loja/all");
  return response.data;
}

export async function getLojaById(id: number): Promise<Loja> {
  const response = await api.get(`/loja/${id}`);
  return response.data;
}

export async function createLoja(data: CreateLojaDTO): Promise<Loja> {
  const response = await api.post("/loja", data);
  return response.data;
}

export async function updateLoja(id: number, data: UpdateLojaDTO): Promise<Loja> {
  const response = await api.put(`/loja/${id}`, data);
  return response.data;
}

export async function deleteLoja(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/loja/${id}`);
  return response.data;
}
