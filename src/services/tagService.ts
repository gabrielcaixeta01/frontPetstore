import { api } from "./api";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../types/tag";

export async function getTags(): Promise<Etiqueta[]> {
  const response = await api.get("/tag");
  return response.data;
}

export async function getTagById(id: number): Promise<Etiqueta> {
  const response = await api.get(`/tag/${id}`);
  return response.data;
}

export async function createTag(data: CreateEtiquetaDTO): Promise<Etiqueta> {
  const response = await api.post("/tag", data);
  return response.data;
}

export async function updateTag(id: number, data: UpdateEtiquetaDTO): Promise<Etiqueta> {
  const response = await api.put(`/tag/${id}`, data);
  return response.data;
}

export async function deleteTag(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/tag/${id}`);
  return response.data;
}