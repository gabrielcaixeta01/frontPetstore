import { useEffect, useMemo, useState } from "react";
import { Plus, X, RefreshCw, Check, Pencil, Trash2, PawPrint, Users } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditPetForm from "../../components/pet/EditPetForm";
import PetForm from "../../components/pet/PetForm";
import { getCategories } from "../../services/categoriaService";
import { createPet, deletePet, getPets, updatePet } from "../../services/petService";
import { getUsuarios } from "../../services/usuarioService";
import { getAppointments } from "../../services/atendimentoService";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";
import type { Appointment } from "../../types/atendimento";

function tagColor(nome: string): string {
  const n = nome.toLowerCase();
  if (/alergi|intoler/.test(n))                         return "border-red-200 bg-red-50 text-red-700";
  if (/alert|atenção|atencao|cuid|medo|ansio/.test(n)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (/vacin|castrad|microchip|vermif/.test(n))         return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-[#1c46f3]/20 bg-[#1c46f3]/5 text-[#1c46f3]";
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petBeingEdited, setPetBeingEdited] = useState<Pet | null>(null);
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [categoriasById, setCategoriasById] = useState<Record<number, string>>({});
  const [donosById, setDonosById] = useState<Record<number, string>>({});

  async function loadAll() {
    try {
      setLoading(true);
      const [petsData, cats, usuarios, atendData] = await Promise.all([
        getPets(),
        getCategories(),
        getUsuarios(),
        getAppointments().catch(() => [] as Appointment[]),
      ]);
      setPets(petsData);
      setAtendimentos(atendData);
      setCategoriasById(Object.fromEntries(cats.map((c) => [c.id, c.name])));
      setDonosById(Object.fromEntries(usuarios.map((u) => [u.id, u.nome])));
      setError("");
    } catch {
      setError("Erro ao carregar pets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const atendimentosByPetId = useMemo(
    () => atendimentos.reduce<Record<number, Appointment[]>>((acc, a) => {
      if (!acc[a.pet_id]) acc[a.pet_id] = [];
      acc[a.pet_id].push(a);
      return acc;
    }, {}),
    [atendimentos],
  );

  async function handleCreatePet(data: CreatePetDTO) {
    try {
      await createPet(data);
      setFeedback("Pet cadastrado com sucesso.");
      setShowForm(false);
      await loadAll();
    } catch { setError("Erro ao cadastrar pet."); }
  }

  async function handleUpdatePet(id: number, data: UpdatePetDTO) {
    try {
      await updatePet(id, data);
      setFeedback("Pet atualizado com sucesso.");
      setPetBeingEdited(null);
      await loadAll();
    } catch { setError("Erro ao atualizar pet."); }
  }

  async function handleDeletePet(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este pet?")) return;
    try {
      await deletePet(id);
      setFeedback("Pet excluído com sucesso.");
      if (petBeingEdited?.id === id) setPetBeingEdited(null);
      await loadAll();
    } catch { setError("Erro ao excluir pet."); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gerencie todos os pets cadastrados no sistema.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo pet"}</span>
        </button>
      </div>

      {feedback && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check size={15} /> {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {showForm && (
        <div className="mb-6">
          <PetForm
            petBeingEdited={null}
            onCreate={handleCreatePet}
            onUpdate={handleUpdatePet}
            onCancelEdit={() => setShowForm(false)}
          />
        </div>
      )}

      <EditModal isOpen={Boolean(petBeingEdited)} title="Editar Pet" onClose={() => setPetBeingEdited(null)}>
        {petBeingEdited && (
          <EditPetForm
            pet={petBeingEdited}
            onUpdate={handleUpdatePet}
            onCancel={() => setPetBeingEdited(null)}
          />
        )}
      </EditModal>

      {!loading && pets.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">{pets.length} {pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}</p>
          <button onClick={loadAll} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">Carregando pets...</div>
      ) : pets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <PawPrint size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">Nenhum pet cadastrado no sistema.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-semibold text-[#1c46f3] hover:underline">Cadastrar primeiro pet</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const ats = atendimentosByPetId[pet.id] ?? [];
            const gasto = ats.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0);
            const ultimo = ats[0];
            return (
              <div key={pet.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c46f3]/15 to-[#00bb69]/15 text-lg font-bold text-[#1c46f3]">
                    {pet.nome[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{pet.nome}</h3>
                    <p className="text-xs text-gray-400">{categoriasById[pet.categoria_id] ?? "—"}</p>
                  </div>
                </div>

                <p className="truncate text-xs text-gray-500">
                  {[
                    pet.raca,
                    pet.sexo && pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1),
                    pet.porte && pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1),
                    pet.peso != null && `${pet.peso} kg`,
                  ].filter(Boolean).join(" · ") || "Sem detalhes"}
                </p>

                {donosById[pet.dono_id] && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Users size={10} /> {donosById[pet.dono_id]}
                  </p>
                )}

                {pet.observacoes_saude && (
                  <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2">
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">{pet.observacoes_saude}</p>
                  </div>
                )}

                {pet.tags && pet.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {pet.tags.map((tag) => (
                      <span key={tag.id} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tagColor(tag.nome)}`}>
                        {tag.nome}
                      </span>
                    ))}
                  </div>
                )}

                {ats.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{ats.length} {ats.length === 1 ? "visita" : "visitas"}</span>
                    <span className="text-gray-300">·</span>
                    <span>R$ {gasto.toFixed(2)} gasto</span>
                    {ultimo && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>último {new Date(ultimo.data_atendimento).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button onClick={() => setPetBeingEdited(pet)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50">
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => handleDeletePet(pet.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50">
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
