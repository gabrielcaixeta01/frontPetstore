import { Pencil, Trash2 } from "lucide-react";
import type { Etiqueta } from "../../types/tag";
import { apexTheme } from "../../lib/theme";

interface TagListProps {
  tags: Etiqueta[];
  onEdit?: (tag: Etiqueta) => void;
  onDelete?: (id: number) => Promise<void>;
}

export default function TagList({ tags, onEdit, onDelete }: TagListProps) {
  const c = apexTheme.colors;

  if (tags.length === 0) {
    return (
      <div className={`rounded-2xl border ${c.border} ${c.cardSoft} p-6 ${c.textMuted}`}>
        Nenhuma tag encontrada.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className={`rounded-2xl border ${c.border} ${c.card} p-4 shadow-sm transition hover:shadow-md`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`truncate font-bold ${c.text}`}>{tag.nome}</h3>
              {tag.descricao && (
                <p className={`mt-1 text-sm ${c.textSoft} line-clamp-2`}>{tag.descricao}</p>
              )}
            </div>

            {(onEdit || onDelete) && (
            <div className="flex shrink-0 gap-1.5">
              {onEdit && (
              <button
                onClick={() => onEdit(tag)}
                title="Editar"
                className={`rounded-lg border ${c.border} p-2 text-sm transition hover:bg-gray-50`}
              >
                <Pencil size={13} className={c.text} />
              </button>
              )}
              {onDelete && (
              <button
                onClick={() => onDelete(tag.id)}
                title="Excluir"
                className="rounded-lg border border-red-200 bg-white p-2 transition hover:bg-red-50"
              >
                <Trash2 size={13} className="text-red-600" />
              </button>
              )}
            </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
