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
              <h3 className={`text-xl font-bold ${c.text}`}>{pet.nome}</h3>
              <p className={`text-sm ${c.textMuted}`}>ID: {pet.id}</p>
              <p className={`text-sm ${c.textSoft}`}>Raça: {pet.raca ?? "-"}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Sexo: {pet.sexo ?? "-"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Porte: {pet.porte ?? "-"}
              </p>
              <p className={`text-sm ${c.textSoft} break-all`}>
                Peso: {pet.peso ?? "-"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Categoria ID: {pet.categoria_id}</p>
              <p className={`text-sm ${c.textSoft}`}>Dono ID: {pet.dono_id}</p>
              <p className={`text-sm ${c.textSoft} break-all`}>
                Observações: {pet.observacoes_saude || "Não informada"}
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
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
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