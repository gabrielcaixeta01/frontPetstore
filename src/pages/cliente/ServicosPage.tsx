import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Scissors, Droplets, Stethoscope, Shield, Star, Home, Sparkles,
  CalendarPlus, type LucideIcon,
} from "lucide-react";
import { getServicos } from "../../services/servicoService";
import type { Servico } from "../../types/servico";

function strip(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function fixAccents(nome: string): string {
  const map: [RegExp, string][] = [
    [/vacinac[aã]o/gi, "Vacinação"],
    [/castrac[aã]o/gi, "Castração"],
    [/hidratac[aã]o/gi, "Hidratação"],
    [/adestramento b[aá]sico/gi, "Adestramento Básico"],
    [/consulta m[eé]dica/gi, "Consulta Médica"],
  ];
  let r = nome;
  map.forEach(([re, rep]) => { r = r.replace(re, rep); });
  return r;
}

type ServiceCat = "todos" | "higiene" | "estetica" | "saude" | "comportamento" | "outros";

const CATS: { id: ServiceCat; label: string }[] = [
  { id: "todos",        label: "Todos" },
  { id: "higiene",      label: "Banho & Higiene" },
  { id: "estetica",     label: "Estética" },
  { id: "saude",        label: "Saúde" },
  { id: "comportamento",label: "Comportamento" },
  { id: "outros",       label: "Outros" },
];

function getCat(nome: string): Exclude<ServiceCat, "todos"> {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat|dental|dente/.test(n))            return "higiene";
  if (/tosa|corte|pelos|unhas|estetica|grooming/.test(n))            return "estetica";
  if (/vacin|vermifug|castrac|cirurgi|consult|exame|fisio|veterinar/.test(n)) return "saude";
  if (/adestramento|treino|comportamento|socializac/.test(n))         return "comportamento";
  return "outros";
}

function getIcon(nome: string): LucideIcon {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat/.test(n)) return Droplets;
  if (/tosa|corte|pelos|unhas/.test(n))      return Scissors;
  if (/vacin|vermifug|castrac|cirurgi/.test(n)) return Shield;
  if (/consult|exame|fisio|veterinar/.test(n)) return Stethoscope;
  if (/adestramento|treino|comportamento/.test(n)) return Star;
  if (/hospedagem|hotel|creche/.test(n))     return Home;
  return Sparkles;
}

function getColor(nome: string): { bg: string; icon: string; accent: string } {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat/.test(n)) return { bg: "bg-blue-100",    icon: "text-blue-600",    accent: "from-blue-500 to-blue-400" };
  if (/tosa|corte|pelos|unhas/.test(n))      return { bg: "bg-purple-100",  icon: "text-purple-600",  accent: "from-purple-500 to-purple-400" };
  if (/vacin|vermifug|castrac|cirurgi/.test(n)) return { bg: "bg-red-100",  icon: "text-red-500",    accent: "from-red-500 to-red-400" };
  if (/consult|exame|fisio|veterinar/.test(n)) return { bg: "bg-emerald-100", icon: "text-emerald-600", accent: "from-emerald-500 to-emerald-400" };
  if (/adestramento|treino|comportamento/.test(n)) return { bg: "bg-orange-100", icon: "text-orange-500", accent: "from-orange-500 to-orange-400" };
  if (/hospedagem|hotel|creche/.test(n))     return { bg: "bg-indigo-100",  icon: "text-indigo-600",  accent: "from-indigo-500 to-indigo-400" };
  return { bg: "bg-[#1c46f3]/10", icon: "text-[#1c46f3]", accent: "from-[#1c46f3] to-[#00bb69]" };
}

function isPopular(nome: string): boolean {
  return /banho|tosa|consulta|vacina/i.test(strip(nome));
}

export default function ClienteServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<ServiceCat>("todos");

  useEffect(() => {
    getServicos()
      .then(setServicos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const servicosFiltrados = useMemo(() =>
    catFilter === "todos" ? servicos : servicos.filter((s) => getCat(s.nome) === catFilter),
    [servicos, catFilter]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <p className="mt-0.5 text-sm text-gray-500">Conheça todos os serviços que oferecemos para o seu pet.</p>
      </div>

      {/* Category filter */}
      {!loading && servicos.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {CATS.map((cat) => {
            const count = cat.id === "todos"
              ? servicos.length
              : servicos.filter((s) => getCat(s.nome) === cat.id).length;
            if (count === 0 && cat.id !== "todos") return null;
            return (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                  catFilter === cat.id
                    ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {cat.label}
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${catFilter === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando serviços...
        </div>
      ) : servicos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Sparkles size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum serviço disponível no momento.</p>
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Nenhum serviço nesta categoria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicosFiltrados.map((s) => {
            const Icon  = getIcon(s.nome);
            const col   = getColor(s.nome);
            const popular = isPopular(s.nome);
            return (
              <div
                key={s.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#1c46f3]/25 hover:shadow-md"
              >
                {/* Accent bar — cor por categoria */}
                <div className={`h-1 bg-gradient-to-r ${col.accent}`} />

                <div className="flex flex-1 flex-col p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${col.bg}`}>
                      <Icon size={16} className={col.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold leading-snug text-gray-900">
                          {fixAccents(s.nome)}
                        </h3>
                        {popular && (
                          <span className="shrink-0 rounded-full bg-[#ffd200]/20 px-2 py-0.5 text-xs font-bold text-yellow-700">
                            ⭐ Popular
                          </span>
                        )}
                      </div>
                      {s.descricao && (
                        <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">
                          {s.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                    <div>
                      <p className="text-xs text-gray-400">Preço</p>
                      <p className="text-base font-bold text-gray-900">
                        R$ {Number(s.preco).toFixed(2)}
                      </p>
                    </div>
                    <Link
                      to="/atendimentos"
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
                    >
                      <CalendarPlus size={13} />
                      Agendar
                    </Link>
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
