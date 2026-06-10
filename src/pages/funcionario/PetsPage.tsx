import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Check, Pencil, Trash2, PawPrint, Users, Search,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import EditPetForm from "../../components/pet/EditPetForm";
import PetForm from "../../components/pet/PetForm";
import { getCategories } from "../../services/categoriaService";
import { createPet, deletePet, getPets, updatePet } from "../../services/petService";
import { getUsuarios } from "../../services/usuarioService";
import { getAppointments } from "../../services/atendimentoService";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";
import type { Appointment } from "../../types/atendimento";
import { useFuncionarioStore } from "../../hooks/useFuncionarioStore";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

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

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

export default function PetsPage() {
  const { lojaId } = useFuncionarioStore();

  const [pets, setPets] = useState<Pet[]>([]);
  const [petBeingEdited, setPetBeingEdited] = useState<Pet | null>(null);
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [categoriasById, setCategoriasById] = useState<Record<number, string>>({});
  const [donosById, setDonosById] = useState<Record<number, string>>({});
  const [speciesFilter, setSpeciesFilter] = useState("todos");
  const [search, setSearch] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      const [petsData, cats, usuarios, atendData] = await Promise.all([
        getPets(), getCategories(), getUsuarios(),
        getAppointments().catch(() => [] as Appointment[]),
      ]);
      setPets(petsData);
      setAtendimentos(atendData);
      setCategoriasById(Object.fromEntries(cats.map((c) => [c.id, c.name])));
      setDonosById(Object.fromEntries(usuarios.map((u) => [u.id, u.nome])));
      setError("");
    } catch { setError("Erro ao carregar pets."); }
    finally { setLoading(false); }
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

  const petIdsNaLoja = useMemo(() => {
    if (lojaId == null) return null;
    return new Set(atendimentos.filter((a) => a.loja_id === lojaId).map((a) => a.pet_id));
  }, [atendimentos, lojaId]);

  const visiblePets = useMemo(
    () => petIdsNaLoja != null ? pets.filter((p) => petIdsNaLoja.has(p.id)) : pets,
    [pets, petIdsNaLoja],
  );

  const speciesCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visiblePets.forEach((p) => { const k = getSpeciesKey(categoriasById[p.categoria_id] ?? ""); counts[k] = (counts[k] ?? 0) + 1; });
    return counts;
  }, [visiblePets, categoriasById]);

  const filterOptions = useMemo(() => {
    const keys = new Set(visiblePets.map((p) => getSpeciesKey(categoriasById[p.categoria_id] ?? "")));
    return ["Canino", "Felino", "Ave", "Roedor", "Outros"].filter((k) => keys.has(k));
  }, [visiblePets, categoriasById]);

  const filteredPets = useMemo(() => {
    let result = visiblePets;
    if (speciesFilter !== "todos") result = result.filter((p) => getSpeciesKey(categoriasById[p.categoria_id] ?? "") === speciesFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) =>
        p.nome.toLowerCase().includes(q) || (p.raca ?? "").toLowerCase().includes(q) ||
        (donosById[p.dono_id] ?? "").toLowerCase().includes(q) || (categoriasById[p.categoria_id] ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [visiblePets, speciesFilter, search, categoriasById, donosById]);

  async function handleCreatePet(data: CreatePetDTO) {
    try { await createPet(data); setFeedback("Pet cadastrado com sucesso."); setShowForm(false); await loadAll(); }
    catch { setError("Erro ao cadastrar pet."); }
  }
  async function handleUpdatePet(id: number, data: UpdatePetDTO) {
    try { await updatePet(id, data); setFeedback("Pet atualizado com sucesso."); setPetBeingEdited(null); await loadAll(); }
    catch { setError("Erro ao atualizar pet."); }
  }
  async function handleDeletePet(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este pet?")) return;
    try { await deletePet(id); setFeedback("Pet excluído com sucesso."); if (petBeingEdited?.id === id) setPetBeingEdited(null); await loadAll(); }
    catch { setError("Erro ao excluir pet."); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Loja</p>
          <div className="flex items-center gap-2">
            <PawPrint size={22} className="text-white/80" />
            <h1 className="text-2xl font-extrabold text-white">
              Pets <span style={{ color: AMBER }}>da Loja</span>
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/70">Gerencie todos os pets atendidos na sua loja</p>
          {!loading && (
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold" style={{ color: AMBER }}>{visiblePets.length}</span>
                <span className="text-xs text-white/65">total de pets</span>
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
      <div className="mb-5 flex flex-wrap items-center gap-2 bg-white px-4 py-2.5"
        style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
          style={{ border: `1px solid ${BORD}`, borderRadius: "6px", background: "#F8FAFC" }}>
          <Search size={13} className="shrink-0" style={{ color: MUTED }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pet, tutor, raça..."
            className="w-36 bg-transparent outline-none placeholder:text-gray-400 sm:w-52"
            style={{ color: COAL }}
            onFocus={(e) => { (e.currentTarget.parentElement as HTMLElement).style.borderColor = TEAL; }}
            onBlur={(e) => { (e.currentTarget.parentElement as HTMLElement).style.borderColor = BORD; }} />
        </div>
        <div className="flex gap-1">
          {["todos", ...filterOptions].map((key) => {
            const isActive = speciesFilter === key;
            return (
              <button key={key} onClick={() => setSpeciesFilter(key)}
                className="px-2.5 py-1.5 text-[11px] font-medium transition"
                style={{
                  borderRadius: "6px",
                  border: `1px solid ${isActive ? "transparent" : BORD}`,
                  background: isActive ? TEAL : "#fff",
                  color: isActive ? "#fff" : MUTED,
                }}>
                {key === "todos" ? "Todos" : key}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!loading && <span className="text-xs" style={{ color: MUTED }}>{filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}</span>}
          <button onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition"
            style={{ background: showForm ? MUTED : TEAL, borderRadius: "6px" }}
            onMouseEnter={(e) => { if (!showForm) (e.currentTarget as HTMLButtonElement).style.background = TDARK; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = showForm ? MUTED : TEAL; }}>
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancelar" : "Novo pet"}
          </button>
        </div>
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

      {showForm && (
        <div className="mb-5"><PetForm petBeingEdited={null} onCreate={handleCreatePet} onUpdate={handleUpdatePet} onCancelEdit={() => setShowForm(false)} /></div>
      )}

      <EditModal isOpen={Boolean(petBeingEdited)} title="Editar Pet" onClose={() => setPetBeingEdited(null)}>
        {petBeingEdited && <EditPetForm pet={petBeingEdited} onUpdate={handleUpdatePet} onCancel={() => setPetBeingEdited(null)} />}
      </EditModal>

      {/* Grid */}
      {loading ? (
        <div className="p-10 text-center text-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
          Carregando pets...
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="p-14 text-center" style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
          <PawPrint size={38} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>{visiblePets.length === 0 ? "Nenhum pet cadastrado nesta loja." : "Nenhum pet encontrado."}</p>
          {visiblePets.length === 0 && (
            <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold transition hover:opacity-70" style={{ color: TEAL }}>
              Cadastrar primeiro pet
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet) => {
            const ats = atendimentosByPetId[pet.id] ?? [];
            const gasto = ats.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0);
            const ultimo = ats[0];
            const catName = categoriasById[pet.categoria_id] ?? "";
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
                  <p className="mb-0.5 truncate text-[11px]" style={{ color: MUTED }}>
                    {[pet.raca, pet.sexo && pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1), pet.porte && pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1), pet.peso != null && `${pet.peso} kg`].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </p>
                  {donosById[pet.dono_id] && (
                    <p className="mb-2 flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                      <Users size={10} className="shrink-0" /> {donosById[pet.dono_id]}
                    </p>
                  )}
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
                  <button onClick={() => setPetBeingEdited(pet)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition hover:bg-[#e6f5f5]"
                    style={{ color: MUTED, borderBottomLeftRadius: "10px" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => handleDeletePet(pet.id)}
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
