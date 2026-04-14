export interface Atendimento {
  id: number;
  valor_final: number;
  data_atendimento: string;
  forma_pagamento: "pix" | "cartao_credito" | "cartao_debito" | "dinheiro";
  status: "agendado" | "concluido" | "cancelado";
  online: boolean;
  observacoes?: string | null;
  loja_id: number;
  cliente_id: number;
  funcionario_id: number;
}

export interface CreateAtendimentoDTO {
  forma_pagamento: "pix" | "cartao_credito" | "cartao_debito" | "dinheiro";
  status: "agendado" | "concluido" | "cancelado";
  online?: boolean;
  observacoes?: string | null;
  loja_id: number;
  cliente_id: number;
  funcionario_id: number;
}

export interface UpdateAtendimentoDTO {
  forma_pagamento?: "pix" | "cartao_credito" | "cartao_debito" | "dinheiro";
  status?: "agendado" | "concluido" | "cancelado";
  online?: boolean;
  observacoes?: string | null;
  loja_id?: number;
  cliente_id?: number;
  funcionario_id?: number;
}

export interface AtendimentoServico {
  atendimento_id: number;
  servico_id: number;
  valor_cobrado: number;
  data_pedido: string;
  data_entrega?: string | null;
  observacoes?: string | null;
}

export interface CreateAtendimentoServicoDTO {
  servico_id: number;
  valor_cobrado: number;
  observacoes?: string | null;
}

export interface UpdateAtendimentoServicoDTO {
  valor_cobrado?: number;
  data_entrega?: string | null;
  observacoes?: string | null;
}

export type Order = Atendimento;
export type CreateOrderDTO = CreateAtendimentoDTO;
export type UpdateOrderDTO = UpdateAtendimentoDTO;