export interface Tag {
  id: number;
  nome: string;
  descricao?: string;
}

export interface CreateTagDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateTagDTO {
  nome?: string;
  descricao?: string;
}