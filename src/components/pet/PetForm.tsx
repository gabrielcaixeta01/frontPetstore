import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { apexTheme } from "../../lib/theme";
import type { Categoria } from "../../types/categoria";
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
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState<CreatePetDTO["sexo"] | "">("");
  const [porte, setPorte] = useState<CreatePetDTO["porte"] | "">("");
  const [peso, setPeso] = useState("");
  const [observacoesSaude, setObservacoesSaude] = useState("");
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
      setNome(petBeingEdited.nome ?? "");
      setRaca(petBeingEdited.raca ?? "");
      setSexo(petBeingEdited.sexo ?? "");
      setPorte(petBeingEdited.porte ?? "");
      setPeso(petBeingEdited.peso !== undefined ? String(petBeingEdited.peso) : "");
      setObservacoesSaude(petBeingEdited.observacoes_saude ?? "");
      setCategoryId(String(petBeingEdited.categoria_id ?? ""));
      setOwnerId(String(petBeingEdited.dono_id ?? ""));
      return;
    }

    setNome("");
    setRaca("");
    setSexo("");
    setPorte("");
    setPeso("");
    setObservacoesSaude("");
    setOwnerId("");

    if (categories.length > 0) {
      setCategoryId(String(categories[0].id));
    } else {
      setCategoryId("");
    }
  }, [petBeingEdited, categories]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome do pet.");
      return;
    }

    if (!categoryId) {
      alert("Selecione uma categoria.");
      return;
    }

    const sexoValue = sexo || undefined;
    const porteValue = porte || undefined;
    const pesoValue = peso.trim() ? Number(peso) : undefined;

    try {
      if (petBeingEdited) {
        const payload: UpdatePetDTO = {
          nome: nome.trim(),
          raca: raca.trim() || undefined,
          sexo: sexoValue,
          porte: porteValue,
          peso: pesoValue,
          observacoes_saude: observacoesSaude.trim() || undefined,
          categoria_id: Number(categoryId),
          dono_id: Number(ownerId),
        };

        await onUpdate(petBeingEdited.id, payload);
      } else {
        const payload: CreatePetDTO = {
          nome: nome.trim(),
          raca: raca.trim() || undefined,
          sexo: sexoValue,
          porte: porteValue,
          peso: pesoValue,
          observacoes_saude: observacoesSaude.trim() || undefined,
          categoria_id: Number(categoryId),
          dono_id: Number(ownerId),
        };

        await onCreate(payload);
      }

      if (!petBeingEdited) {
        setNome("");
        setRaca("");
        setSexo("");
        setPorte("");
        setPeso("");
        setObservacoesSaude("");
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
          <label htmlFor="nome" className={`mb-1 block text-sm ${c.textSoft}`}>
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="raca" className={`mb-1 block text-sm ${c.textSoft}`}>
            Raça
          </label>
          <input
            id="raca"
            type="text"
            value={raca}
            onChange={(e) => setRaca(e.target.value)}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="sexo" className={`mb-1 block text-sm ${c.textSoft}`}>
            Sexo
          </label>
          <select
            id="sexo"
            value={sexo}
            onChange={(e) =>
              setSexo(e.target.value as CreatePetDTO["sexo"] | "")
            }
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="">Selecione</option>
            <option value="macho">macho</option>
            <option value="femea">femea</option>
          </select>
        </div>

        <div>
          <label htmlFor="porte" className={`mb-1 block text-sm ${c.textSoft}`}>
            Porte
          </label>
          <select
            id="porte"
            value={porte}
            onChange={(e) =>
              setPorte(e.target.value as CreatePetDTO["porte"] | "")
            }
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="">Selecione</option>
            <option value="pequeno">pequeno</option>
            <option value="medio">medio</option>
            <option value="grande">grande</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="peso" className={`mb-1 block text-sm ${c.textSoft}`}>
            Peso
          </label>
          <input
            id="peso"
            type="number"
            step="0.01"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="category" className={`mb-1 block text-sm ${c.textSoft}`}>
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
          <label htmlFor="ownerId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Dono ID
          </label>
          <input
            id="ownerId"
            type="number"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="observacoes" className={`mb-1 block text-sm ${c.textSoft}`}>
            Observações de saúde
          </label>
          <textarea
            id="observacoes"
            value={observacoesSaude}
            onChange={(e) => setObservacoesSaude(e.target.value)}
            rows={3}
            className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>
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