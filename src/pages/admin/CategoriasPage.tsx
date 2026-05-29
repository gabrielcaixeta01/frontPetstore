import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Pencil, Trash2, PawPrint,
  Dog, Cat, Bird, Rabbit, Fish, Turtle, Squirrel,
  type LucideIcon,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CreateCategoriaDTO,
  type UpdateCategoriaDTO,
} from "../../services/categoriaService";
import { getPets } from "../../services/petService";
import type { Categoria } from "../../types/categoria";

const BLUE  = "#1A3CB8";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: `1px solid ${BORD}`,
  borderRadius: "4px",
  background: "#fff",
  outline: "none",
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
  iconBg: string;
  iconText: string;
  accent: string;
  bannerBg: string;
  bannerText: string;
  bannerBorder: string;
};

const COLORS: ColorScheme[] = [
  { iconBg: "bg-blue-100",    iconText: "text-blue-600",    accent: "#3B82F6", bannerBg: "bg-blue-50",    bannerText: "text-blue-800",    bannerBorder: "border-blue-200"    },
  { iconBg: "bg-violet-100",  iconText: "text-violet-600",  accent: "#7C3AED", bannerBg: "bg-violet-50",  bannerText: "text-violet-800",  bannerBorder: "border-violet-200"  },
  { iconBg: "bg-amber-100",   iconText: "text-amber-600",   accent: "#F59E0B", bannerBg: "bg-amber-50",   bannerText: "text-amber-800",   bannerBorder: "border-amber-200"   },
  { iconBg: "bg-emerald-100", iconText: "text-emerald-600", accent: "#00A651", bannerBg: "bg-emerald-50", bannerText: "text-emerald-800", bannerBorder: "border-emerald-200" },
  { iconBg: "bg-cyan-100",    iconText: "text-cyan-600",    accent: "#06B6D4", bannerBg: "bg-cyan-50",    bannerText: "text-cyan-800",    bannerBorder: "border-cyan-200"    },
  { iconBg: "bg-rose-100",    iconText: "text-rose-600",    accent: "#F43F5E", bannerBg: "bg-rose-50",    bannerText: "text-rose-800",    bannerBorder: "border-rose-200"    },
];

function stripAccents(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function fixDescription(text: string): string {
  const map: [RegExp, string][] = [
    [/\bcaes\b/gi,          "cães"],
    [/\bcao\b/gi,           "cão"],
    [/domesticas\b/gi,      "domésticas"],
    [/domestica\b/gi,       "doméstica"],
    [/domesticos\b/gi,      "domésticos"],
    [/domestico\b/gi,       "doméstico"],
    [/passaros\b/gi,        "pássaros"],
    [/passaro\b/gi,         "pássaro"],
  ];
  let result = text;
  map.forEach(([re, rep]) => { result = result.replace(re, rep); });
  return result;
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
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.name ?? "";
  } catch { return ""; }
}

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const axiosError = error as { response?: { status?: number; data?: unknown } };
  if (axiosError.response?.status === 422)
    return "Nome da categoria inválido. Use pelo menos 2 caracteres.";
  const data = axiosError.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }
  return fallback;
}

export default function CategoriasPage() {
  const [categorias, setCategorias]               = useState<Categoria[]>([]);
  const [petCounts, setPetCounts]                 = useState<Record<number, number>>({});
  const [categoriaBeingEdited, setCategoriaBeingEdited] = useState<Categoria | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [showForm, setShowForm]                   = useState(false);
  const [feedback, setFeedback]                   = useState("");
  const [error, setError]                         = useState("");
  const [nome, setNome]                           = useState("");
  const [descricao, setDescricao]                 = useState("");
  const [editNome, setEditNome]                   = useState("");
  const [editDescricao, setEditDescricao]         = useState("");

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
    if (!categoriaBeingEdited) { setEditNome(""); setEditDescricao(""); return; }
    setEditNome(categoriaBeingEdited.name);
    setEditDescricao(categoriaBeingEdited.description ?? "");
  }, [categoriaBeingEdited]);

  const topCat = useMemo((): { cat: Categoria; count: number } | null => {
    if (categorias.length === 0) return null;
    let best: Categoria | null = null;
    let bestCount = 0;
    categorias.forEach((cat) => {
      const count = petCounts[cat.id] ?? 0;
      if (count > bestCount) { best = cat; bestCount = count; }
    });
    return best && bestCount > 0 ? { cat: best, count: bestCount } : null;
  }, [categorias, petCounts]);

  const topCatIdx   = topCat ? categorias.findIndex((c) => c.id === topCat.cat.id) : -1;
  const topCatColor = topCat ? getCategoryColor(topCat.cat.name, topCatIdx) : COLORS[0];
  const TopCatIcon  = topCat ? getCategoryIcon(topCat.cat.name) : PawPrint;
  const totalPets   = Object.values(petCounts).reduce((a, b) => a + b, 0);

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNome = nome.trim();
    if (normalizedNome.length < 2) { setError("O nome da categoria deve ter no mínimo 2 caracteres."); return; }
    try {
      const payload: CreateCategoriaDTO = { name: normalizedNome, description: descricao.trim() || undefined };
      await createCategory(payload);
      setFeedback("Categoria cadastrada com sucesso.");
      setNome(""); setDescricao(""); setShowForm(false);
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao cadastrar categoria.")); }
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoriaBeingEdited) return;
    const normalizedNome = editNome.trim();
    if (normalizedNome.length < 2) { setError("O nome da categoria deve ter no mínimo 2 caracteres."); return; }
    try {
      const payload: UpdateCategoriaDTO = { name: normalizedNome, description: editDescricao.trim() };
      await updateCategory(categoriaBeingEdited.id, payload);
      setFeedback("Categoria atualizada.");
      setCategoriaBeingEdited(null);
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao atualizar categoria.")); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Excluir esta categoria?")) return;
    try {
      await deleteCategory(id);
      setFeedback("Categoria excluída.");
      if (categoriaBeingEdited?.id === id) setCategoriaBeingEdited(null);
      await loadData();
    } catch { setError("Erro ao excluir categoria."); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
            Gerenciamento
          </span>
          <h1 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Categorias</h1>
          <p className="mt-0.5 text-sm" style={{ color: MUTED }}>Organize os tipos de pet por categoria.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setError(""); }}
          className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: showForm ? MUTED : BLUE, borderRadius: "4px" }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nova categoria"}</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 px-4 py-3 text-sm font-medium"
          style={{ borderRadius: "4px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
          {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 text-sm font-medium"
          style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="mb-6 bg-white p-6 shadow-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: "#1a1a1a" }}>Nova Categoria</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
              <input
                minLength={2} required placeholder="Ex: Cão"
                value={nome} onChange={(e) => setNome(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Descrição</label>
              <input
                placeholder="Descrição opcional"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
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
      <EditModal isOpen={Boolean(categoriaBeingEdited)} title="Editar Categoria" onClose={() => setCategoriaBeingEdited(null)}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
              <input
                minLength={2} required
                value={editNome} onChange={(e) => setEditNome(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Descrição</label>
              <input
                value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: BLUE, borderRadius: "4px" }}>
              Salvar
            </button>
            <button type="button" onClick={() => setCategoriaBeingEdited(null)}
              className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
              Cancelar
            </button>
          </div>
        </form>
      </EditModal>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
          Carregando categorias...
        </div>
      ) : categorias.length === 0 ? (
        <div className="p-12 text-center"
          style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff" }}>
          <PawPrint size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Nenhuma categoria cadastrada.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-bold transition hover:opacity-70"
            style={{ color: BLUE }}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <>
          {/* Highlight banner */}
          {topCat && (
            <div className={`mb-6 flex items-center gap-4 border p-5 ${topCatColor.bannerBorder} ${topCatColor.bannerBg}`}
              style={{ borderRadius: "8px" }}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center ${topCatColor.iconBg}`}
                style={{ borderRadius: "8px" }}>
                <TopCatIcon size={22} className={topCatColor.iconText} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${topCatColor.iconText}`}>
                  Categoria mais ativa
                </p>
                <p className={`text-lg font-extrabold leading-tight ${topCatColor.bannerText}`}>
                  {topCat.cat.name}
                </p>
                <p className="text-sm" style={{ color: MUTED }}>
                  {userName ? `${firstName(userName)}, ` : ""}
                  <strong>{topCat.count}</strong>{" "}
                  {topCat.count === 1 ? "pet cadastrado" : "pets cadastrados"} nesta categoria
                  {totalPets > topCat.count ? ` (de ${totalPets} no total)` : ""}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((cat, i) => {
              const color = getCategoryColor(cat.name, i);
              const Icon  = getCategoryIcon(cat.name);
              const count = petCounts[cat.id] ?? 0;
              const desc  = cat.description ? fixDescription(cat.description) : undefined;
              return (
                <div
                  key={cat.id}
                  className="relative flex flex-col gap-3 overflow-hidden bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}
                >
                  {/* Colored accent bar */}
                  <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color.accent }} />

                  <div className="flex items-start gap-3 pt-1">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${color.iconBg}`}
                      style={{ borderRadius: "8px" }}>
                      <Icon size={18} className={color.iconText} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold" style={{ color: "#1a1a1a" }}>{cat.name}</h3>
                        {count > 0 && (
                          <span className={`px-2 py-0.5 text-xs font-semibold ${color.iconBg} ${color.iconText}`}
                            style={{ borderRadius: "20px" }}>
                            {count} {count === 1 ? "pet" : "pets"}
                          </span>
                        )}
                      </div>
                      {desc
                        ? <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: MUTED }}>{desc}</p>
                        : <p className="mt-0.5 text-xs italic" style={{ color: "#CBD5E1" }}>Sem descrição</p>
                      }
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3" style={{ borderTop: `1px solid ${BORD}` }}>
                    <button onClick={() => setCategoriaBeingEdited(cat)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition hover:bg-gray-50"
                      style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition hover:bg-red-50"
                      style={{ border: "1px solid #FECACA", borderRadius: "4px", color: "#EF4444" }}>
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
