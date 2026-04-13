export interface Funcionario {
  usuario_id: number;
  matricula: string;
  cargo: string;
  salario: number;
  data_contratacao: string;
  loja_id: number;
}

export interface CreateFuncionarioDTO {
  usuario_id: number;
  matricula: string;
  cargo: string;
  salario: number;
  data_contratacao: string;
  loja_id: number;
}

export interface UpdateFuncionarioDTO {
  matricula?: string;
  cargo?: string;
  salario?: number;
  loja_id?: number;
}
