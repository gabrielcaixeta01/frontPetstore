import { apexTheme } from "../../lib/theme";
import type { Appointment } from "../../types/atendimento";

type AppointmentListProps = {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => Promise<void>;
  lojasById: Record<number, string>;
  clientesById: Record<number, string>;
  funcionariosById: Record<number, string>;
  servicosPorAtendimento: Record<number, string[]>;
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
  servicosPorAtendimento,
}: AppointmentListProps) {
  const c = apexTheme.colors;

  if (appointments.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${c.border} ${c.card} ${c.textMuted}`}>
        Nenhum atendimento encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
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
              <div className="space-y-2">
                <p className={`text-sm ${c.textSoft}`}>Servicos:</p>
                {(servicosPorAtendimento[appointment.id] ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(servicosPorAtendimento[appointment.id] ?? []).map((servicoNome) => (
                      <span
                        key={`${appointment.id}-${servicoNome}`}
                        className="rounded-full border border-[#1c46f3]/30 bg-[#1c46f3]/10 px-3 py-1 text-xs font-medium text-[#8fb1ff]"
                      >
                        {servicoNome}
                      </span>
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
