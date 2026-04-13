export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
}

export interface CreateServicoDTO {
  nome: string;
  descricao?: string;
  preco: number;
}

export interface UpdateServicoDTO {
  nome?: string;
  descricao?: string;
  preco?: number;
}
