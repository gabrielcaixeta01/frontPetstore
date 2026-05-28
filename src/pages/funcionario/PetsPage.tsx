import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Check, Pencil, Trash2, PawPrint, Users,
  ChevronRight, Search,
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

      {/* ── Hero Banner ────────────────────────────────────── */}
      <div className="relative mb-5 overflow-hidden rounded-md bg-[#1c46f3] px-6 py-7 sm:px-8">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-white/60">
          <span>Painel</span><ChevronRight size={10} />
          <span className="font-medium text-white/90">Pets</span>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <PawPrint size={20} className="text-[#F5A800]" />
          <h1 className="text-2xl font-extrabold leading-tight text-white">
            Pets <span className="text-[#F5A800]">da Loja</span>
          </h1>
        </div>
        <p className="mb-4 text-[13px] text-white/70">Gerencie todos os pets atendidos na sua loja</p>
        {!loading && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold text-[#F5A800]">{visiblePets.length}</span>
              <span className="text-[11px] text-white/65">Total de pets</span>
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
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs focus-within:border-[#1c46f3] focus-within:bg-white">
          <Search size={13} className="shrink-0 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pet, tutor, raça..."
            className="w-36 bg-transparent outline-none placeholder:text-gray-400 sm:w-52" />
        </div>
        <div className="flex gap-1">
          {["todos", ...filterOptions].map((key) => (
            <button key={key} onClick={() => setSpeciesFilter(key)}
              className={`rounded border px-2.5 py-1.5 text-[11px] font-medium transition ${
                speciesFilter === key
                  ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-[#1c46f3] hover:text-[#1c46f3]"
              }`}>
              {key === "todos" ? "Todos" : key}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!loading && <span className="text-xs text-gray-400">{filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}</span>}
          <button onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex items-center gap-1.5 rounded bg-[#1c46f3] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#1840e0]">
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancelar" : "Novo pet"}
          </button>
        </div>
      </div>

      {feedback && <div className="mb-4 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"><Check size={14} /> {feedback}</div>}
      {error   && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      {showForm && <div className="mb-5"><PetForm petBeingEdited={null} onCreate={handleCreatePet} onUpdate={handleUpdatePet} onCancelEdit={() => setShowForm(false)} /></div>}

      <EditModal isOpen={Boolean(petBeingEdited)} title="Editar Pet" onClose={() => setPetBeingEdited(null)}>
        {petBeingEdited && <EditPetForm pet={petBeingEdited} onUpdate={handleUpdatePet} onCancel={() => setPetBeingEdited(null)} />}
      </EditModal>

      {/* ── Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="rounded border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">Carregando pets...</div>
      ) : filteredPets.length === 0 ? (
        <div className="rounded border border-dashed border-gray-200 bg-white p-14 text-center">
          <PawPrint size={38} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">{visiblePets.length === 0 ? "Nenhum pet cadastrado nesta loja." : "Nenhum pet encontrado."}</p>
          {visiblePets.length === 0 && <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">Cadastrar primeiro pet</button>}
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
                  <p className="mb-0.5 truncate text-[11px] text-gray-500">
                    {[pet.raca, pet.sexo && pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1), pet.porte && pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1), pet.peso != null && `${pet.peso} kg`].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </p>
                  {donosById[pet.dono_id] && (
                    <p className="mb-2 flex items-center gap-1 text-[11px] text-gray-400"><Users size={10} className="shrink-0" /> {donosById[pet.dono_id]}</p>
                  )}
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
                  <button onClick={() => setPetBeingEdited(pet)} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-gray-600 transition hover:bg-[#e8eeff] hover:text-[#1c46f3]">
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => handleDeletePet(pet.id)} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600">
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
