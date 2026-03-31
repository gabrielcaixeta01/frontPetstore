import { api } from "./api";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../types/pet";

export async function getPets(): Promise<Pet[]> {
  const response = await api.get("/pet/findByStatus", {
    params: {
      status: "available", // ou pending / sold
    },
  });
  return response.data;
}

export async function getPetById(id: number): Promise<Pet> {
  const response = await api.get(`/pet/${id}`);
  return response.data;
}

export async function createPet(data: CreatePetDTO): Promise<Pet> {
  const response = await api.post("/pet", data);
  return response.data;
}

export async function updatePet(id: number, data: UpdatePetDTO): Promise<Pet> {
  const response = await api.put(`/pet/${id}`, data);
  return response.data;
}

export async function deletePet(id: number): Promise<void> {
  await api.delete(`/pet/${id}`);
}