import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Pencil, Trash2, PawPrint, ChevronRight, LayoutGrid,
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

const BLUE  = "#1A3CB8";
const BDARK = "#0D2580";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BORD  = "#E0E0E0";
const BG    = "#F4F4F4";
const MUTED = "#6B6B6B";

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "8px 12px", fontSize: "14px",
  border: `1px solid ${BORD}`, borderRadius: "4px",
  background: "#fff", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BLUE;
  e.target.style.boxShadow = "0 0 0 3px rgba(26,60,184,0.10)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow = "none";
}

type ColorScheme = {
  stripe: string; iconBg: string; iconColor: string;
  badgeBg: string; badgeColor: string;
  bannerBg: string; bannerText: string; bannerBorder: string;
};
const COLORS: ColorScheme[] = [
  { stripe: BLUE,      iconBg: "rgba(26,60,184,0.10)",  iconColor: BLUE,     badgeBg: "#e8eeff", badgeColor: "#1A3CB8", bannerBg: "bg-blue-50",    bannerText: "text-blue-900",    bannerBorder: "border-blue-200"    },
  { stripe: "#7C3AED", iconBg: "rgba(124,58,237,0.10)", iconColor: "#7C3AED",badgeBg: "#f5f3ff", badgeColor: "#5B21B6", bannerBg: "bg-violet-50",  bannerText: "text-violet-900",  bannerBorder: "border-violet-200"  },
  { stripe: YELL,      iconBg: "rgba(245,168,0,0.15)",  iconColor: "#a06000",badgeBg: "#fff8e6", badgeColor: "#7a5000", bannerBg: "bg-amber-50",   bannerText: "text-amber-900",   bannerBorder: "border-amber-200"   },
  { stripe: GREEN,     iconBg: "rgba(0,166,81,0.10)",   iconColor: GREEN,    badgeBg: "#e6f4ed", badgeColor: "#005c2e", bannerBg: "bg-emerald-50", bannerText: "text-emerald-900", bannerBorder: "border-emerald-200" },
  { stripe: "#0EA5E9", iconBg: "rgba(14,165,233,0.10)", iconColor: "#0369A1",badgeBg: "#e0f2fe", badgeColor: "#0369A1", bannerBg: "bg-cyan-50",    bannerText: "text-cyan-900",    bannerBorder: "border-cyan-200"    },
  { stripe: "#F43F5E", iconBg: "rgba(244,63,94,0.10)",  iconColor: "#C0392B",badgeBg: "#fde8e8", badgeColor: "#9b1c1c", bannerBg: "bg-rose-50",    bannerText: "text-rose-900",    bannerBorder: "border-rose-200"    },
];

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
function getCategoryColor(name: string, index: number): ColorScheme {
  const n = stripAccents(name);
  if (/cao|canis|canin|cachorro/.test(n)) return COLORS[0];
  if (/gat|felin/.test(n))                return COLORS[1];
  if (/ave|bird|pass[ao]/.test(n))        return COLORS[2];
  if (/roedor|hamster|rato|coelh/.test(n)) return COLORS[3];
  if (/peix/.test(n))                     return COLORS[4];
  if (/tartaruga|reptil/.test(n))         return COLORS[5];
  return COLORS[index % COLORS.length];
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

  const topCat = useMemo((): { cat: Categoria; count: number; idx: number } | null => {
    if (categorias.length === 0) return null;
    let best: Categoria | null = null; let bestCount = 0; let bestIdx = 0;
    categorias.forEach((cat, i) => {
      const count = petCounts[cat.id] ?? 0;
      if (count > bestCount) { best = cat; bestCount = count; bestIdx = i; }
    });
    return best && bestCount > 0 ? { cat: best, count: bestCount, idx: bestIdx } : null;
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

  const TopIcon  = topCat ? getCategoryIcon(topCat.cat.name) : PawPrint;

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>

      {/* ── Hero (full-width bg, constrained content) ── */}
      <div className="relative overflow-hidden" style={{ background: BLUE }}>
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">

          {/* Geo shapes — absolute to hero, not content container */}
          <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 lg:flex"
            style={{ opacity: 0.65 }} aria-hidden="true">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-3 w-3 rotate-45" style={{ background: YELL, borderRadius: "2px" }} />
              <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: GREEN }} />
              <div className="h-2 w-2" style={{ background: GREEN }} />
            </div>
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <div style={{ width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:`14px solid ${YELL}` }} />
              <div className="h-6 w-6 bg-white/10" style={{ borderRadius: "3px" }} />
              <div className="h-4 w-4 rounded-full" style={{ background: GREEN }} />
            </div>
            <div className="-mt-2 flex flex-col items-center gap-1.5">
              <div className="h-4 w-4 rotate-45 border-2" style={{ borderColor: YELL, borderRadius: "2px" }} />
              <div className="h-8 w-8 rounded-full bg-white/10" />
              <div style={{ width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"10px solid rgba(255,255,255,0.3)" }} />
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Painel Administrativo</span>
            <ChevronRight size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>Categorias</span>
          </div>

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-1">
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-black text-white">
                <LayoutGrid size={22} style={{ color: YELL }} />
                Categorias <span style={{ color: YELL }}>de Pets</span>
              </h1>
              <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Organize e gerencie os tipos de pet atendidos
              </p>
            </div>
            <button
              onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setError(""); }}
              className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-extrabold transition hover:opacity-90"
              style={{ background: showForm ? "rgba(255,255,255,0.2)" : YELL, color: showForm ? "#fff" : BDARK, borderRadius: "4px" }}
            >
              {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nova categoria</>}
            </button>
          </div>

          {/* Stats strip */}
          <div className="mt-5 flex">
            {[
              { val: categorias.length, label: "Categorias",    active: true  },
              { val: totalPets,          label: "Pets totais",   active: false },
              { val: topCat?.count ?? 0, label: "Mais popular",  active: false },
            ].map((tab, i) => (
              <div key={i} className="mr-0.5 px-5 py-3"
                style={{
                  background: tab.active ? BG : "rgba(255,255,255,0.08)",
                  borderTop: `2px solid ${tab.active ? YELL : "transparent"}`,
                  borderRadius: "6px 6px 0 0",
                }}>
                <div className="text-lg font-black leading-none" style={{ color: tab.active ? BLUE : YELL }}>{tab.val}</div>
                <div className="mt-0.5 text-[10px]" style={{ color: tab.active ? MUTED : "rgba(255,255,255,0.6)" }}>{tab.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="sticky top-[52px] z-10 border-b bg-white md:top-0" style={{ borderColor: BORD }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
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
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-5">

          {/* Feedback */}
          {feedback && (
            <div className="px-4 py-3 text-sm font-medium"
              style={{ borderRadius: "4px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
              {feedback}
            </div>
          )}
          {error && (
            <div className="px-4 py-3 text-sm font-medium"
              style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-white p-5 shadow-sm"
              style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
              <h2 className="mb-4 text-sm font-bold" style={{ color: "#1a1a1a" }}>Nova Categoria</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
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
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: BLUE, borderRadius: "4px" }}>
                  <Plus size={14} /> Cadastrar
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                  style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
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
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
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
                  className="px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: BLUE, borderRadius: "4px" }}>Salvar</button>
                <button type="button" onClick={() => setCatBeingEdited(null)}
                  className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                  style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>Cancelar</button>
              </div>
            </form>
          </EditModal>

          {loading ? (
            <div className="p-10 text-center text-sm" style={{ color: MUTED }}>Carregando categorias...</div>
          ) : categorias.length === 0 ? (
            <div className="p-12 text-center" style={{ border: `2px dashed ${BORD}`, borderRadius: "8px", background: "#fff" }}>
              <PawPrint size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p className="text-sm" style={{ color: MUTED }}>Nenhuma categoria cadastrada.</p>
              <button onClick={() => setShowForm(true)}
                className="mt-2 text-sm font-bold transition hover:opacity-70" style={{ color: BLUE }}>
                Criar primeira categoria
              </button>
            </div>
          ) : (
            <>
              {/* Destaque */}
              {topCat && (
                <div className="relative flex flex-wrap items-center gap-5 overflow-hidden p-5"
                  style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BDARK} 100%)`, borderRadius: "8px" }}>
                  <svg className="pointer-events-none absolute right-0 top-0 bottom-0 h-full" viewBox="0 0 400 100"
                    preserveAspectRatio="xMaxYMid slice" aria-hidden="true" style={{ opacity: 0.5 }}>
                    <polygon points="340,5 375,65 305,65" fill={YELL} opacity=".5"/>
                    <circle cx="240" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="2"/>
                    <rect x="380" y="60" width="20" height="20" rx="3" fill={GREEN} opacity=".6" transform="rotate(20,390,70)"/>
                    <rect x="270" y="15" width="14" height="14" rx="2" fill="rgba(255,255,255,.15)" transform="rotate(45,277,22)"/>
                  </svg>
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px" }}>
                    <TopIcon size={26} style={{ color: YELL }} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Categoria mais ativa
                    </p>
                    <p className="text-xl font-black" style={{ color: YELL }}>{topCat.cat.name}</p>
                    <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {userName ? `${firstName(userName)}, ` : ""}
                      <strong>{topCat.count}</strong>{" "}
                      {topCat.count === 1 ? "pet cadastrado" : "pets cadastrados"} nesta categoria
                      {totalPets > topCat.count ? ` (${Math.round((topCat.count / totalPets) * 100)}% do total)` : ""}
                    </p>
                  </div>
                  <div className="relative z-10 shrink-0 px-4 py-1.5 text-sm font-extrabold"
                    style={{ background: YELL, color: BDARK, borderRadius: "20px" }}>
                    #{topCat.cat.name}
                  </div>
                </div>
              )}

              {/* Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((cat, i) => {
                  const realIdx = categorias.findIndex((c) => c.id === cat.id);
                  const color   = getCategoryColor(cat.name, realIdx >= 0 ? realIdx : i);
                  const Icon    = getCategoryIcon(cat.name);
                  const count   = petCounts[cat.id] ?? 0;
                  const pct     = totalPets > 0 ? Math.round((count / totalPets) * 100) : 0;
                  const desc    = cat.description ? fixDescription(cat.description) : undefined;
                  return (
                    <article key={cat.id}
                      className="flex flex-col overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
                      <div style={{ height: "4px", background: color.stripe }} />
                      <div className="flex-1 p-4">
                        <div className="mb-3 flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center"
                            style={{ background: color.iconBg, borderRadius: "10px" }}>
                            <Icon size={22} style={{ color: color.iconColor }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold" style={{ color: "#1a1a1a" }}>{cat.name}</h3>
                              <span className="px-2 py-0.5 text-[10px] font-bold"
                                style={{ background: color.badgeBg, color: color.badgeColor, borderRadius: "20px" }}>
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
                          <div className="flex-1 overflow-hidden" style={{ height: "5px", background: "#F0F0F0", borderRadius: "3px" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: color.stripe, borderRadius: "3px", transition: "width 0.3s" }} />
                          </div>
                          <span className="whitespace-nowrap text-[10px] font-medium" style={{ color: MUTED }}>{pct}% do total</span>
                        </div>
                      </div>
                      <div className="flex gap-2 px-4 pb-3 pt-2" style={{ borderTop: `1px solid ${BORD}` }}>
                        <button onClick={() => setCatBeingEdited(cat)}
                          className="flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition hover:bg-[#f0f3ff] hover:text-[#1A3CB8]"
                          style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: "#555" }}>
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => handleDelete(cat.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: "#888" }}>
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
