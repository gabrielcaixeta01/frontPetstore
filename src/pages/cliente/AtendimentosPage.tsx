import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck, Clock, CheckCircle2, XCircle,
  Store, PawPrint, ChevronDown, ChevronUp,
  Wallet, Scissors, Plus, X,
  ChevronLeft, ChevronRight as ChevronRightPage,
  ChevronRight as ChevronBread,
} from "lucide-react";
import { getAppointments, createAtendimento } from "../../services/atendimentoService";
import { getApiErrorMessage } from "../../utils/apiError";
import { getLojas, getStoreEmployees } from "../../services/lojaService";
import { getPets } from "../../services/petService";
import { getServicos } from "../../services/servicoService";
import type { Atendimento } from "../../types/atendimento";
import type { FuncionarioLoja } from "../../types/loja";

function getStoredUser() { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }

const statusLabel: Record<string, string> = {
  agendado: "Agendado", concluido: "Concluído", cancelado: "Cancelado",
};
const pillCls: Record<string, string> = {
  concluido: "bg-[#e6f4ed] text-[#004d22]",
  agendado:  "bg-[#fff8e6] text-[#7a5000]",
  cancelado: "bg-gray-100 text-gray-500",
};
const dateBg: Record<string, string> = {
  concluido: "bg-[#00A651]",
  agendado:  "bg-[#F5A800]",
  cancelado: "bg-gray-400",
};
const dateText: Record<string, string> = { agendado: "text-[#0D2580]" };
const pgmtLabel: Record<string, string> = {
  pix: "Pix",
  "cartão de crédito": "Cartão de Crédito",
  "cartão de débito": "Cartão de Débito",
  dinheiro: "Dinheiro",
  "transferência bancária": "Transferência Bancária",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
};
const pgmtOptions = [
  { value: "pix", label: "Pix" },
  { value: "cartão de crédito", label: "Cartão de Crédito" },
  { value: "cartão de débito", label: "Cartão de Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferência bancária", label: "Transferência Bancária" },
];

const PAGE_SIZE = 5;
const inputCls = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white";

type HistoryFilter = "todos" | "agendado" | "concluido" | "cancelado";
interface FormState { pet_id: string; data: string; hora: string; loja_id: string; funcionario_id: string; forma_pagamento: string; observacoes: string; servicos_ids: number[]; }
const emptyForm = (): FormState => ({ pet_id: "", data: "", hora: "", loja_id: "", funcionario_id: "", forma_pagamento: "", observacoes: "", servicos_ids: [] });

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
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState<FormState>(emptyForm());
  const [submitting, setSubmitting]     = useState(false);
  const [toast, setToast]               = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [meusPets, setMeusPets]         = useState<{ id: number; nome: string }[]>([]);
  const [lojasList, setLojasList]       = useState<{ id: number; nome: string }[]>([]);
  const [servicosList, setServicosList] = useState<{ id: number; nome: string }[]>([]);
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState<FuncionarioLoja[]>([]);
  const [loadingFuncionarios, setLoadingFuncionarios]         = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [all, lojas, pets, servicos] = await Promise.all([getAppointments(), getLojas(), getPets(), getServicos()]);
        const myPets = pets.filter((p) => p.dono_id === userId);
        setAtendimentos(all.filter((a) => a.cliente_id === userId).sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()));
        setLojasById(Object.fromEntries(lojas.map((l) => [l.id, l.nome])));
        setPetsById(Object.fromEntries(myPets.map((p) => [p.id, p.nome])));
        setServicosById(Object.fromEntries(servicos.map((s) => [s.id, s.nome])));
        setMeusPets(myPets.map((p) => ({ id: p.id, nome: p.nome })));
        setLojasList(lojas.map((l) => ({ id: l.id, nome: l.nome })));
        setServicosList(servicos.map((s) => ({ id: s.id, nome: s.nome })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!form.loja_id) { setFuncionariosDisponiveis([]); return; }
    setLoadingFuncionarios(true);
    getStoreEmployees(Number(form.loja_id)).then(setFuncionariosDisponiveis).catch(() => setFuncionariosDisponiveis([])).finally(() => setLoadingFuncionarios(false));
  }, [form.loja_id]);

  const agendados  = useMemo(() => atendimentos.filter((a) => a.status === "agendado").sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()), [atendimentos]);
  const historico  = useMemo(() => atendimentos.filter((a) => a.status !== "agendado"), [atendimentos]);
  const concluidos = useMemo(() => historico.filter((a) => a.status === "concluido"), [historico]);
  const gastoTotal = useMemo(() => concluidos.reduce((s, a) => s + Number(a.valor_final), 0), [concluidos]);
  const filtered   = useMemo(() => filter === "todos" ? historico : historico.filter((a) => a.status === filter), [historico, filter]);
  useEffect(() => { setPage(1); }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const monthlyChart = useMemo(() => {
    const map: Record<string, number> = {};
    concluidos.forEach((a) => { const d = new Date(a.data_atendimento); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; map[k] = (map[k] ?? 0) + Number(a.valor_final); });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { key: k, label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), value: map[k] ?? 0, isLast: i === 5 };
    });
  }, [concluidos]);
  const chartMax = Math.max(...monthlyChart.map((m) => m.value), 1);

  function svcNames(at: Atendimento) { return at.items?.map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`).join(", ") ?? ""; }
  function showToast(type: "success" | "error", msg: string) { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); }
  function toggleServico(id: number) { setForm((f) => ({ ...f, servicos_ids: f.servicos_ids.includes(id) ? f.servicos_ids.filter((s) => s !== id) : [...f.servicos_ids, id] })); }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!form.pet_id || !form.data || !form.hora || !form.loja_id || !form.forma_pagamento) { showToast("error", "Preencha todos os campos obrigatórios."); return; }
    setSubmitting(true);
    try {
      await createAtendimento({ forma_pagamento: form.forma_pagamento as Atendimento["forma_pagamento"], status: "agendado", online: true, observacoes: form.observacoes || undefined, data_atendimento: `${form.data}T${form.hora}:00`, loja_id: Number(form.loja_id), cliente_id: userId, funcionario_id: form.funcionario_id ? Number(form.funcionario_id) : undefined, pet_id: Number(form.pet_id) }, form.servicos_ids);
      const all = await getAppointments();
      setAtendimentos(all.filter((a) => a.cliente_id === userId).sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()));
      setShowForm(false); setForm(emptyForm()); showToast("success", "Atendimento agendado com sucesso!");
    } catch (err) { showToast("error", getApiErrorMessage(err, "Erro ao criar atendimento.")); }
    finally { setSubmitting(false); }
  }

  /* ── Row ─────────────────────────────────────────────── */
  function Row({ at }: { at: Atendimento }) {
    const isExp = expandedId === at.id;
    const names = svcNames(at);
    const tc = dateText[at.status] ?? "text-white";
    const subTc = at.status === "agendado" ? "text-[#0D2580]/70" : "text-white/75";
    return (
      <div className="border-b border-gray-100 last:border-0">
        <div className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : at.id)}>
          <div className={`flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded ${dateBg[at.status] ?? "bg-[#1c46f3]"}`}>
            <span className={`text-base font-extrabold leading-none ${tc}`}>{new Date(at.data_atendimento).getDate().toString().padStart(2, "0")}</span>
            <span className={`text-[9px] font-semibold uppercase ${subTc}`}>{new Date(at.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold text-gray-800">{names || <span className="italic font-normal text-gray-400">Sem serviços</span>}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${pillCls[at.status] ?? pillCls.cancelado}`}>{statusLabel[at.status] ?? at.status}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {petsById[at.pet_id] && <span className="flex items-center gap-1 text-[11px] text-gray-400"><PawPrint size={10} /> {petsById[at.pet_id]}</span>}
              {lojasById[at.loja_id] && <span className="flex items-center gap-1 text-[11px] text-gray-400"><Store size={10} /> {lojasById[at.loja_id]}</span>}
            </div>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-sm font-bold text-gray-900">R$ {Number(at.valor_final).toFixed(2)}</p>
            <p className="text-[10px] text-gray-400">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
          </div>
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-[#1c46f3]/30 hover:bg-[#e8eeff] hover:text-[#1c46f3]">
            {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
        {isExp && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Data e horário</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {" às "}{new Date(at.data_atendimento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Pagamento</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
              </div>
              {at.items && at.items.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Serviços</p>
                  <div className="space-y-1.5">
                    {at.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#e8eeff]"><Scissors size={11} className="text-[#1c46f3]" /></div>
                          <span className="text-sm text-gray-700">{servicosById[item.service_id] ?? `Serviço #${item.service_id}`}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">R$ {Number(item.charged_value).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {at.observacoes && <div className="sm:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Observações</p><p className="mt-1 text-sm text-gray-600">{at.observacoes}</p></div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Pagination ────────────────────────────────────────── */
  function Pagination() {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
      .reduce<(number | "…")[]>((acc, n, i, arr) => { if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…"); acc.push(n); return acc; }, []);
    return (
      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
        <span className="text-[11px] text-gray-400">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} atendimentos</span>
        <div className="flex gap-1">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:border-[#1c46f3] hover:text-[#1c46f3] disabled:opacity-40"><ChevronLeft size={13} /></button>
          {pages.map((n, i) => n === "…"
            ? <span key={`e${i}`} className="px-1 text-xs text-gray-300">…</span>
            : <button key={n} onClick={() => setPage(n as number)} className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] font-semibold transition ${page === n ? "border-[#1c46f3] bg-[#1c46f3] text-white" : "border-gray-200 text-gray-600 hover:border-[#1c46f3] hover:text-[#1c46f3]"}`}>{n}</button>
          )}
          <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:border-[#1c46f3] hover:text-[#1c46f3] disabled:opacity-40"><ChevronRightPage size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded border px-4 py-2.5 text-sm font-medium shadow-lg ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {toast.msg}
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative mb-5 overflow-hidden rounded-md bg-[#1c46f3] px-6 py-7 sm:px-8">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-white/55">
            <span>Minha Conta</span><ChevronBread size={10} /><span className="font-medium text-white/90">Meus Atendimentos</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck size={20} className="text-[#F5A800]" />
                <h1 className="text-2xl font-extrabold text-white">Meus Atendimentos</h1>
              </div>
              <p className="mt-0.5 text-[13px] text-white/65">Histórico e agendamentos no Apex Petstore</p>
            </div>
            <button onClick={() => { setShowForm((v) => !v); setForm(emptyForm()); }}
              className="flex items-center gap-2 rounded bg-[#F5A800] px-4 py-2 text-sm font-bold text-[#0D2580] transition hover:bg-[#e09600]">
              {showForm ? <X size={14} /> : <Plus size={14} />}
              {showForm ? "Cancelar" : "Novo agendamento"}
            </button>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-2 lg:flex" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-3 rotate-45 rounded bg-[#F5A800]" />
            <div className="h-5 w-5 rounded-full border-2 border-[#00A651]" />
            <div className="h-2 w-2 rounded bg-[#00A651]" />
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            <div style={{ width:0, height:0, borderLeft:"9px solid transparent", borderRight:"9px solid transparent", borderBottom:"16px solid #F5A800" }} />
            <div className="h-6 w-6 rounded bg-white/10" />
            <div className="h-3.5 w-3.5 rounded-full bg-[#00A651]" />
          </div>
          <div className="-mt-2 flex flex-col items-center gap-2">
            <div className="h-3.5 w-3.5 rotate-45 rounded border-2 border-[#F5A800]" />
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div style={{ width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:"11px solid rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </div>

      {/* ── KPI Strip ─────────────────────────────────────── */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-md border border-gray-200 bg-white lg:grid-cols-4">
          <div className="flex items-center gap-3 border-b border-r border-gray-200 p-4 lg:border-b-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eeff]"><Wallet size={16} className="text-[#1c46f3]" /></div>
            <div>
              <p className="text-[11px] text-gray-500">Total gasto</p>
              <p className="text-xl font-extrabold text-gray-900">{gastoTotal >= 1000 ? `R$ ${(gastoTotal / 1000).toFixed(1)}k` : `R$ ${gastoTotal.toFixed(0)}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-gray-200 p-4 lg:border-b-0 lg:border-r">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ed]"><CheckCircle2 size={16} className="text-[#00A651]" /></div>
            <div>
              <p className="text-[11px] text-gray-500">Concluídos</p>
              <p className="text-xl font-extrabold text-gray-900">{concluidos.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-r border-gray-200 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff8e6]"><Clock size={16} className="text-[#F5A800]" /></div>
            <div>
              <p className="text-[11px] text-gray-500">Agendados</p>
              <p className="text-xl font-extrabold text-gray-900">{agendados.length}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="mb-2 text-[11px] text-gray-500">Gasto mensal</p>
            <div className="flex h-8 items-end gap-0.5">
              {monthlyChart.map((m) => {
                const h = chartMax > 0 ? Math.round((m.value / chartMax) * 100) : 0;
                return (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-0.5">
                    <div className="relative w-full" style={{ height: "24px" }}>
                      <div className={`absolute bottom-0 w-full rounded-t-sm ${m.isLast ? "bg-[#1c46f3]" : "bg-[#1c46f3]/20"}`} style={{ height: `${Math.max(h, h > 0 ? 15 : 0)}%` }} />
                      {h === 0 && <div className="absolute bottom-0 w-full rounded-t-sm bg-gray-100" style={{ height: "3px" }} />}
                    </div>
                    <span className={`text-[8px] capitalize ${m.isLast ? "font-bold text-[#1c46f3]" : "text-gray-400"}`}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Form ──────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3.5">
            <CalendarCheck size={15} className="text-[#1c46f3]" />
            <span className="text-[13px] font-bold text-gray-800">Novo Agendamento Online</span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Pet <span className="text-red-400">*</span></label>
              {meusPets.length === 0
                ? <p className="rounded border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-400">Você ainda não tem pets cadastrados.</p>
                : <select value={form.pet_id} onChange={(e) => setForm((f) => ({ ...f, pet_id: e.target.value }))} required className={inputCls}>
                    <option value="">Selecione um pet</option>
                    {meusPets.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
              }
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Loja <span className="text-red-400">*</span></label>
              <select value={form.loja_id} onChange={(e) => setForm((f) => ({ ...f, loja_id: e.target.value, funcionario_id: "" }))} required className={inputCls}>
                <option value="">Selecione uma loja</option>
                {lojasList.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Funcionário <span className="text-gray-400 font-normal">(opcional)</span></label>
              <select value={form.funcionario_id} onChange={(e) => setForm((f) => ({ ...f, funcionario_id: e.target.value }))} disabled={loadingFuncionarios || !form.loja_id} className={inputCls + " disabled:cursor-not-allowed disabled:opacity-50"}>
                <option value="">{!form.loja_id ? "Selecione uma loja primeiro" : loadingFuncionarios ? "Carregando…" : funcionariosDisponiveis.length === 0 ? "Nenhum funcionário" : "Sem preferência"}</option>
                {funcionariosDisponiveis.map((f) => <option key={f.usuario_id} value={f.usuario_id}>{f.nome}{f.cargo ? ` — ${f.cargo}` : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Data <span className="text-red-400">*</span></label>
              <input type="date" value={form.data} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Horário <span className="text-red-400">*</span></label>
              <input type="time" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Forma de pagamento <span className="text-red-400">*</span></label>
              <select value={form.forma_pagamento} onChange={(e) => setForm((f) => ({ ...f, forma_pagamento: e.target.value }))} required className={inputCls}>
                <option value="">Selecione</option>
                {pgmtOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Observações</label>
              <input type="text" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} placeholder="Alguma informação adicional…" className={inputCls} />
            </div>
            {servicosList.length > 0 && (
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-gray-500">Serviços</label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {servicosList.map((s) => {
                    const checked = form.servicos_ids.includes(s.id);
                    return (
                      <label key={s.id} className={`flex cursor-pointer items-center gap-2.5 rounded border px-3 py-2 text-sm transition ${checked ? "border-[#1c46f3]/40 bg-[#e8eeff] text-[#1c46f3]" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleServico(s.id)} className="accent-[#1c46f3]" />
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e8eeff]"><Scissors size={10} className="text-[#1c46f3]" /></div>
                        {s.nome}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3.5">
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarCheck size={12} className="text-[#1c46f3]" />
              Agendamento online — um funcionário será atribuído em breve.
            </p>
            <button type="submit" disabled={submitting || meusPets.length === 0}
              className="rounded bg-[#1c46f3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1840e0] disabled:opacity-50">
              {submitting ? "Agendando…" : "Confirmar agendamento"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-5">
        {/* Agendados section */}
        {!loading && agendados.length > 0 && (
          <div className="overflow-hidden rounded-md border border-amber-200 bg-white">
            <div className="flex items-center gap-2 border-b border-amber-100 px-5 py-3.5">
              <Clock size={15} className="text-[#F5A800]" />
              <span className="text-[13px] font-bold text-amber-700">Próximos Agendamentos</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{agendados.length}</span>
            </div>
            <div>{agendados.map((at) => <Row key={at.id} at={at} />)}</div>
          </div>
        )}

        {/* Histórico section */}
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3.5">
            <CalendarCheck size={15} className="text-[#1c46f3]" />
            <span className="text-[13px] font-bold text-gray-800">Histórico de Atendimentos</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 px-5 py-2.5">
            {(["todos", "concluido", "cancelado"] as HistoryFilter[]).map((s) => {
              const count = s === "todos" ? historico.length : historico.filter((a) => a.status === s).length;
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-medium transition ${filter === s ? "border-[#1c46f3] bg-[#1c46f3] text-white" : "border-gray-200 text-gray-500 hover:border-[#1c46f3] hover:text-[#1c46f3]"}`}>
                  {s === "todos" ? "Todos" : statusLabel[s]}
                  <span className={`rounded-full px-1.5 text-[10px] font-bold ${filter === s ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
                </button>
              );
            })}
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Carregando atendimentos...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <CalendarCheck size={32} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-300">Nenhum atendimento nesta categoria.</p>
            </div>
          ) : (
            <div>{paginated.map((at) => <Row key={at.id} at={at} />)}</div>
          )}
          {totalPages > 1 && <Pagination />}
        </div>
      </div>
    </div>
  );
}
