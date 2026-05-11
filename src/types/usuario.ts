export interface ClientePerfil {
  usuario_id: number;
  tipo_cliente: string;
  end_cep: string;
  end_estado: string;
  end_cidade: string;
}

export interface FuncionarioPerfil {
  usuario_id: number;
  matricula: string;
  cargo: string;
  salario: number;
  data_contratacao: string;
  loja_id: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo_perfil: 'cliente' | 'funcionario';
  cpf?: string | null;
  cnpj?: string | null;
  ativo: boolean;
  is_superuser: boolean;
  data_cadastro: string;
  client_profile?: ClientePerfil | null;
  employee_profile?: FuncionarioPerfil | null;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  tipo_perfil: 'cliente' | 'funcionario';
  cpf?: string | null;
  cnpj?: string | null;
}

export interface UpdateUsuarioDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  tipo_perfil?: 'cliente' | 'funcionario';
  cpf?: string;
  cnpj?: string;
  ativo?: boolean;
  is_superuser?: boolean;
  cep?: string;
  state?: string;
  city?: string;
}
