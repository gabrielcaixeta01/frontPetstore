import { api } from "./api";
import type { Atendimento, CreateAtendimentoDTO, UpdateAtendimentoDTO, AtendimentoServico, CreateAtendimentoServicoDTO, UpdateAtendimentoServicoDTO } from "../types/atendimento";

export async function getAtendimentos(): Promise<Atendimento[]> {
  const response = await api.get("/atendimento/all");
  return response.data;
}

export async function getAtendimentoById(id: number): Promise<Atendimento> {
  const response = await api.get(`/atendimento/${id}`);
  return response.data;
}

export async function createAtendimento(data: CreateAtendimentoDTO): Promise<Atendimento> {
  const response = await api.post("/atendimento", data);
  return response.data;
}

export async function updateAtendimento(id: number, data: UpdateAtendimentoDTO): Promise<Atendimento> {
  const response = await api.put(`/atendimento/${id}`, data);
  return response.data;
}

export async function deleteAtendimento(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/atendimento/${id}`);
  return response.data;
}

export async function getAtendimentoServicos(atendimentoId: number): Promise<AtendimentoServico[]> {
  const response = await api.get(`/atendimento/${atendimentoId}/servicos`);
  return response.data;
}

export async function createAtendimentoServico(atendimentoId: number, data: CreateAtendimentoServicoDTO): Promise<AtendimentoServico> {
  const response = await api.post(`/atendimento/${atendimentoId}/servico`, data);
  return response.data;
}

export async function updateAtendimentoServico(atendimentoId: number, servicoId: number, data: UpdateAtendimentoServicoDTO): Promise<AtendimentoServico> {
  const response = await api.put(`/atendimento/${atendimentoId}/servico/${servicoId}`, data);
  return response.data;
}

export async function deleteAtendimentoServico(atendimentoId: number, servicoId: number): Promise<{ message: string }> {
  const response = await api.delete(`/atendimento/${atendimentoId}/servico/${servicoId}`);
  return response.data;
}
