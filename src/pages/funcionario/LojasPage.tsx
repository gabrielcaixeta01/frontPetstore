import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, X, RefreshCw, Pencil, Trash2, ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import EditModal from "../../components/EditModal";
import {
  createLoja,
  deleteLoja,
  getLojas,
  updateLoja,
} from "../../services/lojaService";
import type { CreateLojaDTO, Loja, UpdateLojaDTO } from "../../types/loja";

export default function LojasPage() {
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaBeingEdited, setLojaBeingEdited] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateLojaDTO>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    cep: "",
    city: "",
    state: "",
    street: "",
    neighborhood: "",
    number: "",
  });
  const [editForm, setEditForm] = useState<CreateLojaDTO>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    cep: "",
    city: "",
    state: "",
    street: "",
    neighborhood: "",
    number: "",
  });

  async function loadLojas() {
    try {
      setLoading(true);
      const data = await getLojas();
      setLojas(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar lojas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLojas();
  }, []);

  useEffect(() => {
    if (!lojaBeingEdited) {
      setEditForm({
        nome: "",
        cnpj: "",
        telefone: "",
        email: "",
        cep: "",
        city: "",
        state: "",
        street: "",
        neighborhood: "",
        number: "",
      });
      return;
    }

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

  function updateField<K extends keyof CreateLojaDTO>(field: K, value: CreateLojaDTO[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateEditField<K extends keyof CreateLojaDTO>(field: K, value: CreateLojaDTO[K]) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.nome.trim() || !form.cnpj.trim() || !form.telefone.trim() || !form.email.trim()) {
      alert("Preencha os campos obrigatórios da loja.");
      return;
    }

    try {
      await createLoja(form);
      setFeedback("Loja cadastrada com sucesso.");
      setShowForm(false);
      setForm({
        nome: "",
        cnpj: "",
        telefone: "",
        email: "",
        cep: "",
        city: "",
        state: "",
        street: "",
        neighborhood: "",
        number: "",
      });
      await loadLojas();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar loja.");
    }
  }

  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!lojaBeingEdited) return;

    if (!editForm.nome.trim() || !editForm.telefone.trim() || !editForm.email.trim()) {
      alert("Preencha os campos obrigatórios da loja.");
      return;
    }

    try {
      const payload: UpdateLojaDTO = {
        nome: editForm.nome,
        telefone: editForm.telefone,
        email: editForm.email,
        cep: editForm.cep,
        city: editForm.city,
        state: editForm.state,
        street: editForm.street,
        neighborhood: editForm.neighborhood,
        number: editForm.number,
      };
      await updateLoja(lojaBeingEdited.id, payload);
      setFeedback("Loja atualizada com sucesso.");
      setLojaBeingEdited(null);
      await loadLojas();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar loja.");
    }
  }

  async function handleDeleteLoja(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir esta loja?")) return;

    try {
      await deleteLoja(id);
      setFeedback("Loja excluída com sucesso.");
      if (lojaBeingEdited?.id === id) setLojaBeingEdited(null);
      await loadLojas();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir loja.");
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
            <p className="mt-0.5 text-sm text-gray-500">Gerencie unidades com contato e endereço.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nova loja"}</span>
          </button>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateSubmit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Nova Loja</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
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
              ].map(({ label, value, field, type }) => (
                <div key={field} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => updateField(field, e.target.value)}
                    required
                    className={inputClass}
                  />
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

        <EditModal
          isOpen={Boolean(lojaBeingEdited)}
          title="Editar Loja"
          onClose={() => setLojaBeingEdited(null)}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Nome" value={editForm.nome} onChange={(e) => updateEditField("nome", e.target.value)} required className={inputClass} />
              <input placeholder="CNPJ" value={editForm.cnpj} onChange={(e) => updateEditField("cnpj", e.target.value)} required className={inputClass} />
              <input placeholder="Telefone" value={editForm.telefone} onChange={(e) => updateEditField("telefone", e.target.value)} required className={inputClass} />
              <input type="email" placeholder="Email" value={editForm.email} onChange={(e) => updateEditField("email", e.target.value)} required className={inputClass} />
              <input placeholder="CEP" value={editForm.cep} onChange={(e) => updateEditField("cep", e.target.value)} required className={inputClass} />
              <input placeholder="Cidade" value={editForm.city} onChange={(e) => updateEditField("city", e.target.value)} required className={inputClass} />
              <input placeholder="Estado" value={editForm.state} onChange={(e) => updateEditField("state", e.target.value)} required className={inputClass} />
              <input placeholder="Rua" value={editForm.street} onChange={(e) => updateEditField("street", e.target.value)} required className={inputClass} />
              <input placeholder="Bairro" value={editForm.neighborhood} onChange={(e) => updateEditField("neighborhood", e.target.value)} required className={inputClass} />
              <input placeholder="Número" value={editForm.number} onChange={(e) => updateEditField("number", e.target.value)} required className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90">
                Salvar alterações
              </button>
              <button type="button" onClick={() => setLojaBeingEdited(null)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </EditModal>

        <section className="space-y-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Lista de lojas</h2>
            <button
              onClick={loadLojas}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Atualizar
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
            <div className="grid gap-4 lg:grid-cols-2">
              {lojas.map((loja) => (
                <div
                  key={loja.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md hover:border-[#1c46f3]/20"
                >
                  {/* Clickable area */}
                  <div
                    onClick={() => navigate(`/lojas/${loja.id}`)}
                    className="cursor-pointer p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                        <Store size={20} className="text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#1c46f3] transition-colors">
                            {loja.nome}
                          </h3>
                          <ChevronRight size={14} className="text-gray-300 transition group-hover:text-[#1c46f3] group-hover:translate-x-0.5" />
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={11} className="shrink-0" />
                            {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={11} /> {loja.telefone}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail size={11} /> {loja.email}
                          </span>
                        </div>
                      </div>
                      {loja.funcionarios?.length > 0 && (
                        <span className="shrink-0 rounded-full bg-[#1c46f3]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1c46f3]">
                          {loja.funcionarios.length} func.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
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
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
