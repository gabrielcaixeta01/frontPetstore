import { useState } from "react";
import type { CreateTagDTO, Tag, UpdateTagDTO } from "../types/tag";

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
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-white">
        {tagBeingEdited ? "Editar Tag" : "Cadastrar Tag"}
      </h2>

      <div>
        <label htmlFor="tag-name" className="mb-1 block text-sm text-zinc-300">
          Nome
        </label>
        <input
          id="tag-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          {tagBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {tagBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}