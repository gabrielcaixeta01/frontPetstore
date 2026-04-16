import { api } from "./api";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../types/tag";

type ApiTag = {
  id: number;
  name?: string;
  nome?: string;
  description?: string | null;
  descricao?: string | null;
};

function toEtiqueta(tag: ApiTag): Etiqueta {
  return {
    id: tag.id,
    nome: tag.name ?? tag.nome ?? "",
    descricao: tag.description ?? tag.descricao ?? undefined,
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
  const payload = {
    name: data.nome,
    nome: data.nome,
    description: data.descricao,
    descricao: data.descricao,
  };

  const response = await api.post<ApiTag>("/tag", payload, {
    params: payload,
  });
  const created = toEtiqueta(response.data);

  const descricaoInformada = data.descricao?.trim();
  const descricaoPersistida = created.descricao?.trim();

  // Fallback: alguns backends ignoram descricao no create, mas aceitam no update.
  if (descricaoInformada && !descricaoPersistida) {
    try {
      return await updateTag(created.id, {
        nome: created.nome || data.nome,
        descricao: descricaoInformada,
      });
    } catch (error) {
      console.warn("Falha ao aplicar fallback de descricao da tag apos create:", error);
      return created;
    }
  }

  return created;
}

export async function updateTag(id: number, data: UpdateEtiquetaDTO): Promise<Etiqueta> {
  const response = await api.put<ApiTag>(`/tag/${id}`, null, {
    params: {
      name: data.nome,
      nome: data.nome,
      description: data.descricao,
      descricao: data.descricao,
    },
  });
  return toEtiqueta(response.data);
}

export async function deleteTag(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/tag/${id}`);
  return response.data;
}