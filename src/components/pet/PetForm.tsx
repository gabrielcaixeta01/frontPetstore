import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { apexTheme } from "../../lib/theme";
import type { Category } from "../../types/category";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";

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
  const c = apexTheme.colors;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [name, setName] = useState("");
  const [photoUrls, setPhotoUrls] = useState("");
  const [status, setStatus] = useState("available");
  const [categoryId, setCategoryId] = useState("");
  const [ownerId, setOwnerId] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (petBeingEdited) {
      setName(petBeingEdited.name ?? "");
      setPhotoUrls(petBeingEdited.photoUrls ?? "");
      setStatus(petBeingEdited.status ?? "available");
      setCategoryId(
        petBeingEdited.category_id !== undefined &&
          petBeingEdited.category_id !== null
          ? String(petBeingEdited.category_id)
          : ""
      );
      setOwnerId(
        petBeingEdited.owner_id !== undefined && petBeingEdited.owner_id !== null
          ? String(petBeingEdited.owner_id)
          : ""
      );
      return;
    }

    setName("");
    setPhotoUrls("");
    setStatus("available");
    setOwnerId("");

    if (categories.length > 0) {
      setCategoryId(String(categories[0].id));
    } else {
      setCategoryId("");
    }
  }, [petBeingEdited, categories]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Informe o nome do pet.");
      return;
    }

    if (!categoryId) {
      alert("Selecione uma categoria.");
      return;
    }

    const payload: CreatePetDTO | UpdatePetDTO = {
      name: name.trim(),
      photoUrls: photoUrls.trim() || undefined,
      status,
      category_id: Number(categoryId),
      owner_id: ownerId.trim() ? Number(ownerId) : null,
    };

    try {
      if (petBeingEdited) {
        await onUpdate(petBeingEdited.id, payload);
      } else {
        await onCreate(payload);
      }

      if (!petBeingEdited) {
        setName("");
        setPhotoUrls("");
        setStatus("available");
        setOwnerId("");
        if (categories.length > 0) {
          setCategoryId(String(categories[0].id));
        }
      }
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border ${c.border} ${c.card} p-6 shadow-lg`}
    >
      <div>
        <h2 className={`text-2xl font-bold ${c.text}`}>
          {petBeingEdited ? "Editar Pet" : "Cadastrar Pet"}
        </h2>
        <p className={`mt-1 text-sm ${c.textMuted}`}>
          Preencha os dados do pet para salvar no sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={`mb-1 block text-sm ${c.textSoft}`}>
            Nome
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="status" className={`mb-1 block text-sm ${c.textSoft}`}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="available">available</option>
            <option value="pending">pending</option>
            <option value="sold">sold</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category"
            className={`mb-1 block text-sm ${c.textSoft}`}
          >
            Categoria
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loadingCategories || categories.length === 0}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3] disabled:opacity-60`}
          >
            {loadingCategories ? (
              <option value="">Carregando categorias...</option>
            ) : categories.length === 0 ? (
              <option value="">Nenhuma categoria encontrada</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="ownerId"
            className={`mb-1 block text-sm ${c.textSoft}`}
          >
            Owner ID
          </label>
          <input
            id="ownerId"
            type="number"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="photoUrls"
          className={`mb-1 block text-sm ${c.textSoft}`}
        >
          Photo URL
        </label>
        <input
          id="photoUrls"
          type="text"
          value={photoUrls}
          onChange={(e) => setPhotoUrls(e.target.value)}
          className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loadingCategories || categories.length === 0}
          className={`rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {petBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {petBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`rounded-xl border ${c.border} px-5 py-3 font-semibold ${c.text} transition hover:${c.bgSoft}`}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}