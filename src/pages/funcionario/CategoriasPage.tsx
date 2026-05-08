import { useEffect, useState } from "react";
import { LayoutGrid, Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
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

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaBeingEdited, setCategoriaBeingEdited] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");

  async function loadCategorias() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategorias(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (!categoriaBeingEdited) {
      setEditNome("");
      setEditDescricao("");
      return;
    }

    setEditNome(categoriaBeingEdited.name);
    setEditDescricao(categoriaBeingEdited.description ?? "");
  }, [categoriaBeingEdited]);

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome da categoria.");
      return;
    }

    try {
      const payload: CreateCategoriaDTO = {
        name: nome.trim(),
        description: descricao.trim() || undefined,
      };
      await createCategory(payload);
      setFeedback("Categoria cadastrada com sucesso.");
      setNome("");
      setDescricao("");
      await loadCategorias();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar categoria.");
    }
  }

  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!categoriaBeingEdited) return;

    if (!editNome.trim()) {
      alert("Informe o nome da categoria.");
      return;
    }

    try {
      const payload: UpdateCategoriaDTO = {
        name: editNome.trim(),
        description: editDescricao.trim() || undefined,
      };
      await updateCategory(categoriaBeingEdited.id, payload);
      setFeedback("Categoria atualizada com sucesso.");
      setCategoriaBeingEdited(null);
      await loadCategorias();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar categoria.");
    }
  }

  async function handleDeleteCategoria(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await deleteCategory(id);
      setFeedback("Categoria excluída com sucesso.");
      if (categoriaBeingEdited?.id === id) setCategoriaBeingEdited(null);
      await loadCategorias();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir categoria.");
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00bb69]/10">
              <LayoutGrid size={20} className="text-[#00bb69]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Organize os tipos de pet por categoria para facilitar filtros e gestão.
              </p>
            </div>
          </div>
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

        <form
          onSubmit={handleCreateSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Cadastrar Categoria</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="categoria-nome" className="mb-1 block text-xs font-medium text-gray-500">
                Nome
              </label>
              <input
                id="categoria-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            <div>
              <label htmlFor="categoria-descricao" className="mb-1 block text-xs font-medium text-gray-500">
                Descrição
              </label>
              <input
                id="categoria-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>
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
        </form>

        <EditModal
          isOpen={Boolean(categoriaBeingEdited)}
          title="Editar Categoria"
          onClose={() => setCategoriaBeingEdited(null)}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="categoria-edit-nome" className="mb-1 block text-xs font-medium text-gray-500">
                  Nome
                </label>
                <input
                  id="categoria-edit-nome"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
                />
              </div>
              <div>
                <label htmlFor="categoria-edit-descricao" className="mb-1 block text-xs font-medium text-gray-500">
                  Descrição
                </label>
                <input
                  id="categoria-edit-descricao"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
              >
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={() => setCategoriaBeingEdited(null)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </EditModal>

        <section className="space-y-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Lista de categorias</h2>
            <button
              onClick={loadCategorias}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
              Carregando categorias...
            </div>
          ) : categorias.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <div className="grid gap-4">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-gray-800">{categoria.name}</h3>
                      {categoria.description && (
                        <p className="text-sm text-gray-500">{categoria.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCategoriaBeingEdited(categoria)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategoria(categoria.id)}
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
