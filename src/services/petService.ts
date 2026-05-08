import { api } from "./api";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../types/pet";

type ApiPet = {
  id: number;
  name: string;
  breed?: string | null;
  sex?: string | null;
  size?: string | null;
  weight?: number | null;
  health_notes?: string | null;
  category_id: number;
  owner_id: number;
};

function fromApiSex(value?: string | null): Pet["sexo"] | undefined {
  if (!value) return undefined;
  if (value === "M") return "macho";
  if (value === "F") return "femea";
  if (value === "macho" || value === "femea") return value;
  return undefined;
}

function toApiSex(value?: Pet["sexo"]): string | undefined {
  // backend _normalize_sex does .lower() before dict lookup;
  // "M"/"F" become "m"/"f" which aren't keys → 400.
  // "macho"/"femea" survive .lower() and ARE keys → works.
  return value || undefined;
}

function toPet(pet: ApiPet): Pet {
  return {
    id: pet.id,
    nome: pet.name,
    raca: pet.breed ?? undefined,
    sexo: fromApiSex(pet.sex),
    porte: (pet.size as Pet["porte"]) ?? undefined,
    peso: pet.weight ?? undefined,
    observacoes_saude: pet.health_notes ?? undefined,
    categoria_id: pet.category_id,
    dono_id: pet.owner_id,
  };
}

export async function getPets(): Promise<Pet[]> {
  const response = await api.get<ApiPet[]>("/pet/pets");
  return response.data.map(toPet);
}

export async function getPetById(id: number): Promise<Pet> {
  const response = await api.get<ApiPet>(`/pet/${id}`);
  return toPet(response.data);
}

export async function createPet(data: CreatePetDTO): Promise<Pet> {
  const response = await api.post<ApiPet>("/pet", null, {
    params: {
      name: data.nome,
      breed: data.raca,
      sex: toApiSex(data.sexo),
      size: data.porte,
      weight: data.peso,
      health_notes: data.observacoes_saude,
      category_id: data.categoria_id,
      owner_id: data.dono_id,
    },
  });
  return toPet(response.data);
}

export async function updatePet(id: number, data: UpdatePetDTO): Promise<Pet> {
  const response = await api.put<ApiPet>(`/pet/${id}`, null, {
    params: {
      name: data.nome,
      breed: data.raca,
      sex: toApiSex(data.sexo),
      size: data.porte,
      weight: data.peso,
      health_notes: data.observacoes_saude,
      category_id: data.categoria_id,
      owner_id: data.dono_id,
    },
  });
  return toPet(response.data);
}

export async function deletePet(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/pet/${id}`);
  return response.data;
}