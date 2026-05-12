import { useEffect, useState } from "react";
import { LayoutGrid, Plus, X, Pencil, Trash2 } from "lucide-react";
import EditModal from "../../components/EditModal";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CreateCategoriaDTO,
  type UpdateCategoriaDTO,
} from "../../services/categoriaService";
import type { Categoria } from "../../types/categoria";

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;

  const axiosError = error as { response?: { status?: number; data?: unknown } };
  if (axiosError.response?.status === 422) {
    return "Nome da categoria inválido. Use pelo menos 2 caracteres.";
  }

  const data = axiosError.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }

  return fallback;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaBeingEdited, setCategoriaBeingEdited] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");

  async function loadCategorias() {
    setLoading(true);
    try {
      setCategorias(await getCategories());
      setError("");
    } catch { setError("Erro ao carregar categorias."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCategorias(); }, []);

  useEffect(() => {
    if (!categoriaBeingEdited) { setEditNome(""); setEditDescricao(""); return; }
    setEditNome(categoriaBeingEdited.name);
    setEditDescricao(categoriaBeingEdited.description ?? "");
  }, [categoriaBeingEdited]);

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNome = nome.trim();
    if (normalizedNome.length < 2) {
      setError("O nome da categoria deve ter no mínimo 2 caracteres.");
      return;
    }
    try {
      const payload: CreateCategoriaDTO = { name: normalizedNome, description: descricao.trim() || undefined };
      await createCategory(payload);
      setFeedback("Categoria cadastrada com sucesso.");
      setNome(""); setDescricao(""); setShowForm(false);
      await loadCategorias();
    } catch (error) { setError(getApiErrorMessage(error, "Erro ao cadastrar categoria.")); }
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoriaBeingEdited) return;
    const normalizedNome = editNome.trim();
    if (normalizedNome.length < 2) {
      setError("O nome da categoria deve ter no mínimo 2 caracteres.");
      return;
    }
    try {
      const payload: UpdateCategoriaDTO = { name: normalizedNome, description: editDescricao.trim() };
      await updateCategory(categoriaBeingEdited.id, payload);
      setFeedback("Categoria atualizada.");
      setCategoriaBeingEdited(null);
      await loadCategorias();
    } catch (error) { setError(getApiErrorMessage(error, "Erro ao atualizar categoria.")); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Excluir esta categoria?")) return;
    try {
      await deleteCategory(id);
      setFeedback("Categoria excluída.");
      if (categoriaBeingEdited?.id === id) setCategoriaBeingEdited(null);
      await loadCategorias();
    } catch { setError("Erro ao excluir categoria."); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-0.5 text-sm text-gray-500">Organize os tipos de pet por categoria.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setError(""); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancelar" : "Nova categoria"}
        </button>
      </div>

      {feedback && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Nova Categoria</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} placeholder="Ex: Cão" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Descrição</label>
              <input className={inputCls} placeholder="Descrição opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      <EditModal isOpen={Boolean(categoriaBeingEdited)} title="Editar Categoria" onClose={() => setCategoriaBeingEdited(null)}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Descrição</label>
              <input className={inputCls} value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">Salvar</button>
            <button type="button" onClick={() => setCategoriaBeingEdited(null)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </EditModal>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">Carregando categorias...</div>
      ) : categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <LayoutGrid size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">Criar primeira categoria</button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00bb69]/10">
                  <LayoutGrid size={16} className="text-[#00bb69]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  {cat.description && <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{cat.description}</p>}
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-50 pt-3">
                <button onClick={() => setCategoriaBeingEdited(cat)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handleDelete(cat.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50">
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
