import { Pencil, Trash2, Tag, PawPrint } from "lucide-react";
import type { Etiqueta } from "../../types/tag";

interface TagListProps {
  tags: Etiqueta[];
  onEdit?: (tag: Etiqueta) => void;
  onDelete?: (id: number) => Promise<void>;
  compact?: boolean;
  cards?: boolean; // read-only card grid (no actions)
  petCountByTag?: Record<number, number>;
}

// Converts backend slugs and raw names to human-readable labels.
// Known slugs are mapped explicitly; everything else gets underscore→space + title case.
const LABEL_OVERRIDES: Record<string, string> = {
  precisa_sedacao:      "Precisa de Sedação",
  primeiro_atendimento: "Primeiro Atendimento",
  agressivo:            "Comportamento Reativo",
  nao_castrado:         "Não Castrado",
  precisa_medicacao:    "Precisa de Medicação",
  alergia_conhecida:    "Alergia Conhecida",
  filhote:              "Filhote",
  idoso:                "Idoso",
  ansioso:              "Ansioso",
  timido:               "Tímido",
};

function humanLabel(nome: string): string {
  const key = nome.toLowerCase().trim();
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return nome.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Color grouped by semantic meaning.
// Red = health risk · Amber = behavior · Emerald = positive health · Blue = profile · Slate = default
function getTagColor(nome: string): string {
  const n = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/sedac|alerg|risco|medicac|cirurgi|urgente|doenca|problema/.test(n))
    return "border-red-200 bg-red-50 text-red-700";
  if (/agressiv|reativ|comportamento|nervos|estress|ansio|medo|timid/.test(n))
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (/saudav|vacin|castrad/.test(n))
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (/primeiro|filhote|novo|vip|especial|idoso/.test(n))
    return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function TagList({ tags, onEdit, onDelete, compact, cards, petCountByTag }: TagListProps) {
  const canEdit = Boolean(onEdit || onDelete);
  const showCards = canEdit || cards;

  if (tags.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Nenhuma tag encontrada.
      </div>
    );
  }

  // Chips — read-only, no compact, no cards
  if (!canEdit && !compact && !cards) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            title={tag.nome + (tag.descricao ? ` — ${tag.descricao}` : "")}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${getTagColor(tag.nome)}`}
          >
            <Tag size={12} className="shrink-0" />
            <span className="max-w-[10rem] truncate">{humanLabel(tag.nome)}</span>
          </span>
        ))}
      </div>
    );
  }

  // Compact table — used in read-only list contexts (e.g. cliente TagsPage)
  if (compact) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>Tag</span>
          {canEdit && <span className="text-right">Ações</span>}
        </div>
        <div className="divide-y divide-gray-50">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-gray-50/60">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getTagColor(tag.nome)}`}>
                  <Tag size={10} className="shrink-0" />
                  <span className="max-w-[8rem] truncate">{humanLabel(tag.nome)}</span>
                </span>
                {tag.descricao && <p className="truncate text-sm text-gray-400">{tag.descricao}</p>}
              </div>
              {canEdit && (
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
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Card grid — admin (with buttons) or read-only (cards prop)
  if (!showCards) return null; // unreachable but satisfies TS
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => {
        const label = humanLabel(tag.nome);
        const color = getTagColor(tag.nome);
        const count = petCountByTag?.[tag.id] ?? 0;
        return (
          <div
            key={tag.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>
                <Tag size={11} className="shrink-0" />
                {label}
              </span>
              <div className="flex shrink-0 gap-1">
                {onEdit && (
                  <button onClick={() => onEdit(tag)} title="Editar"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-100">
                    <Pencil size={12} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(tag.id)} title="Excluir"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {tag.descricao && (
              <p className="text-xs leading-relaxed text-gray-400">{tag.descricao}</p>
            )}

            <div className="mt-auto border-t border-gray-50 pt-2.5">
              <span className={`flex items-center gap-1.5 text-xs font-medium ${count > 0 ? "text-gray-600" : "text-gray-300"}`}>
                <PawPrint size={11} />
                {count > 0
                  ? `${count} pet${count !== 1 ? "s" : ""}`
                  : "Nenhum pet"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
