import type { Tag } from "../../types/tag";

interface TagListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function TagList({ tags, onEdit, onDelete }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Nenhuma tag encontrada.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">{tag.name}</h3>
              <p className="text-sm text-zinc-300">ID: {tag.id}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(tag)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(tag.id)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}