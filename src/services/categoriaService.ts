import { api } from "./api";
import type { Categoria } from "../types/categoria";

type ApiCategory = {
  id: number;
  name: string;
  description?: string | null;
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