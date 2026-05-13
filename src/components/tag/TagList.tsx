import { Pencil, Trash2, Tag } from "lucide-react";
import type { Etiqueta } from "../../types/tag";

interface TagListProps {
  tags: Etiqueta[];
  onEdit?: (tag: Etiqueta) => void;
  onDelete?: (id: number) => Promise<void>;
  compact?: boolean; // when true, render the compact table-style view without actions
}

const chipColors = [
  "border-blue-200 bg-blue-50 text-blue-700",
  "border-emerald-200 bg-emerald-50 text-emerald-700",
  "border-purple-200 bg-purple-50 text-purple-700",
  "border-yellow-200 bg-yellow-50 text-yellow-700",
  "border-pink-200 bg-pink-50 text-pink-700",
  "border-orange-200 bg-orange-50 text-orange-700",
  "border-sky-200 bg-sky-50 text-sky-700",
  "border-rose-200 bg-rose-50 text-rose-700",
];

export default function TagList({ tags, onEdit, onDelete, compact }: TagListProps) {
  const canEdit = Boolean(onEdit || onDelete);
  const showCompact = Boolean(compact);

  if (tags.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Nenhuma tag encontrada.
      </div>
    );
  }

  // Simple view (read-only): just colorful chips
  if (!canEdit && !showCompact) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={tag.id}
            title={tag.nome + (tag.descricao ? ` — ${tag.descricao}` : "")}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${chipColors[i % chipColors.length]}`}
          >
            <Tag size={12} className="shrink-0" />
            <span className="max-w-[10rem] truncate">{tag.nome}</span>
          </span>
        ))}
      </div>
    );
  }

  // Editable / compact view: compact table (actions shown only when present)
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span>Tag</span>
        <span className="text-right">{canEdit ? "Ações" : ""}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {tags.map((tag, i) => (
          <div key={tag.id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-gray-50/60">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                title={tag.nome}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${chipColors[i % chipColors.length]}`}
              >
                <Tag size={10} className="shrink-0" />
                <span className="max-w-[8rem] truncate">{tag.nome}</span>
              </span>
              {tag.descricao && (
                <p className="truncate text-sm text-gray-400">{tag.descricao}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {onEdit && (
                <button onClick={() => onEdit(tag)} title="Editar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100">
                  <Pencil size={13} />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(tag.id)} title="Excluir"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
