export interface Cliente {
  usuario_id: number;
  tipo_cliente: 'pessoa_fisica' | 'pessoa_juridica';
  end_cep: string;
  end_estado: string;
  end_cidade: string;
}

export interface CreateClienteDTO {
  usuario_id: number;
  tipo_cliente: 'pessoa_fisica' | 'pessoa_juridica';
  end_cep: string;
  end_estado: string;
  end_cidade: string;
}

export interface UpdateClienteDTO {
  tipo_cliente?: 'pessoa_fisica' | 'pessoa_juridica';
  end_cep?: string;
  end_estado?: string;
  end_cidade?: string;
}
