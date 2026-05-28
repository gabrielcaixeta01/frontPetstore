import { useEffect, useMemo, useState } from "react";
import { Plus, X, Check, Pencil, Trash2, PawPrint, ChevronRight } from "lucide-react";
import EditModal from "../../components/EditModal";
import { getCategories } from "../../services/categoriaService";
import { createPet, deletePet, getPets, updatePet } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getTags } from "../../services/tagService";
import type { Categoria } from "../../types/categoria";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";
import type { Etiqueta } from "../../types/tag";
import type { Appointment } from "../../types/atendimento";

/* ─── helpers ─────────────────────────────────────────────── */
function getStoredUser() { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }
function getStoredUserId(): number | null {
  const user = getStoredUser();
  const id = Number(user.id ?? user.user_id ?? user.usuario_id);
  return Number.isFinite(id) ? id : null;
}

function getSpeciesKey(catName: string): string {
  const n = catName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/cao|canis|canin|cachorro/.test(n)) return "Canino";
  if (/gat|felin/.test(n))               return "Felino";
  if (/ave|bird|pass/.test(n))           return "Ave";
  if (/roedor|hamster|rato|coelh/.test(n)) return "Roedor";
  return "Outros";
}

function getSpeciesStyle(key: string) {
  switch (key) {
    case "Canino": return { avatarBg: "bg-[#e8eeff]", avatarText: "text-[#1c46f3]", badgeCls: "bg-[#e8eeff] text-[#1c46f3]" };
    case "Felino": return { avatarBg: "bg-[#e6f4ed]", avatarText: "text-[#00A651]", badgeCls: "bg-[#e6f4ed] text-[#00A651]" };
    case "Ave":    return { avatarBg: "bg-[#fff8e6]", avatarText: "text-[#b07800]", badgeCls: "bg-[#fff8e6] text-[#b07800]" };
    case "Roedor": return { avatarBg: "bg-[#fde8e8]", avatarText: "text-[#8b1a1a]", badgeCls: "bg-[#fde8e8] text-[#8b1a1a]" };
    default:       return { avatarBg: "bg-[#e8eeff]", avatarText: "text-[#1c46f3]", badgeCls: "bg-[#e8eeff] text-[#1c46f3]" };
  }
}

function tagColor(nome: string): string {
  const n = nome.toLowerCase();
  if (/alergi|intoler/.test(n))                        return "bg-red-50 text-red-700";
  if (/alert|atenção|atencao|cuid|medo|ansio/.test(n)) return "bg-amber-50 text-amber-700";
  if (/vacin|castrad|microchip|vermif/.test(n))        return "bg-emerald-50 text-emerald-700";
  return "bg-[#e8eeff] text-[#1c46f3]";
}

const inputCls = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white";
const selectCls = inputCls + " appearance-none";
const MAX_OBS = 50;

type PetFormState = { nome: string; raca: string; sexo: string; porte: string; peso: string; observacoes_saude: string; categoria_id: string };
const emptyForm: PetFormState = { nome: "", raca: "", sexo: "", porte: "", peso: "", observacoes_saude: "", categoria_id: "" };

/* ─── Component ───────────────────────────────────────────── */
export default function ClientePetsPage() {
  const userId = getStoredUserId();

  const [pets, setPets] = useState<Pet[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState<Etiqueta[]>([]);
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetFormState>(emptyForm);
  const [editForm, setEditForm] = useState<PetFormState>(emptyForm);
  const [tagIdsCriacao, setTagIdsCriacao] = useState<number[]>([]);
  const [tagIdsEdicao, setTagIdsEdicao] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadPets() {
    if (userId === null) { setError("Não foi possível identificar o cliente logado."); setLoading(false); return; }
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
          all.filter((a) => a.cliente_id === userId)
             .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
        ))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!editingPet) return;
    setEditForm({
      nome: editingPet.nome, raca: editingPet.raca ?? "", sexo: editingPet.sexo ?? "",
      porte: editingPet.porte ?? "", peso: editingPet.peso != null ? String(editingPet.peso) : "",
      observacoes_saude: editingPet.observacoes_saude ?? "", categoria_id: String(editingPet.categoria_id),
    });
    setTagIdsEdicao(editingPet.tags?.map((t) => t.id) ?? []);
  }, [editingPet]);

  const catById = useMemo(() => Object.fromEntries(categorias.map((c) => [c.id, c.name])), [categorias]);
  const atendimentosByPetId = useMemo(() =>
    atendimentos.reduce<Record<number, Appointment[]>>((acc, a) => {
      if (!acc[a.pet_id]) acc[a.pet_id] = [];
      acc[a.pet_id].push(a);
      return acc;
    }, {}), [atendimentos]);

  const speciesCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    pets.forEach((p) => { const k = getSpeciesKey(catById[p.categoria_id] ?? ""); counts[k] = (counts[k] ?? 0) + 1; });
    return counts;
  }, [pets, catById]);

  function validateForm(f: PetFormState): string | null {
    if (f.nome.trim().length < 2) return "O nome do pet deve ter no mínimo 2 caracteres.";
    if (!f.raca.trim() || !f.categoria_id) return "Raça e categoria são obrigatórias.";
    if (!f.sexo) return "O sexo do pet é obrigatório.";
    if (!f.porte) return "O porte do pet é obrigatório.";
    if (f.peso) {
      const p = Number(f.peso);
      if (!Number.isFinite(p) || p <= 0) return "O peso deve ser maior que 0.";
      if (p > 100) return "O peso não pode ultrapassar 100 kg.";
    }
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (userId === null) { setError("Não foi possível identificar o cliente logado."); return; }
    const err = validateForm(form);
    if (err) { setError(err); return; }
    let obs = form.observacoes_saude.trim();
    if (obs.length > MAX_OBS) obs = obs.slice(0, MAX_OBS);
    try {
      const payload: CreatePetDTO = {
        nome: form.nome.trim(), raca: form.raca.trim() || undefined,
        sexo: (form.sexo as Pet["sexo"]) || undefined, porte: (form.porte as Pet["porte"]) || undefined,
        peso: form.peso ? Number(form.peso) : undefined, observacoes_saude: obs || undefined,
        categoria_id: Number(form.categoria_id), dono_id: userId,
        tag_ids: tagIdsCriacao.length > 0 ? tagIdsCriacao : undefined,
      };
      await createPet(payload);
      setFeedback("Pet cadastrado com sucesso!"); setForm(emptyForm); setTagIdsCriacao([]); setShowForm(false);
      await loadPets();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Erro ao cadastrar pet.");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPet || userId === null) return;
    const err = validateForm(editForm);
    if (err) { setError(err); return; }
    let obs = editForm.observacoes_saude.trim();
    if (obs.length > MAX_OBS) obs = obs.slice(0, MAX_OBS);
    try {
      const payload: UpdatePetDTO = {
        nome: editForm.nome.trim(), raca: editForm.raca.trim() || undefined,
        sexo: (editForm.sexo as Pet["sexo"]) || undefined, porte: (editForm.porte as Pet["porte"]) || undefined,
        peso: editForm.peso ? Number(editForm.peso) : undefined, observacoes_saude: obs,
        categoria_id: Number(editForm.categoria_id), dono_id: userId, tag_ids: tagIdsEdicao,
      };
      await updatePet(editingPet.id, payload);
      setFeedback("Pet atualizado!"); setEditingPet(null); await loadPets();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Erro ao atualizar pet.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Excluir este pet?")) return;
    try { await deletePet(id); setFeedback("Pet excluído."); await loadPets(); }
    catch { setError("Erro ao excluir pet."); }
  }

  /* ── Pet form fields ──────────────────────────────────── */
  function PetFields({ f, setF, tagIds, setTagIds }: { f: PetFormState; setF: (v: PetFormState) => void; tagIds: number[]; setTagIds: (fn: (ids: number[]) => number[]) => void }) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div><label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
          <input minLength={2} className={inputCls} placeholder="Nome do pet" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required /></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500">Categoria *</label>
          <select className={selectCls} value={f.categoria_id} onChange={(e) => setF({ ...f, categoria_id: e.target.value })} required>
            <option value="">Selecionar...</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500">Raça *</label>
          <input className={inputCls} placeholder="Ex: Golden Retriever" value={f.raca} onChange={(e) => setF({ ...f, raca: e.target.value })} required /></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500">Sexo *</label>
          <select className={selectCls} value={f.sexo} onChange={(e) => setF({ ...f, sexo: e.target.value })} required>
            <option value="">Selecionar...</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500">Porte *</label>
          <select className={selectCls} value={f.porte} onChange={(e) => setF({ ...f, porte: e.target.value })} required>
            <option value="">Selecionar...</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500">Peso (kg)</label>
          <input type="number" step="0.1" min="0" max="100" className={inputCls} placeholder="Ex: 5.2" value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })} /></div>
        <div className="sm:col-span-2 lg:col-span-3"><label className="mb-1 block text-xs font-medium text-gray-500">Observações de saúde</label>
          <input maxLength={MAX_OBS} className={inputCls} placeholder="Alergias, medicamentos, etc." value={f.observacoes_saude} onChange={(e) => setF({ ...f, observacoes_saude: e.target.value })} /></div>
        {tagsDisponiveis.length > 0 && (
          <div className="sm:col-span-2 lg:col-span-3"><label className="mb-1 block text-xs font-medium text-gray-500">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagsDisponiveis.map((tag) => {
                const sel = tagIds.includes(tag.id);
                return (
                  <button key={tag.id} type="button" onClick={() => setTagIds((ids) => sel ? ids.filter((id) => id !== tag.id) : [...ids, tag.id])}
                    className={`rounded border px-3 py-1 text-xs font-medium transition ${sel ? "border-[#1c46f3] bg-[#1c46f3] text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#1c46f3] hover:text-[#1c46f3]"}`}>
                    {tag.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* ── Hero Banner ────────────────────────────────────── */}
      <div className="relative mb-5 overflow-hidden rounded-md bg-[#1c46f3] px-6 py-7 sm:px-8">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-white/60">
          <span>Minha Conta</span><ChevronRight size={10} />
          <span className="font-medium text-white/90">Meus Pets</span>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <PawPrint size={20} className="text-[#F5A800]" />
          <h1 className="text-2xl font-extrabold leading-tight text-white">
            Meus <span className="text-[#F5A800]">Pets</span>
          </h1>
        </div>
        <p className="mb-4 text-[13px] text-white/70">Gerencie os pets associados à sua conta</p>
        {!loading && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold text-[#F5A800]">{pets.length}</span>
              <span className="text-[11px] text-white/65">{pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}</span>
            </div>
            {Object.entries(speciesCounts).map(([key, count], i) => (
              <div key={key} className="flex items-center gap-3">
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold" style={{ color: i === 0 ? "#7fffb5" : i === 1 ? "#ffe066" : "#ffa07a" }}>{count}</span>
                  <span className="text-[11px] text-white/65">{key}s</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-2.5 lg:flex" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <div className="h-3.5 w-3.5 rotate-45 rounded bg-[#F5A800]" />
            <div className="h-6 w-6 rounded-full border-2 border-[#00A651]" />
            <div className="h-2.5 w-2.5 rounded bg-[#00A651]" />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div style={{ width:0, height:0, borderLeft:"11px solid transparent", borderRight:"11px solid transparent", borderBottom:"19px solid #F5A800" }} />
            <div className="h-7 w-7 rounded bg-white/10" />
            <div className="h-4 w-4 rounded-full bg-[#00A651]" />
          </div>
          <div className="-mt-2 flex flex-col items-center gap-2">
            <div className="h-4 w-4 rotate-45 rounded border-2 border-[#F5A800]" />
            <div className="h-9 w-9 rounded-full bg-white/10" />
            <div style={{ width:0, height:0, borderLeft:"7px solid transparent", borderRight:"7px solid transparent", borderTop:"13px solid rgba(255,255,255,0.35)" }} />
          </div>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2.5">
        {!loading && <span className="text-xs text-gray-400">{pets.length} {pets.length === 1 ? "pet" : "pets"}</span>}
        <button onClick={() => { setShowForm((v) => !v); setError(""); setForm(emptyForm); setTagIdsCriacao([]); }}
          className="ml-auto flex items-center gap-1.5 rounded bg-[#1c46f3] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#1840e0]">
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancelar" : "Novo pet"}
        </button>
      </div>

      {feedback && <div className="mb-4 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"><Check size={14} /> {feedback}</div>}
      {error   && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      {/* create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Novo Pet</h2>
          <PetFields f={form} setF={setForm} tagIds={tagIdsCriacao} setTagIds={setTagIdsCriacao} />
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded bg-[#1c46f3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1840e0]"><Plus size={14} /> Cadastrar</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded border border-gray-200 px-5 py-2 text-sm text-gray-500 transition hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      {/* edit modal */}
      <EditModal isOpen={Boolean(editingPet)} title="Editar Pet" onClose={() => setEditingPet(null)}>
        {editingPet && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <PetFields f={editForm} setF={setEditForm} tagIds={tagIdsEdicao} setTagIds={setTagIdsEdicao} />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex items-center gap-2 rounded bg-[#1c46f3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1840e0]"><Check size={14} /> Salvar</button>
              <button type="button" onClick={() => setEditingPet(null)} className="rounded border border-gray-200 px-5 py-2 text-sm text-gray-500 transition hover:bg-gray-50">Cancelar</button>
            </div>
          </form>
        )}
      </EditModal>

      {/* ── Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="rounded border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">Carregando pets...</div>
      ) : pets.length === 0 ? (
        <div className="rounded border border-dashed border-gray-200 bg-white p-14 text-center">
          <PawPrint size={38} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Você ainda não tem pets cadastrados.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">Cadastrar primeiro pet</button>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const ats = atendimentosByPetId[pet.id] ?? [];
            const gasto = ats.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0);
            const ultimo = ats[0];
            const catName = catById[pet.categoria_id] ?? "";
            const { avatarBg, avatarText, badgeCls } = getSpeciesStyle(getSpeciesKey(catName));
            return (
              <article key={pet.id} className="flex flex-col rounded border border-gray-200 bg-white transition hover:border-[#1c46f3]/40 hover:shadow-[0_3px_16px_rgba(28,70,243,0.08)]">
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${avatarBg} ${avatarText}`}>
                      {pet.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-snug text-gray-900">{pet.nome}</h3>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeCls}`}>{catName || "—"}</span>
                    </div>
                  </div>
                  <p className="mb-1 truncate text-[11px] text-gray-500">
                    {[pet.raca, pet.sexo && pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1), pet.porte && pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1), pet.peso != null && `${pet.peso} kg`].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </p>
                  {pet.observacoes_saude ? (
                    <div className="mb-2.5 rounded-r border-l-[3px] border-l-[#1c46f3] bg-gray-50 px-2.5 py-2 text-[11px] italic leading-relaxed text-gray-600">
                      <p className="line-clamp-2">{pet.observacoes_saude}</p>
                    </div>
                  ) : (
                    <div className="mb-2.5 h-8 rounded-r border-l-[3px] border-l-gray-200 bg-gray-50 px-2.5 py-2 text-[11px] italic text-gray-300">Sem observações</div>
                  )}
                  {pet.tags && pet.tags.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap gap-1">
                      {pet.tags.map((tag) => <span key={tag.id} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagColor(tag.nome)}`}>{tag.nome}</span>)}
                    </div>
                  )}
                  <div className="mt-auto flex divide-x divide-gray-200 rounded border border-gray-200 bg-gray-50">
                    <div className="flex flex-1 flex-col items-center py-2">
                      <span className="text-[13px] font-bold text-gray-900">{ats.length}</span>
                      <span className="text-[9px] uppercase tracking-wide text-gray-500">visitas</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center py-2">
                      <span className="text-[13px] font-bold text-[#1c46f3]">R${Math.round(gasto)}</span>
                      <span className="text-[9px] uppercase tracking-wide text-gray-500">gasto</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center py-2">
                      <span className="text-[11px] font-semibold text-gray-900">
                        {ultimo ? new Date(ultimo.data_atendimento).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—"}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide text-gray-500">última visita</span>
                    </div>
                  </div>
                </div>
                <div className="flex divide-x divide-gray-200 border-t border-gray-200">
                  <button onClick={() => { setEditingPet(pet); setError(""); }}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-gray-600 transition hover:bg-[#e8eeff] hover:text-[#1c46f3]">
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(pet.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
