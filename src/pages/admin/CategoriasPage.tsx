import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Pencil, Trash2, PawPrint, LayoutGrid,
  Dog, Cat, Bird, Rabbit, Fish, Turtle, Squirrel,
  type LucideIcon,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import {
  createCategory, deleteCategory, getCategories, updateCategory,
  type CreateCategoriaDTO, type UpdateCategoriaDTO,
} from "../../services/categoriaService";
import { getPets } from "../../services/petService";
import type { Categoria } from "../../types/categoria";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "8px 12px", fontSize: "14px",
  border: `1px solid ${BORD}`, borderRadius: "6px",
  background: "#F8FAFC", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = TEAL;
  e.target.style.boxShadow = "0 0 0 3px rgba(13,115,119,0.12)";
  e.target.style.background = "#fff";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow = "none";
  e.target.style.background = "#F8FAFC";
}

function stripAccents(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function fixDescription(text: string): string {
  const map: [RegExp, string][] = [
    [/\bcaes\b/gi,"cães"],[/\bcao\b/gi,"cão"],
    [/domesticas\b/gi,"domésticas"],[/domestica\b/gi,"doméstica"],
    [/domesticos\b/gi,"domésticos"],[/domestico\b/gi,"doméstico"],
    [/passaros\b/gi,"pássaros"],[/passaro\b/gi,"pássaro"],
  ];
  let r = text; map.forEach(([re,rep]) => { r = r.replace(re,rep); }); return r;
}
function getCategoryIcon(name: string): LucideIcon {
  const n = stripAccents(name);
  if (/cao|canis|canin|cachorro/.test(n))       return Dog;
  if (/gat|felin/.test(n))                       return Cat;
  if (/ave|bird|pass[ao]|papag|calopsi/.test(n)) return Bird;
  if (/coelh|rabbit/.test(n))                    return Rabbit;
  if (/roedor|hamster|rato|camundongo/.test(n))  return Squirrel;
  if (/peix|fish/.test(n))                       return Fish;
  if (/tartaruga|turtle/.test(n))                return Turtle;
  return PawPrint;
}
function getStoredUserName(): string {
  try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.name ?? ""; }
  catch { return ""; }
}
function firstName(name: string) { return name.split(" ")[0] ?? name; }
function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const ax = error as { response?: { status?: number; data?: unknown } };
  if (ax.response?.status === 422) return "Nome inválido. Use pelo menos 2 caracteres.";
  const data = ax.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }
  return fallback;
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

export default function CategoriasPage() {
  const [categorias, setCategorias]         = useState<Categoria[]>([]);
  const [petCounts, setPetCounts]           = useState<Record<number, number>>({});
  const [catBeingEdited, setCatBeingEdited] = useState<Categoria | null>(null);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [feedback, setFeedback]             = useState("");
  const [error, setError]                   = useState("");
  const [nome, setNome]                     = useState("");
  const [descricao, setDescricao]           = useState("");
  const [editNome, setEditNome]             = useState("");
  const [editDescricao, setEditDescricao]   = useState("");
  const [sortBy, setSortBy]                 = useState<"az" | "pets">("az");

  const userName = getStoredUserName();

  async function loadData() {
    setLoading(true);
    try {
      const [cats, pets] = await Promise.all([getCategories(), getPets()]);
      setCategorias(cats);
      const counts: Record<number, number> = {};
      pets.forEach((p) => { counts[p.categoria_id] = (counts[p.categoria_id] ?? 0) + 1; });
      setPetCounts(counts);
      setError("");
    } catch { setError("Erro ao carregar categorias."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!catBeingEdited) { setEditNome(""); setEditDescricao(""); return; }
    setEditNome(catBeingEdited.name);
    setEditDescricao(catBeingEdited.description ?? "");
  }, [catBeingEdited]);

  const totalPets = useMemo(() => Object.values(petCounts).reduce((a, b) => a + b, 0), [petCounts]);

  const topCat = useMemo((): { cat: Categoria; count: number } | null => {
    if (categorias.length === 0) return null;
    let best: Categoria | null = null; let bestCount = 0;
    categorias.forEach((cat) => {
      const count = petCounts[cat.id] ?? 0;
      if (count > bestCount) { best = cat; bestCount = count; }
    });
    return best && bestCount > 0 ? { cat: best, count: bestCount } : null;
  }, [categorias, petCounts]);

  const sorted = useMemo(() => {
    const arr = [...categorias];
    if (sortBy === "az") return arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr.sort((a, b) => (petCounts[b.id] ?? 0) - (petCounts[a.id] ?? 0));
  }, [categorias, petCounts, sortBy]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = nome.trim();
    if (n.length < 2) { setError("Nome deve ter ao menos 2 caracteres."); return; }
    try {
      await createCategory({ name: n, description: descricao.trim() || undefined } as CreateCategoriaDTO);
      setFeedback("Categoria cadastrada."); setNome(""); setDescricao(""); setShowForm(false); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao cadastrar categoria.")); }
  }
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!catBeingEdited) return;
    const n = editNome.trim();
    if (n.length < 2) { setError("Nome deve ter ao menos 2 caracteres."); return; }
    try {
      await updateCategory(catBeingEdited.id, { name: n, description: editDescricao.trim() } as UpdateCategoriaDTO);
      setFeedback("Categoria atualizada."); setCatBeingEdited(null); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao atualizar categoria.")); }
  }
  async function handleDelete(id: number) {
    if (!window.confirm("Excluir esta categoria?")) return;
    try {
      await deleteCategory(id); setFeedback("Categoria excluída.");
      if (catBeingEdited?.id === id) setCatBeingEdited(null);
      await loadData();
    } catch { setError("Erro ao excluir categoria."); }
  }

  const TopIcon = topCat ? getCategoryIcon(topCat.cat.name) : PawPrint;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-5 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Gerenciamento</p>
            <div className="flex items-center gap-2">
              <LayoutGrid size={22} className="text-white/80" />
              <h1 className="text-2xl font-extrabold text-white">Categorias de Pets</h1>
            </div>
            <p className="mt-0.5 text-sm text-white/70">Organize e gerencie os tipos de pet atendidos</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setError(""); }}
            className="flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold transition"
            style={{ background: showForm ? "rgba(255,255,255,0.15)" : AMBER, color: showForm ? "#fff" : COAL, borderRadius: "6px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nova categoria</>}
          </button>
        </div>

        {/* Stats chips */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-3">
          {[
            { val: categorias.length, label: "Categorias" },
            { val: totalPets,          label: "Pets totais" },
            { val: topCat?.count ?? 0, label: "Mais popular" },
          ].map((s, i) => (
            <div key={i} className="px-4 py-2 text-center"
              style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", minWidth: "80px" }}>
              <div className="text-lg font-extrabold text-white leading-none">{s.val}</div>
              <div className="mt-0.5 text-[10px] text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3 bg-white px-4 py-2.5"
        style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
        <span className="text-xs" style={{ color: MUTED }}>
          {loading ? "Carregando..." : `${categorias.length} categoria${categorias.length !== 1 ? "s" : ""} cadastrada${categorias.length !== 1 ? "s" : ""}`}
        </span>
        <div className="ml-auto">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "az" | "pets")}
            className="text-xs" style={{ border: `1px solid ${BORD}`, background: "#fff", padding: "4px 8px", borderRadius: "4px", color: "#555", outline: "none" }}>
            <option value="az">Ordenar: A–Z</option>
            <option value="pets">Mais pets</option>
          </select>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 px-4 py-2.5 text-sm"
          style={{ borderRadius: "6px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
          {feedback}
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
        <form onSubmit={handleCreate} className="mb-5 overflow-hidden bg-white p-5"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
          <div className="mb-4 flex items-center gap-2">
            <LayoutGrid size={15} style={{ color: TEAL }} />
            <h2 className="text-sm font-bold" style={{ color: COAL }}>Nova Categoria</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome <span className="text-red-400">*</span></label>
              <input minLength={2} required placeholder="Ex: Cão"
                value={nome} onChange={(e) => setNome(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Descrição</label>
              <input placeholder="Descrição opcional"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: TEAL, borderRadius: "6px" }}>
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      <EditModal isOpen={Boolean(catBeingEdited)} title="Editar Categoria" onClose={() => setCatBeingEdited(null)}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome <span className="text-red-400">*</span></label>
              <input minLength={2} required value={editNome} onChange={(e) => setEditNome(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Descrição</label>
              <input value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: TEAL, borderRadius: "6px" }}>Salvar</button>
            <button type="button" onClick={() => setCatBeingEdited(null)}
              className="px-5 py-2 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>Cancelar</button>
          </div>
        </form>
      </EditModal>

      {loading ? (
        <div className="p-10 text-center text-sm" style={{ color: MUTED }}>Carregando categorias...</div>
      ) : categorias.length === 0 ? (
        <div className="p-12 text-center" style={{ border: `2px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
          <PawPrint size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Nenhuma categoria cadastrada.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-bold transition hover:opacity-70" style={{ color: TEAL }}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Top category highlight */}
          {topCat && (
            <div className="relative flex flex-wrap items-center gap-5 overflow-hidden px-6 py-5"
              style={{ background: TEAL, borderRadius: "10px" }}>
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 right-24 h-20 w-20 rounded-full bg-white/10" />
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <TopIcon size={26} style={{ color: AMBER }} />
              </div>
              <div className="relative z-10 min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Categoria mais ativa</p>
                <p className="text-xl font-extrabold" style={{ color: AMBER }}>{topCat.cat.name}</p>
                <p className="mt-0.5 text-xs text-white/65">
                  {userName ? `${firstName(userName)}, ` : ""}
                  <strong>{topCat.count}</strong>{" "}
                  {topCat.count === 1 ? "pet cadastrado" : "pets cadastrados"} nesta categoria
                  {totalPets > topCat.count ? ` (${Math.round((topCat.count / totalPets) * 100)}% do total)` : ""}
                </p>
              </div>
              <div className="relative z-10 shrink-0 px-4 py-1.5 text-sm font-extrabold"
                style={{ background: AMBER, color: COAL, borderRadius: "20px" }}>
                #{topCat.cat.name}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((cat) => {
              const Icon  = getCategoryIcon(cat.name);
              const count = petCounts[cat.id] ?? 0;
              const pct   = totalPets > 0 ? Math.round((count / totalPets) * 100) : 0;
              const desc  = cat.description ? fixDescription(cat.description) : undefined;
              return (
                <article key={cat.id}
                  className="flex flex-col overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
                  <div className="flex-1 p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "#e6f5f5" }}>
                        <Icon size={22} style={{ color: TEAL }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold" style={{ color: COAL }}>{cat.name}</h3>
                          <span className="px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: "#e6f5f5", color: TDARK, borderRadius: "20px" }}>
                            {count} {count === 1 ? "pet" : "pets"}
                          </span>
                        </div>
                        {desc
                          ? <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: MUTED }}>{desc}</p>
                          : <p className="mt-0.5 text-xs italic" style={{ color: "#CBD5E1" }}>Sem descrição</p>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 overflow-hidden" style={{ height: "4px", background: "#F1F5F9", borderRadius: "3px" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: TEAL, borderRadius: "3px", transition: "width 0.3s" }} />
                      </div>
                      <span className="whitespace-nowrap text-[10px] font-medium" style={{ color: MUTED }}>{pct}% do total</span>
                    </div>
                  </div>
                  <div className="flex gap-2 px-4 pb-3 pt-2" style={{ borderTop: `1px solid ${BORD}` }}>
                    <button onClick={() => setCatBeingEdited(cat)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition hover:bg-[#e6f5f5]"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition hover:bg-red-50"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
