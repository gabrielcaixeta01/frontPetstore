import { api } from "./api";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../types/tag";

type ApiTag = {
  id: number;
  name: string;
  description?: string | null;
};

function toEtiqueta(tag: ApiTag): Etiqueta {
  return {
    id: tag.id,
    nome: tag.name,
    descricao: tag.description ?? undefined,
  };
}

export async function getTags(): Promise<Etiqueta[]> {
  const response = await api.get<ApiTag[]>("/tag/tags");
  return response.data.map(toEtiqueta);
}

export async function getTagById(id: number): Promise<Etiqueta> {
  const response = await api.get<ApiTag>(`/tag/${id}`);
  return toEtiqueta(response.data);
}

export async function createTag(data: CreateEtiquetaDTO): Promise<Etiqueta> {
  const response = await api.post<ApiTag>("/tag", null, {
    params: {
      name: data.nome,
      description: data.descricao,
    },
  });
  return toEtiqueta(response.data);
}

export async function updateTag(id: number, data: UpdateEtiquetaDTO): Promise<Etiqueta> {
  const response = await api.put<ApiTag>(`/tag/${id}`, null, {
    params: {
      name: data.nome,
      description: data.descricao,
    },
  });
  return toEtiqueta(response.data);
}

export async function deleteTag(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/tag/${id}`);
  return response.data;
}