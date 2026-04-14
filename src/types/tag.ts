export interface Etiqueta {
  id: number;
  nome: string;
  descricao?: string;
}

export interface CreateEtiquetaDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateEtiquetaDTO {
  nome?: string;
  descricao?: string;
}