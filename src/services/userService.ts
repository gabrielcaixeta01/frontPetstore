import { api } from "./api";

export async function getUsers() {
  const response = await api.get("/user");
  return response.data;
}