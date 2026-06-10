import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Pencil, Trash2, XCircle,
  CalendarCheck, Clock, CheckCircle2, AlertCircle,
  Store, PawPrint, ChevronDown, ChevronUp,
  Wallet, Scissors, User,
  ChevronLeft, ChevronRight as ChevronRightPage,
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

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

const statusLabel: Record<string, string> = {
  agendado: "Agendado", concluido: "Concluído", cancelado: "Cancelado", atrasado: "Atrasado",
};
const pillCls: Record<string, string> = {
  atrasado: "bg-rose-50 text-rose-500",
  concluido: "bg-teal-50 text-teal-700",
  agendado:  "bg-amber-50 text-amber-700",
  cancelado: "bg-slate-100 text-slate-500",
};
const dateBg: Record<string, string> = {
  atrasado: "bg-rose-300",
  concluido: "bg-[#0D7377]",
  agendado:  "bg-[#F59E0B]",
  cancelado: "bg-slate-400",
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

type HistoryFilter = "todos" | "agendado" | "atrasado" | "concluido" | "cancelado";

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

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
  async function handleQuickStatus(at: Appointment, newStatus: "concluido" | "cancelado") {
    try {
      await updateAppointment(at.id, {
        status: newStatus, loja_id: at.loja_id, cliente_id: at.cliente_id,
        funcionario_id: at.funcionario_id, pet_id: at.pet_id,
        data_atendimento: at.data_atendimento, forma_pagamento: at.forma_pagamento,
        observacoes: at.observacoes ?? "", service_ids: at.items?.map((i) => i.service_id) ?? [],
      });
      setFeedback(newStatus === "concluido" ? "Atendimento concluído!" : "Atendimento cancelado.");
      setExpandedId(null);
      await loadAtendimentos();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao atualizar status.")); }
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
    const lightDate   = at.status === "agendado" || at.status === "atrasado";
    const dateTextCls = lightDate ? "text-[#1E293B]" : "text-white";
    const dateSubCls  = lightDate ? "text-[#1E293B]/60" : "text-white/75";
    return (
      <div style={{ borderBottom: `1px solid ${BORD}` }} className="last:border-0">
        <div className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition hover:bg-[#F8FAFC]"
          onClick={() => setExpandedId(isExp ? null : at.id)}>
          <div className={`flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded ${dateBg[at.status] ?? "bg-slate-400"}`}>
            <span className={`text-base font-extrabold leading-none ${dateTextCls}`}>{new Date(at.data_atendimento).getDate().toString().padStart(2, "0")}</span>
            <span className={`text-[9px] font-semibold uppercase ${dateSubCls}`}>{new Date(at.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold" style={{ color: COAL }}>{names || <span className="italic font-normal" style={{ color: MUTED }}>Sem serviços</span>}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${pillCls[at.status] ?? pillCls.cancelado}`}>{statusLabel[at.status] ?? at.status}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {petsById[at.pet_id] && <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}><PawPrint size={10} /> {petsById[at.pet_id]}</span>}
              {clientesById[at.cliente_id] && <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}><User size={10} /> {clientesById[at.cliente_id]}</span>}
              {lojasById[at.loja_id] && <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}><Store size={10} /> {lojasById[at.loja_id]}</span>}
            </div>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-sm font-bold" style={{ color: COAL }}>R$ {Number(at.valor_final).toFixed(2)}</p>
            <p className="text-[10px]" style={{ color: MUTED }}>{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
          </div>
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded transition hover:bg-[#e6f5f5]"
            style={{ border: `1px solid ${BORD}`, color: MUTED }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
            {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
        {isExp && (
          <div className="px-5 py-4" style={{ borderTop: `1px solid ${BORD}`, background: "#F8FAFC" }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Data e horário</p>
                <p className="mt-1 text-sm font-medium" style={{ color: COAL }}>
                  {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {" às "}{new Date(at.data_atendimento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Pagamento</p>
                <p className="mt-1 text-sm font-medium" style={{ color: COAL }}>{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
              </div>
              {clientesById[at.cliente_id] && <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Cliente</p><p className="mt-1 text-sm font-medium" style={{ color: COAL }}>{clientesById[at.cliente_id]}</p></div>}
              {funcionariosById[at.funcionario_id] && <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Funcionário</p><p className="mt-1 text-sm font-medium" style={{ color: COAL }}>{funcionariosById[at.funcionario_id]}</p></div>}
              {at.items && at.items.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Serviços</p>
                  <div className="space-y-1.5">
                    {at.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white px-3 py-2"
                        style={{ border: `1px solid ${BORD}`, borderRadius: "6px" }}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded" style={{ background: "#e6f5f5" }}>
                            <Scissors size={11} style={{ color: TEAL }} />
                          </div>
                          <span className="text-sm" style={{ color: COAL }}>{servicosById[item.service_id] ?? `Serviço #${item.service_id}`}</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: COAL }}>R$ {Number(item.charged_value).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {at.observacoes && <div className="sm:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Observações</p><p className="mt-1 text-sm" style={{ color: MUTED }}>{at.observacoes}</p></div>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${BORD}` }}>
              {(at.status === "agendado" || at.status === "atrasado") && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); handleQuickStatus(at, "concluido"); }}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition hover:opacity-80"
                    style={{ borderRadius: "6px", border: `1px solid #b3dfe0`, background: "#e6f5f5", color: TDARK }}>
                    <CheckCircle2 size={12} /> Concluído
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleQuickStatus(at, "cancelado"); }}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition hover:bg-gray-100"
                    style={{ borderRadius: "6px", border: `1px solid ${BORD}`, color: MUTED }}>
                    <XCircle size={12} /> Cancelar
                  </button>
                </>
              )}
              <button onClick={(e) => { e.stopPropagation(); setAtendimentoBeingEdited(at); }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition hover:bg-[#e6f5f5]"
                style={{ borderRadius: "6px", border: `1px solid ${BORD}`, color: MUTED }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                <Pencil size={12} /> Editar
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(at.id); }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition hover:bg-red-50"
                style={{ borderRadius: "6px", border: "1px solid #FECACA", color: "#EF4444" }}>
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
      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${BORD}` }}>
        <span className="text-[11px]" style={{ color: MUTED }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
            className="flex h-7 w-7 items-center justify-center rounded transition disabled:opacity-40"
            style={{ border: `1px solid ${BORD}`, color: MUTED }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
            <ChevronLeft size={13} />
          </button>
          {pages.map((n, i) => n === "…"
            ? <span key={`e${i}`} className="px-1 text-xs" style={{ color: MUTED }}>…</span>
            : <button key={n} onClick={() => setPage(n as number)}
                className="flex h-7 w-7 items-center justify-center rounded text-[11px] font-semibold transition"
                style={{ border: `1px solid ${page === n ? TEAL : BORD}`, background: page === n ? TEAL : "#fff", color: page === n ? "#fff" : MUTED }}>
                {n}
              </button>
          )}
          <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded transition disabled:opacity-40"
            style={{ border: `1px solid ${BORD}`, color: MUTED }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
            <ChevronRightPage size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-5 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Gerenciamento</p>
            <div className="flex items-center gap-2">
              <CalendarCheck size={22} className="text-white/80" />
              <h1 className="text-2xl font-extrabold text-white">Atendimentos</h1>
            </div>
            <p className="mt-0.5 text-sm text-white/70">Gerencie agendamentos, pagamentos e status</p>
          </div>
          <button onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition"
            style={{ background: AMBER, borderRadius: "6px", color: COAL }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancelar" : "Novo atendimento"}
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 overflow-hidden bg-white lg:grid-cols-4"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
          <div className="flex items-center gap-3 p-4" style={{ borderRight: `1px solid ${BORD}`, borderBottom: `1px solid ${BORD}` }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#e6f5f5" }}>
              <Wallet size={16} style={{ color: TEAL }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: MUTED }}>Receita total</p>
              <p className="text-xl font-extrabold" style={{ color: COAL }}>{receitaTotal >= 1000 ? `R$ ${(receitaTotal / 1000).toFixed(1)}k` : `R$ ${receitaTotal.toFixed(0)}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 lg:border-r" style={{ borderBottom: `1px solid ${BORD}`, borderRight: `1px solid ${BORD}` }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
              <CheckCircle2 size={16} className="text-teal-600" />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: MUTED }}>Concluídos</p>
              <p className="text-xl font-extrabold" style={{ color: COAL }}>{concluidos.length}</p>
              {historico.length > 0 && <p className="text-[10px]" style={{ color: MUTED }}>{Math.round(concluidos.length / historico.length * 100)}% do total</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4" style={{ borderRight: `1px solid ${BORD}` }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Clock size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: MUTED }}>Agendados</p>
              <p className="text-xl font-extrabold" style={{ color: COAL }}>{agendados.length}</p>
              {agendados.length === 0 && <p className="text-[10px]" style={{ color: MUTED }}>Nenhum pendente</p>}
            </div>
          </div>
          <div className="p-4">
            <p className="mb-2 text-[11px]" style={{ color: MUTED }}>Receita mensal</p>
            <div className="flex h-8 items-end gap-0.5">
              {monthlyChart.map((m) => {
                const h = chartMax > 0 ? Math.round((m.value / chartMax) * 100) : 0;
                return (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-0.5">
                    <div className="relative w-full" style={{ height: "24px" }}>
                      <div className="absolute bottom-0 w-full rounded-t-sm"
                        style={{ height: `${Math.max(h, h > 0 ? 15 : 0)}%`, background: m.isLast ? TEAL : `${TEAL}33` }} />
                      {h === 0 && <div className="absolute bottom-0 w-full rounded-t-sm bg-gray-100" style={{ height: "3px" }} />}
                    </div>
                    <span className="text-[8px] capitalize" style={{ color: m.isLast ? TEAL : MUTED, fontWeight: m.isLast ? 700 : 400 }}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {feedback && <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>{feedback}</div>}
      {error    && <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>{error}</div>}

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
          <div className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderRadius: "8px", border: "1px solid #FDE68A", background: "#FFFBEB" }}>
            <AlertCircle size={15} className="shrink-0 text-amber-500" />
            <span className="text-[12px] font-semibold text-amber-700">
              Atendimentos em atraso
              <span className="ml-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">{atrasados.length}</span>
            </span>
            <span className="text-[11px] text-amber-600">— requer atenção imediata</span>
          </div>
        )}

        {!loading && atrasados.length > 0 && (
          <div className="overflow-hidden bg-white" style={{ border: "1px solid #F5E0E3", borderRadius: "10px" }}>
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #FDF0F2" }}>
              <AlertCircle size={15} className="text-rose-400" />
              <span className="text-[13px] font-semibold text-rose-500">Atrasados</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-400">{atrasados.length}</span>
            </div>
            <div>{atrasados.map((at) => <Row key={at.id} at={at} />)}</div>
          </div>
        )}

        {!loading && agendados.length > 0 && (
          <div className="overflow-hidden bg-white" style={{ border: "1px solid #FDE68A", borderRadius: "10px" }}>
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #FEF3C7" }}>
              <Clock size={15} className="text-amber-500" />
              <span className="text-[13px] font-bold text-amber-700">Próximos Agendamentos</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{agendados.length}</span>
            </div>
            <div>{agendados.map((at) => <Row key={at.id} at={at} />)}</div>
          </div>
        )}

        <div className="overflow-hidden bg-white" style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: `1px solid ${BORD}` }}>
            <CalendarCheck size={15} style={{ color: TEAL }} />
            <span className="text-[13px] font-bold" style={{ color: COAL }}>Histórico de Atendimentos</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5" style={{ borderBottom: `1px solid ${BORD}` }}>
            {(["todos", "agendado", "atrasado", "concluido", "cancelado"] as HistoryFilter[]).map((s) => {
              const count = s === "todos" ? historico.length : historico.filter((a) => a.status === s).length;
              const isActive = filter === s;
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium transition"
                  style={{ borderRadius: "6px", border: `1px solid ${isActive ? "transparent" : BORD}`, background: isActive ? TEAL : "#fff", color: isActive ? "#fff" : MUTED }}>
                  {s === "todos" ? "Todos" : statusLabel[s]}
                  <span className="rounded-full px-1.5 text-[10px] font-bold"
                    style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#F1F5F9", color: isActive ? "#fff" : MUTED }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm" style={{ color: MUTED }}>Carregando atendimentos...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <CalendarCheck size={32} className="mb-2" style={{ color: "#D1D5DB" }} />
              <p className="text-sm" style={{ color: MUTED }}>Nenhum atendimento nesta categoria.</p>
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
