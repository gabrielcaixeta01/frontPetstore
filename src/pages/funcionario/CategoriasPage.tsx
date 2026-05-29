import { useEffect, useState } from "react";
import {
  PawPrint, ChevronRight, LayoutGrid,
  Dog, Cat, Bird, Rabbit, Fish, Turtle, Squirrel,
  type LucideIcon,
} from "lucide-react";
import { getCategories } from "../../services/categoriaService";
import type { Categoria } from "../../types/categoria";

const BLUE  = "#1A3CB8";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BORD  = "#E0E0E0";
const BG    = "#F4F4F4";
const MUTED = "#6B6B6B";

type ColorScheme = {
  stripe: string; iconBg: string; iconColor: string;
  badgeBg: string; badgeColor: string;
};
const COLORS: ColorScheme[] = [
  { stripe: BLUE,      iconBg: "rgba(26,60,184,0.10)",  iconColor: BLUE,     badgeBg: "#e8eeff", badgeColor: "#1A3CB8" },
  { stripe: "#7C3AED", iconBg: "rgba(124,58,237,0.10)", iconColor: "#7C3AED",badgeBg: "#f5f3ff", badgeColor: "#5B21B6" },
  { stripe: YELL,      iconBg: "rgba(245,168,0,0.15)",  iconColor: "#a06000",badgeBg: "#fff8e6", badgeColor: "#7a5000" },
  { stripe: GREEN,     iconBg: "rgba(0,166,81,0.10)",   iconColor: GREEN,    badgeBg: "#e6f4ed", badgeColor: "#005c2e" },
  { stripe: "#0EA5E9", iconBg: "rgba(14,165,233,0.10)", iconColor: "#0369A1",badgeBg: "#e0f2fe", badgeColor: "#0369A1" },
  { stripe: "#F43F5E", iconBg: "rgba(244,63,94,0.10)",  iconColor: "#C0392B",badgeBg: "#fde8e8", badgeColor: "#9b1c1c" },
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
    <div style={{ background: BG, minHeight: "100vh" }}>

      {/* ── Hero (full-width bg, constrained content) ── */}
      <div className="relative overflow-hidden" style={{ background: BLUE }}>
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">

          {/* Geo shapes */}
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
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Painel</span>
            <ChevronRight size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>Categorias</span>
          </div>

          {/* Title */}
          <div className="pb-1">
            <h1 className="flex items-center gap-2.5 text-2xl font-black text-white">
              <LayoutGrid size={22} style={{ color: YELL }} />
              Categorias <span style={{ color: YELL }}>de Pets</span>
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Tipos de pet atendidos pelo nosso petshop
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-5 flex">
            {[
              { val: categorias.length, label: "Categorias", active: true  },
              { val: "Veja abaixo",      label: "Tipos",      active: false },
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
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="p-10 text-center text-sm" style={{ color: MUTED }}>Carregando categorias...</div>
          ) : categorias.length === 0 ? (
            <div className="p-12 text-center" style={{ border: `2px dashed ${BORD}`, borderRadius: "8px", background: "#fff" }}>
              <PawPrint size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p className="text-sm" style={{ color: MUTED }}>Nenhuma categoria disponível no momento.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((cat, i) => {
                const color = getCategoryColor(cat.name, i);
                const Icon  = getCategoryIcon(cat.name);
                const desc  = cat.description ? fixDescription(cat.description) : undefined;
                return (
                  <article key={cat.id}
                    className="flex flex-col overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
                    <div style={{ height: "4px", background: color.stripe }} />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center"
                          style={{ background: color.iconBg, borderRadius: "10px" }}>
                          <Icon size={22} style={{ color: color.iconColor }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold" style={{ color: "#1a1a1a" }}>{cat.name}</h3>
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
      </div>
    </div>
  );
}
