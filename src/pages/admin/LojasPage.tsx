import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Plus, X, RefreshCw, Pencil, Trash2, ChevronRight,
  MapPin, Phone, Mail, Users, CalendarCheck, TrendingUp,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import { createLoja, deleteLoja, getLojas, updateLoja } from "../../services/lojaService";
import { getAppointments } from "../../services/atendimentoService";
import type { CreateLojaDTO, Loja, UpdateLojaDTO } from "../../types/loja";
import type { Atendimento } from "../../types/atendimento";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

function formatMoney(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const EMPTY_FORM: CreateLojaDTO = {
  nome: "", cnpj: "", telefone: "", email: "",
  cep: "", city: "", state: "", street: "", neighborhood: "", number: "",
};

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "8px 12px", fontSize: "14px",
  border: `1px solid ${BORD}`, borderRadius: "6px",
  background: "#F8FAFC", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = TEAL;
  e.target.style.boxShadow = "0 0 0 3px rgba(13,115,119,0.12)";
  e.target.style.background = "#fff";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow = "none";
  e.target.style.background = "#F8FAFC";
}

function maskCNPJ(v: string) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

function getMasked(field: keyof CreateLojaDTO, value: string): string {
  if (field === "cnpj") return maskCNPJ(value);
  if (field === "telefone") return maskPhone(value);
  if (field === "cep") return maskCEP(value);
  return value;
}

function extractApiError(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(" · ");
  return fallback;
}

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

export default function LojasPage() {
  const navigate = useNavigate();
  const [lojas, setLojas]                     = useState<Loja[]>([]);
  const [atendimentos, setAtendimentos]       = useState<Atendimento[]>([]);
  const [lojaBeingEdited, setLojaBeingEdited] = useState<Loja | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);
  const [feedback, setFeedback]               = useState("");
  const [error, setError]                     = useState("");
  const [form, setForm]                       = useState<CreateLojaDTO>(EMPTY_FORM);
  const [editForm, setEditForm]               = useState<CreateLojaDTO>(EMPTY_FORM);

  async function loadAll() {
    try {
      setLoading(true);
      const [lojasList, atendList] = await Promise.all([
        getLojas(),
        getAppointments().catch(() => [] as Atendimento[]),
      ]);
      setLojas(lojasList);
      setAtendimentos(atendList);
      setError("");
    } catch { setError("Erro ao carregar lojas."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (!lojaBeingEdited) { setEditForm(EMPTY_FORM); return; }
    setEditForm({
      nome: lojaBeingEdited.nome, cnpj: lojaBeingEdited.cnpj,
      telefone: lojaBeingEdited.telefone, email: lojaBeingEdited.email,
      cep: lojaBeingEdited.cep, city: lojaBeingEdited.city, state: lojaBeingEdited.state,
      street: lojaBeingEdited.street, neighborhood: lojaBeingEdited.neighborhood, number: lojaBeingEdited.number,
    });
  }, [lojaBeingEdited]);

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const perStoreStats = useMemo((): Record<number, { atendimentosMes: number; faturamentoMes: number }> => {
    const map: Record<number, { atendimentosMes: number; faturamentoMes: number }> = {};
    atendimentos.forEach((at) => {
      const d = new Date(at.data_atendimento);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        if (!map[at.loja_id]) map[at.loja_id] = { atendimentosMes: 0, faturamentoMes: 0 };
        map[at.loja_id].atendimentosMes++;
        if (at.status === "concluido") map[at.loja_id].faturamentoMes += Number(at.valor_final) || 0;
      }
    });
    return map;
  }, [atendimentos, thisYear, thisMonth]);

  const totalFuncionarios = useMemo(() => lojas.reduce((s, l) => s + l.funcionarios.length, 0), [lojas]);
  const totalAtendMes     = useMemo(() => Object.values(perStoreStats).reduce((s, st) => s + st.atendimentosMes, 0), [perStoreStats]);

  const cityList = useMemo(() => {
    const map: Record<string, { city: string; state: string; count: number }> = {};
    lojas.forEach((l) => {
      const key = `${l.city.trim()}/${l.state.trim().toUpperCase()}`;
      if (!map[key]) map[key] = { city: l.city.trim(), state: l.state.trim().toUpperCase(), count: 0 };
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [lojas]);

  function updateField<K extends keyof CreateLojaDTO>(field: K, value: CreateLojaDTO[K]) {
    const masked = typeof value === "string" ? getMasked(field, value) as CreateLojaDTO[K] : value;
    setForm((p) => ({ ...p, [field]: masked }));
  }
  function updateEditField<K extends keyof CreateLojaDTO>(field: K, value: CreateLojaDTO[K]) {
    const masked = typeof value === "string" ? getMasked(field, value) as CreateLojaDTO[K] : value;
    setEditForm((p) => ({ ...p, [field]: masked }));
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(""); setError("");
    if (!form.nome.trim() || !form.cnpj.trim() || !form.telefone.trim() || !form.email.trim()) { setError("Preencha os campos obrigatórios."); return; }
    try { await createLoja(form); setFeedback("Loja cadastrada."); setShowForm(false); setForm(EMPTY_FORM); await loadAll(); }
    catch (err) { setError(extractApiError(err, "Erro ao cadastrar loja.")); }
  }
  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lojaBeingEdited) return;
    setFeedback(""); setError("");
    if (!editForm.nome.trim() || !editForm.telefone.trim() || !editForm.email.trim()) { setError("Preencha os campos obrigatórios."); return; }
    try {
      const payload: UpdateLojaDTO = {
        nome: editForm.nome, telefone: editForm.telefone, email: editForm.email,
        cep: editForm.cep, city: editForm.city, state: editForm.state,
        street: editForm.street, neighborhood: editForm.neighborhood, number: editForm.number,
      };
      await updateLoja(lojaBeingEdited.id, payload);
      setFeedback("Loja atualizada."); setLojaBeingEdited(null); await loadAll();
    } catch (err) { setError(extractApiError(err, "Erro ao atualizar loja.")); }
  }
  async function handleDeleteLoja(id: number) {
    if (!window.confirm("Excluir esta loja?")) return;
    try { await deleteLoja(id); setFeedback("Loja excluída."); if (lojaBeingEdited?.id === id) setLojaBeingEdited(null); await loadAll(); }
    catch { setError("Erro ao excluir loja."); }
  }

  const formFields = [
    { label: "Nome *",     field: "nome"         as const, type: "text"  },
    { label: "CNPJ *",     field: "cnpj"         as const, type: "text"  },
    { label: "Telefone *", field: "telefone"     as const, type: "tel"   },
    { label: "E-mail *",   field: "email"        as const, type: "email" },
    { label: "CEP",        field: "cep"          as const, type: "text"  },
    { label: "Cidade",     field: "city"         as const, type: "text"  },
    { label: "Estado",     field: "state"        as const, type: "text"  },
    { label: "Rua",        field: "street"       as const, type: "text"  },
    { label: "Bairro",     field: "neighborhood" as const, type: "text"  },
    { label: "Número",     field: "number"       as const, type: "text"  },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-5 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Gerenciamento</p>
            <div className="flex items-center gap-2">
              <Store size={22} className="text-white/80" />
              <h1 className="text-2xl font-extrabold text-white">Lojas</h1>
            </div>
            <p className="mt-0.5 text-sm text-white/70">Gerencie as unidades da rede</p>
          </div>
          <button onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold transition"
            style={{ background: showForm ? "rgba(255,255,255,0.15)" : AMBER, color: showForm ? "#fff" : COAL, borderRadius: "6px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nova loja</>}
          </button>
        </div>

        {!loading && lojas.length > 0 && (
          <div className="relative z-10 mt-6 flex flex-wrap gap-3">
            {[
              { icon: Store,         label: "Unidades",     value: lojas.length         },
              { icon: Users,         label: "Funcionários", value: totalFuncionarios    },
              { icon: CalendarCheck, label: "Atend./Mês",   value: totalAtendMes        },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px" }}>
                <Icon size={14} className="text-white/70" />
                <div>
                  <div className="text-lg font-extrabold text-white leading-none">{value}</div>
                  <div className="text-[10px] text-white/60">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {feedback && <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>{feedback}</div>}
      {error    && <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="mb-5 overflow-hidden bg-white p-5"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
          <div className="mb-4 flex items-center gap-2">
            <Store size={15} style={{ color: TEAL }} />
            <h2 className="text-sm font-bold" style={{ color: COAL }}>Nova Loja</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {formFields.map(({ label, field, type }) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: MUTED }}>{label}</label>
                <input type={type} value={form[field]} onChange={(e) => updateField(field, e.target.value)}
                  required={label.includes("*")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: TEAL, borderRadius: "6px" }}>
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      <EditModal isOpen={Boolean(lojaBeingEdited)} title="Editar Loja" onClose={() => setLojaBeingEdited(null)}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { ph: "Nome",     field: "nome"         as const, type: "text"  },
              { ph: "CNPJ",     field: "cnpj"         as const, type: "text"  },
              { ph: "Telefone", field: "telefone"     as const, type: "tel"   },
              { ph: "E-mail",   field: "email"        as const, type: "email" },
              { ph: "CEP",      field: "cep"          as const, type: "text"  },
              { ph: "Cidade",   field: "city"         as const, type: "text"  },
              { ph: "Estado",   field: "state"        as const, type: "text"  },
              { ph: "Rua",      field: "street"       as const, type: "text"  },
              { ph: "Bairro",   field: "neighborhood" as const, type: "text"  },
              { ph: "Número",   field: "number"       as const, type: "text"  },
            ].map(({ ph, field, type }) => (
              <input key={field} placeholder={ph} type={type} required value={editForm[field]}
                onChange={(e) => updateEditField(field, e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: TEAL, borderRadius: "6px" }}>Salvar alterações</button>
            <button type="button" onClick={() => setLojaBeingEdited(null)}
              className="px-5 py-2 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>Cancelar</button>
          </div>
        </form>
      </EditModal>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: COAL }}>
            Unidades {!loading && <span className="font-normal" style={{ color: MUTED }}>({lojas.length})</span>}
          </h2>
          <button onClick={loadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
            style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
            Carregando lojas...
          </div>
        ) : lojas.length === 0 ? (
          <div className="p-12 text-center" style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
            <Store size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
            <p className="text-sm" style={{ color: MUTED }}>Nenhuma loja cadastrada.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-2 text-sm font-bold transition hover:opacity-70" style={{ color: TEAL }}>
              Cadastrar primeira loja
            </button>
          </div>
        ) : (
          <>
            {cityList.length > 0 && (
              <div className="bg-white px-5 py-4" style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Distribuição geográfica</p>
                <div className="flex flex-wrap gap-2">
                  {cityList.map(({ city, state, count }) => (
                    <div key={`${city}-${state}`} className="flex items-center gap-1.5 px-3 py-1.5"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "20px", background: "#F8FAFC" }}>
                      <MapPin size={12} style={{ color: TEAL }} />
                      <span className="text-sm font-medium" style={{ color: COAL }}>{city}</span>
                      <span className="text-xs" style={{ color: MUTED }}>{state}</span>
                      {count > 1 && (
                        <span className="px-1.5 py-0.5 text-xs font-bold"
                          style={{ background: "#e6f5f5", borderRadius: "20px", color: TDARK }}>
                          {count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {lojas.map((loja) => {
                const stats = perStoreStats[loja.id] ?? { atendimentosMes: 0, faturamentoMes: 0 };
                return (
                  <div key={loja.id}
                    className="overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
                    <div onClick={() => navigate(`/lojas/${loja.id}`)} className="cursor-pointer p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: "#e6f5f5" }}>
                          <Store size={20} style={{ color: TEAL }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold transition-colors" style={{ color: COAL }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
                              onMouseLeave={(e) => (e.currentTarget.style.color = COAL)}>
                              {loja.nome}
                            </h3>
                            <ChevronRight size={14} style={{ color: "#D1D5DB" }} />
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                            <MapPin size={11} className="shrink-0" />
                            {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                            <Phone size={11} /> {loja.telefone}
                            <span className="mx-1" style={{ color: BORD }}>·</span>
                            <Mail size={11} /> {loja.email}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-5 pt-3" style={{ borderTop: `1px solid ${BORD}` }}>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                          <Users size={12} />
                          <span className="font-bold" style={{ color: COAL }}>{loja.funcionarios.length}</span> func.
                        </div>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                          <CalendarCheck size={12} />
                          <span className="font-bold" style={{ color: COAL }}>{stats.atendimentosMes}</span> atend./mês
                        </div>
                        {stats.faturamentoMes > 0 && (
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                            <TrendingUp size={12} style={{ color: TEAL }} />
                            <span className="font-bold" style={{ color: COAL }}>{formatMoney(stats.faturamentoMes)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-5 py-2.5"
                      style={{ borderTop: `1px solid ${BORD}`, background: "#F8FAFC" }}>
                      <span className="text-xs" style={{ color: MUTED }}>CNPJ: {loja.cnpj}</span>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setLojaBeingEdited(loja); }}
                          className="flex h-7 w-7 items-center justify-center transition hover:bg-[#e6f5f5]"
                          style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLoja(loja.id); }}
                          className="flex h-7 w-7 items-center justify-center transition hover:bg-red-50"
                          style={{ border: "1px solid #FECACA", borderRadius: "6px", color: "#EF4444" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
