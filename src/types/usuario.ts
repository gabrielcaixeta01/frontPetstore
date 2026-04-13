export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo_perfil: 'cliente' | 'funcionario';
  cpf?: string;
  cnpj?: string;
  ativo: boolean;
  is_superuser: boolean;
  data_cadastro: string;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  tipo_perfil: 'cliente' | 'funcionario';
  cpf?: string;
  cnpj?: string;
}

export interface UpdateUsuarioDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  ativo?: boolean;
}
