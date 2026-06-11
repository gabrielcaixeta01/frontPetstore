import { Pencil, Trash2, Tag, PawPrint } from "lucide-react";
import type { Etiqueta } from "../../types/tag";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

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

export default function TagList({ tags, onEdit, onDelete, compact, cards, petCountByTag }: TagListProps) {
  const canEdit = Boolean(onEdit || onDelete);
  const showCards = canEdit || cards;

  const sorted = [...tags].sort((a, b) =>
    humanLabel(a.nome).localeCompare(humanLabel(b.nome), "pt-BR")
  );

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

  // Chips — inline, read-only
  if (!canEdit && !compact && !cards) {
    return (
      <div className="flex flex-wrap gap-2">
        {sorted.map((tag) => (
          <span
            key={tag.id}
            title={tag.nome + (tag.descricao ? ` — ${tag.descricao}` : "")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
            style={{
              borderRadius: "20px",
              border: `1px solid #b3dfe0`,
              background: "#e6f5f5",
              color: TDARK,
            }}
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
          style={{ borderColor: BORD, background: "#F8FAFC", color: MUTED }}
        >
          <span>Tag</span>
          {canEdit && <span className="text-right">Ações</span>}
        </div>
        <div className="divide-y divide-gray-100">
          {sorted.map((tag) => (
            <div key={tag.id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-gray-50/60">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-semibold"
                  style={{ borderRadius: "20px", border: `1px solid #b3dfe0`, background: "#e6f5f5", color: TDARK }}
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

  // Card grid
  if (!showCards) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((tag) => {
        const label = humanLabel(tag.nome);
        const count = petCountByTag?.[tag.id] ?? 0;
        return (
          <div
            key={tag.id}
            className="flex flex-col gap-3 bg-white p-4 transition hover:shadow-md"
            style={{
              border: `1px solid ${BORD}`,
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Icon + name row */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{ borderRadius: "8px", background: "#e6f5f5" }}
              >
                <Tag size={16} style={{ color: TEAL }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" style={{ color: COAL }}>{label}</p>
                {tag.descricao && (
                  <p className="truncate text-xs" style={{ color: MUTED }}>{tag.descricao}</p>
                )}
              </div>
              {canEdit && (
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
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 pt-2.5" style={{ borderTop: `1px solid ${BORD}` }}>
              <PawPrint size={12} style={{ color: count > 0 ? TEAL : "#CBD5E1" }} />
              <span
                className="text-xs font-medium"
                style={{ color: count > 0 ? TEAL : "#CBD5E1" }}
              >
                {count > 0 ? `${count} pet${count !== 1 ? "s" : ""}` : "Nenhum pet"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
