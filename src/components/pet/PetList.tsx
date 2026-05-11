import { Pencil, Trash2 } from "lucide-react";
import type { Pet } from "../../types/pet";

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => Promise<void>;
  categoriasById: Record<number, string>;
  donosById: Record<number, string>;
}

const porteCls: Record<string, string> = {
  pequeno: "bg-blue-50 text-blue-700 border-blue-200",
  medio:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  médio:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  grande:  "bg-orange-50 text-orange-700 border-orange-200",
};

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
      {/* Header */}
      <div className="grid grid-cols-[1fr_130px_120px_88px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span>Pet</span>
        <span>Categoria / Porte</span>
        <span>Dono</span>
        <span className="text-right">Ações</span>
      </div>

      <div className="divide-y divide-gray-50">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="grid grid-cols-[1fr_130px_120px_88px] items-start gap-4 px-5 py-3.5 transition hover:bg-gray-50/60"
          >
            {/* Name + breed + tags + obs */}
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1c46f3]/10 text-xs font-bold text-[#1c46f3]">
                {getInitials(pet.nome)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{pet.nome}</p>
                <p className="truncate text-xs text-gray-400">
                  {[pet.raca, pet.sexo ? sexoLabel[pet.sexo] ?? pet.sexo : null, pet.peso ? `${pet.peso} kg` : null]
                    .filter(Boolean)
                    .join(" · ") || "Sem detalhes"}
                </p>
                {pet.observacoes_saude && (
                  <p className="mt-1 truncate text-xs text-amber-600" title={pet.observacoes_saude}>
                    {pet.observacoes_saude}
                  </p>
                )}
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

            {/* Categoria + Porte */}
            <div className="flex min-w-0 flex-col gap-1 pt-0.5">
              {pet.categoria_id && (
                <span className="truncate text-xs font-medium text-gray-700">
                  {categoriasById[pet.categoria_id] ?? "—"}
                </span>
              )}
              {pet.porte && (
                <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${porteCls[pet.porte.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {pet.porte}
                </span>
              )}
            </div>

            {/* Dono */}
            <p className="truncate pt-0.5 text-xs text-gray-500">
              {donosById[pet.dono_id] ?? <span className="text-gray-300">—</span>}
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-1.5 pt-0.5">
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
