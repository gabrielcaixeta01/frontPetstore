import { Pencil, Trash2 } from "lucide-react";
import type { Pet } from "../../types/pet";

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => Promise<void>;
  categoriasById: Record<number, string>;
  donosById: Record<number, string>;
}


const sexoLabel: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
  M: "Macho",
  F: "Fêmea",
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function PetList({ pets, onEdit, onDelete, categoriasById, donosById }: PetListProps) {
  if (pets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Nenhum pet encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Desktop header — hidden on mobile */}
      <div className="hidden border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid sm:grid-cols-[1fr_130px_120px_88px] sm:gap-4">
        <span>Pet</span>
        <span>Categoria / Porte</span>
        <span>Dono</span>
        <span className="text-right">Ações</span>
      </div>

      <div className="divide-y divide-gray-50">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-gray-50/60 sm:grid sm:grid-cols-[1fr_130px_120px_88px] sm:gap-4 sm:px-5"
          >
            {/* Col 1 — Pet info (+ mobile extras) */}
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:flex-none">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1c46f3]/10 text-xs font-bold text-[#1c46f3]">
                {getInitials(pet.nome)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{pet.nome}</p>
                <p className="truncate text-xs text-gray-400">
                  {[
                    pet.raca,
                    pet.sexo ? sexoLabel[pet.sexo] ?? pet.sexo : null,
                    pet.porte ? pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1) : null,
                    pet.peso ? `${pet.peso} kg` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Sem detalhes"}
                </p>
                {pet.observacoes_saude && (
                  <p className="mt-0.5 truncate text-xs text-amber-600" title={pet.observacoes_saude}>
                    {pet.observacoes_saude}
                  </p>
                )}
                {/* Mobile-only: categoria + dono */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:hidden">
                  {pet.categoria_id && (
                    <span className="text-xs font-medium text-gray-500">
                      {categoriasById[pet.categoria_id] ?? "—"}
                    </span>
                  )}
                  {donosById[pet.dono_id] && (
                    <span className="text-xs text-gray-400">· {donosById[pet.dono_id]}</span>
                  )}
                </div>
                {pet.tags && pet.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {pet.tags.map((tag) => (
                      <span key={tag.id} className="rounded-full border border-[#1c46f3]/20 bg-[#1c46f3]/8 px-2 py-0.5 text-xs font-medium text-[#1c46f3]">
                        {tag.nome}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Col 2 — Categoria + Porte (desktop only) */}
            <div className="hidden flex-col gap-1 pt-0.5 sm:flex">
              {pet.categoria_id && (
                <span className="truncate text-xs font-medium text-gray-700">
                  {categoriasById[pet.categoria_id] ?? "—"}
                </span>
              )}
              {pet.porte && (
                <span className="text-xs capitalize text-gray-400">
                  {pet.porte}
                </span>
              )}
            </div>

            {/* Col 3 — Dono (desktop only) */}
            <p className="hidden truncate pt-0.5 text-xs text-gray-500 sm:block">
              {donosById[pet.dono_id] ?? <span className="text-gray-300">—</span>}
            </p>

            {/* Col 4 — Actions (always visible) */}
            <div className="flex shrink-0 gap-1.5 pt-0.5 sm:justify-end">
              <button
                onClick={() => onEdit(pet)}
                title="Editar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(pet.id)}
                title="Excluir"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
