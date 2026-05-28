import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Pencil, Trash2,
  CalendarCheck, Clock, CheckCircle2, AlertCircle,
  Store, PawPrint, ChevronDown, ChevronUp,
  Wallet, Scissors, User,
  ChevronLeft, ChevronRight as ChevronRightPage,
  ChevronRight as ChevronBread,
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
import { getApiErrorMessage } from "../../utils/apiError";

const statusLabel: Record<string, string> = {
  agendado: "Agendado", concluido: "Concluído", cancelado: "Cancelado", atrasado: "Atrasado",
};
const pillCls: Record<string, string> = {
  atrasado: "bg-[#fde8e8] text-[#8b1a1a]",
  concluido: "bg-[#e6f4ed] text-[#004d22]",
  agendado:  "bg-[#fff8e6] text-[#7a5000]",
  cancelado: "bg-gray-100 text-gray-500",
};
const dateBg: Record<string, string> = {
  atrasado: "bg-red-600",
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

type HistoryFilter = "todos" | "agendado" | "atrasado" | "concluido" | "cancelado";

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
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadAtendimentos() {
    try {
      setLoading(true);
      const [data, lojas, usuarios, pets, servicos] = await Promise.all([
        getAppointments(), getLojas(), getUsuarios(), getPets(), getServicos(),
      ]);
      setAtendimentos(data.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()));
      setLojasById(Object.fromEntries(lojas.map((l) => [l.id, l.nome])));
      const cMap: Record<number, string> = {};
      const fMap: Record<number, string> = {};
      usuarios.forEach((u) => { if (u.tipo_perfil === "cliente") cMap[u.id] = u.nome; else fMap[u.id] = u.nome; });
      setClientesById(cMap); setFuncionariosById(fMap);
      setPetsById(Object.fromEntries(pets.map((p) => [p.id, p.nome])));
      setServicosById(Object.fromEntries(servicos.map((s) => [s.id, s.nome])));
      setError("");
    } catch { setError("Erro ao carregar atendimentos."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAtendimentos(); }, []);

  async function handleCreate(data: CreateAppointmentDTO, serviceIds: number[]) {
    try { await createAppointment(data, serviceIds); setFeedback("Atendimento cadastrado."); setShowForm(false); await loadAtendimentos(); }
    catch (err) { setError(getApiErrorMessage(err, "Erro ao cadastrar atendimento.")); }
  }
  async function handleUpdate(id: number, data: UpdateAppointmentDTO, serviceIds: number[]) {
    try { await updateAppointment(id, { ...data, service_ids: serviceIds }); setFeedback("Atendimento atualizado."); setAtendimentoBeingEdited(null); await loadAtendimentos(); }
    catch (err) { setError(getApiErrorMessage(err, "Erro ao atualizar atendimento.")); }
  }
  async function handleDelete(id: number) {
    if (!window.confirm("Excluir este atendimento?")) return;
    try { await deleteAppointment(id); setFeedback("Atendimento excluído."); if (atendimentoBeingEdited?.id === id) setAtendimentoBeingEdited(null); await loadAtendimentos(); }
    catch { setError("Erro ao excluir atendimento."); }
  }

  const historico  = atendimentos;
  const agendados  = useMemo(() => historico.filter((a) => a.status === "agendado").sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()), [historico]);
  const atrasados  = useMemo(() => historico.filter((a) => a.status === "atrasado").sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()), [historico]);
  const concluidos = useMemo(() => historico.filter((a) => a.status === "concluido"), [historico]);
  const receitaTotal = useMemo(() => concluidos.reduce((s, a) => s + Number(a.valor_final), 0), [concluidos]);

  const filtered = useMemo(() => filter === "todos" ? historico : historico.filter((a) => a.status === filter), [historico, filter]);
  useEffect(() => { setPage(1); }, [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const monthlyChart = useMemo(() => {
    const rev: Record<string, number> = {};
    concluidos.forEach((a) => {
      const d = new Date(a.data_atendimento);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      rev[k] = (rev[k] ?? 0) + Number(a.valor_final);
    });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { key: k, label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), value: rev[k] ?? 0, isLast: i === 5 };
    });
  }, [concluidos]);
  const chartMax = Math.max(...monthlyChart.map((m) => m.value), 1);

  function svcNames(at: Appointment) {
    if (!at.items?.length) return "";
    return at.items.map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`).join(", ");
  }

  function Row({ at }: { at: Appointment }) {
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
              {clientesById[at.cliente_id] && <span className="flex items-center gap-1 text-[11px] text-gray-400"><User size={10} /> {clientesById[at.cliente_id]}</span>}
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
              {clientesById[at.cliente_id] && <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Cliente</p><p className="mt-1 text-sm font-medium text-gray-800">{clientesById[at.cliente_id]}</p></div>}
              {funcionariosById[at.funcionario_id] && <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Funcionário</p><p className="mt-1 text-sm font-medium text-gray-800">{funcionariosById[at.funcionario_id]}</p></div>}
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
            <div className="mt-4 flex gap-2 border-t border-gray-200 pt-3">
              <button onClick={(e) => { e.stopPropagation(); setAtendimentoBeingEdited(at); }} className="flex items-center gap-1.5 rounded border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-[#e8eeff] hover:text-[#1c46f3]">
                <Pencil size={12} /> Editar
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(at.id); }} className="flex items-center gap-1.5 rounded border border-red-200 px-4 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50">
                <Trash2 size={12} /> Excluir
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

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

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative mb-5 overflow-hidden rounded-md bg-[#1c46f3] px-6 py-7 sm:px-8">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-white/55">
            <span>Painel Administrativo</span><ChevronBread size={10} /><span className="font-medium text-white/90">Atendimentos</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck size={20} className="text-[#F5A800]" />
                <h1 className="text-2xl font-extrabold text-white">Atendimentos</h1>
              </div>
              <p className="mt-0.5 text-[13px] text-white/65">Gerencie agendamentos, pagamentos e status</p>
            </div>
            <button onClick={() => { setShowForm((v) => !v); setError(""); }}
              className="flex items-center gap-2 rounded bg-[#F5A800] px-4 py-2 text-sm font-bold text-[#0D2580] transition hover:bg-[#e09600]">
              {showForm ? <X size={14} /> : <Plus size={14} />}
              {showForm ? "Cancelar" : "Novo atendimento"}
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
              <p className="text-[11px] text-gray-500">Receita total</p>
              <p className="text-xl font-extrabold text-gray-900">{receitaTotal >= 1000 ? `R$ ${(receitaTotal / 1000).toFixed(1)}k` : `R$ ${receitaTotal.toFixed(0)}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-gray-200 p-4 lg:border-b-0 lg:border-r">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ed]"><CheckCircle2 size={16} className="text-[#00A651]" /></div>
            <div>
              <p className="text-[11px] text-gray-500">Concluídos</p>
              <p className="text-xl font-extrabold text-gray-900">{concluidos.length}</p>
              {historico.length > 0 && <p className="text-[10px] text-gray-400">{Math.round(concluidos.length / historico.length * 100)}% do total</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 border-r border-gray-200 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff8e6]"><Clock size={16} className="text-[#F5A800]" /></div>
            <div>
              <p className="text-[11px] text-gray-500">Agendados</p>
              <p className="text-xl font-extrabold text-gray-900">{agendados.length}</p>
              {agendados.length === 0 && <p className="text-[10px] text-gray-400">Nenhum pendente</p>}
            </div>
          </div>
          <div className="p-4">
            <p className="mb-2 text-[11px] text-gray-500">Receita mensal</p>
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

      {feedback && <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{feedback}</div>}
      {error    && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      {showForm && (
        <div className="mb-5">
          <AppointmentForm appointmentBeingEdited={null} onCreate={handleCreate} onUpdate={handleUpdate} onCancelEdit={() => setShowForm(false)} />
        </div>
      )}

      <EditModal isOpen={Boolean(atendimentoBeingEdited)} title="Editar Atendimento" onClose={() => setAtendimentoBeingEdited(null)}>
        {atendimentoBeingEdited && <EditAppointmentForm appointment={atendimentoBeingEdited} onUpdate={handleUpdate} onCancel={() => setAtendimentoBeingEdited(null)} />}
      </EditModal>

      <div className="space-y-5">
        {!loading && atrasados.length > 0 && (
          <div className="flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
            <AlertCircle size={15} className="shrink-0 text-amber-500" />
            <span className="text-[12px] font-semibold text-amber-700">
              Atendimentos em atraso
              <span className="ml-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">{atrasados.length}</span>
            </span>
            <span className="text-[11px] text-amber-600">— requer atenção imediata</span>
          </div>
        )}

        {!loading && atrasados.length > 0 && (
          <div className="overflow-hidden rounded-md border border-red-200 bg-white">
            <div className="flex items-center gap-2 border-b border-red-100 px-5 py-3.5">
              <AlertCircle size={15} className="text-red-500" />
              <span className="text-[13px] font-bold text-red-600">Atrasados</span>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">{atrasados.length}</span>
            </div>
            <div>{atrasados.map((at) => <Row key={at.id} at={at} />)}</div>
          </div>
        )}

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

        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3.5">
            <CalendarCheck size={15} className="text-[#1c46f3]" />
            <span className="text-[13px] font-bold text-gray-800">Histórico de Atendimentos</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 px-5 py-2.5">
            {(["todos", "agendado", "atrasado", "concluido", "cancelado"] as HistoryFilter[]).map((s) => {
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
