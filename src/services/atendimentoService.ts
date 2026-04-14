import { api } from "./api";
import type {
  AppointmentItem,
  Atendimento,
  CreateAtendimentoDTO,
  UpdateAtendimentoDTO,
  AtendimentoServico,
  CreateAtendimentoServicoDTO,
  UpdateAtendimentoServicoDTO,
} from "../types/atendimento";

type ApiAppointment = {
  id: number;
  value_final: number;
  service_at: string;
  payment_type: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
  status: 'agendado' | 'concluido' | 'cancelado';
  online: boolean;
  observations?: string | null;
  store_id: number;
  client_id: number;
  worker_id: number;
  pet_id: number;
  items?: ApiAppointmentItem[];
};

type ApiAppointmentItem = {
  appointment_id: number;
  service_id: number;
  charged_value: number;
  order_date: string;
  delivery_date: string | null;
  observations: string | null;
};

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

function toAppointmentItem(item: ApiAppointmentItem): AppointmentItem {
  return {
    appointment_id: item.appointment_id,
    service_id: item.service_id,
    charged_value: item.charged_value,
    order_date: item.order_date,
    delivery_date: item.delivery_date,
    observations: item.observations,
  };
}

function toAtendimento(appointment: ApiAppointment): Atendimento {
  return {
    id: appointment.id,
    valor_final: appointment.value_final,
    data_atendimento: appointment.service_at,
    forma_pagamento: appointment.payment_type,
    status: appointment.status,
    online: appointment.online,
    observacoes: appointment.observations ?? undefined,
    loja_id: appointment.store_id,
    cliente_id: appointment.client_id,
    funcionario_id: appointment.worker_id,
    pet_id: appointment.pet_id,
    items: (appointment.items ?? []).map(toAppointmentItem),
  };
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
  const response = await api.get<ApiAppointment[]>("/appointment/appointments");
  return response.data.map(toAtendimento);
}

export async function getAppointmentById(id: number): Promise<Atendimento> {
  const response = await api.get<ApiAppointment>(`/appointment/${id}`);
  return toAtendimento(response.data);
}

export async function createAppointment(data: CreateAtendimentoDTO): Promise<Atendimento> {
  const response = await api.post<ApiAppointment>("/appointment", null, {
    params: {
      payment_type: data.forma_pagamento,
      status: data.status,
      online: data.online,
      observations: data.observacoes,
      store_id: data.loja_id,
      client_id: data.cliente_id,
      worker_id: data.funcionario_id,
      pet_id: data.pet_id,
    },
  });
  return toAtendimento(response.data);
}

export async function updateAppointment(id: number, data: UpdateAtendimentoDTO): Promise<Atendimento> {
  const response = await api.put<ApiAppointment>(`/appointment/${id}`, null, {
    params: {
      payment_type: data.forma_pagamento,
      status: data.status,
      online: data.online,
      observations: data.observacoes,
      store_id: data.loja_id,
      client_id: data.cliente_id,
      worker_id: data.funcionario_id,
      pet_id: data.pet_id,
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

export async function createAtendimento(data: CreateAtendimentoDTO): Promise<Atendimento> {
  return createAppointment(data);
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
