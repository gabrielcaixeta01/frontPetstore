import { useState } from "react";
import { apexTheme } from "../../lib/theme";
import type { CreateTagDTO, Tag, UpdateTagDTO } from "../../types/tag";

interface TagFormProps {
  tagBeingEdited: Tag | null;
  onCreate: (data: CreateTagDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateTagDTO) => Promise<void>;
  onCancelEdit: () => void;
}

export default function TagForm({
  tagBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
}: TagFormProps) {
  const c = apexTheme.colors;
  const [nome, setNome] = useState(tagBeingEdited?.nome ?? "");
  const [descricao, setDescricao] = useState(tagBeingEdited?.descricao ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome da tag.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
    };

    if (tagBeingEdited) {
      await onUpdate(tagBeingEdited.id, payload);
    } else {
      await onCreate(payload);
      setNome("");
      setDescricao("");
    }
  }

  return (
    <form
      key={tagBeingEdited?.id ?? "new"} // 🔥 ISSO AQUI resolve tudo
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border ${c.border} ${c.card} p-6 shadow-lg`}
    >
      <h2 className={`text-2xl font-bold ${c.text}`}>
        {tagBeingEdited ? "Editar Tag" : "Cadastrar Tag"}
      </h2>

      <div>
        <label htmlFor="tag-name" className={`mb-1 block text-sm ${c.textSoft}`}>
          Nome
        </label>
        <input
          id="tag-name"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
        />
      </div>

      <div>
        <label htmlFor="tag-desc" className={`mb-1 block text-sm ${c.textSoft}`}>
          Descricao
        </label>
        <textarea
          id="tag-desc"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90`}
        >
          {tagBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {tagBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`rounded-xl border ${c.border} px-5 py-3 font-semibold ${c.text} transition hover:${c.bgSoft}`}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}