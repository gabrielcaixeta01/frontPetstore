import { Pencil, Trash2, Tag, PawPrint } from "lucide-react";
import type { Etiqueta } from "../../types/tag";

const BLUE  = "#1A3CB8";
const GREEN = "#00A651";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

interface TagListProps {
  tags: Etiqueta[];
  onEdit?: (tag: Etiqueta) => void;
  onDelete?: (id: number) => Promise<void>;
  compact?: boolean;
  cards?: boolean;
  petCountByTag?: Record<number, number>;
}

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

// Red = health risk · Amber = behavior · Green = positive health · Blue = profile · Gray = default
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

function getAccentColor(nome: string): string {
  const n = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/sedac|alerg|risco|medicac|cirurgi|urgente|doenca|problema/.test(n)) return "#DC2626";
  if (/agressiv|reativ|comportamento|nervos|estress|ansio|medo|timid/.test(n)) return "#D97706";
  if (/saudav|vacin|castrad/.test(n)) return GREEN;
  if (/primeiro|filhote|novo|vip|especial|idoso/.test(n)) return BLUE;
  return "#94A3B8";
}

export default function TagList({ tags, onEdit, onDelete, compact, cards, petCountByTag }: TagListProps) {
  const canEdit = Boolean(onEdit || onDelete);
  const showCards = canEdit || cards;

  if (tags.length === 0) {
    return (
      <div
        className="p-10 text-center text-sm"
        style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}
      >
        Nenhuma tag encontrada.
      </div>
    );
  }

  // Chips — inline, read-only, no actions
  if (!canEdit && !compact && !cards) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            title={tag.nome + (tag.descricao ? ` — ${tag.descricao}` : "")}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-sm font-medium ${getTagColor(tag.nome)}`}
            style={{ borderRadius: "20px" }}
          >
            <Tag size={12} className="shrink-0" />
            <span className="max-w-[10rem] truncate">{humanLabel(tag.nome)}</span>
          </span>
        ))}
      </div>
    );
  }

  // Compact table
  if (compact) {
    return (
      <div className="overflow-hidden bg-white shadow-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
        <div
          className="grid grid-cols-[1fr_auto] gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-widest"
          style={{ borderColor: BORD, background: "#F4F4F4", color: MUTED }}
        >
          <span>Tag</span>
          {canEdit && <span className="text-right">Ações</span>}
        </div>
        <div className="divide-y" style={{ borderColor: BORD }}>
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-gray-50/60">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${getTagColor(tag.nome)}`}
                  style={{ borderRadius: "20px" }}
                >
                  <Tag size={10} className="shrink-0" />
                  <span className="max-w-[8rem] truncate">{humanLabel(tag.nome)}</span>
                </span>
                {tag.descricao && <p className="truncate text-sm" style={{ color: MUTED }}>{tag.descricao}</p>}
              </div>
              {canEdit && (
                <div className="flex shrink-0 gap-1.5">
                  {onEdit && (
                    <button onClick={() => onEdit(tag)} title="Editar"
                      className="flex h-8 w-8 items-center justify-center transition hover:bg-gray-100"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
                      <Pencil size={13} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(tag.id)} title="Excluir"
                      className="flex h-8 w-8 items-center justify-center transition hover:bg-red-50"
                      style={{ border: "1px solid #FECACA", borderRadius: "4px", color: "#EF4444" }}>
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

  // Card grid — admin (with actions) or read-only (cards prop)
  if (!showCards) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => {
        const label  = humanLabel(tag.nome);
        const color  = getTagColor(tag.nome);
        const accent = getAccentColor(tag.nome);
        const count  = petCountByTag?.[tag.id] ?? 0;
        return (
          <div
            key={tag.id}
            className="relative flex flex-col gap-3 overflow-hidden bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}
          >
            {/* colored top accent */}
            <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ background: accent }} />

            <div className="flex items-start justify-between gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${color}`}
                style={{ borderRadius: "20px" }}
              >
                <Tag size={11} className="shrink-0" />
                {label}
              </span>
              <div className="flex shrink-0 gap-1">
                {onEdit && (
                  <button onClick={() => onEdit(tag)} title="Editar"
                    className="flex h-7 w-7 items-center justify-center transition hover:bg-gray-100"
                    style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
                    <Pencil size={12} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(tag.id)} title="Excluir"
                    className="flex h-7 w-7 items-center justify-center transition hover:bg-red-50"
                    style={{ border: "1px solid #FECACA", borderRadius: "4px", color: "#EF4444" }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {tag.descricao && (
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{tag.descricao}</p>
            )}

            <div className="mt-auto pt-2.5" style={{ borderTop: `1px solid ${BORD}` }}>
              <span
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: count > 0 ? "#374151" : "#CBD5E1" }}
              >
                <PawPrint size={11} />
                {count > 0 ? `${count} pet${count !== 1 ? "s" : ""}` : "Nenhum pet"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
