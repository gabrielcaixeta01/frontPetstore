import { api } from "./api";
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from "../types/usuario";

type ApiClientProfile = {
  user_id?: number;
  usuario_id?: number;
  client_type?: string;
  tipo_cliente?: string;
  cep?: string;
  end_cep?: string;
  state?: string;
  end_estado?: string;
  city?: string;
  end_cidade?: string;
};

type ApiEmployeeProfile = {
  user_id?: number;
  usuario_id?: number;
  matricula?: string;
  job_title?: string;
  cargo?: string;
  salary?: string | number;
  salario?: string | number;
  hired_at?: string;
  data_contratacao?: string;
  store_id?: number;
  loja_id?: number;
};

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  profile_type?: string | null;  // backend field name
  cpf?: string | null;
  cnpj?: string | null;
  active: boolean;
  is_superuser: boolean;
  created_at: string;
  client_profile?: ApiClientProfile | null;
  employee_profile?: ApiEmployeeProfile | null;
};

function toUsuario(user: ApiUser): Usuario {
  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    telefone: user.phone ?? "",
    tipo_perfil: (user.profile_type ?? user.role) === "funcionario" ? "funcionario" : "cliente",
    cpf: user.cpf ?? null,
    cnpj: user.cnpj ?? null,
    ativo: user.active,
    is_superuser: user.is_superuser,
    data_cadastro: user.created_at,
    client_profile: user.client_profile
      ? {
          usuario_id:
            user.client_profile.user_id ?? user.client_profile.usuario_id ?? user.id,
          tipo_cliente:
            user.client_profile.client_type ??
            user.client_profile.tipo_cliente ??
            "pessoa_fisica",
          end_cep: user.client_profile.cep ?? user.client_profile.end_cep ?? "",
          end_estado:
            user.client_profile.state ?? user.client_profile.end_estado ?? "",
          end_cidade:
            user.client_profile.city ?? user.client_profile.end_cidade ?? "",
        }
      : null,
    employee_profile: user.employee_profile
      ? {
          usuario_id:
            user.employee_profile.user_id ??
            user.employee_profile.usuario_id ??
            user.id,
          matricula: user.employee_profile.matricula ?? "",
          cargo: user.employee_profile.job_title ?? user.employee_profile.cargo ?? "",
          salario: Number(user.employee_profile.salary ?? user.employee_profile.salario ?? 0),
          data_contratacao:
            user.employee_profile.hired_at ??
            user.employee_profile.data_contratacao ??
            "",
          loja_id: user.employee_profile.store_id ?? user.employee_profile.loja_id ?? 0,
        }
      : null,
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
