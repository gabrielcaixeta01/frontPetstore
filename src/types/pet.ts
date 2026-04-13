export interface Pet {
  id: number;
  nome: string;
  raca?: string;
  sexo?: 'macho' | 'femea';
  porte?: 'pequeno' | 'medio' | 'grande';
  peso?: number;
  observacoes_saude?: string;
  categoria_id: number;
  dono_id: number;
}

export interface CreatePetDTO {
  nome: string;
  raca?: string;
  sexo?: 'macho' | 'femea';
  porte?: 'pequeno' | 'medio' | 'grande';
  peso?: number;
  observacoes_saude?: string;
  categoria_id: number;
  dono_id: number;
}

export interface UpdatePetDTO {
  nome?: string;
  raca?: string;
  sexo?: 'macho' | 'femea';
  porte?: 'pequeno' | 'medio' | 'grande';
  peso?: number;
  observacoes_saude?: string;
  categoria_id?: number;
  dono_id?: number;
}