import { useEffect, useState } from "react";
import { Tag, RefreshCw } from "lucide-react";
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

export default function TagsPage() {
  const [tags, setTags] = useState<Etiqueta[]>([]);
  const [tagBeingEdited, setTagBeingEdited] = useState<Etiqueta | null>(null);
  const [loading, setLoading] = useState(true);
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
      await loadTags();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar tag.");
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
      setError("Erro ao atualizar tag.");
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
              <Tag size={20} className="text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Organize e classifique entidades do sistema com tags reutilizáveis.
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

        <TagForm
          tagBeingEdited={null}
          onCreate={handleCreateTag}
          onUpdate={handleUpdateTag}
          onCancelEdit={() => setTagBeingEdited(null)}
        />

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
