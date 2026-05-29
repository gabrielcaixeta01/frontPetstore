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

const BLUE  = "#1A3CB8";
const GREEN = "#00A651";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

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
  padding: "10px 12px", fontSize: "14px",
  border: `1px solid ${BORD}`, borderRadius: "4px",
  background: "#fff", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BLUE;
  e.target.style.boxShadow = "0 0 0 3px rgba(26,60,184,0.10)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow = "none";
}

export default function LojasPage() {
  const navigate = useNavigate();
  const [lojas, setLojas]                   = useState<Loja[]>([]);
  const [atendimentos, setAtendimentos]     = useState<Atendimento[]>([]);
  const [lojaBeingEdited, setLojaBeingEdited] = useState<Loja | null>(null);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [feedback, setFeedback]             = useState("");
  const [error, setError]                   = useState("");
  const [form, setForm]                     = useState<CreateLojaDTO>(EMPTY_FORM);
  const [editForm, setEditForm]             = useState<CreateLojaDTO>(EMPTY_FORM);

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
    } catch {
      setError("Erro ao carregar lojas.");
    } finally {
      setLoading(false);
    }
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
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateEditField<K extends keyof CreateLojaDTO>(field: K, value: CreateLojaDTO[K]) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nome.trim() || !form.cnpj.trim() || !form.telefone.trim() || !form.email.trim()) {
      setError("Preencha os campos obrigatórios da loja."); return;
    }
    try {
      await createLoja(form);
      setFeedback("Loja cadastrada com sucesso.");
      setShowForm(false); setForm(EMPTY_FORM);
      await loadAll();
    } catch { setError("Erro ao cadastrar loja."); }
  }

  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lojaBeingEdited) return;
    if (!editForm.nome.trim() || !editForm.telefone.trim() || !editForm.email.trim()) {
      setError("Preencha os campos obrigatórios da loja."); return;
    }
    try {
      const payload: UpdateLojaDTO = {
        nome: editForm.nome, telefone: editForm.telefone, email: editForm.email,
        cep: editForm.cep, city: editForm.city, state: editForm.state,
        street: editForm.street, neighborhood: editForm.neighborhood, number: editForm.number,
      };
      await updateLoja(lojaBeingEdited.id, payload);
      setFeedback("Loja atualizada com sucesso.");
      setLojaBeingEdited(null);
      await loadAll();
    } catch { setError("Erro ao atualizar loja."); }
  }

  async function handleDeleteLoja(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir esta loja?")) return;
    try {
      await deleteLoja(id);
      setFeedback("Loja excluída com sucesso.");
      if (lojaBeingEdited?.id === id) setLojaBeingEdited(null);
      await loadAll();
    } catch { setError("Erro ao excluir loja."); }
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
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
              Gerenciamento
            </span>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Lojas</h1>
            <p className="mt-0.5 text-sm" style={{ color: MUTED }}>Gerencie as unidades da rede.</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: showForm ? MUTED : BLUE, borderRadius: "4px" }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nova loja"}</span>
          </button>
        </div>

        {/* Summary cards */}
        {!loading && lojas.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Store,         label: "Unidades",      value: lojas.length,       accent: BLUE  },
              { icon: Users,         label: "Funcionários",  value: totalFuncionarios,  accent: "#7C3AED" },
              { icon: CalendarCheck, label: "Atend. / Mês",  value: totalAtendMes,      accent: GREEN },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="relative overflow-hidden bg-white p-4 shadow-sm"
                style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
                <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent }} />
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pl-2" style={{ color: MUTED }}>
                  <Icon size={13} style={{ color: accent }} /> {label}
                </div>
                <p className="mt-2 pl-2 text-3xl font-extrabold" style={{ color: "#1a1a1a" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="px-4 py-3 text-sm font-medium"
            style={{ borderRadius: "4px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
            {feedback}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 text-sm font-medium"
            style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreateSubmit} className="bg-white p-5 shadow-sm"
            style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
            <h2 className="mb-4 text-sm font-bold" style={{ color: "#1a1a1a" }}>Nova Loja</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {formFields.map(({ label, field, type }) => (
                <div key={field} className="space-y-1.5">
                  <label className="block text-xs font-medium" style={{ color: MUTED }}>{label}</label>
                  <input
                    type={type} value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    required={label.includes("*")}
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: BLUE, borderRadius: "4px" }}>
                <Plus size={14} /> Cadastrar
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
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
                <input key={field} placeholder={ph} type={type} required
                  value={editForm[field]} onChange={(e) => updateEditField(field, e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: BLUE, borderRadius: "4px" }}>
                Salvar alterações
              </button>
              <button type="button" onClick={() => setLojaBeingEdited(null)}
                className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
                Cancelar
              </button>
            </div>
          </form>
        </EditModal>

        {/* List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "#1a1a1a" }}>
              Unidades
              {!loading && (
                <span className="ml-2 text-sm font-normal" style={{ color: MUTED }}>({lojas.length})</span>
              )}
            </h2>
            <button onClick={loadAll}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
              <RefreshCw size={13} /> Atualizar
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm"
              style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
              Carregando lojas...
            </div>
          ) : lojas.length === 0 ? (
            <div className="p-12 text-center"
              style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff" }}>
              <Store size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p className="text-sm" style={{ color: MUTED }}>Nenhuma loja cadastrada.</p>
              <button onClick={() => setShowForm(true)}
                className="mt-2 text-sm font-bold transition hover:opacity-70" style={{ color: BLUE }}>
                Cadastrar primeira loja
              </button>
            </div>
          ) : (
            <>
              {/* Geographic distribution */}
              {cityList.length > 0 && (
                <div className="bg-white px-5 py-4 shadow-sm"
                  style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                    Distribuição geográfica
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cityList.map(({ city, state, count }) => (
                      <div key={`${city}-${state}`}
                        className="flex items-center gap-1.5 px-3 py-1.5"
                        style={{ border: `1px solid ${BORD}`, borderRadius: "20px", background: "#F4F4F4" }}>
                        <MapPin size={12} style={{ color: BLUE }} />
                        <span className="text-sm font-medium" style={{ color: "#374151" }}>{city}</span>
                        <span className="text-xs" style={{ color: MUTED }}>{state}</span>
                        {count > 1 && (
                          <span className="px-1.5 py-0.5 text-xs font-bold"
                            style={{ background: "rgba(26,60,184,0.10)", borderRadius: "20px", color: BLUE }}>
                            {count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Store cards */}
              <div className="grid gap-4 lg:grid-cols-2">
                {lojas.map((loja) => {
                  const stats = perStoreStats[loja.id] ?? { atendimentosMes: 0, faturamentoMes: 0 };
                  return (
                    <div key={loja.id}
                      className="group relative overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>

                      {/* Top accent bar */}
                      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: BLUE }} />

                      {/* Clickable body */}
                      <div onClick={() => navigate(`/lojas/${loja.id}`)} className="cursor-pointer p-5 pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center"
                            style={{ background: "rgba(26,60,184,0.10)", borderRadius: "8px" }}>
                            <Store size={20} style={{ color: BLUE }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-extrabold transition-colors"
                                style={{ color: "#1a1a1a" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#1a1a1a")}>
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
                              <span className="mx-1" style={{ color: "#E0E0E0" }}>·</span>
                              <Mail size={11} /> {loja.email}
                            </div>
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="mt-4 flex items-center gap-5 pt-3" style={{ borderTop: `1px solid ${BORD}` }}>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                            <Users size={12} style={{ color: MUTED }} />
                            <span className="font-bold" style={{ color: "#374151" }}>{loja.funcionarios.length}</span> func.
                          </div>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                            <CalendarCheck size={12} style={{ color: MUTED }} />
                            <span className="font-bold" style={{ color: "#374151" }}>{stats.atendimentosMes}</span> atend./mês
                          </div>
                          {stats.faturamentoMes > 0 && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                              <TrendingUp size={12} style={{ color: GREEN }} />
                              <span className="font-bold" style={{ color: "#374151" }}>{formatMoney(stats.faturamentoMes)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="flex items-center justify-between px-5 py-2.5"
                        style={{ borderTop: `1px solid ${BORD}`, background: "#F4F4F4" }}>
                        <span className="text-xs" style={{ color: MUTED }}>CNPJ: {loja.cnpj}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLojaBeingEdited(loja); }}
                            className="flex h-7 w-7 items-center justify-center transition hover:bg-gray-200"
                            style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}
                            title="Editar">
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteLoja(loja.id); }}
                            className="flex h-7 w-7 items-center justify-center transition hover:bg-red-50"
                            style={{ border: "1px solid #FECACA", borderRadius: "4px", color: "#EF4444" }}
                            title="Excluir">
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
        </section>
      </div>
    </div>
  );
}
