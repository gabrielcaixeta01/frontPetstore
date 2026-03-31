import { useEffect, useState } from "react";
import PetForm from "./components/PetForm";
import PetList from "./components/PetList";
import {
  createPet,
  deletePet,
  getPets,
  updatePet,
} from "./services/petService";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "./types/pet";

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petBeingEdited, setPetBeingEdited] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadPets() {
    try {
      setLoading(true);
      const data = await getPets();
      setPets(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar os pets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();
  }, []);

  async function handleCreatePet(data: CreatePetDTO) {
    try {
      await createPet(data);
      setFeedback("Pet cadastrado com sucesso.");
      setError("");
      await loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar pet.");
      setFeedback("");
    }
  }

  async function handleUpdatePet(id: number, data: UpdatePetDTO) {
    try {
      await updatePet(id, data);
      setFeedback("Pet atualizado com sucesso.");
      setError("");
      setPetBeingEdited(null);
      await loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar pet.");
      setFeedback("");
    }
  }

  async function handleDeletePet(id: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este pet?");
    if (!confirmed) return;

    try {
      await deletePet(id);
      setFeedback("Pet excluído com sucesso.");
      setError("");
      if (petBeingEdited?.id === id) {
        setPetBeingEdited(null);
      }
      await loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir pet.");
      setFeedback("");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Petstore Apex</h1>
          <p className="text-zinc-400">
            CRUD inicial de pets integrado ao backend em FastAPI.
          </p>
        </header>

        {feedback && (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-3 text-emerald-300">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <PetForm
          petBeingEdited={petBeingEdited}
          onCreate={handleCreatePet}
          onUpdate={handleUpdatePet}
          onCancelEdit={() => setPetBeingEdited(null)}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Pets cadastrados</h2>
            <button
              onClick={loadPets}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Atualizar lista
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
              Carregando pets...
            </div>
          ) : (
            <PetList
              pets={pets}
              onEdit={setPetBeingEdited}
              onDelete={handleDeletePet}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default App;