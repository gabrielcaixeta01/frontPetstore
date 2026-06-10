import { useEffect, useState } from "react";
import {
  PawPrint, LayoutGrid,
  Dog, Cat, Bird, Rabbit, Fish, Turtle, Squirrel,
  type LucideIcon,
} from "lucide-react";
import { getCategories } from "../../services/categoriaService";
import type { Categoria } from "../../types/categoria";

const TEAL  = "#0D7377";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

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

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

export default function FuncionarioCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sortBy, setSortBy]         = useState<"az" | "az-desc">("az");

  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...categorias].sort((a, b) =>
    sortBy === "az" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-5 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Painel</p>
          <div className="flex items-center gap-2">
            <LayoutGrid size={22} className="text-white/80" />
            <h1 className="text-2xl font-extrabold text-white">Categorias de Pets</h1>
          </div>
          <p className="mt-0.5 text-sm text-white/70">Tipos de pet atendidos pelo Pet Club</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="px-4 py-2 text-center"
              style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", minWidth: "80px" }}>
              <div className="text-lg font-extrabold text-white leading-none">{categorias.length}</div>
              <div className="mt-0.5 text-[10px] text-white/60">Categorias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3 bg-white px-4 py-2.5"
        style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
        <span className="text-xs" style={{ color: MUTED }}>
          {loading ? "Carregando..." : `${categorias.length} categoria${categorias.length !== 1 ? "s" : ""}`}
        </span>
        <div className="ml-auto">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "az" | "az-desc")}
            className="text-xs" style={{ border: `1px solid ${BORD}`, background: "#fff", padding: "4px 8px", borderRadius: "4px", color: "#555", outline: "none" }}>
            <option value="az">Ordenar: A–Z</option>
            <option value="az-desc">Ordenar: Z–A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm" style={{ color: MUTED }}>Carregando categorias...</div>
      ) : categorias.length === 0 ? (
        <div className="p-12 text-center" style={{ border: `2px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
          <PawPrint size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Nenhuma categoria disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const desc = cat.description ? fixDescription(cat.description) : undefined;
            return (
              <article key={cat.id}
                className="overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "#e6f5f5" }}>
                      <Icon size={22} style={{ color: TEAL }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold" style={{ color: COAL }}>{cat.name}</h3>
                      {desc
                        ? <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                        : <p className="mt-0.5 text-xs italic" style={{ color: "#CBD5E1" }}>Sem descrição</p>
                      }
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
