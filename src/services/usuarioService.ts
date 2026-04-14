import { api } from "./api";
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from "../types/usuario";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  active: boolean;
  is_superuser: boolean;
  created_at: string;
};

function toUsuario(user: ApiUser): Usuario {
  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    telefone: user.phone ?? "",
    tipo_perfil: user.role === "funcionario" ? "funcionario" : "cliente",
    cpf: user.cpf ?? null,
    cnpj: user.cnpj ?? null,
    ativo: user.active,
    is_superuser: user.is_superuser,
    data_cadastro: user.created_at,
  };
}

export async function getUsuarios(): Promise<Usuario[]> {
  const response = await api.get<ApiUser[]>("/user/users");
  return response.data.map(toUsuario);
}

export async function getUsuarioById(id: number): Promise<Usuario> {
  const response = await api.get<ApiUser>(`/user/${id}`);
  return toUsuario(response.data);
}

export async function createUsuario(data: CreateUsuarioDTO): Promise<Usuario> {
  const response = await api.post<ApiUser>("/user", null, {
    params: {
      name: data.nome,
      email: data.email,
      password: data.senha_hash,
      phone: data.telefone || undefined,
      role: data.tipo_perfil,
    },
  });
  return toUsuario(response.data);
}

export async function updateUsuario(id: number, data: UpdateUsuarioDTO): Promise<Usuario> {
  const response = await api.put<ApiUser>(`/user/${id}`, null, {
    params: {
      name: data.nome,
      email: data.email,
      phone: data.telefone,
      role: data.tipo_perfil,
      cpf: data.cpf,
      cnpj: data.cnpj,
      user_active: data.ativo,
    },
  });
  return toUsuario(response.data);
}

export async function deleteUsuario(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/user/${id}`);
  return response.data;
}
