import { api } from "./api";
import type { Categoria } from "../types/categoria";

export async function getCategories(): Promise<Categoria[]> {
  const response = await api.get("/category");
  return response.data;
}