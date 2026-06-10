import { Pencil, Trash2 } from "lucide-react";
import type { Pet } from "../../types/pet";

const TEAL = "#0D7377";
const BORD = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => Promise<void>;
  categoriasById: Record<number, string>;
  donosById: Record<number, string>;
}

const sexoLabel: Record<string, string> = {
  macho: "Macho", femea: "Fêmea", M: "Macho", F: "Fêmea",
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function PetList({ pets, onEdit, onDelete, categoriasById, donosById }: PetListProps) {
  if (pets.length === 0) {
    return (
      <div className="p-10 text-center text-sm" style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
        Nenhum pet encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white" style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
      <div className="hidden border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide sm:grid sm:grid-cols-[1fr_130px_120px_88px] sm:gap-4"
        style={{ borderColor: BORD, background: "#F8FAFC", color: MUTED }}>
        <span>Pet</span>
        <span>Categoria / Porte</span>
        <span>Dono</span>
        <span className="text-right">Ações</span>
      </div>

      <div className="divide-y" style={{ borderColor: BORD }}>
        {pets.map((pet) => (
          <div key={pet.id}
            className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-gray-50/60 sm:grid sm:grid-cols-[1fr_130px_120px_88px] sm:gap-4 sm:px-5">
            {/* Col 1 */}
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:flex-none">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "#e6f5f5", color: TEAL }}>
                {getInitials(pet.nome)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: COAL }}>{pet.nome}</p>
                <p className="truncate text-xs" style={{ color: MUTED }}>
                  {[
                    pet.raca,
                    pet.sexo ? sexoLabel[pet.sexo] ?? pet.sexo : null,
                    pet.porte ? pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1) : null,
                    pet.peso ? `${pet.peso} kg` : null,
                  ].filter(Boolean).join(" · ") || "Sem detalhes"}
                </p>
                {pet.observacoes_saude && (
                  <p className="mt-0.5 truncate text-xs" style={{ color: MUTED }} title={pet.observacoes_saude}>
                    {pet.observacoes_saude}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:hidden">
                  {pet.categoria_id && (
                    <span className="text-xs font-medium" style={{ color: MUTED }}>{categoriasById[pet.categoria_id] ?? "—"}</span>
                  )}
                  {donosById[pet.dono_id] && (
                    <span className="text-xs" style={{ color: MUTED }}>· {donosById[pet.dono_id]}</span>
                  )}
                </div>
                {pet.tags && pet.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {pet.tags.map((tag) => (
                      <span key={tag.id} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                        {tag.nome}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Col 2 */}
            <div className="hidden flex-col gap-1 pt-0.5 sm:flex">
              {pet.categoria_id && (
                <span className="truncate text-xs font-medium" style={{ color: COAL }}>{categoriasById[pet.categoria_id] ?? "—"}</span>
              )}
              {pet.porte && (
                <span className="text-xs capitalize" style={{ color: MUTED }}>{pet.porte}</span>
              )}
            </div>

            {/* Col 3 */}
            <p className="hidden truncate pt-0.5 text-xs sm:block" style={{ color: MUTED }}>
              {donosById[pet.dono_id] ?? <span style={{ color: "#CBD5E1" }}>—</span>}
            </p>

            {/* Col 4 */}
            <div className="flex shrink-0 gap-1.5 pt-0.5 sm:justify-end">
              <button onClick={() => onEdit(pet)} title="Editar"
                className="flex h-8 w-8 items-center justify-center transition hover:bg-[#e6f5f5]"
                style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
                <Pencil size={13} />
              </button>
              <button onClick={() => onDelete(pet.id)} title="Excluir"
                className="flex h-8 w-8 items-center justify-center transition hover:bg-red-50"
                style={{ border: "1px solid #FECACA", borderRadius: "6px", color: "#EF4444" }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
