import { Pencil, Trash2, Store, User, Users, PawPrint, CreditCard, Wifi, WifiOff } from "lucide-react";
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
  if (!dateValue) return "—";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(parsed);
}

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700",
  concluido: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-600",
  em_andamento: "bg-blue-100 text-blue-700",
};

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

  if (appointments.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${c.border} ${c.card} ${c.textMuted}`}>
        Nenhum atendimento encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => {
        const items = appointment.items ?? [];
        const statusClass = statusColors[appointment.status?.toLowerCase()] ?? "bg-gray-100 text-gray-700";

        return (
          <div
            key={appointment.id}
            className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${c.border} ${c.card}`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-3 min-w-0">
                {/* Cabeçalho */}
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`font-bold ${c.text}`}>
                    Atendimento #{appointment.id}
                  </h3>

                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass}`}>
                    {appointment.status}
                  </span>

                  {appointment.online ? (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      <Wifi size={11} /> Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                      <WifiOff size={11} /> Presencial
                    </span>
                  )}
                </div>

                {/* Valor + data + pagamento */}
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  <span className="text-lg font-bold text-[#1c46f3]">
                    R$ {Number(appointment.valor_final).toFixed(2)}
                  </span>
                  <span className={`flex items-center gap-1.5 text-sm ${c.textSoft}`}>
                    {formatDateTime(appointment.data_atendimento)}
                  </span>
                  {appointment.forma_pagamento && (
                    <span className={`flex items-center gap-1.5 text-sm ${c.textSoft}`}>
                      <CreditCard size={13} />
                      {appointment.forma_pagamento}
                    </span>
                  )}
                </div>

                {/* Vínculos */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                  <InfoItem icon={<Store size={12} />} label="Loja" value={lojasById[appointment.loja_id] ?? "—"} />
                  <InfoItem icon={<User size={12} />} label="Cliente" value={clientesById[appointment.cliente_id] ?? "—"} />
                  <InfoItem icon={<Users size={12} />} label="Funcionário" value={funcionariosById[appointment.funcionario_id] ?? "—"} />
                  <InfoItem icon={<PawPrint size={12} />} label="Pet" value={petsById[appointment.pet_id] ?? `#${appointment.pet_id}`} />
                </div>

                {/* Observações */}
                {appointment.observacoes && (
                  <p className={`text-xs ${c.textMuted}`}>Obs: {appointment.observacoes}</p>
                )}

                {/* Serviços vinculados */}
                {items.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {items.map((item) => (
                      <div
                        key={`${appointment.id}-${item.service_id}-${item.order_date}`}
                        className={`min-w-56 rounded-xl border px-3 py-2 text-sm ${c.border} ${c.cardSoft}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-medium ${c.text}`}>
                            {servicosById[item.service_id] ?? `Serviço #${item.service_id}`}
                          </span>
                          <span className="font-semibold text-[#00bb69]">
                            R$ {Number(item.charged_value).toFixed(2)}
                          </span>
                        </div>
                        <div className={`mt-1 flex flex-wrap gap-3 text-xs ${c.textMuted}`}>
                          <span>Pedido: {formatDateTime(item.order_date)}</span>
                          {item.delivery_date && (
                            <span>Entrega: {formatDateTime(item.delivery_date)}</span>
                          )}
                        </div>
                        {item.observations && (
                          <p className={`mt-1 text-xs ${c.textSoft}`}>{item.observations}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${c.textMuted}`}>Nenhum serviço vinculado.</p>
                )}
              </div>

              {/* Botões */}
              <div className="flex shrink-0 gap-2 md:flex-col">
                <button
                  onClick={() => onEdit(appointment)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:bg-gray-50`}
                >
                  <Pencil size={13} />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(appointment.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={13} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-gray-400">{icon} {label}</p>
      <p className="truncate text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}
