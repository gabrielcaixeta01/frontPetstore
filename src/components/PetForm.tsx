import { useEffect, useState } from "react";
import type { Category } from "../types/category";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../types/pet";
import { getCategories } from "../services/categoryService";

interface PetFormProps {
  petBeingEdited: Pet | null;
  onCreate: (data: CreatePetDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdatePetDTO) => Promise<void>;
  onCancelEdit: () => void;
}

export default function PetForm({
  petBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
}: PetFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [photoUrls, setPhotoUrls] = useState("");
  const [status, setStatus] = useState("available");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [ownerId, setOwnerId] = useState<string>("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0 && !petBeingEdited) {
          setCategoryId(data[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    }

    loadCategories();
  }, [petBeingEdited]);

  useEffect(() => {
    if (petBeingEdited) {
      setName(petBeingEdited.name);
      setPhotoUrls(petBeingEdited.photoUrls ?? "");
      setStatus(petBeingEdited.status);
      setCategoryId(petBeingEdited.category_id);
      setOwnerId(
        petBeingEdited.owner_id !== null && petBeingEdited.owner_id !== undefined
          ? String(petBeingEdited.owner_id)
          : ""
      );
    } else {
      setName("");
      setPhotoUrls("");
      setStatus("available");
      setOwnerId("");
    }
  }, [petBeingEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      photoUrls,
      status,
      category_id: Number(categoryId),
      owner_id: ownerId.trim() ? Number(ownerId) : null,
    };

    if (petBeingEdited) {
      await onUpdate(petBeingEdited.id, payload);
    } else {
      await onCreate(payload);
      setName("");
      setPhotoUrls("");
      setStatus("available");
      setOwnerId("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
    >
      <div>
        <h2 className="text-2xl font-bold text-white">
          {petBeingEdited ? "Editar Pet" : "Cadastrar Pet"}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Preencha os dados do pet para salvar no sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          >
            <option value="available">available</option>
            <option value="pending">pending</option>
            <option value="sold">sold</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Owner ID</label>
          <input
            type="number"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">Photo URL</label>
        <input
          type="text"
          value={photoUrls}
          onChange={(e) => setPhotoUrls(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          {petBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {petBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}