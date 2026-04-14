import { api } from "./api";
import type { Servico, CreateServicoDTO, UpdateServicoDTO } from "../types/servico";

type ApiService = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
};

function toServico(service: ApiService): Servico {
  return {
    id: service.id,
    nome: service.name,
    descricao: service.description ?? undefined,
    preco: service.price,
  };
}

export async function getServicos(): Promise<Servico[]> {
  const response = await api.get<ApiService[]>("/service/services");
  return response.data.map(toServico);
}

export async function getServicoById(id: number): Promise<Servico> {
  const response = await api.get<ApiService>(`/service/${id}`);
  return toServico(response.data);
}

export async function createServico(data: CreateServicoDTO): Promise<Servico> {
  const response = await api.post<ApiService>("/service", null, {
    params: {
      name: data.nome,
      description: data.descricao,
      price: data.preco,
    },
  });
  return toServico(response.data);
}

export async function updateServico(id: number, data: UpdateServicoDTO): Promise<Servico> {
  const response = await api.put<ApiService>(`/service/${id}`, null, {
    params: {
      name: data.nome,
      description: data.descricao,
      price: data.preco,
    },
  });
  return toServico(response.data);
}

export async function deleteServico(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/service/${id}`);
  return response.data;
}
