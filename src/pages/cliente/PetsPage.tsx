import { useEffect, useMemo, useState } from "react";
import { Plus, X, Check, Pencil, Trash2, PawPrint } from "lucide-react";
import EditModal from "../../components/EditModal";
import { getCategories } from "../../services/categoriaService";
import { createPet, deletePet, getPets, updatePet } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getTags } from "../../services/tagService";
import type { Categoria } from "../../types/categoria";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";
import type { Etiqueta } from "../../types/tag";
import type { Appointment } from "../../types/atendimento";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

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

function getSpeciesStyle(_key: string) {
  return { avatarBg: "bg-[#e6f5f5]", avatarText: "text-[#085C60]", badgeCls: "bg-[#e6f5f5] text-[#085C60]" };
}

function tagColor(_nome: string): string {
  return "bg-teal-50 text-teal-700";
}

const inputCls = `w-full rounded border bg-gray-50 px-3 py-2 text-sm outline-none transition focus:bg-white`;
const selectCls = inputCls + " appearance-none";
const MAX_OBS = 50;

type PetFormState = { nome: string; raca: string; sexo: string; porte: string; peso: string; observacoes_saude: string; categoria_id: string };
const emptyForm: PetFormState = { nome: "", raca: "", sexo: "", porte: "", peso: "", observacoes_saude: "", categoria_id: "" };

function PetFields({ f, setF, tagIds, setTagIds, categorias, tagsDisponiveis }: {
  f: PetFormState;
  setF: (v: PetFormState) => void;
  tagIds: number[];
  setTagIds: (fn: (ids: number[]) => number[]) => void;
  categorias: Categoria[];
  tagsDisponiveis: Etiqueta[];
}) {
  const fieldBorder = { borderColor: BORD };
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = TEAL;
    e.target.style.boxShadow = "0 0 0 3px rgba(13,115,119,0.10)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = BORD;
    e.target.style.boxShadow = "none";
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
        <input minLength={2} className={inputCls} style={fieldBorder} placeholder="Nome do pet"
          value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required
          onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Categoria *</label>
        <select className={selectCls} style={fieldBorder} value={f.categoria_id}
          onChange={(e) => setF({ ...f, categoria_id: e.target.value })} required
          onFocus={focusStyle} onBlur={blurStyle}>
          <option value="">Selecionar...</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Raça *</label>
        <input className={inputCls} style={fieldBorder} placeholder="Ex: Golden Retriever"
          value={f.raca} onChange={(e) => setF({ ...f, raca: e.target.value })} required
          onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Sexo *</label>
        <select className={selectCls} style={fieldBorder} value={f.sexo}
          onChange={(e) => setF({ ...f, sexo: e.target.value })} required
          onFocus={focusStyle} onBlur={blurStyle}>
          <option value="">Selecionar...</option>
          <option value="macho">Macho</option>
          <option value="femea">Fêmea</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Porte *</label>
        <select className={selectCls} style={fieldBorder} value={f.porte}
          onChange={(e) => setF({ ...f, porte: e.target.value })} required
          onFocus={focusStyle} onBlur={blurStyle}>
          <option value="">Selecionar...</option>
          <option value="pequeno">Pequeno</option>
          <option value="medio">Médio</option>
          <option value="grande">Grande</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Peso (kg)</label>
        <input type="number" step="0.1" min="0" max="100" className={inputCls} style={fieldBorder}
          placeholder="Ex: 5.2" value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })}
          onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Observações de saúde</label>
        <input maxLength={MAX_OBS} className={inputCls} style={fieldBorder}
          placeholder="Alergias, medicamentos, etc." value={f.observacoes_saude}
          onChange={(e) => setF({ ...f, observacoes_saude: e.target.value })}
          onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      {tagsDisponiveis.length > 0 && (
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Tags</label>
          <div className="flex flex-wrap gap-2">
            {tagsDisponiveis.map((tag) => {
              const sel = tagIds.includes(tag.id);
              return (
                <button key={tag.id} type="button"
                  onClick={() => setTagIds((ids) => sel ? ids.filter((id) => id !== tag.id) : [...ids, tag.id])}
                  className="rounded px-3 py-1 text-xs font-medium transition"
                  style={{
                    border: `1px solid ${sel ? TEAL : BORD}`,
                    background: sel ? TEAL : "#F8FAFC",
                    color: sel ? "#fff" : MUTED,
                  }}>
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

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Minha Conta</p>
          <div className="flex items-center gap-2">
            <PawPrint size={22} className="text-white/80" />
            <h1 className="text-2xl font-extrabold text-white">
              Meus <span style={{ color: AMBER }}>Pets</span>
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/70">Gerencie os pets associados à sua conta</p>
          {!loading && (
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold" style={{ color: AMBER }}>{pets.length}</span>
                <span className="text-xs text-white/65">{pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}</span>
              </div>
              {Object.entries(speciesCounts).map(([key, count]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="h-5 w-px bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold text-white/90">{count}</span>
                    <span className="text-xs text-white/55">{key}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between bg-white px-4 py-2.5"
        style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
        {!loading && <span className="text-xs" style={{ color: MUTED }}>{pets.length} {pets.length === 1 ? "pet" : "pets"}</span>}
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); setForm(emptyForm); setTagIdsCriacao([]); }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition"
          style={{ background: showForm ? MUTED : TEAL, borderRadius: "6px" }}
          onMouseEnter={(e) => { if (!showForm) (e.currentTarget as HTMLButtonElement).style.background = TDARK; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = showForm ? MUTED : TEAL; }}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancelar" : "Novo pet"}
        </button>
      </div>

      {feedback && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 text-sm"
          style={{ borderRadius: "6px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
          <Check size={14} /> {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-2.5 text-sm"
          style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 bg-white p-5"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: COAL }}>Novo Pet</h2>
          <PetFields f={form} setF={setForm} tagIds={tagIdsCriacao} setTagIds={setTagIdsCriacao} categorias={categorias} tagsDisponiveis={tagsDisponiveis} />
          <div className="mt-4 flex gap-2">
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white"
              style={{ background: TEAL, borderRadius: "6px" }}>
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      <EditModal isOpen={Boolean(editingPet)} title="Editar Pet" onClose={() => setEditingPet(null)}>
        {editingPet && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <PetFields f={editForm} setF={setEditForm} tagIds={tagIdsEdicao} setTagIds={setTagIdsEdicao} categorias={categorias} tagsDisponiveis={tagsDisponiveis} />
            <div className="flex gap-2 pt-1">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white"
                style={{ background: TEAL, borderRadius: "6px" }}>
                <Check size={14} /> Salvar
              </button>
              <button type="button" onClick={() => setEditingPet(null)}
                className="px-5 py-2 text-sm transition hover:bg-gray-50"
                style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </EditModal>

      {/* Grid */}
      {loading ? (
        <div className="p-10 text-center text-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
          Carregando pets...
        </div>
      ) : pets.length === 0 ? (
        <div className="p-14 text-center" style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
          <PawPrint size={38} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Você ainda não tem pets cadastrados.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold transition hover:opacity-70" style={{ color: TEAL }}>
            Cadastrar primeiro pet
          </button>
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
              <article key={pet.id}
                className="flex flex-col bg-white transition hover:shadow-md"
                style={{ border: `1px solid ${BORD}`, borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${avatarBg} ${avatarText}`}>
                      {pet.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-snug" style={{ color: COAL }}>{pet.nome}</h3>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeCls}`}>{catName || "—"}</span>
                    </div>
                  </div>
                  <p className="mb-1 truncate text-[11px]" style={{ color: MUTED }}>
                    {[pet.raca, pet.sexo && pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1), pet.porte && pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1), pet.peso != null && `${pet.peso} kg`].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </p>
                  {pet.observacoes_saude ? (
                    <div className="mb-2.5 rounded-r bg-[#F8FAFC] px-2.5 py-2 text-[11px] italic leading-relaxed"
                      style={{ borderLeft: `3px solid ${TEAL}`, color: MUTED }}>
                      <p className="line-clamp-2">{pet.observacoes_saude}</p>
                    </div>
                  ) : (
                    <div className="mb-2.5 h-8 rounded-r bg-[#F8FAFC] px-2.5 py-2 text-[11px] italic"
                      style={{ borderLeft: `3px solid ${BORD}`, color: "#CBD5E1" }}>
                      Sem observações
                    </div>
                  )}
                  {pet.tags && pet.tags.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap gap-1">
                      {pet.tags.map((tag) => (
                        <span key={tag.id} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagColor(tag.nome)}`}>{tag.nome}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex divide-x rounded" style={{ border: `1px solid ${BORD}`, background: "#F8FAFC", borderColor: BORD }}>
                    <div className="flex flex-1 flex-col items-center py-2">
                      <span className="text-[13px] font-bold" style={{ color: COAL }}>{ats.length}</span>
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: MUTED }}>visitas</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center py-2">
                      <span className="text-[13px] font-bold" style={{ color: TEAL }}>R${Math.round(gasto)}</span>
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: MUTED }}>gasto</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center py-2">
                      <span className="text-[11px] font-semibold" style={{ color: COAL }}>
                        {ultimo ? new Date(ultimo.data_atendimento).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—"}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: MUTED }}>última visita</span>
                    </div>
                  </div>
                </div>
                <div className="flex divide-x" style={{ borderTop: `1px solid ${BORD}`, borderColor: BORD }}>
                  <button onClick={() => { setEditingPet(pet); setError(""); }}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition hover:bg-[#e6f5f5]"
                    style={{ color: MUTED, borderBottomLeftRadius: "10px" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(pet.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    style={{ borderBottomRightRadius: "10px" }}>
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
