import { useEffect, useState } from "react";
import { PawPrint, RefreshCw } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditPetForm from "../../components/pet/EditPetForm";
import PetForm from "../../components/pet/PetForm";
import PetList from "../../components/pet/PetList";
import { getCategories } from "../../services/categoriaService";
import {
  createPet,
  deletePet,
  getPets,
  updatePet,
} from "../../services/petService";
import { getUsuarios } from "../../services/usuarioService";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petBeingEdited, setPetBeingEdited] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [categoriasById, setCategoriasById] = useState<Record<number, string>>({});
  const [donosById, setDonosById] = useState<Record<number, string>>({});

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

  useEffect(() => {
    async function loadRelacionamentos() {
      try {
        const [categorias, usuarios] = await Promise.all([
          getCategories(),
          getUsuarios(),
        ]);

        const categoriasMap: Record<number, string> = {};
        categorias.forEach((categoria) => {
          categoriasMap[categoria.id] = categoria.name;
        });

        const donosMap: Record<number, string> = {};
        usuarios.forEach((usuario) => {
          donosMap[usuario.id] = usuario.nome;
        });

        setCategoriasById(categoriasMap);
        setDonosById(donosMap);
      } catch (err) {
        console.error("Erro ao carregar relacionamentos de pets:", err);
      }
    }

    loadRelacionamentos();
  }, []);

  async function handleCreatePet(data: CreatePetDTO) {
    try {
      await createPet(data);
      setFeedback("Pet cadastrado com sucesso.");
      setPetBeingEdited(null);
      await loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar pet.");
    }
  }

  async function handleUpdatePet(id: number, data: UpdatePetDTO) {
    try {
      await updatePet(id, data);
      setFeedback("Pet atualizado com sucesso.");
      setPetBeingEdited(null);
      await loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar pet.");
    }
  }

  async function handleDeletePet(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este pet?")) return;

    try {
      await deletePet(id);
      setFeedback("Pet excluído com sucesso.");
      if (petBeingEdited?.id === id) setPetBeingEdited(null);
      await loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir pet.");
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c46f3]/10">
              <PawPrint size={20} className="text-[#1c46f3]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Gerencie os pets cadastrados, seus status e suas categorias.
              </p>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <PetForm
          petBeingEdited={null}
          onCreate={handleCreatePet}
          onUpdate={handleUpdatePet}
          onCancelEdit={() => setPetBeingEdited(null)}
        />

        <EditModal
          isOpen={Boolean(petBeingEdited)}
          title="Editar Pet"
          onClose={() => setPetBeingEdited(null)}
        >
          {petBeingEdited && (
            <EditPetForm
              pet={petBeingEdited}
              onUpdate={handleUpdatePet}
              onCancel={() => setPetBeingEdited(null)}
            />
          )}
        </EditModal>

        <section className="space-y-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Lista de pets</h2>
            <button
              onClick={loadPets}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
              Carregando pets...
            </div>
          ) : (
            <PetList
              pets={pets}
              onEdit={setPetBeingEdited}
              onDelete={handleDeletePet}
              categoriasById={categoriasById}
              donosById={donosById}
            />
          )}
        </section>
      </div>
    </div>
  );
}
