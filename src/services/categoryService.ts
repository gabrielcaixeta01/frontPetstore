import { api } from "./api";

export async function getCategories() {
  const response = await api.get("/category/categories");
  return response.data;
}