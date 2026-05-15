import { api } from "./api";
import type { Loja, CreateLojaDTO, UpdateLojaDTO } from "../types/loja";

type ApiStoreEmployee = {
  user_id: number;
  employee_name?: string;
  matricula: string;
  job_title: string;
  salary: string | number;
  hired_at: string;
  store_id: number;
};

type ApiStore = {
  id: number;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  cep: string;
  city: string;
  state: string;
  street: string;
  neighborhood: string;
  number: string;
  active: boolean;
  created_at: string;
  business_hours?: string;
  horario_funcionamento?: string;
  employees?: ApiStoreEmployee[];
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
    cep: store.cep,
    city: store.city,
    state: store.state,
    street: store.street,
    neighborhood: store.neighborhood,
    number: store.number,
    horario_funcionamento: store.business_hours ?? store.horario_funcionamento ?? undefined,
    funcionarios: (store.employees ?? []).map((employee) => ({
      usuario_id: employee.user_id,
      nome: employee.employee_name ?? `Usuário #${employee.user_id}`,
      matricula: employee.matricula,
      cargo: employee.job_title,
      salario: Number(employee.salary),
      data_contratacao: employee.hired_at,
      loja_id: employee.store_id,
    })),
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
      cep: data.cep,
      city: data.city,
      state: data.state,
      street: data.street,
      neighborhood: data.neighborhood,
      number: data.number,
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
      cep: data.cep,
      city: data.city,
      state: data.state,
      street: data.street,
      neighborhood: data.neighborhood,
      number: data.number,
    },
  });
  return toLoja(response.data);
}

export async function deleteLoja(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/store/${id}`);
  return response.data;
}
