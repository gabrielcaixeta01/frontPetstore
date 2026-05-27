import { useState } from "react";
import { Pencil, Trash2, Store, User, Users, PawPrint, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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

const statusCfg: Record<string, { label: string; icon: typeof Clock; cls: string; dot: string }> = {
  agendado:     { label: "Agendado",     icon: Clock,        cls: "text-yellow-700 bg-yellow-50 border-yellow-200",   dot: "bg-yellow-400" },
  concluido:    { label: "Concluído",    icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  cancelado:    { label: "Cancelado",    icon: XCircle,      cls: "text-red-600 bg-red-50 border-red-200",            dot: "bg-red-400" },
  atrasado:     { label: "Atrasado",     icon: AlertCircle,  cls: "text-orange-700 bg-orange-50 border-orange-200",   dot: "bg-orange-400" },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix", cartao_credito: "Crédito", cartao_debito: "Débito", dinheiro: "Dinheiro",
};

function dateCircle(dateStr?: string) {
  if (!dateStr) return { day: "—", month: "", time: "" };
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function AppointmentList({
  appointments, onEdit, onDelete,
  lojasById, clientesById, funcionariosById, petsById, servicosById,
}: AppointmentListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Nenhum atendimento encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((apt) => {
        const cfg = statusCfg[apt.status?.toLowerCase()] ?? statusCfg.agendado;
        const { day, month, time } = dateCircle(apt.data_atendimento);
        const isExpanded = expandedId === apt.id;
        const items = apt.items ?? [];

        return (
          <div key={apt.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
            {/* Main row */}
            <div className="flex items-center gap-2 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
              {/* Date circle */}
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1c46f3]/8 text-[#1c46f3] sm:h-11 sm:w-11">
                <span className="text-sm font-bold leading-none sm:text-base">{day}</span>
                <span className="text-xs font-medium">{month}</span>
              </div>

              {/* Status + meta info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold sm:px-2.5 ${cfg.cls}`}>
                    <cfg.icon size={11} /> {cfg.label}
                  </span>
                  {apt.online && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Online</span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-400 sm:gap-x-3">
                  {time && (
                    <span className="flex items-center gap-1"><Clock size={11} />{time}</span>
                  )}
                  {lojasById[apt.loja_id] && (
                    <span className="flex items-center gap-1"><Store size={11} />{lojasById[apt.loja_id]}</span>
                  )}
                  {clientesById[apt.cliente_id] && (
                    <span className="flex items-center gap-1"><User size={11} />{clientesById[apt.cliente_id]}</span>
                  )}
                  {funcionariosById[apt.funcionario_id] && (
                    <span className="flex items-center gap-1"><Users size={11} />{funcionariosById[apt.funcionario_id]}</span>
                  )}
                  {petsById[apt.pet_id] && (
                    <span className="flex items-center gap-1"><PawPrint size={11} />{petsById[apt.pet_id]}</span>
                  )}
                </div>
                {/* Value shown inline on mobile */}
                <p className="mt-0.5 text-sm font-bold text-gray-900 sm:hidden">
                  R$ {Number(apt.valor_final).toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-gray-400">{pgmtLabel[apt.forma_pagamento] ?? apt.forma_pagamento}</span>
                </p>
              </div>

              {/* Value — desktop only */}
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-base font-bold text-gray-900">R$ {Number(apt.valor_final).toFixed(2)}</p>
                <p className="text-xs text-gray-400">{pgmtLabel[apt.forma_pagamento] ?? apt.forma_pagamento}</p>
              </div>

              {/* Expand button */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Edit + Delete — desktop only */}
              <div className="hidden shrink-0 gap-1.5 sm:flex">
                <button onClick={() => onEdit(apt)} title="Editar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100">
                  <Pencil size={13} />
                </button>
                <button onClick={() => onDelete(apt.id)} title="Excluir"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-4 sm:px-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {apt.observacoes && (
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-medium text-gray-400">Observações</p>
                      <p className="text-sm text-gray-600">
                        {apt.observacoes.length > 50 ? `${apt.observacoes.slice(0, 50)}…` : apt.observacoes}
                      </p>
                    </div>
                  )}
                  {items.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-xs font-medium text-gray-400">Serviços ({items.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, idx) => (
                          <div key={`${apt.id}-${item.service_id}-${idx}`}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                            <span className="text-gray-700">{servicosById[item.service_id] ?? `Serviço #${item.service_id}`}</span>
                            <span className="font-semibold text-[#00bb69]">R$ {Number(item.charged_value).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {items.length === 0 && !apt.observacoes && (
                    <p className="text-xs text-gray-400">Nenhum detalhe adicional.</p>
                  )}
                </div>

                {/* Mobile actions — shown only in expanded view */}
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 sm:hidden">
                  <button
                    onClick={() => onEdit(apt)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => onDelete(apt.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
