import { apexTheme } from "../../lib/theme";
import type { Appointment } from "../../types/atendimento";

type AppointmentListProps = {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => Promise<void>;
  lojasById: Record<number, string>;
  clientesById: Record<number, string>;
  funcionariosById: Record<number, string>;
  petsById: Record<number, string>;
  servicosById: Record<number, string>;
};

function formatDateTime(dateValue?: string) {
  if (!dateValue) return "Nao informado";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

export default function AppointmentList({
  appointments,
  onEdit,
  onDelete,
  lojasById,
  clientesById,
  funcionariosById,
  petsById,
  servicosById,
}: AppointmentListProps) {
  const c = apexTheme.colors;
  const appointmentItemsById = appointments.map((appointment) => ({
    appointment,
    items: appointment.items ?? [],
  }));

  if (appointments.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${c.border} ${c.card} ${c.textMuted}`}>
        Nenhum atendimento encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {appointmentItemsById.map(({ appointment, items }) => (
        <div
          key={appointment.id}
          className={`rounded-2xl border p-5 shadow-lg ${c.border} ${c.card}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className={`text-xl font-bold ${c.text}`}>Atendimento #{appointment.id}</h3>
              <p className={`text-sm ${c.textSoft}`}>
                Valor final: R$ {Number(appointment.valor_final).toFixed(2)}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Data: {formatDateTime(appointment.data_atendimento)}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Forma pagamento: {appointment.forma_pagamento}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Status: {appointment.status}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Online: {appointment.online ? "Sim" : "Nao"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Loja: {lojasById[appointment.loja_id] ?? "Nao encontrada"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Cliente: {clientesById[appointment.cliente_id] ?? "Nao encontrado"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Funcionario: {funcionariosById[appointment.funcionario_id] ?? "Nao encontrado"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Pet: {petsById[appointment.pet_id] ?? `Pet #${appointment.pet_id}`}
              </p>
              <div className="space-y-2">
                <p className={`text-sm ${c.textSoft}`}>Servicos:</p>
                {items.length > 0 ? (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={`${appointment.id}-${item.service_id}-${item.order_date}`}
                        className={`rounded-xl border px-3 py-2 text-sm ${c.border} ${c.cardSoft}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`font-medium ${c.text}`}>
                            {servicosById[item.service_id] ?? `Servico #${item.service_id}`}
                          </span>
                          <span className={c.textSoft}>
                            R$ {Number(item.charged_value).toFixed(2)}
                          </span>
                        </div>
                        <div className={`mt-1 flex flex-wrap gap-3 text-xs ${c.textMuted}`}>
                          <span>Pedido: {formatDateTime(item.order_date)}</span>
                          <span>Entrega: {formatDateTime(item.delivery_date ?? undefined)}</span>
                        </div>
                        {item.observations && (
                          <p className={`mt-1 text-xs ${c.textSoft}`}>{item.observations}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${c.textSoft}`}>Nenhum servico vinculado</p>
                )}
              </div>
              <p className={`text-sm ${c.textSoft}`}>
                {appointment.observacoes ?? "Sem observacoes"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(appointment)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:${c.bgSoft}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(appointment.id)}
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
