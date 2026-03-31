import { api } from "./api";
import type { CreateTagDTO, Tag, UpdateTagDTO } from "../types/tag";

export async function getTags(): Promise<Tag[]> {
  const response = await api.get("/tag");
  return response.data;
}

export async function getTagById(id: number): Promise<Tag> {
  const response = await api.get(`/tag/${id}`);
  return response.data;
}

export async function createTag(data: CreateTagDTO): Promise<Tag> {
  const response = await api.post("/tag", data);
  return response.data;
}

export async function updateTag(id: number, data: UpdateTagDTO): Promise<Tag> {
  const response = await api.put(`/tag/${id}`, data);
  return response.data;
}

export async function deleteTag(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/tag/${id}`);
  return response.data;
}