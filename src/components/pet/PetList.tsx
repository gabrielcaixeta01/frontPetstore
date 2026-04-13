import type { Pet } from "../../types/pet";
import { apexTheme } from "../../lib/theme";

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function PetList({ pets, onEdit, onDelete }: PetListProps) {
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
          className={`rounded-2xl border ${c.border} ${c.card} p-5 shadow-lg`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className={`text-xl font-bold ${c.text}`}>{pet.name}</h3>
              <p className={`text-sm ${c.textMuted}`}>ID: {pet.id}</p>
              <p className={`text-sm ${c.textSoft}`}>Status: {pet.status}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Categoria ID: {pet.category_id}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Owner ID: {pet.owner_id ?? "Sem dono"}
              </p>
              <p className={`text-sm ${c.textSoft} break-all`}>
                Foto: {pet.photoUrls || "Não informada"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(pet)}
                className={`rounded-xl border ${c.border} px-4 py-2 text-sm font-medium ${c.text} transition hover:${c.bgSoft}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(pet.id)}
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