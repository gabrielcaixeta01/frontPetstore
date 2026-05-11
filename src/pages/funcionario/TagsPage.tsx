import { useEffect, useState } from "react";
import { Tag, Plus, X, RefreshCw } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditTagForm from "../../components/tag/EditTagForm";
import TagForm from "../../components/tag/TagForm";
import TagList from "../../components/tag/TagList";
import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "../../services/tagService";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../../types/tag";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;

  const axiosError = error as { response?: { status?: number; data?: unknown } };
  if (axiosError.response?.status === 422) {
    return "Nome da tag inválido. Use pelo menos 2 caracteres.";
  }

  const data = axiosError.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }

  return fallback;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Etiqueta[]>([]);
  const [tagBeingEdited, setTagBeingEdited] = useState<Etiqueta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadTags() {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar tags.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  async function handleCreateTag(data: CreateEtiquetaDTO) {
    try {
      await createTag(data);
      setFeedback("Tag cadastrada com sucesso.");
      setTagBeingEdited(null);
      setShowForm(false);
      await loadTags();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Erro ao cadastrar tag."));
    }
  }

  async function handleUpdateTag(id: number, data: UpdateEtiquetaDTO) {
    try {
      await updateTag(id, data);
      setFeedback("Tag atualizada com sucesso.");
      setTagBeingEdited(null);
      await loadTags();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Erro ao atualizar tag."));
    }
  }

  async function handleDeleteTag(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir esta tag?")) return;

    try {
      await deleteTag(id);
      setFeedback("Tag excluída com sucesso.");
      if (tagBeingEdited?.id === id) setTagBeingEdited(null);
      await loadTags();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir tag.");
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
            <p className="mt-0.5 text-sm text-gray-500">Organize e classifique entidades com tags reutilizáveis.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancelar" : "Nova tag"}
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
          <TagForm
            tagBeingEdited={null}
            onCreate={handleCreateTag}
            onUpdate={handleUpdateTag}
            onCancelEdit={() => { setTagBeingEdited(null); setShowForm(false); }}
          />
        )}

        <EditModal
          isOpen={Boolean(tagBeingEdited)}
          title="Editar Tag"
          onClose={() => setTagBeingEdited(null)}
        >
          {tagBeingEdited && (
            <EditTagForm
              tag={tagBeingEdited}
              onUpdate={handleUpdateTag}
              onCancel={() => setTagBeingEdited(null)}
            />
          )}
        </EditModal>

        <section className="space-y-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Lista de tags</h2>
            <button
              onClick={loadTags}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
              Carregando tags...
            </div>
          ) : (
            <TagList
              tags={tags}
              onEdit={setTagBeingEdited}
              onDelete={handleDeleteTag}
            />
          )}
        </section>
      </div>
    </div>
  );
}
