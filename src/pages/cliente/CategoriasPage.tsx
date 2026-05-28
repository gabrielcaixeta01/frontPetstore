import { useEffect, useState } from "react";
import {
  PawPrint, Dog, Cat, Bird, Rabbit, Fish, Turtle, Squirrel,
  type LucideIcon,
} from "lucide-react";
import { getCategories } from "../../services/categoriaService";
import type { Categoria } from "../../types/categoria";

type ColorScheme = {
  strip: string;
  iconBg: string;
  iconText: string;
  countBg: string;
  countText: string;
};

const SCHEMES: ColorScheme[] = [
  { strip: "bg-blue-400",    iconBg: "bg-blue-100",    iconText: "text-blue-600",    countBg: "bg-blue-50",    countText: "text-blue-600"    },
  { strip: "bg-violet-400",  iconBg: "bg-violet-100",  iconText: "text-violet-600",  countBg: "bg-violet-50",  countText: "text-violet-600"  },
  { strip: "bg-amber-400",   iconBg: "bg-amber-100",   iconText: "text-amber-600",   countBg: "bg-amber-50",   countText: "text-amber-600"   },
  { strip: "bg-emerald-400", iconBg: "bg-emerald-100", iconText: "text-emerald-600", countBg: "bg-emerald-50", countText: "text-emerald-600" },
  { strip: "bg-cyan-400",    iconBg: "bg-cyan-100",    iconText: "text-cyan-600",    countBg: "bg-cyan-50",    countText: "text-cyan-600"    },
  { strip: "bg-rose-400",    iconBg: "bg-rose-100",    iconText: "text-rose-600",    countBg: "bg-rose-50",    countText: "text-rose-600"    },
];

function strip(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function fixDescription(text: string): string {
  const map: [RegExp, string][] = [
    [/\bcaes\b/gi,     "cães"],
    [/\bcao\b/gi,      "cão"],
    [/domesticas\b/gi, "domésticas"],
    [/domestica\b/gi,  "doméstica"],
    [/domesticos\b/gi, "domésticos"],
    [/domestico\b/gi,  "doméstico"],
    [/passaros\b/gi,   "pássaros"],
    [/passaro\b/gi,    "pássaro"],
  ];
  let result = text;
  map.forEach(([re, rep]) => { result = result.replace(re, rep); });
  return result;
}

function getCategoryIcon(name: string): LucideIcon {
  const n = strip(name);
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
  const n = strip(name);
  if (/cao|canis|canin|cachorro/.test(n)) return SCHEMES[0];
  if (/gat|felin/.test(n))                return SCHEMES[1];
  if (/ave|bird|pass[ao]/.test(n))        return SCHEMES[2];
  if (/roedor|hamster|rato|coelh/.test(n))return SCHEMES[3];
  if (/peix/.test(n))                     return SCHEMES[4];
  if (/tartaruga|reptil/.test(n))         return SCHEMES[5];
  return SCHEMES[index % SCHEMES.length];
}

export default function ClienteCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tipos de pet atendidos pelo nosso petshop.</p>
        </div>
        {!loading && categorias.length > 0 && (
          <span className="mb-0.5 text-sm font-medium text-gray-400">
            {categorias.length} {categorias.length === 1 ? "categoria" : "categorias"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando categorias...
        </div>
      ) : categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <PawPrint size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhuma categoria disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((cat, i) => {
            const color = getCategoryColor(cat.name, i);
            const Icon = getCategoryIcon(cat.name);
            const desc = cat.description ? fixDescription(cat.description) : undefined;
            return (
              <div
                key={cat.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${color.strip}`} />
                <div className="flex items-start gap-3 p-5 pt-6">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color.iconBg}`}>
                    <Icon size={20} className={color.iconText} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    {desc ? (
                      <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{desc}</p>
                    ) : (
                      <p className="mt-1 text-xs italic text-gray-300">Sem descrição</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
