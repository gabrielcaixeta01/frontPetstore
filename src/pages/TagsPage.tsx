import { useEffect, useState } from "react";
import TagForm from "../components/TagForm";
import TagList from "../components/TagList";
import { apexTheme } from "../lib/theme";
import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "../services/tagService";
import type { CreateTagDTO, Tag, UpdateTagDTO } from "../types/tag";

export default function TagsPage() {
  const c = apexTheme.colors;
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagBeingEdited, setTagBeingEdited] = useState<Tag | null>(null);
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

  async function handleCreateTag(data: CreateTagDTO) {
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

  async function handleUpdateTag(id: number, data: UpdateTagDTO) {
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
    <div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
          <p className={`text-sm ${c.textMuted}`}>Módulo</p>
          <h1 className="mt-2 text-4xl font-bold">Tags</h1>
          <p className={`mt-3 ${c.textSoft}`}>
            Organize e classifique entidades do sistema com tags reutilizáveis.
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

        <TagForm
          key={tagBeingEdited?.id ?? "new-tag"}
          tagBeingEdited={tagBeingEdited}
          onCreate={handleCreateTag}
          onUpdate={handleUpdateTag}
          onCancelEdit={() => setTagBeingEdited(null)}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de tags</h2>
            <button
              onClick={loadTags}
              className={`rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
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