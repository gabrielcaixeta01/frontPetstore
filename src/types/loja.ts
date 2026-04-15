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
  end_cep: string;
  end_cidade: string;
  end_estado: string;
  end_rua: string;
  end_bairro: string;
  end_numero: string;
  funcionarios: FuncionarioLoja[];
}

export interface CreateLojaDTO {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  end_cep: string;
  end_cidade: string;
  end_estado: string;
  end_rua: string;
  end_bairro: string;
  end_numero: string;
}

export interface UpdateLojaDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  end_cep?: string;
  end_cidade?: string;
  end_estado?: string;
  end_rua?: string;
  end_bairro?: string;
  end_numero?: string;
}
