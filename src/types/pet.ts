export interface PetTag {
  id: number;
  nome: string;
  descricao?: string;
}

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
  tags?: PetTag[];
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
  tag_ids?: number[];
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
  tag_ids?: number[];
}