import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Pencil, Trash2,
  CalendarCheck, Clock, CheckCircle2, XCircle,
  Store, PawPrint, ChevronDown, ChevronUp,
  Wallet, TrendingUp, Scissors, User,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 5;
import EditModal from "../../components/EditModal";
import AppointmentForm from "../../components/appointment/AppointmentForm";
import EditAppointmentForm from "../../components/appointment/EditAppointmentForm";
import { getLojas } from "../../services/lojaService";
import { getPets } from "../../services/petService";
import { getServicos } from "../../services/servicoService";
import { createAppointment, deleteAppointment, getAppointments, updateAppointment } from "../../services/atendimentoService";
import { getUsuarios } from "../../services/usuarioService";
import type { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from "../../types/atendimento";

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string; dot: string }> = {
  agendado:      { label: "Agendado",     icon: Clock,        cls: "text-yellow-700 bg-yellow-50 border-yellow-200",   dot: "bg-yellow-400"  },
  concluido:     { label: "Concluído",    icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  cancelado:     { label: "Cancelado",    icon: XCircle,      cls: "text-red-600 bg-red-50 border-red-200",             dot: "bg-red-400"     },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix",
  "cartão de crédito": "Cartão de Crédito",
  "cartão de débito": "Cartão de Débito",
  dinheiro: "Dinheiro",
  "transferência bancária": "Transferência Bancária",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
};

type HistoryFilter = "todos" | "agendado" | "concluido" | "cancelado";

export default function AppointmentsPage() {
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [atendimentoBeingEdited, setAtendimentoBeingEdited] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [lojasById, setLojasById] = useState<Record<number, string>>({});
  const [clientesById, setClientesById] = useState<Record<number, string>>({});
  const [funcionariosById, setFuncionariosById] = useState<Record<number, string>>({});
  const [petsById, setPetsById] = useState<Record<number, string>>({});
  const [servicosById, setServicosById] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<HistoryFilter>("todos");
  const [page, setPage]     = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadAtendimentos() {
    try {
      setLoading(true);
      const [data, lojas, usuarios, pets, servicos] = await Promise.all([
        getAppointments(),
        getLojas(),
        getUsuarios(),
        getPets(),
        getServicos(),
      ]);
      setAtendimentos(data.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()));
      setLojasById(Object.fromEntries(lojas.map((l) => [l.id, l.nome])));
      const cMap: Record<number, string> = {};
      const fMap: Record<number, string> = {};
      usuarios.forEach((u) => {
        if (u.tipo_perfil === "cliente") cMap[u.id] = u.nome;
        else fMap[u.id] = u.nome;
      });
      setClientesById(cMap);
      setFuncionariosById(fMap);
      setPetsById(Object.fromEntries(pets.map((p) => [p.id, p.nome])));
      setServicosById(Object.fromEntries(servicos.map((s) => [s.id, s.nome])));
      setError("");
    } catch {
      setError("Erro ao carregar atendimentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAtendimentos(); }, []);

  async function handleCreateAtendimento(data: CreateAppointmentDTO, serviceIds: number[]) {
    try {
      await createAppointment(data, serviceIds);
      setFeedback("Atendimento cadastrado com sucesso.");
      setShowForm(false);
      await loadAtendimentos();
    } catch { setError("Erro ao cadastrar atendimento."); }
  }

  async function handleUpdateAtendimento(id: number, data: UpdateAppointmentDTO, serviceIds: number[]) {
    try {
      await updateAppointment(id, { ...data, service_ids: serviceIds });
      setFeedback("Atendimento atualizado com sucesso.");
      setAtendimentoBeingEdited(null);
      await loadAtendimentos();
    } catch { setError("Erro ao atualizar atendimento."); }
  }

  async function handleDeleteAtendimento(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este atendimento?")) return;
    try {
      await deleteAppointment(id);
      setFeedback("Atendimento excluído com sucesso.");
      if (atendimentoBeingEdited?.id === id) setAtendimentoBeingEdited(null);
      await loadAtendimentos();
    } catch { setError("Erro ao excluir atendimento."); }
  }

  const agendados = useMemo(() =>
    atendimentos.filter((a) => a.status === "agendado")
      .sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()),
    [atendimentos],
  );
  const historico = useMemo(() => atendimentos.filter((a) => a.status !== "agendado"), [atendimentos]);
  const filtered = useMemo(() =>
    filter === "todos" ? historico : historico.filter((a) => a.status === filter),
    [historico, filter],
  );

  useEffect(() => { setPage(1); }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const concluidos = useMemo(() => historico.filter((a) => a.status === "concluido"), [historico]);
  const receitaTotal = useMemo(() => concluidos.reduce((s, a) => s + Number(a.valor_final), 0), [concluidos]);

  const monthlyChart = useMemo(() => {
    const revenue: Record<string, number> = {};
    concluidos.forEach((a) => {
      const d = new Date(a.data_atendimento);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenue[key] = (revenue[key] ?? 0) + Number(a.valor_final);
    });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      return { key, label, value: revenue[key] ?? 0 };
    });
  }, [concluidos]);

  const chartMax = Math.max(...monthlyChart.map((m) => m.value), 1);

  function toggle(id: number) { setExpandedId((prev) => (prev === id ? null : id)); }

  function serviceNames(at: Appointment): string {
    if (!at.items?.length) return "";
    return at.items.map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`).join(", ");
  }

  function AtendimentoRow({ at, highlight = false }: { at: Appointment; highlight?: boolean }) {
    const cfg = statusConfig[at.status] ?? statusConfig.agendado;
    const isExpanded = expandedId === at.id;
    const names = serviceNames(at);

    return (
      <div className={`overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${
        highlight ? "border-[#1c46f3]/25 bg-gradient-to-br from-[#1c46f3]/5 to-white" : "border-gray-100 bg-white"
      }`}>
        <div className="flex cursor-pointer items-center gap-2 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4" onClick={() => toggle(at.id)}>
          <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-sm font-bold leading-none sm:h-11 sm:w-11 ${
            highlight ? "bg-[#1c46f3]/15 text-[#1c46f3]" : "bg-[#1c46f3]/8 text-[#1c46f3]"
          }`}>
            <span className="text-sm font-bold sm:text-base">
              {new Date(at.data_atendimento).getDate().toString().padStart(2, "0")}
            </span>
            <span className="text-xs">
              {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            {names ? (
              <p className="truncate text-sm font-semibold text-gray-900">{names}</p>
            ) : (
              <p className="text-sm font-semibold italic text-gray-400">Sem serviços registrados</p>
            )}
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                <cfg.icon size={10} /> {cfg.label}
              </span>
              {petsById[at.pet_id] && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <PawPrint size={10} /> {petsById[at.pet_id]}
                </span>
              )}
              {clientesById[at.cliente_id] && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <User size={10} /> {clientesById[at.cliente_id]}
                </span>
              )}
              {lojasById[at.loja_id] && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <Store size={10} /> {lojasById[at.loja_id]}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-bold text-gray-700 sm:hidden">
              R$ {Number(at.valor_final).toFixed(2)}
              <span className="ml-1 font-normal text-gray-400">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</span>
            </p>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-base font-bold text-gray-900">R$ {Number(at.valor_final).toFixed(2)}</p>
            <p className="text-xs text-gray-400">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
          </div>

          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
            isExpanded ? "border-[#1c46f3]/30 bg-[#1c46f3]/8 text-[#1c46f3]" : "border-gray-200 text-gray-400"
          }`}>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-4 sm:px-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-400">Data completa</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Pagamento</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
              </div>
              {clientesById[at.cliente_id] && (
                <div>
                  <p className="text-xs font-medium text-gray-400">Cliente</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-800">{clientesById[at.cliente_id]}</p>
                </div>
              )}
              {funcionariosById[at.funcionario_id] && (
                <div>
                  <p className="text-xs font-medium text-gray-400">Funcionário</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-800">{funcionariosById[at.funcionario_id]}</p>
                </div>
              )}

              {at.items && at.items.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-medium text-gray-400">Serviços</p>
                  <div className="space-y-1.5">
                    {at.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1c46f3]/10">
                            <Scissors size={11} className="text-[#1c46f3]" />
                          </div>
                          <span className="text-sm text-gray-700">{servicosById[item.service_id] ?? `Serviço #${item.service_id}`}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">R$ {Number(item.charged_value).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {at.observacoes && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-gray-400">Observações</p>
                  <p className="mt-0.5 text-sm text-gray-600">{at.observacoes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={(e) => { e.stopPropagation(); setAtendimentoBeingEdited(at); }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <Pencil size={12} /> Editar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteAtendimento(at.id); }}
                className="flex items-center gap-1.5 rounded-xl border border-red-100 px-4 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={12} /> Excluir
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gerencie agendamentos, pagamentos e status.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo atendimento"}</span>
        </button>
      </div>

      {feedback && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {showForm && (
        <div className="mb-6">
          <AppointmentForm
            appointmentBeingEdited={null}
            onCreate={handleCreateAtendimento}
            onUpdate={handleUpdateAtendimento}
            onCancelEdit={() => setShowForm(false)}
          />
        </div>
      )}

      <EditModal isOpen={Boolean(atendimentoBeingEdited)} title="Editar Atendimento" onClose={() => setAtendimentoBeingEdited(null)}>
        {atendimentoBeingEdited && (
          <EditAppointmentForm
            appointment={atendimentoBeingEdited}
            onUpdate={handleUpdateAtendimento}
            onCancel={() => setAtendimentoBeingEdited(null)}
          />
        )}
      </EditModal>

      {/* Summary + Chart */}
      {!loading && (
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1c46f3]/10">
                <Wallet size={15} className="text-[#1c46f3]" />
              </div>
              <p className="text-xs text-gray-400">Receita total</p>
              <p className="text-base font-bold text-gray-900">R$ {receitaTotal.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00bb69]/10">
                <CheckCircle2 size={15} className="text-[#00bb69]" />
              </div>
              <p className="text-xs text-gray-400">Concluídos</p>
              <p className="text-base font-bold text-gray-900">{concluidos.length}</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-100">
                <Clock size={15} className="text-yellow-600" />
              </div>
              <p className="text-xs text-gray-400">Agendados</p>
              <p className="text-base font-bold text-gray-900">{agendados.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-[#1c46f3]" />
              <p className="text-xs font-semibold text-gray-500">Receita mensal</p>
            </div>
            <div className="flex h-20 items-end gap-1.5">
              {monthlyChart.map((m) => {
                const pct = chartMax > 0 ? (m.value / chartMax) * 100 : 0;
                return (
                  <div key={m.key} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full" style={{ height: "56px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-[#1c46f3]/20 transition-all group-hover:bg-[#1c46f3]/40"
                        style={{ height: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}
                        title={`R$ ${m.value.toFixed(2)}`}
                      />
                      {pct === 0 && <div className="absolute bottom-0 w-full rounded-t-md bg-gray-100" style={{ height: "4px" }} />}
                    </div>
                    <span className="text-[10px] capitalize text-gray-400">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Próximos agendamentos */}
      {!loading && agendados.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Clock size={15} className="text-yellow-600" />
            <h2 className="text-sm font-semibold text-gray-700">Próximos agendamentos</h2>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">{agendados.length}</span>
          </div>
          <div className="space-y-2">
            {agendados.map((at) => <AtendimentoRow key={at.id} at={at} highlight />)}
          </div>
        </div>
      )}

      {/* Histórico */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CalendarCheck size={15} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Histórico</h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["todos", "agendado", "concluido", "cancelado"] as HistoryFilter[]).map((s) => {
            const cfg = s !== "todos" ? statusConfig[s] : null;
            const count = s === "todos" ? historico.length : historico.filter((a) => a.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                  filter === s ? "border-[#1c46f3] bg-[#1c46f3] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {cfg && <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />}
                {s === "todos" ? "Todos" : cfg?.label}
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${filter === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">Carregando atendimentos...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <CalendarCheck size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Nenhum atendimento nesta categoria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map((at) => <AtendimentoRow key={at.id} at={at} />)}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-gray-400">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce<(number | "…")[]>((acc, n, i, arr) => {
                      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-300">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                            page === n
                              ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
