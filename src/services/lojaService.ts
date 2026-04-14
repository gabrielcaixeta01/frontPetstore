import { api } from "./api";
import type { Loja, CreateLojaDTO, UpdateLojaDTO } from "../types/loja";

type ApiStore = {
  id: number;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  cep: string;
  city: string;
  state: string;
  address: string;
  neighborhood: string;
  number: string;
  active: boolean;
  created_at: string;
};

function toLoja(store: ApiStore): Loja {
  return {
    id: store.id,
    nome: store.name,
    cnpj: store.cnpj,
    telefone: store.phone,
    email: store.email,
    ativo: store.active,
    data_cadastro: store.created_at,
    end_cep: store.cep,
    end_cidade: store.city,
    end_estado: store.state,
    end_rua: store.address,
    end_bairro: store.neighborhood,
    end_numero: store.number,
  };
}

export async function getLojas(): Promise<Loja[]> {
  const response = await api.get<ApiStore[]>("/store/stores");
  return response.data.map(toLoja);
}

export async function getLojaById(id: number): Promise<Loja> {
  const response = await api.get<ApiStore>(`/store/${id}`);
  return toLoja(response.data);
}

export async function createLoja(data: CreateLojaDTO): Promise<Loja> {
  const response = await api.post<ApiStore>("/store", null, {
    params: {
      name: data.nome,
      cnpj: data.cnpj,
      phone: data.telefone,
      email: data.email,
      cep: data.end_cep,
      city: data.end_cidade,
      state: data.end_estado,
      address: data.end_rua,
      neighborhood: data.end_bairro,
      number: data.end_numero,
    },
  });
  return toLoja(response.data);
}

export async function updateLoja(id: number, data: UpdateLojaDTO): Promise<Loja> {
  const response = await api.put<ApiStore>(`/store/${id}`, null, {
    params: {
      name: data.nome,
      phone: data.telefone,
      email: data.email,
      active: data.ativo,
      cep: data.end_cep,
      city: data.end_cidade,
      state: data.end_estado,
      address: data.end_rua,
      neighborhood: data.end_bairro,
      number: data.end_numero,
    },
  });
  return toLoja(response.data);
}

export async function deleteLoja(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/store/${id}`);
  return response.data;
}
