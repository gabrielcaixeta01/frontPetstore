import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck, Clock, CheckCircle2, XCircle,
  Store, PawPrint, ChevronDown, ChevronUp,
  Wallet, TrendingUp, Scissors, Plus, X,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { getAppointments, createAtendimento } from "../../services/atendimentoService";
import { getLojas, getStoreEmployees } from "../../services/lojaService";
import { getPets } from "../../services/petService";
import { getServicos } from "../../services/servicoService";
import type { Atendimento } from "../../types/atendimento";
import type { FuncionarioLoja } from "../../types/loja";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string; dot: string }> = {
  agendado:      { label: "Agendado",      icon: Clock,        cls: "text-yellow-700 bg-yellow-50 border-yellow-200",   dot: "bg-yellow-400"  },
  concluido:     { label: "Concluído",     icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  cancelado:     { label: "Cancelado",     icon: XCircle,      cls: "text-red-600 bg-red-50 border-red-200",             dot: "bg-red-400"     },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix",
  "cartão de crédito": "Cartão de Crédito",
  "cartão de débito": "Cartão de Débito",
  dinheiro: "Dinheiro",
  "transferência bancária": "Transferência Bancária",
  // backward compat com valores antigos
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
};

const PAGE_SIZE = 5;

const pgmtOptions = [
  { value: "pix",                   label: "Pix" },
  { value: "cartão de crédito",     label: "Cartão de Crédito" },
  { value: "cartão de débito",      label: "Cartão de Débito" },
  { value: "dinheiro",              label: "Dinheiro" },
  { value: "transferência bancária",label: "Transferência Bancária" },
];

type HistoryFilter = "todos" | "agendado" | "concluido" | "cancelado";

interface FormState {
  pet_id: string;
  data: string;
  hora: string;
  loja_id: string;
  funcionario_id: string;
  forma_pagamento: string;
  observacoes: string;
  servicos_ids: number[];
}

function emptyForm(): FormState {
  return { pet_id: "", data: "", hora: "", loja_id: "", funcionario_id: "", forma_pagamento: "", observacoes: "", servicos_ids: [] };
}

export default function ClienteAtendimentosPage() {
  const user = getStoredUser();
  const userId: number = user.id;

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lojasById, setLojasById]       = useState<Record<number, string>>({});
  const [petsById, setPetsById]         = useState<Record<number, string>>({});
  const [servicosById, setServicosById] = useState<Record<number, string>>({});
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<HistoryFilter>("todos");
  const [page, setPage]                 = useState(1);
  const [expandedId, setExpandedId]     = useState<number | null>(null);

  // Form state
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Dropdown data
  const [meusPets, setMeusPets]                     = useState<{ id: number; nome: string }[]>([]);
  const [lojasList, setLojasList]                   = useState<{ id: number; nome: string }[]>([]);
  const [servicosList, setServicosList]             = useState<{ id: number; nome: string }[]>([]);
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState<FuncionarioLoja[]>([]);
  const [loadingFuncionarios, setLoadingFuncionarios]         = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [all, lojas, pets, servicos] = await Promise.all([
          getAppointments(), getLojas(), getPets(), getServicos(),
        ]);
        const myPets = pets.filter((p) => p.dono_id === userId);
        setAtendimentos(
          all
            .filter((a) => a.cliente_id === userId)
            .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
        );
        setLojasById(Object.fromEntries(lojas.map((l) => [l.id, l.nome])));
        setPetsById(Object.fromEntries(myPets.map((p) => [p.id, p.nome])));
        setServicosById(Object.fromEntries(servicos.map((s) => [s.id, s.nome])));
        setMeusPets(myPets.map((p) => ({ id: p.id, nome: p.nome })));
        setLojasList(lojas.map((l) => ({ id: l.id, nome: l.nome })));
        setServicosList(servicos.map((s) => ({ id: s.id, nome: s.nome })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  // ── Computed ─────────────────────────────────────────────────
  const agendados = useMemo(() =>
    atendimentos
      .filter((a) => a.status === "agendado")
      .sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()),
    [atendimentos]
  );

  const historico = useMemo(() =>
    atendimentos.filter((a) => a.status !== "agendado"),
    [atendimentos]
  );

  const filtered = useMemo(() =>
    filter === "todos" ? historico : historico.filter((a) => a.status === filter),
    [historico, filter]
  );

  useEffect(() => { setPage(1); }, [filter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const concluidos = useMemo(() => historico.filter((a) => a.status === "concluido"), [historico]);
  const gastoTotal = useMemo(() => concluidos.reduce((s, a) => s + Number(a.valor_final), 0), [concluidos]);

  const monthlyChart = useMemo(() => {
    const spending: Record<string, number> = {};
    concluidos.forEach((a) => {
      const d = new Date(a.data_atendimento);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      spending[key] = (spending[key] ?? 0) + Number(a.valor_final);
    });
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      months.push({ key, label, value: spending[key] ?? 0 });
    }
    return months;
  }, [concluidos]);

  const chartMax = Math.max(...monthlyChart.map((m) => m.value), 1);

  useEffect(() => {
    if (!form.loja_id) {
      setFuncionariosDisponiveis([]);
      return;
    }
    setLoadingFuncionarios(true);
    getStoreEmployees(Number(form.loja_id))
      .then(setFuncionariosDisponiveis)
      .catch(() => setFuncionariosDisponiveis([]))
      .finally(() => setLoadingFuncionarios(false));
  }, [form.loja_id]);

  // ── Helpers ───────────────────────────────────────────────────
  function serviceNames(at: Atendimento): string {
    if (!at.items?.length) return "";
    return at.items
      .map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`)
      .join(", ");
  }

  function toggle(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function toggleServico(id: number) {
    setForm((f) => ({
      ...f,
      servicos_ids: f.servicos_ids.includes(id)
        ? f.servicos_ids.filter((s) => s !== id)
        : [...f.servicos_ids, id],
    }));
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!form.pet_id || !form.data || !form.hora || !form.loja_id || !form.forma_pagamento) {
      showToast("error", "Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      await createAtendimento(
        {
          forma_pagamento: form.forma_pagamento as Atendimento["forma_pagamento"],
          status: "agendado",
          online: true,
          observacoes: form.observacoes || undefined,
          data_atendimento: `${form.data}T${form.hora}:00`,
          loja_id: Number(form.loja_id),
          cliente_id: userId,
          funcionario_id: form.funcionario_id ? Number(form.funcionario_id) : undefined,
          pet_id: Number(form.pet_id),
        },
        form.servicos_ids
      );
      const all = await getAppointments();
      setAtendimentos(
        all
          .filter((a) => a.cliente_id === userId)
          .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
      );
      setShowForm(false);
      setForm(emptyForm());
      showToast("success", "Atendimento agendado com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao criar atendimento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Row component ─────────────────────────────────────────────
  function AtendimentoRow({ at, highlight = false }: { at: Atendimento; highlight?: boolean }) {
    const cfg = statusConfig[at.status] ?? statusConfig.agendado;
    const isExpanded = expandedId === at.id;
    const names = serviceNames(at);

    return (
      <div className={`overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${
        highlight
          ? "border-[#1c46f3]/25 bg-gradient-to-br from-[#1c46f3]/5 to-white"
          : "border-gray-100 bg-white"
      }`}>
        <div
          className="flex cursor-pointer items-center gap-2 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4"
          onClick={() => toggle(at.id)}
        >
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
              <p className="text-sm font-semibold text-gray-400 italic">Sem serviços registrados</p>
            )}
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                <cfg.icon size={10} />
                {cfg.label}
              </span>
              {petsById[at.pet_id] && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <PawPrint size={10} />
                  {petsById[at.pet_id]}
                </span>
              )}
              {lojasById[at.loja_id] && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <Store size={10} />
                  {lojasById[at.loja_id]}
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
                  {new Date(at.data_atendimento).toLocaleDateString("pt-BR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Pagamento</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}
                </p>
              </div>

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
                          <span className="text-sm text-gray-700">
                            {servicosById[item.service_id] ?? `Serviço #${item.service_id}`}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          R$ {Number(item.charged_value).toFixed(2)}
                        </span>
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
          </div>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg transition ${
          toast.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Atendimentos</h1>
          <p className="mt-0.5 text-sm text-gray-500">Histórico de atendimentos no Apex Petstore.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setForm(emptyForm()); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
            showForm
              ? "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              : "bg-gradient-to-r from-[#1c46f3] to-[#1840e0] text-white shadow-[#1c46f3]/20 hover:opacity-90"
          }`}
        >
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Novo agendamento</>}
        </button>
      </div>

      {/* ── Formulário de criação ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-5 text-sm font-semibold text-gray-700">Novo agendamento online</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Pet */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Pet <span className="text-red-400">*</span>
              </label>
              {meusPets.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-3 py-2.5 text-sm text-gray-400">
                  Você ainda não tem pets cadastrados.
                </p>
              ) : (
                <select
                  value={form.pet_id}
                  onChange={(e) => setForm((f) => ({ ...f, pet_id: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
                >
                  <option value="">Selecione um pet</option>
                  {meusPets.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Loja */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Loja <span className="text-red-400">*</span>
              </label>
              <select
                value={form.loja_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, loja_id: e.target.value, funcionario_id: "" }))
                }
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              >
                <option value="">Selecione uma loja</option>
                {lojasList.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>

            {/* Funcionário (opcional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Funcionário <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <select
                value={form.funcionario_id}
                onChange={(e) => setForm((prev) => ({ ...prev, funcionario_id: e.target.value }))}
                disabled={loadingFuncionarios || (!form.loja_id)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {!form.loja_id
                    ? "Selecione uma loja primeiro"
                    : loadingFuncionarios
                      ? "Carregando funcionários…"
                      : funcionariosDisponiveis.length === 0
                        ? "Nenhum funcionário nesta loja"
                        : "Sem preferência"}
                </option>
                {funcionariosDisponiveis.map((func) => (
                  <option key={func.usuario_id} value={func.usuario_id}>
                    {func.nome}{func.cargo ? ` — ${func.cargo}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Data <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.data}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            {/* Hora */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Horário <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            {/* Forma de pagamento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Forma de pagamento <span className="text-red-400">*</span>
              </label>
              <select
                value={form.forma_pagamento}
                onChange={(e) => setForm((f) => ({ ...f, forma_pagamento: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              >
                <option value="">Selecione</option>
                {pgmtOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Observações */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Observações</label>
              <input
                type="text"
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Alguma informação adicional…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            {/* Serviços */}
            {servicosList.length > 0 && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-gray-500">Serviços</label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {servicosList.map((s) => {
                    const checked = form.servicos_ids.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                          checked
                            ? "border-[#1c46f3]/40 bg-[#1c46f3]/5 text-[#1c46f3]"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleServico(s.id)}
                          className="accent-[#1c46f3]"
                        />
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#1c46f3]/10">
                          <Scissors size={10} className="text-[#1c46f3]" />
                        </div>
                        {s.nome}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Info online */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#1c46f3]/20 bg-[#1c46f3]/5 px-4 py-2.5">
            <CalendarCheck size={13} className="text-[#1c46f3]" />
            <p className="text-xs text-[#1c46f3]">
              Este agendamento será feito de forma <strong>online</strong> com status <strong>agendado</strong>.
              Um funcionário será atribuído em breve.
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting || meusPets.length === 0}
              className="rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Agendando…" : "Confirmar agendamento"}
            </button>
          </div>
        </form>
      )}

      {/* ── Resumo + Gráfico ── */}
      {!loading && (
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-3 grid-cols-3">
            <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1c46f3]/10">
                <Wallet size={15} className="text-[#1c46f3]" />
              </div>
              <p className="text-xs text-gray-400">Total gasto</p>
              <p className="text-base font-bold text-gray-900">R$ {gastoTotal.toFixed(2)}</p>
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
              <p className="text-xs font-semibold text-gray-500">Gasto mensal</p>
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
                      {pct === 0 && (
                        <div className="absolute bottom-0 w-full rounded-t-md bg-gray-100" style={{ height: "4px" }} />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 capitalize">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Próximos agendamentos ── */}
      {!loading && agendados.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Clock size={15} className="text-yellow-600" />
            <h2 className="text-sm font-semibold text-gray-700">Próximos agendamentos</h2>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
              {agendados.length}
            </span>
          </div>
          <div className="space-y-2">
            {agendados.map((at) => (
              <AtendimentoRow key={at.id} at={at} highlight />
            ))}
          </div>
        </div>
      )}

      {/* ── Histórico ── */}
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
                  filter === s
                    ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
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
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            Carregando atendimentos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <CalendarCheck size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Nenhum atendimento nesta categoria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map((at) => (
                <AtendimentoRow key={at.id} at={at} />
              ))}
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
