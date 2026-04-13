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
  const [name, setName] = useState(tagBeingEdited?.name ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Informe o nome da tag.");
      return;
    }

    const payload = { name: name.trim() };

    if (tagBeingEdited) {
      await onUpdate(tagBeingEdited.id, payload);
    } else {
      await onCreate(payload);
      setName("");
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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