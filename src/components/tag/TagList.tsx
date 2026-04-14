import type { Etiqueta } from "../../types/tag";
import { apexTheme } from "../../lib/theme";

interface TagListProps {
  tags: Etiqueta[];
  onEdit: (tag: Etiqueta) => void;
  onDelete: (id: number) => Promise<void>;
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
    <div className="grid gap-4">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className={`rounded-2xl border ${c.border} ${c.card} p-5 shadow-lg`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-bold ${c.text}`}>{tag.nome}</h3>
              {tag.descricao && (
                <p className={`mt-1 text-sm ${c.textSoft}`}>{tag.descricao}</p>
              )}
              <p className={`text-sm ${c.textSoft}`}>ID: {tag.id}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(tag)}
                className={`rounded-xl border ${c.border} px-4 py-2 text-sm font-medium ${c.text} transition hover:${c.bgSoft}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(tag.id)}
                className={`rounded-xl ${c.danger}`}
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