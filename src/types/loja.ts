export interface FuncionarioLoja {
  usuario_id: number;
  nome: string;
  matricula: string;
  cargo: string;
  salario: number;
  data_contratacao: string;
  loja_id: number;
}

export interface Loja {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  ativo: boolean;
  data_cadastro: string;
  cep: string;
  city: string;
  state: string;
  street: string;
  neighborhood: string;
  number: string;
  funcionarios: FuncionarioLoja[];
}

export interface CreateLojaDTO {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  cep: string;
  city: string;
  state: string;
  street: string;
  neighborhood: string;
  number: string;
}

export interface UpdateLojaDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  cep?: string;
  city?: string;
  state?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
}
