export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo_perfil: "cliente" | "funcionario";
  cpf?: string | null;
  cnpj?: string | null;
  ativo: boolean;
  is_superuser: boolean;
  data_cadastro: string;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  tipo_perfil: "cliente" | "funcionario";
  cpf?: string | null;
  cnpj?: string | null;
}

export interface UpdateUsuarioDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  tipo_perfil?: "cliente" | "funcionario";
  cpf?: string | null;
  cnpj?: string | null;
  ativo?: boolean;
  is_superuser?: boolean;
}

export type User = Usuario;
export type CreateUserDTO = CreateUsuarioDTO;
export type UpdateUserDTO = UpdateUsuarioDTO;