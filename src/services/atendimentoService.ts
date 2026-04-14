import { api } from "./api";
import type { Atendimento, CreateAtendimentoDTO, UpdateAtendimentoDTO, AtendimentoServico, CreateAtendimentoServicoDTO, UpdateAtendimentoServicoDTO } from "../types/atendimento";

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
};

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
  };
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
  const response = await api.get(`/atendimento/${atendimentoId}/servicos`);
  return response.data;
}

export async function createAtendimentoServico(atendimentoId: number, data: CreateAtendimentoServicoDTO): Promise<AtendimentoServico> {
  const response = await api.post(`/atendimento/${atendimentoId}/servico`, data);
  return response.data;
}

export async function updateAtendimentoServico(atendimentoId: number, servicoId: number, data: UpdateAtendimentoServicoDTO): Promise<AtendimentoServico> {
  const response = await api.put(`/atendimento/${atendimentoId}/servico/${servicoId}`, data);
  return response.data;
}

export async function deleteAtendimentoServico(atendimentoId: number, servicoId: number): Promise<{ message: string }> {
  const response = await api.delete(`/atendimento/${atendimentoId}/servico/${servicoId}`);
  return response.data;
}
