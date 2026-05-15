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

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

type ColorScheme = {
  iconBg: string;
  iconText: string;
  borderAccent: string;
  bannerBg: string;
  bannerText: string;
  bannerBorder: string;
};

const COLORS: ColorScheme[] = [
  { iconBg: "bg-blue-100",    iconText: "text-blue-600",    borderAccent: "border-l-blue-400",    bannerBg: "bg-blue-50",    bannerText: "text-blue-800",    bannerBorder: "border-blue-200"    },
  { iconBg: "bg-violet-100",  iconText: "text-violet-600",  borderAccent: "border-l-violet-400",  bannerBg: "bg-violet-50",  bannerText: "text-violet-800",  bannerBorder: "border-violet-200"  },
  { iconBg: "bg-amber-100",   iconText: "text-amber-600",   borderAccent: "border-l-amber-400",   bannerBg: "bg-amber-50",   bannerText: "text-amber-800",   bannerBorder: "border-amber-200"   },
  { iconBg: "bg-emerald-100", iconText: "text-emerald-600", borderAccent: "border-l-emerald-400", bannerBg: "bg-emerald-50", bannerText: "text-emerald-800", bannerBorder: "border-emerald-200" },
  { iconBg: "bg-cyan-100",    iconText: "text-cyan-600",    borderAccent: "border-l-cyan-400",    bannerBg: "bg-cyan-50",    bannerText: "text-cyan-800",    bannerBorder: "border-cyan-200"    },
  { iconBg: "bg-rose-100",    iconText: "text-rose-600",    borderAccent: "border-l-rose-400",    bannerBg: "bg-rose-50",    bannerText: "text-rose-800",    bannerBorder: "border-rose-200"    },
];

function strip(s: string) {
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
  const n = strip(name);
  if (/cao|canis|canin|cachorro/.test(n)) return Dog;
  if (/gat|felin/.test(n))                return Cat;
  if (/ave|bird|pass[ao]|papag|calopsi/.test(n)) return Bird;
  if (/coelh|rabbit/.test(n))             return Rabbit;
  if (/roedor|hamster|rato|camundongo/.test(n)) return Squirrel;
  if (/peix|fish/.test(n))               return Fish;
  if (/tartaruga|turtle/.test(n))        return Turtle;
  return PawPrint;
}

function getCategoryColor(name: string, index: number): ColorScheme {
  const n = strip(name);
  if (/cao|canis|canin|cachorro/.test(n)) return COLORS[0];
  if (/gat|felin/.test(n))                return COLORS[1];
  if (/ave|bird|pass[ao]/.test(n))         return COLORS[2];
  if (/roedor|hamster|rato|coelh/.test(n)) return COLORS[3];
  if (/peix/.test(n))                      return COLORS[4];
  if (/tartaruga|reptil/.test(n))          return COLORS[5];
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
  if (axiosError.response?.status === 422) {
    return "Nome da categoria inválido. Use pelo menos 2 caracteres.";
  }
  const data = axiosError.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }
  return fallback;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [petCounts, setPetCounts] = useState<Record<number, number>>({});
  const [categoriaBeingEdited, setCategoriaBeingEdited] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");

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

  const topCatIdx = topCat ? categorias.findIndex((c) => c.id === topCat.cat.id) : -1;
  const topCatColor = topCat ? getCategoryColor(topCat.cat.name, topCatIdx) : COLORS[0];
  const TopCatIcon = topCat ? getCategoryIcon(topCat.cat.name) : PawPrint;
  const totalPets = Object.values(petCounts).reduce((a, b) => a + b, 0);

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNome = nome.trim();
    if (normalizedNome.length < 2) {
      setError("O nome da categoria deve ter no mínimo 2 caracteres.");
      return;
    }
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
    if (normalizedNome.length < 2) {
      setError("O nome da categoria deve ter no mínimo 2 caracteres.");
      return;
    }
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-0.5 text-sm text-gray-500">Organize os tipos de pet por categoria.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setError(""); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nova categoria"}</span>
        </button>
      </div>

      {feedback && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Nova Categoria</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} placeholder="Ex: Cão" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Descrição</label>
              <input className={inputCls} placeholder="Descrição opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">
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
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Descrição</label>
              <input className={inputCls} value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">Salvar</button>
            <button type="button" onClick={() => setCategoriaBeingEdited(null)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </EditModal>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">Carregando categorias...</div>
      ) : categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <PawPrint size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">Criar primeira categoria</button>
        </div>
      ) : (
        <>
          {/* Personalized highlight banner */}
          {topCat && (
              <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${topCatColor.bannerBorder} ${topCatColor.bannerBg}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${topCatColor.iconBg}`}>
                  <TopCatIcon size={22} className={topCatColor.iconText} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${topCatColor.iconText}`}>Categoria mais ativa</p>
                  <p className={`text-lg font-bold leading-tight ${topCatColor.bannerText}`}>{topCat.cat.name}</p>
                  <p className="text-sm text-gray-500">
                    {userName ? `${firstName(userName)}, ` : ""}
                    <strong>{topCat.count}</strong> {topCat.count === 1 ? "pet cadastrado" : "pets cadastrados"} nesta categoria
                    {totalPets > topCat.count ? ` (de ${totalPets} no total)` : ""}
                  </p>
                </div>
              </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((cat, i) => {
              const color = getCategoryColor(cat.name, i);
              const Icon = getCategoryIcon(cat.name);
              const count = petCounts[cat.id] ?? 0;
              const desc = cat.description ? fixDescription(cat.description) : undefined;
              return (
                <div key={cat.id} className={`flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md border-l-4 ${color.borderAccent}`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.iconBg}`}>
                      <Icon size={18} className={color.iconText} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                        {count > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color.iconBg} ${color.iconText}`}>
                            {count} {count === 1 ? "pet" : "pets"}
                          </span>
                        )}
                      </div>
                      {desc && <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{desc}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-gray-50 pt-3">
                    <button onClick={() => setCategoriaBeingEdited(cat)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50">
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50">
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
