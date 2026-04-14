import { useEffect, useState } from "react";
import { apexTheme } from "../lib/theme";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CreateCategoriaDTO,
  type UpdateCategoriaDTO,
} from "../services/categoriaService";
import type { Categoria } from "../types/categoria";

export default function CategoriasPage() {
  const c = apexTheme.colors;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaBeingEdited, setCategoriaBeingEdited] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

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
      setNome("");
      setDescricao("");
      return;
    }

    setNome(categoriaBeingEdited.name);
    setDescricao("");
  }, [categoriaBeingEdited]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome da categoria.");
      return;
    }

    try {
      if (categoriaBeingEdited) {
        const payload: UpdateCategoriaDTO = {
          name: nome.trim(),
          description: descricao.trim() || undefined,
        };
        await updateCategory(categoriaBeingEdited.id, payload);
        setFeedback("Categoria atualizada com sucesso.");
      } else {
        const payload: CreateCategoriaDTO = {
          name: nome.trim(),
          description: descricao.trim() || undefined,
        };
        await createCategory(payload);
        setFeedback("Categoria cadastrada com sucesso.");
      }

      setCategoriaBeingEdited(null);
      await loadCategorias();
    } catch (err) {
      console.error(err);
      setError(categoriaBeingEdited ? "Erro ao atualizar categoria." : "Erro ao cadastrar categoria.");
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
    <div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
          <p className={`text-sm ${c.textMuted}`}>Módulo</p>
          <h1 className="mt-2 text-4xl font-bold">Categorias</h1>
          <p className={`mt-3 ${c.textSoft}`}>
            Organize os tipos de pet por categoria para facilitar filtros e gestão.
          </p>
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

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 rounded-2xl border ${c.border} ${c.card} p-6 shadow-lg`}
        >
          <h2 className={`text-2xl font-bold ${c.text}`}>
            {categoriaBeingEdited ? "Editar Categoria" : "Cadastrar Categoria"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="categoria-nome" className={`mb-1 block text-sm ${c.textSoft}`}>
                Nome
              </label>
              <input
                id="categoria-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
              />
            </div>

            <div>
              <label htmlFor="categoria-descricao" className={`mb-1 block text-sm ${c.textSoft}`}>
                Descrição
              </label>
              <input
                id="categoria-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className={`rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90`}
            >
              {categoriaBeingEdited ? "Salvar alterações" : "Cadastrar"}
            </button>

            {categoriaBeingEdited && (
              <button
                type="button"
                onClick={() => setCategoriaBeingEdited(null)}
                className={`rounded-xl border ${c.border} px-5 py-3 font-semibold ${c.text} transition hover:${c.bgSoft}`}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de categorias</h2>
            <button
              onClick={loadCategorias}
              className={`rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
              Carregando categorias...
            </div>
          ) : categorias.length === 0 ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textMuted}`}>
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <div className="grid gap-4">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className={`rounded-2xl border ${c.border} ${c.card} p-5 shadow-lg`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h3 className={`text-xl font-bold ${c.text}`}>{categoria.name}</h3>
                      <p className={`text-sm ${c.textSoft}`}>ID: {categoria.id}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCategoriaBeingEdited(categoria)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:${c.bgSoft}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategoria(categoria.id)}
                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                      >
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
