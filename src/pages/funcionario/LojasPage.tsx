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

function formatMoney(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const EMPTY_FORM: CreateLojaDTO = {
  nome: "", cnpj: "", telefone: "", email: "",
  cep: "", city: "", state: "", street: "", neighborhood: "", number: "",
};

export default function LojasPage() {
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lojaBeingEdited, setLojaBeingEdited] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateLojaDTO>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<CreateLojaDTO>(EMPTY_FORM);

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
      nome: lojaBeingEdited.nome,
      cnpj: lojaBeingEdited.cnpj,
      telefone: lojaBeingEdited.telefone,
      email: lojaBeingEdited.email,
      cep: lojaBeingEdited.cep,
      city: lojaBeingEdited.city,
      state: lojaBeingEdited.state,
      street: lojaBeingEdited.street,
      neighborhood: lojaBeingEdited.neighborhood,
      number: lojaBeingEdited.number,
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
        if (at.status === "concluido") map[at.loja_id].faturamentoMes += at.valor_final;
      }
    });
    return map;
  }, [atendimentos, thisYear, thisMonth]);

  const totalFuncionarios = useMemo(
    () => lojas.reduce((s, l) => s + l.funcionarios.length, 0),
    [lojas],
  );
  const totalAtendMes = useMemo(
    () => Object.values(perStoreStats).reduce((s, st) => s + st.atendimentosMes, 0),
    [perStoreStats],
  );

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
      setError("Preencha os campos obrigatórios da loja.");
      return;
    }
    try {
      await createLoja(form);
      setFeedback("Loja cadastrada com sucesso.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      await loadAll();
    } catch { setError("Erro ao cadastrar loja."); }
  }

  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lojaBeingEdited) return;
    if (!editForm.nome.trim() || !editForm.telefone.trim() || !editForm.email.trim()) {
      setError("Preencha os campos obrigatórios da loja.");
      return;
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

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
            <p className="mt-0.5 text-sm text-gray-500">Gerencie unidades da rede.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nova loja"}</span>
          </button>
        </div>

        {/* Summary bar */}
        {!loading && lojas.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <Store size={13} /> Unidades
              </div>
              <p className="mt-1.5 text-3xl font-bold text-gray-900">{lojas.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <Users size={13} /> Funcionários
              </div>
              <p className="mt-1.5 text-3xl font-bold text-gray-900">{totalFuncionarios}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <CalendarCheck size={13} /> Atend. / Mês
              </div>
              <p className="mt-1.5 text-3xl font-bold text-gray-900">{totalAtendMes}</p>
            </div>
          </div>
        )}

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreateSubmit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Nova Loja</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { label: "Nome *",     value: form.nome,         field: "nome" as const,         type: "text"  },
                { label: "CNPJ *",     value: form.cnpj,         field: "cnpj" as const,         type: "text"  },
                { label: "Telefone *", value: form.telefone,     field: "telefone" as const,     type: "tel"   },
                { label: "E-mail *",   value: form.email,        field: "email" as const,        type: "email" },
                { label: "CEP *",      value: form.cep,          field: "cep" as const,          type: "text"  },
                { label: "Cidade *",   value: form.city,         field: "city" as const,         type: "text"  },
                { label: "Estado *",   value: form.state,        field: "state" as const,        type: "text"  },
                { label: "Rua *",      value: form.street,       field: "street" as const,       type: "text"  },
                { label: "Bairro *",   value: form.neighborhood, field: "neighborhood" as const, type: "text"  },
                { label: "Número *",   value: form.number,       field: "number" as const,       type: "text"  },
              ] as const).map(({ label, value, field, type }) => (
                <div key={field} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">{label}</label>
                  <input type={type} value={value} onChange={(e) => updateField(field, e.target.value)} required className={inputClass} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90">
                <Plus size={14} /> Cadastrar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <EditModal isOpen={Boolean(lojaBeingEdited)} title="Editar Loja" onClose={() => setLojaBeingEdited(null)}>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Nome"     value={editForm.nome}         onChange={(e) => updateEditField("nome", e.target.value)}         required className={inputClass} />
              <input placeholder="CNPJ"     value={editForm.cnpj}         onChange={(e) => updateEditField("cnpj", e.target.value)}         required className={inputClass} />
              <input placeholder="Telefone" value={editForm.telefone}     onChange={(e) => updateEditField("telefone", e.target.value)}     required className={inputClass} />
              <input placeholder="Email" type="email" value={editForm.email} onChange={(e) => updateEditField("email", e.target.value)}    required className={inputClass} />
              <input placeholder="CEP"      value={editForm.cep}          onChange={(e) => updateEditField("cep", e.target.value)}          required className={inputClass} />
              <input placeholder="Cidade"   value={editForm.city}         onChange={(e) => updateEditField("city", e.target.value)}         required className={inputClass} />
              <input placeholder="Estado"   value={editForm.state}        onChange={(e) => updateEditField("state", e.target.value)}        required className={inputClass} />
              <input placeholder="Rua"      value={editForm.street}       onChange={(e) => updateEditField("street", e.target.value)}       required className={inputClass} />
              <input placeholder="Bairro"   value={editForm.neighborhood} onChange={(e) => updateEditField("neighborhood", e.target.value)} required className={inputClass} />
              <input placeholder="Número"   value={editForm.number}       onChange={(e) => updateEditField("number", e.target.value)}       required className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90">
                Salvar alterações
              </button>
              <button type="button" onClick={() => setLojaBeingEdited(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </EditModal>

        {/* Store list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Unidades</h2>
            <button
              onClick={loadAll}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} /> Atualizar
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
              Carregando lojas...
            </div>
          ) : lojas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <Store size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">Nenhuma loja cadastrada.</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">
                Cadastrar primeira loja
              </button>
            </div>
          ) : (
            <>
              {/* Geographic distribution */}
              {cityList.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Distribuição geográfica</p>
                  <div className="flex flex-wrap gap-2">
                    {cityList.map(({ city, state, count }) => (
                      <div
                        key={`${city}-${state}`}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5"
                      >
                        <MapPin size={12} className="text-[#1c46f3]" />
                        <span className="text-sm font-medium text-gray-700">{city}</span>
                        <span className="text-xs text-gray-400">{state}</span>
                        {count > 1 && (
                          <span className="rounded-full bg-[#1c46f3]/10 px-1.5 py-0.5 text-xs font-bold text-[#1c46f3]">
                            {count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards */}
              <div className="grid gap-4 lg:grid-cols-2">
                {lojas.map((loja) => {
                  const stats = perStoreStats[loja.id] ?? { atendimentosMes: 0, faturamentoMes: 0 };
                  return (
                    <div
                      key={loja.id}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#1c46f3]/20 hover:shadow-md"
                    >
                      {/* Clickable area */}
                      <div onClick={() => navigate(`/lojas/${loja.id}`)} className="cursor-pointer p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                            <Store size={20} className="text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-gray-900 transition-colors group-hover:text-[#1c46f3]">
                                {loja.nome}
                              </h3>
                              <ChevronRight size={14} className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#1c46f3]" />
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                              <MapPin size={11} className="shrink-0" />
                              {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
                            </p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                              <Phone size={11} /> {loja.telefone}
                              <span className="mx-1 text-gray-200">·</span>
                              <Mail size={11} /> {loja.email}
                            </div>
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Users size={12} className="text-gray-400" />
                            <span className="font-semibold text-gray-700">{loja.funcionarios.length}</span> func.
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarCheck size={12} className="text-gray-400" />
                            <span className="font-semibold text-gray-700">{stats.atendimentosMes}</span> atend./mês
                          </div>
                          {stats.faturamentoMes > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <TrendingUp size={12} className="text-[#00bb69]" />
                              <span className="font-semibold text-gray-700">{formatMoney(stats.faturamentoMes)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-gray-50 px-5 py-2.5">
                        <span className="text-xs text-gray-400">CNPJ: {loja.cnpj}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLojaBeingEdited(loja); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
                            title="Editar"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteLoja(loja.id); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50"
                            title="Excluir"
                          >
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
