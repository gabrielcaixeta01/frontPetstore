import type { Pet } from "../../types/pet";

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function PetList({ pets, onEdit, onDelete }: PetListProps) {
  if (pets.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Nenhum pet encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{pet.name}</h3>
              <p className="text-sm text-zinc-400">ID: {pet.id}</p>
              <p className="text-sm text-zinc-300">Status: {pet.status}</p>
              <p className="text-sm text-zinc-300">
                Categoria ID: {pet.category_id}
              </p>
              <p className="text-sm text-zinc-300">
                Owner ID: {pet.owner_id ?? "Sem dono"}
              </p>
              <p className="text-sm text-zinc-300 break-all">
                Foto: {pet.photoUrls || "Não informada"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(pet)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(pet.id)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
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