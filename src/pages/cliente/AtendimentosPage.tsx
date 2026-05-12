import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  PawPrint,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getAppointments } from "../../services/atendimentoService";
import { getLojas } from "../../services/lojaService";
import { getPets } from "../../services/petService";
import type { Atendimento } from "../../types/atendimento";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string; dot: string }> = {
  agendado: { label: "Agendado", icon: Clock, cls: "text-yellow-700 bg-yellow-50 border-yellow-200", dot: "bg-yellow-400" },
  concluido: { label: "Concluído", icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  cancelado: { label: "Cancelado", icon: XCircle, cls: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-400" },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
};

type FilterStatus = "todos" | "agendado" | "concluido" | "cancelado";

export default function ClienteAtendimentosPage() {
  const user = getStoredUser();
  const userId: number = user.id;

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lojasById, setLojasById] = useState<Record<number, string>>({});
  const [petsById, setPetsById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("todos");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [all, lojas, pets] = await Promise.all([getAppointments(), getLojas(), getPets()]);

        setAtendimentos(
          all
            .filter((a) => a.cliente_id === userId)
            .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
        );

        setLojasById(Object.fromEntries(lojas.map((l) => [l.id, l.nome])));
        setPetsById(Object.fromEntries(pets.filter((p) => p.dono_id === userId).map((p) => [p.id, p.nome])));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const filtered = filter === "todos" ? atendimentos : atendimentos.filter((a) => a.status === filter);

  const counts = {
    todos: atendimentos.length,
    agendado: atendimentos.filter((a) => a.status === "agendado").length,
    concluido: atendimentos.filter((a) => a.status === "concluido").length,
    cancelado: atendimentos.filter((a) => a.status === "cancelado").length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Atendimentos</h1>
        <p className="mt-0.5 text-sm text-gray-500">Histórico de todos os seus atendimentos no Apex Petstore.</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["todos", "agendado", "concluido", "cancelado"] as FilterStatus[]).map((s) => {
          const cfg = s !== "todos" ? statusConfig[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                filter === s
                  ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {cfg && <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />}
              {s === "todos" ? "Todos" : cfg?.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${filter === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando atendimentos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <CalendarCheck size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum atendimento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((at) => {
            const cfg = statusConfig[at.status] ?? statusConfig.agendado;
            const isExpanded = expandedId === at.id;
            return (
              <div key={at.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                <div
                  className="flex cursor-pointer items-center gap-2 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4"
                  onClick={() => setExpandedId(isExpanded ? null : at.id)}
                >
                  {/* Date circle */}
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1c46f3]/8 text-[#1c46f3] sm:h-12 sm:w-12">
                    <span className="text-sm font-bold leading-none sm:text-lg">
                      {new Date(at.data_atendimento).getDate().toString().padStart(2, "0")}
                    </span>
                    <span className="text-xs font-medium">
                      {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold sm:px-2.5 ${cfg.cls}`}>
                        <cfg.icon size={11} />
                        {cfg.label}
                      </span>
                      {at.online && (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          Online
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 sm:gap-x-4 sm:text-sm sm:text-gray-500">
                      {lojasById[at.loja_id] && (
                        <span className="flex items-center gap-1">
                          <Store size={11} className="text-gray-400" />
                          {lojasById[at.loja_id]}
                        </span>
                      )}
                      {petsById[at.pet_id] && (
                        <span className="flex items-center gap-1">
                          <PawPrint size={11} className="text-gray-400" />
                          {petsById[at.pet_id]}
                        </span>
                      )}
                    </div>
                    {/* Value inline on mobile */}
                    <p className="mt-0.5 text-sm font-bold text-gray-900 sm:hidden">
                      R$ {Number(at.valor_final).toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-gray-400">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</span>
                    </p>
                  </div>

                  {/* Value — desktop only */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-lg font-bold text-gray-900">R$ {Number(at.valor_final).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
                  </div>

                  {isExpanded ? (
                    <ChevronUp size={15} className="shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown size={15} className="shrink-0 text-gray-400" />
                  )}
                </div>

                {/* Expandido */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-5 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Data</p>
                        <p className="mt-0.5 text-sm text-gray-800">
                          {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Forma de pagamento</p>
                        <p className="mt-0.5 text-sm text-gray-800">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
                      </div>
                      {at.observacoes && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-gray-400">Observações</p>
                          <p title={at.observacoes} className="mt-0.5 text-sm text-gray-600">{at.observacoes.length > 50 ? `${at.observacoes.slice(0,50)}…` : at.observacoes}</p>
                        </div>
                      )}
                      {at.items?.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="mb-2 text-xs font-medium text-gray-400">Serviços realizados</p>
                          <div className="space-y-1">
                            {at.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                                <span className="text-gray-700">Serviço #{item.service_id}</span>
                                <span className="font-semibold text-gray-900">R$ {Number(item.charged_value).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
