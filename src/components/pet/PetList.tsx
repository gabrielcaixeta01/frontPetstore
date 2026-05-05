import { Pencil, Trash2 } from "lucide-react";
import type { Pet } from "../../types/pet";
import { apexTheme } from "../../lib/theme";

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => Promise<void>;
  categoriasById: Record<number, string>;
  donosById: Record<number, string>;
}

const porteColors: Record<string, string> = {
  pequeno: "bg-blue-100 text-blue-700",
  medio: "bg-yellow-100 text-yellow-700",
  médio: "bg-yellow-100 text-yellow-700",
  grande: "bg-orange-100 text-orange-700",
};

const sexoLabels: Record<string, string> = {
  M: "Macho",
  F: "Fêmea",
};

export default function PetList({
  pets,
  onEdit,
  onDelete,
  categoriasById,
  donosById,
}: PetListProps) {
  const c = apexTheme.colors;

  if (pets.length === 0) {
    return (
      <div className={`rounded-2xl border ${c.border} ${c.cardSoft} p-6 ${c.textMuted}`}>
        Nenhum pet encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className={`rounded-2xl border ${c.border} ${c.card} p-5 shadow-sm transition hover:shadow-md`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div>
                <h3 className={`text-lg font-bold ${c.text}`}>{pet.nome}</h3>
                <p className={`text-sm ${c.textMuted}`}>
                  Dono: {donosById[pet.dono_id] ?? "Não encontrado"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {pet.porte && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${porteColors[pet.porte.toLowerCase()] ?? "bg-gray-100 text-gray-700"}`}>
                    {pet.porte}
                  </span>
                )}
                {pet.sexo && (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    {sexoLabels[pet.sexo] ?? pet.sexo}
                  </span>
                )}
                {pet.raca && (
                  <span className={`rounded-full border ${c.border} px-3 py-1 text-xs font-semibold ${c.textSoft}`}>
                    {pet.raca}
                  </span>
                )}
                {pet.categoria_id && (
                  <span className="rounded-full bg-[#1c46f3]/10 px-3 py-1 text-xs font-semibold text-[#1c46f3]">
                    {categoriasById[pet.categoria_id] ?? "Categoria"}
                  </span>
                )}
              </div>

              {(pet.peso || pet.observacoes_saude) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {pet.peso && (
                    <p className={`text-xs ${c.textMuted}`}>Peso: {pet.peso} kg</p>
                  )}
                  {pet.observacoes_saude && (
                    <p className={`text-xs ${c.textMuted}`}>Obs: {pet.observacoes_saude}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => onEdit(pet)}
                className={`flex items-center gap-1.5 rounded-xl border ${c.border} px-3 py-2 text-sm font-medium ${c.text} transition hover:bg-gray-50`}
              >
                <Pencil size={13} />
                Editar
              </button>
              <button
                onClick={() => onDelete(pet.id)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={13} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
