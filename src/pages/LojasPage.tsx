import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, RefreshCw, Pencil, Trash2, ChevronRight } from "lucide-react";
import EditModal from "../components/EditModal";
import { apexTheme } from "../lib/theme";
import {
  createLoja,
  deleteLoja,
  getLojas,
  updateLoja,
} from "../services/lojaService";
import type { CreateLojaDTO, Loja, UpdateLojaDTO } from "../types/loja";

function getIsCliente() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role === "cliente" : false;
  } catch {
    return false;
  }
}

export default function LojasPage() {
  const c = apexTheme.colors;
  const isCliente = getIsCliente();
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaBeingEdited, setLojaBeingEdited] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
              <Store size={26} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lojas</h1>
              <p className={`mt-1 text-sm ${c.textSoft}`}>
                Gerencie unidades da empresa com dados de contato e endereço.
              </p>
            </div>
          </div>
        </header>

        {feedback && (
          <div className="rounded-2xl border border-emerald-800 bg-emerald-950 px-4 py-3 text-emerald-300">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {!isCliente && <form
          onSubmit={handleCreateSubmit}
          className={`space-y-4 rounded-2xl border ${c.border} ${c.card} p-6 shadow-lg`}
        >
          <h2 className={`text-2xl font-bold ${c.text}`}>Cadastrar Loja</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="CNPJ"
              value={form.cnpj}
              onChange={(e) => updateField("cnpj", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => updateField("telefone", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="CEP"
              value={form.end_cep}
              onChange={(e) => updateField("end_cep", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="Cidade"
              value={form.end_cidade}
              onChange={(e) => updateField("end_cidade", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="Estado"
              value={form.end_estado}
              onChange={(e) => updateField("end_estado", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="Rua"
              value={form.end_rua}
              onChange={(e) => updateField("end_rua", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="Bairro"
              value={form.end_bairro}
              onChange={(e) => updateField("end_bairro", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
            <input
              placeholder="Número"
              value={form.end_numero}
              onChange={(e) => updateField("end_numero", e.target.value)}
              required
              className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className={`flex items-center gap-2 rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90`}
            >
              <Plus size={16} />
              Cadastrar
            </button>
          </div>
        </form>}

        {!isCliente && <EditModal
          isOpen={Boolean(lojaBeingEdited)}
          title="Editar Loja"
          onClose={() => setLojaBeingEdited(null)}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Nome" value={editForm.nome} onChange={(e) => updateEditField("nome", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="CNPJ" value={editForm.cnpj} onChange={(e) => updateEditField("cnpj", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="Telefone" value={editForm.telefone} onChange={(e) => updateEditField("telefone", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input type="email" placeholder="Email" value={editForm.email} onChange={(e) => updateEditField("email", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="CEP" value={editForm.end_cep} onChange={(e) => updateEditField("end_cep", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="Cidade" value={editForm.end_cidade} onChange={(e) => updateEditField("end_cidade", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="Estado" value={editForm.end_estado} onChange={(e) => updateEditField("end_estado", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="Rua" value={editForm.end_rua} onChange={(e) => updateEditField("end_rua", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="Bairro" value={editForm.end_bairro} onChange={(e) => updateEditField("end_bairro", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
              <input placeholder="Número" value={editForm.end_numero} onChange={(e) => updateEditField("end_numero", e.target.value)} required className={`rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className={`rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90`}>
                Salvar alterações
              </button>
              <button type="button" onClick={() => setLojaBeingEdited(null)} className={`rounded-xl border ${c.border} px-5 py-3 font-semibold ${c.text} transition hover:${c.bgSoft}`}>
                Cancelar
              </button>
            </div>
          </form>
        </EditModal>}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de lojas</h2>
            <button
              onClick={loadLojas}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
              Carregando lojas...
            </div>
          ) : lojas.length === 0 ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textMuted}`}>
              Nenhuma loja encontrada.
            </div>
          ) : (
            <div className="grid gap-4">
              {lojas.map((loja) => (
                <div
                  key={loja.id}
                  onClick={() => navigate(`/lojas/${loja.id}`)}
                  className={`cursor-pointer rounded-2xl border ${c.border} ${c.card} p-5 shadow-sm transition hover:shadow-md`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-bold ${c.text}`}>{loja.nome}</h3>
                        <ChevronRight size={16} className={c.textMuted} />
                      </div>
                      <p className={`text-sm ${c.textSoft}`}>
                        {loja.end_rua}, {loja.end_numero} — {loja.end_bairro}, {loja.end_cidade}/{loja.end_estado}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <span className={`text-xs ${c.textMuted}`}>{loja.telefone}</span>
                        <span className={`text-xs ${c.textMuted}`}>{loja.email}</span>
                        <span className={`text-xs ${c.textMuted}`}>CNPJ: {loja.cnpj}</span>
                      </div>
                    </div>

                    {!isCliente && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLojaBeingEdited(loja);
                        }}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:bg-gray-50`}
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLoja(loja.id);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Excluir
                      </button>
                    </div>
                    )}
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
