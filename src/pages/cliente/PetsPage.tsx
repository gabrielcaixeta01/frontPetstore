import { useEffect, useMemo, useState } from "react";
import { PawPrint, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { getCategories } from "../../services/categoriaService";
import { createPet, deletePet, getPets, updatePet } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getTags } from "../../services/tagService";
import type { Categoria } from "../../types/categoria";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";
import type { Etiqueta } from "../../types/tag";
import type { Appointment } from "../../types/atendimento";

function tagColor(nome: string): string {
  const n = nome.toLowerCase();
  if (/alergi|alérgic|intoler/.test(n))          return "border-red-200 bg-red-50 text-red-700";
  if (/alert|atenção|atencao|cuid|medo|ansio/.test(n)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (/vacin|castrad|microchip|vermífu|vermifug/.test(n)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-[#1c46f3]/20 bg-[#1c46f3]/8 text-[#1c46f3]";
}

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

function getStoredUserId() {
  const user = getStoredUser();
  const rawId = user.id ?? user.user_id ?? user.usuario_id;
  const parsedId = Number(rawId);
  return Number.isFinite(parsedId) ? parsedId : null;
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";
const selectCls = inputCls + " appearance-none";

const porteOpts = [
  { value: "", label: "Selecionar..." },
  { value: "pequeno", label: "Pequeno" },
  { value: "medio", label: "Médio" },
  { value: "grande", label: "Grande" },
];
const sexoOpts = [
  { value: "", label: "Selecionar..." },
  { value: "macho", label: "Macho" },
  { value: "femea", label: "Fêmea" },
];
const MAX_OBSERVACOES_SAUDE = 50;

type PetForm = {
  nome: string;
  raca: string;
  sexo: string;
  porte: string;
  peso: string;
  observacoes_saude: string;
  categoria_id: string;
};

const emptyForm: PetForm = { nome: "", raca: "", sexo: "", porte: "", peso: "", observacoes_saude: "", categoria_id: "" };

export default function ClientePetsPage() {
  const userId = getStoredUserId();

  const [pets, setPets] = useState<Pet[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetForm>(emptyForm);
  const [editForm, setEditForm] = useState<PetForm>(emptyForm);
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [tagIdsCriacao, setTagIdsCriacao] = useState<number[]>([]);
  const [tagIdsEdicao, setTagIdsEdicao] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadPets() {
    if (userId === null) {
      setError("Nao foi possivel identificar o cliente logado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const all = await getPets();
      setPets(all.filter((p) => p.dono_id === userId));
    } catch { setError("Erro ao carregar pets."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadPets();
    getCategories().then(setCategorias).catch(console.error);
    getTags().then(setTagsDisponiveis).catch(console.error);
    if (userId !== null) {
      getAppointments()
        .then((all) => setAtendimentos(
          all
            .filter((a) => a.cliente_id === userId)
            .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
        ))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (editingPet) {
      setEditForm({
        nome: editingPet.nome,
        raca: editingPet.raca ?? "",
        sexo: editingPet.sexo ?? "",
        porte: editingPet.porte ?? "",
        peso: editingPet.peso != null ? String(editingPet.peso) : "",
        observacoes_saude: editingPet.observacoes_saude ?? "",
        categoria_id: String(editingPet.categoria_id),
      });
      setTagIdsEdicao(editingPet.tags?.map((t) => t.id) ?? []);
    }
  }, [editingPet]);

  function f(obj: PetForm): CreatePetDTO {
    const resolvedUserId = userId;

    if (resolvedUserId === null) {
      throw new Error("Cliente logado nao identificado.");
    }

    return {
      nome: obj.nome.trim(),
      raca: obj.raca.trim() || undefined,
      sexo: (obj.sexo as Pet["sexo"]) || undefined,
      porte: (obj.porte as Pet["porte"]) || undefined,
      peso: obj.peso ? Number(obj.peso) : undefined,
      observacoes_saude: obj.observacoes_saude.trim() || undefined,
      categoria_id: Number(obj.categoria_id),
      dono_id: resolvedUserId,
    };
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNome = form.nome.trim();
    const normalizedRaca = form.raca.trim();
    const normalizedPeso = form.peso ? Number(form.peso) : undefined;
    let normalizedObservacoes = form.observacoes_saude.trim();

    if (normalizedNome.length < 2) { setError("O nome do pet deve ter no mínimo 2 caracteres."); return; }
    if (!normalizedRaca || !form.categoria_id) { setError("Raça e categoria são obrigatórias."); return; }
    if (!form.sexo) { setError("O sexo do pet é obrigatório."); return; }
    if (!form.porte) { setError("O porte do pet é obrigatório."); return; }
    if (normalizedPeso !== undefined && (!Number.isFinite(normalizedPeso) || normalizedPeso <= 0)) { setError("O peso do pet deve ser maior que 0."); return; }
    if (normalizedObservacoes.length > MAX_OBSERVACOES_SAUDE) {
      normalizedObservacoes = normalizedObservacoes.slice(0, MAX_OBSERVACOES_SAUDE);
      alert(`Observações muito longas — truncadas para ${MAX_OBSERVACOES_SAUDE} caracteres.`);
    }
    try {
      const payload = f({ ...form, observacoes_saude: normalizedObservacoes });
      await createPet({ ...payload, tag_ids: tagIdsCriacao.length > 0 ? tagIdsCriacao : undefined });
      setFeedback("Pet cadastrado com sucesso!");
      setForm(emptyForm);
      setTagIdsCriacao([]);
      setShowForm(false);
      await loadPets();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Erro ao cadastrar pet.");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPet) return;

    const resolvedUserId = userId;

    if (resolvedUserId === null) {
      setError("Nao foi possivel identificar o cliente logado.");
      return;
    }

    const normalizedNome = editForm.nome.trim();
    const normalizedRaca = editForm.raca.trim();
    const normalizedPeso = editForm.peso ? Number(editForm.peso) : undefined;
    let normalizedObservacoes = editForm.observacoes_saude.trim();

    if (normalizedNome.length < 2) { setError("O nome do pet deve ter no mínimo 2 caracteres."); return; }
    if (!normalizedRaca || !editForm.categoria_id) { setError("Raça e categoria são obrigatórias."); return; }
    if (!editForm.sexo) { setError("O sexo do pet é obrigatório."); return; }
    if (!editForm.porte) { setError("O porte do pet é obrigatório."); return; }
    if (normalizedPeso !== undefined && (!Number.isFinite(normalizedPeso) || normalizedPeso <= 0)) { setError("O peso do pet deve ser maior que 0."); return; }
    if (normalizedObservacoes.length > MAX_OBSERVACOES_SAUDE) {
      normalizedObservacoes = normalizedObservacoes.slice(0, MAX_OBSERVACOES_SAUDE);
      alert(`Observações muito longas — truncadas para ${MAX_OBSERVACOES_SAUDE} caracteres.`);
    }

    try {
      const payload: UpdatePetDTO = {
        nome: normalizedNome,
        raca: normalizedRaca || undefined,
        sexo: (editForm.sexo as Pet["sexo"]) || undefined,
        porte: (editForm.porte as Pet["porte"]) || undefined,
        peso: normalizedPeso,
        observacoes_saude: normalizedObservacoes,
        categoria_id: Number(editForm.categoria_id),
        dono_id: resolvedUserId,
        tag_ids: tagIdsEdicao,
      };
      await updatePet(editingPet.id, payload);
      setFeedback("Pet atualizado!");
      setEditingPet(null);
      await loadPets();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Erro ao atualizar pet.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Excluir este pet?")) return;
    try {
      await deletePet(id);
      setFeedback("Pet excluído.");
      await loadPets();
    } catch { setError("Erro ao excluir pet."); }
  }

  const catById = Object.fromEntries(categorias.map((c) => [c.id, c.name]));

  const atendimentosByPetId = useMemo(() =>
    atendimentos.reduce<Record<number, Appointment[]>>((acc, a) => {
      if (!acc[a.pet_id]) acc[a.pet_id] = [];
      acc[a.pet_id].push(a);
      return acc;
    }, {}),
    [atendimentos]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Pets</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gerencie os pets associados à sua conta.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setForm(emptyForm); setError(""); }}
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
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">Novo Pet</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} placeholder="Nome do pet" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Categoria *</label>
              <select className={selectCls} value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} required>
                <option value="">Selecionar...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Raça *</label>
              <input className={inputCls} placeholder="Ex: Golden Retriever" value={form.raca} onChange={(e) => setForm({ ...form, raca: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Sexo *</label>
              <select className={selectCls} value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} required>
                {sexoOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Porte *</label>
              <select className={selectCls} value={form.porte} onChange={(e) => setForm({ ...form, porte: e.target.value })} required>
                {porteOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Peso (kg)</label>
              <input type="number" step="0.1" min="0" className={inputCls} placeholder="Ex: 5.2" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Observações de saúde</label>
              <input maxLength={MAX_OBSERVACOES_SAUDE} className={inputCls} placeholder="Alergias, medicamentos, etc." value={form.observacoes_saude} onChange={(e) => setForm({ ...form, observacoes_saude: e.target.value })} />
            </div>
            {tagsDisponiveis.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-medium text-gray-500">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tagsDisponiveis.map((tag) => {
                    const sel = tagIdsCriacao.includes(tag.id);
                    return (
                      <button key={tag.id} type="button"
                        onClick={() => setTagIdsCriacao((ids) => sel ? ids.filter((id) => id !== tag.id) : [...ids, tag.id])}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${sel ? "border-[#1c46f3] bg-[#1c46f3] text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#1c46f3]/50 hover:text-[#1c46f3]"}`}
                      >{tag.nome}</button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}


      {/* Pets list */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando pets...
        </div>
      ) : pets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <PawPrint size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">Você ainda não tem pets cadastrados.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-semibold text-[#1c46f3] hover:underline">
            Cadastrar primeiro pet
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div key={pet.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              {editingPet?.id === pet.id ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <h3 className="mb-2 font-semibold text-gray-800">Editar Pet</h3>
                  <input minLength={2} className={inputCls} placeholder="Nome" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} required />
                  <select className={selectCls} value={editForm.categoria_id} onChange={(e) => setEditForm({ ...editForm, categoria_id: e.target.value })}>
                    <option value="">Categoria...</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input maxLength={80} className={inputCls} placeholder="Raça *" value={editForm.raca} onChange={(e) => setEditForm({ ...editForm, raca: e.target.value })} required />
                  <div className="grid grid-cols-2 gap-2">
                    <select className={selectCls} value={editForm.sexo} onChange={(e) => setEditForm({ ...editForm, sexo: e.target.value })} required>
                      {sexoOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select className={selectCls} value={editForm.porte} onChange={(e) => setEditForm({ ...editForm, porte: e.target.value })} required>
                      {porteOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <input type="number" step="0.1" min="0" className={inputCls} placeholder="Peso (kg)" value={editForm.peso} onChange={(e) => setEditForm({ ...editForm, peso: e.target.value })} />
                  <input maxLength={MAX_OBSERVACOES_SAUDE} className={inputCls} placeholder="Observações de saúde" value={editForm.observacoes_saude} onChange={(e) => setEditForm({ ...editForm, observacoes_saude: e.target.value })} />
                  {tagsDisponiveis.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tagsDisponiveis.map((tag) => {
                          const sel = tagIdsEdicao.includes(tag.id);
                          return (
                            <button key={tag.id} type="button"
                              onClick={() => setTagIdsEdicao((ids) => sel ? ids.filter((id) => id !== tag.id) : [...ids, tag.id])}
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${sel ? "border-[#1c46f3] bg-[#1c46f3] text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#1c46f3]/50 hover:text-[#1c46f3]"}`}
                            >{tag.nome}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="flex-1 rounded-xl bg-[#1c46f3] py-2 text-sm font-semibold text-white transition hover:opacity-90">Salvar</button>
                    <button type="button" onClick={() => setEditingPet(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50">✕</button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c46f3]/15 to-[#00bb69]/15 text-lg font-bold text-[#1c46f3]">
                      {pet.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900">{pet.nome}</h3>
                      <p className="text-xs text-gray-400">{catById[pet.categoria_id] ?? "—"}</p>
                    </div>
                  </div>

                  {/* Info compacta */}
                  <p className="truncate text-xs text-gray-500">
                    {[
                      pet.raca,
                      pet.sexo && pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1),
                      pet.porte && pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1),
                      pet.peso != null && `${pet.peso} kg`,
                    ].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </p>

                  {/* Observações de saúde */}
                  {pet.observacoes_saude && (
                    <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2">
                      <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">
                        {pet.observacoes_saude}
                      </p>
                    </div>
                  )}

                  {/* Tags com cores semânticas */}
                  {pet.tags && pet.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {pet.tags.map((tag) => (
                        <span key={tag.id} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tagColor(tag.nome)}`}>
                          {tag.nome}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mini histórico de atendimentos */}
                  {(atendimentosByPetId[pet.id]?.length ?? 0) > 0 && (() => {
                    const ats = atendimentosByPetId[pet.id];
                    const gasto = ats.filter(a => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0);
                    const ultimo = ats[0];
                    return (
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
                    );
                  })()}

                  {/* Ações */}
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setEditingPet(pet)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50">
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(pet.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50">
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
