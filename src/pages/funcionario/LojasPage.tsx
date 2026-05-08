import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, X, RefreshCw, Pencil, Trash2, ChevronRight } from "lucide-react";
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
    end_cep: "",
    end_cidade: "",
    end_estado: "",
    end_rua: "",
    end_bairro: "",
    end_numero: "",
  });
  const [editForm, setEditForm] = useState<CreateLojaDTO>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    end_cep: "",
    end_cidade: "",
    end_estado: "",
    end_rua: "",
    end_bairro: "",
    end_numero: "",
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
        end_cep: "",
        end_cidade: "",
        end_estado: "",
        end_rua: "",
        end_bairro: "",
        end_numero: "",
      });
      return;
    }

    setEditForm({
      nome: lojaBeingEdited.nome,
      cnpj: lojaBeingEdited.cnpj,
      telefone: lojaBeingEdited.telefone,
      email: lojaBeingEdited.email,
      end_cep: lojaBeingEdited.end_cep,
      end_cidade: lojaBeingEdited.end_cidade,
      end_estado: lojaBeingEdited.end_estado,
      end_rua: lojaBeingEdited.end_rua,
      end_bairro: lojaBeingEdited.end_bairro,
      end_numero: lojaBeingEdited.end_numero,
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
        end_cep: "",
        end_cidade: "",
        end_estado: "",
        end_rua: "",
        end_bairro: "",
        end_numero: "",
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
        end_cep: editForm.end_cep,
        end_cidade: editForm.end_cidade,
        end_estado: editForm.end_estado,
        end_rua: editForm.end_rua,
        end_bairro: editForm.end_bairro,
        end_numero: editForm.end_numero,
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
    <div className="px-8 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
            <p className="mt-0.5 text-sm text-gray-500">Gerencie unidades com contato e endereço.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancelar" : "Nova loja"}
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

        {showForm && <form
          onSubmit={handleCreateSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Nova Loja</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="CNPJ"
              value={form.cnpj}
              onChange={(e) => updateField("cnpj", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => updateField("telefone", e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="CEP"
              value={form.end_cep}
              onChange={(e) => updateField("end_cep", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="Cidade"
              value={form.end_cidade}
              onChange={(e) => updateField("end_cidade", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="Estado"
              value={form.end_estado}
              onChange={(e) => updateField("end_estado", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="Rua"
              value={form.end_rua}
              onChange={(e) => updateField("end_rua", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="Bairro"
              value={form.end_bairro}
              onChange={(e) => updateField("end_bairro", e.target.value)}
              required
              className={inputClass}
            />
            <input
              placeholder="Número"
              value={form.end_numero}
              onChange={(e) => updateField("end_numero", e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
            >
              <Plus size={16} />
              Cadastrar
            </button>
          </div>
        </form>}

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
              <input placeholder="CEP" value={editForm.end_cep} onChange={(e) => updateEditField("end_cep", e.target.value)} required className={inputClass} />
              <input placeholder="Cidade" value={editForm.end_cidade} onChange={(e) => updateEditField("end_cidade", e.target.value)} required className={inputClass} />
              <input placeholder="Estado" value={editForm.end_estado} onChange={(e) => updateEditField("end_estado", e.target.value)} required className={inputClass} />
              <input placeholder="Rua" value={editForm.end_rua} onChange={(e) => updateEditField("end_rua", e.target.value)} required className={inputClass} />
              <input placeholder="Bairro" value={editForm.end_bairro} onChange={(e) => updateEditField("end_bairro", e.target.value)} required className={inputClass} />
              <input placeholder="Número" value={editForm.end_numero} onChange={(e) => updateEditField("end_numero", e.target.value)} required className={inputClass} />
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
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
              Carregando lojas...
            </div>
          ) : lojas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
              Nenhuma loja encontrada.
            </div>
          ) : (
            <div className="grid gap-4">
              {lojas.map((loja) => (
                <div
                  key={loja.id}
                  onClick={() => navigate(`/lojas/${loja.id}`)}
                  className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-800">{loja.nome}</h3>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        {loja.end_rua}, {loja.end_numero} — {loja.end_bairro}, {loja.end_cidade}/{loja.end_estado}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <span className="text-xs text-gray-400">{loja.telefone}</span>
                        <span className="text-xs text-gray-400">{loja.email}</span>
                        <span className="text-xs text-gray-400">CNPJ: {loja.cnpj}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLojaBeingEdited(loja);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLoja(loja.id);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Excluir
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
