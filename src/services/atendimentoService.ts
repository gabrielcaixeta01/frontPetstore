import { api } from "./api";
import type {
  AppointmentItem,
  Atendimento,
  CreateAtendimentoDTO,
  UpdateAtendimentoDTO,
  AtendimentoServico,
  CreateAtendimentoServicoDTO,
  UpdateAtendimentoServicoDTO,
  FormaPagamento,
  StatusAtendimento,
} from "../types/atendimento";

type ApiAppointment = {
  id: number;
  value_final?: number;
  final_value?: number;
  valor_final?: number;
  service_at?: string;
  atendimento_em?: string;
  created_at?: string;
  payment_method?: string;
  payment_type?: string;
  forma_pagamento?: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  online: boolean;
  notes?: string | null;
  observations?: string | null;
  observacoes?: string | null;
  store_id?: number;
  loja_id?: number;
  client_id?: number;
  cliente_id?: number;
  employee_id?: number;
  worker_id?: number;
  funcionario_id?: number;
  pet_id?: number;
  items?: ApiAppointmentItem[];
  services?: ApiAppointmentItem[];
};

type ApiAppointmentItem = {
  appointment_id?: number;
  atendimento_id?: number;
  service_id?: number;
  servico_id?: number;
  charged_value?: number;
  valor_cobrado?: number;
  ordered_at?: string;
  order_date?: string;
  data_pedido?: string;
  delivered_at?: string | null;
  delivery_date?: string | null;
  data_entrega?: string | null;
  notes?: string | null;
  observations?: string | null;
  observacoes?: string | null;
};

type ApiAppointmentListResponse =
  | ApiAppointment[]
  | { appointments?: ApiAppointment[]; atendimentos?: ApiAppointment[]; data?: ApiAppointment[] };

type ApiAppointmentService = {
  atendimento_id?: number;
  appointment_id?: number;
  servico_id?: number;
  service_id?: number;
  valor_cobrado?: number;
  charged_value?: number;
  data_pedido?: string;
  order_date?: string;
  data_entrega?: string | null;
  delivery_date?: string | null;
  observacoes?: string | null;
  observations?: string | null;
};

function normalizeAppointmentStatus(status?: string): StatusAtendimento {
  const s = (status ?? '').toLowerCase();
  if (s === 'concluído' || s === 'concluido' || s === 'completed') return 'concluido';
  if (s === 'cancelado' || s === 'canceled' || s === 'cancelled') return 'cancelado';
  if (s === 'em andamento' || s === 'em_andamento' || s === 'in_progress') return 'em andamento';
  return 'agendado';
}

function normalizePaymentMethod(value?: string): FormaPagamento {
  const v = (value ?? '').toLowerCase();
  if (v === 'cartão de crédito' || v === 'cartao_credito' || v === 'cartao de credito' || v === 'credit_card') return 'cartão de crédito';
  if (v === 'cartão de débito' || v === 'cartao_debito' || v === 'cartao de debito' || v === 'debit_card') return 'cartão de débito';
  if (v === 'transferência bancária' || v === 'transferencia_bancaria' || v === 'bank_transfer') return 'transferência bancária';
  if (v === 'dinheiro' || v === 'cash') return 'dinheiro';
  return 'pix';
}

function toAppointmentItem(item: ApiAppointmentItem): AppointmentItem {
  return {
    appointment_id: item.appointment_id ?? item.atendimento_id ?? 0,
    service_id: item.service_id ?? item.servico_id ?? 0,
    charged_value: item.charged_value ?? item.valor_cobrado ?? 0,
    order_date: item.ordered_at ?? item.order_date ?? item.data_pedido ?? "",
    delivery_date: item.delivered_at ?? item.delivery_date ?? item.data_entrega ?? null,
    observations: item.notes ?? item.observations ?? item.observacoes ?? null,
  };
}

function toAtendimento(appointment: ApiAppointment): Atendimento {
  const rawItems = appointment.items ?? appointment.services ?? [];

  return {
    id: appointment.id,
    valor_final:
      appointment.value_final ??
      appointment.final_value ??
      appointment.valor_final ??
      0,
    data_atendimento:
      appointment.service_at ??
      appointment.atendimento_em ??
      appointment.created_at ??
      "",
    forma_pagamento: normalizePaymentMethod(
      appointment.payment_method ?? appointment.payment_type ?? appointment.forma_pagamento
    ),
    status: normalizeAppointmentStatus(appointment.status),
    online: appointment.online,
    observacoes: appointment.notes ?? appointment.observations ?? appointment.observacoes ?? undefined,
    loja_id: appointment.store_id ?? appointment.loja_id ?? 0,
    cliente_id: appointment.client_id ?? appointment.cliente_id ?? 0,
    funcionario_id: appointment.employee_id ?? appointment.worker_id ?? appointment.funcionario_id ?? 0,
    pet_id: appointment.pet_id ?? 0,
    items: rawItems.map(toAppointmentItem),
  };
}

function toAppointmentList(data: ApiAppointmentListResponse): ApiAppointment[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.appointments)) return data.appointments;
  if (Array.isArray(data.atendimentos)) return data.atendimentos;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function toAtendimentoServico(item: ApiAppointmentService): AtendimentoServico {
  return {
    atendimento_id: item.atendimento_id ?? item.appointment_id ?? 0,
    servico_id: item.servico_id ?? item.service_id ?? 0,
    valor_cobrado: item.valor_cobrado ?? item.charged_value ?? 0,
    data_pedido: item.data_pedido ?? item.order_date ?? "",
    data_entrega: item.data_entrega ?? item.delivery_date ?? undefined,
    observacoes: item.observacoes ?? item.observations ?? undefined,
  };
}

async function requestWithFallback<T>(requests: Array<() => Promise<{ data: T }>>): Promise<T> {
  let lastError: unknown;

  for (const request of requests) {
    try {
      const response = await request();
      return response.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function getAppointments(): Promise<Atendimento[]> {
  const data = await requestWithFallback<ApiAppointmentListResponse>([
    () => api.get("/appointment/appointments"),
    () => api.get("/appointments"),
    () => api.get("/appointment"),
    () => api.get("/atendimento/atendimentos"),
    () => api.get("/atendimento"),
  ]);

  return toAppointmentList(data).map(toAtendimento);
}

export async function getAppointmentById(id: number): Promise<Atendimento> {
  const response = await api.get<ApiAppointment>(`/appointment/${id}`);
  return toAtendimento(response.data);
}

export async function createAppointment(data: CreateAtendimentoDTO, serviceIds: number[]): Promise<Atendimento> {
  const response = await api.post<ApiAppointment>("/appointment", null, {
    params: {
      payment_method: data.forma_pagamento,
      status: data.status,
      online: data.online,
      notes: data.observacoes,
      service_at: data.data_atendimento,
      store_id: data.loja_id,
      client_id: data.cliente_id,
      employee_id: data.funcionario_id,
      pet_id: data.pet_id,
      service_ids: serviceIds,
    },
  });
  return toAtendimento(response.data);
}

export async function updateAppointment(id: number, data: UpdateAtendimentoDTO): Promise<Atendimento> {
  const response = await api.put<ApiAppointment>(`/appointment/${id}`, null, {
    params: {
      payment_method: data.forma_pagamento,
      status: data.status,
      online: data.online,
      notes: data.observacoes,
      store_id: data.loja_id,
      client_id: data.cliente_id,
      employee_id: data.funcionario_id,
      pet_id: data.pet_id,
      service_ids: data.service_ids,
    },
  });
  return toAtendimento(response.data);
}

export async function deleteAppointment(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/appointment/${id}`);
  return response.data;
}

export async function getAtendimentos(): Promise<Atendimento[]> {
  return getAppointments();
}

export async function getAtendimentoById(id: number): Promise<Atendimento> {
  return getAppointmentById(id);
}

export async function createAtendimento(data: CreateAtendimentoDTO, serviceIds: number[]): Promise<Atendimento> {
  return createAppointment(data, serviceIds);
}

export async function updateAtendimento(id: number, data: UpdateAtendimentoDTO): Promise<Atendimento> {
  return updateAppointment(id, data);
}

export async function deleteAtendimento(id: number): Promise<{ message: string }> {
  return deleteAppointment(id);
}

export async function getAtendimentoServicos(atendimentoId: number): Promise<AtendimentoServico[]> {
  const data = await requestWithFallback<ApiAppointmentService[]>([
    () => api.get(`/appointment/${atendimentoId}/services`),
    () => api.get(`/appointment/${atendimentoId}/servicos`),
    () => api.get(`/atendimento/${atendimentoId}/servicos`),
  ]);

  return data.map(toAtendimentoServico);
}

export async function createAtendimentoServico(atendimentoId: number, data: CreateAtendimentoServicoDTO): Promise<AtendimentoServico> {
  const response = await requestWithFallback<ApiAppointmentService>([
    () => api.post(`/appointment/${atendimentoId}/service`, data),
    () => api.post(`/appointment/${atendimentoId}/servico`, data),
    () => api.post(`/atendimento/${atendimentoId}/servico`, data),
  ]);

  return toAtendimentoServico(response);
}

export async function updateAtendimentoServico(atendimentoId: number, servicoId: number, data: UpdateAtendimentoServicoDTO): Promise<AtendimentoServico> {
  const response = await requestWithFallback<ApiAppointmentService>([
    () => api.put(`/appointment/${atendimentoId}/service/${servicoId}`, data),
    () => api.put(`/appointment/${atendimentoId}/servico/${servicoId}`, data),
    () => api.put(`/atendimento/${atendimentoId}/servico/${servicoId}`, data),
  ]);

  return toAtendimentoServico(response);
}

export async function deleteAtendimentoServico(atendimentoId: number, servicoId: number): Promise<{ message: string }> {
  const data = await requestWithFallback<{ message: string }>([
    () => api.delete(`/appointment/${atendimentoId}/service/${servicoId}`),
    () => api.delete(`/appointment/${atendimentoId}/servico/${servicoId}`),
    () => api.delete(`/atendimento/${atendimentoId}/servico/${servicoId}`),
  ]);

  return data;
}
