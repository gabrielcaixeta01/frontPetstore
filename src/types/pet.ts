import type { Category } from "./category";

export interface Pet {
  id: number;
  name: string;
  photoUrls?: string;
  status: string;
  category_id: number;
  owner_id?: number | null;
  category?: Category;
}

export interface CreatePetDTO {
  name: string;
  photoUrls?: string;
  status: string;
  category_id: number;
  owner_id?: number | null;
}

export interface UpdatePetDTO {
  name: string;
  photoUrls?: string;
  status: string;
  category_id: number;
  owner_id?: number | null;
}