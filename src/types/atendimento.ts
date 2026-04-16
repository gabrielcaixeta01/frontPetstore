export interface AppointmentItem {
  appointment_id: number;
  service_id: number;
  charged_value: number;
  order_date: string;
  delivery_date: string | null;
  observations: string | null;
}

export interface Atendimento {
  id: number;
  valor_final: number;
  data_atendimento: string;
  forma_pagamento: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
  status: 'agendado' | 'concluido' | 'cancelado';
  online: boolean;
  observacoes?: string;
  loja_id: number;
  cliente_id: number;
  funcionario_id: number;
  pet_id: number;
  items: AppointmentItem[];
}

export interface CreateAtendimentoDTO {
  forma_pagamento: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
  status: 'agendado' | 'concluido' | 'cancelado';
  online?: boolean;
  observacoes?: string;
  loja_id: number;
  cliente_id: number;
  funcionario_id: number;
  pet_id: number;
}

export interface UpdateAtendimentoDTO {
  forma_pagamento?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
  status?: 'agendado' | 'concluido' | 'cancelado';
  online?: boolean;
  observacoes?: string;
  loja_id?: number;
  cliente_id?: number;
  funcionario_id?: number;
  pet_id?: number;
  service_ids?: number[];
}

export interface AtendimentoServico {
  atendimento_id: number;
  servico_id: number;
  valor_cobrado: number;
  data_pedido: string;
  data_entrega?: string;
  observacoes?: string;
}

export interface CreateAtendimentoServicoDTO {
  servico_id: number;
  valor_cobrado: number;
  observacoes?: string;
}

export interface UpdateAtendimentoServicoDTO {
  valor_cobrado?: number;
  data_entrega?: string;
  observacoes?: string;
}

export type Appointment = Atendimento;
export type CreateAppointmentDTO = CreateAtendimentoDTO;
export type UpdateAppointmentDTO = UpdateAtendimentoDTO;
