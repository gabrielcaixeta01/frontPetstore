import { api } from "./api";
import type { Categoria } from "../types/categoria";

type ApiCategory = {
  id: number;
  name: string;
  description?: string | null;
};

export type CreateCategoriaDTO = {
  name: string;
  description?: string;
};

export type UpdateCategoriaDTO = {
  name?: string;
  description?: string;
};

function toCategoria(category: ApiCategory): Categoria {
  return {
    id: category.id,
    name: category.name,
  };
}

export async function getCategories(): Promise<Categoria[]> {
  const response = await api.get<ApiCategory[]>("/category/categories");
  return response.data.map(toCategoria);
}

export async function getCategoryById(id: number): Promise<Categoria> {
  const response = await api.get<ApiCategory>(`/category/${id}`);
  return toCategoria(response.data);
}

export async function createCategory(data: CreateCategoriaDTO): Promise<Categoria> {
  const response = await api.post<ApiCategory>("/category", null, {
    params: {
      name: data.name,
      description: data.description,
    },
  });
  return toCategoria(response.data);
}

export async function updateCategory(id: number, data: UpdateCategoriaDTO): Promise<Categoria> {
  const response = await api.put<ApiCategory>(`/category/${id}`, null, {
    params: {
      name: data.name,
      description: data.description,
    },
  });
  return toCategoria(response.data);
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/category/${id}`);
  return response.data;
}