import { api } from "./api";
import type { Servico, CreateServicoDTO, UpdateServicoDTO } from "../types/servico";

export async function getServicos(): Promise<Servico[]> {
  const response = await api.get("/servico/all");
  return response.data;
}

export async function getServicoById(id: number): Promise<Servico> {
  const response = await api.get(`/servico/${id}`);
  return response.data;
}

export async function createServico(data: CreateServicoDTO): Promise<Servico> {
  const response = await api.post("/servico", data);
  return response.data;
}

export async function updateServico(id: number, data: UpdateServicoDTO): Promise<Servico> {
  const response = await api.put(`/servico/${id}`, data);
  return response.data;
}

export async function deleteServico(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/servico/${id}`);
  return response.data;
}
