import { useEffect, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditTagForm from "../../components/tag/EditTagForm";
import TagForm from "../../components/tag/TagForm";
import TagList from "../../components/tag/TagList";
import { createTag, deleteTag, getTags, updateTag } from "../../services/tagService";
import { getPets } from "../../services/petService";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../../types/tag";

const BLUE  = "#1A3CB8";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const axiosError = error as { response?: { status?: number; data?: unknown } };
  if (axiosError.response?.status === 422)
    return "Nome da tag inválido. Use pelo menos 2 caracteres.";
  const data = axiosError.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }
  return fallback;
}

export default function TagsPage() {
  const [tags, setTags]                   = useState<Etiqueta[]>([]);
  const [petCountByTag, setPetCountByTag] = useState<Record<number, number>>({});
  const [tagBeingEdited, setTagBeingEdited] = useState<Etiqueta | null>(null);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [feedback, setFeedback]           = useState("");
  const [error, setError]                 = useState("");

  async function loadTags() {
    try {
      setLoading(true);
      const [tagData, petData] = await Promise.all([
        getTags(),
        getPets().catch(() => []),
      ]);
      setTags(tagData);
      const counts: Record<number, number> = {};
      petData.forEach((p) => {
        p.tags?.forEach((t) => { counts[t.id] = (counts[t.id] ?? 0) + 1; });
      });
      setPetCountByTag(counts);
      setError("");
    } catch {
      setError("Erro ao carregar tags.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTags(); }, []);

  async function handleCreateTag(data: CreateEtiquetaDTO) {
    try {
      await createTag(data);
      setFeedback("Tag cadastrada com sucesso.");
      setTagBeingEdited(null);
      setShowForm(false);
      await loadTags();
    } catch (err) {
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
    } catch {
      setError("Erro ao excluir tag.");
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
              Gerenciamento
            </span>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Tags</h1>
            <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
              Organize e classifique entidades com tags reutilizáveis.
            </p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setFeedback(""); setError(""); }}
            className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: showForm ? MUTED : BLUE, borderRadius: "4px" }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nova tag"}</span>
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className="px-4 py-3 text-sm font-medium"
            style={{ borderRadius: "4px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}
          >
            {feedback}
          </div>
        )}
        {error && (
          <div
            className="px-4 py-3 text-sm font-medium"
            style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}
          >
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <TagForm
            tagBeingEdited={null}
            onCreate={handleCreateTag}
            onUpdate={handleUpdateTag}
            onCancelEdit={() => { setTagBeingEdited(null); setShowForm(false); }}
          />
        )}

        {/* Edit modal */}
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

        {/* List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "#1a1a1a" }}>
              Lista de tags
              {!loading && (
                <span className="ml-2 text-sm font-normal" style={{ color: MUTED }}>
                  ({tags.length})
                </span>
              )}
            </h2>
            <button
              onClick={loadTags}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}
            >
              <RefreshCw size={13} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div
              className="p-6 text-center text-sm"
              style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}
            >
              Carregando tags...
            </div>
          ) : (
            <TagList
              tags={tags}
              onEdit={setTagBeingEdited}
              onDelete={handleDeleteTag}
              petCountByTag={petCountByTag}
            />
          )}
        </section>
      </div>
    </div>
  );
}
