import { useEffect, useMemo, useState } from "react";
import {
  Scissors, Plus, X,
  Droplets, Stethoscope, Shield, Star, Home, Sparkles, LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { createServico, getServicos } from "../../services/servicoService";
import type { CreateServicoDTO, Servico } from "../../types/servico";

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

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
    [/c[aâ]es/gi, "cães"],
  ];
  let result = nome;
  map.forEach(([re, rep]) => { result = result.replace(re, rep); });
  return result;
}

type ServiceCat = "todos" | "higiene" | "estetica" | "saude" | "comportamento" | "outros";

const CATS: { id: ServiceCat; label: string; icon: LucideIcon }[] = [
  { id: "todos",         label: "Todos",          icon: LayoutGrid  },
  { id: "higiene",       label: "Banho & Higiene", icon: Droplets    },
  { id: "estetica",      label: "Estética",        icon: Scissors    },
  { id: "saude",         label: "Saúde",           icon: Stethoscope },
  { id: "comportamento", label: "Comportamento",   icon: Star        },
  { id: "outros",        label: "Outros",          icon: Sparkles    },
];

function getCat(nome: string): Exclude<ServiceCat, "todos"> {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat|dental|dente/.test(n))  return "higiene";
  if (/tosa|corte|pelos|unhas|estetica|grooming/.test(n))  return "estetica";
  if (/vacin|vermifug|castrac|cirurgi|consult|exame|fisio|veterinar/.test(n)) return "saude";
  if (/adestramento|treino|comportamento|socializac/.test(n)) return "comportamento";
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

function getColor(nome: string): { bg: string; icon: string } {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat/.test(n)) return { bg: "bg-blue-100",    icon: "text-blue-600" };
  if (/tosa|corte|pelos|unhas/.test(n))      return { bg: "bg-purple-100",  icon: "text-purple-600" };
  if (/vacin|vermifug|castrac|cirurgi/.test(n)) return { bg: "bg-red-100",  icon: "text-red-500" };
  if (/consult|exame|fisio|veterinar/.test(n)) return { bg: "bg-emerald-100", icon: "text-emerald-600" };
  if (/adestramento|treino|comportamento/.test(n)) return { bg: "bg-orange-100", icon: "text-orange-500" };
  if (/hospedagem|hotel|creche/.test(n))     return { bg: "bg-indigo-100",  icon: "text-indigo-600" };
  return { bg: "bg-[#1c46f3]/10", icon: "text-[#1c46f3]" };
}

function getCatColor(id: ServiceCat) {
  switch (id) {
    case "higiene":       return { active: "bg-blue-500",    ring: "ring-blue-200" };
    case "estetica":      return { active: "bg-purple-500",  ring: "ring-purple-200" };
    case "saude":         return { active: "bg-emerald-500", ring: "ring-emerald-200" };
    case "comportamento": return { active: "bg-orange-500",  ring: "ring-orange-200" };
    case "outros":        return { active: "bg-gray-500",    ring: "ring-gray-200" };
    default:              return { active: "bg-[#1c46f3]",   ring: "ring-[#1c46f3]/20" };
  }
}

function sanitizePriceInput(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
  const [integerPart = "", decimalPart = ""] = cleaned.split(".");
  const limitedInteger = integerPart.slice(0, 5);
  if (decimalPart.length === 0) return limitedInteger;
  return `${limitedInteger}.${decimalPart.slice(0, 2)}`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const axiosError = error as { response?: { status?: number; data?: unknown } };
  if (axiosError.response?.status === 422) return "Nome do serviço inválido. Use pelo menos 2 caracteres.";
  const data = axiosError.response?.data as { detail?: unknown } | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }
  return fallback;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [catFilter, setCatFilter] = useState<ServiceCat>("todos");

  const servicosFiltrados = useMemo(() =>
    catFilter === "todos"
      ? servicos
      : servicos.filter((s) => getCat(s.nome) === catFilter),
    [servicos, catFilter]
  );

  async function loadServicos() {
    setLoading(true);
    try { setServicos(await getServicos()); setError(""); }
    catch { setError("Erro ao carregar serviços."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadServicos(); }, []);

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNome = nome.trim();
    if (normalizedNome.length < 2) { setError("O nome do serviço deve ter no mínimo 2 caracteres."); return; }
    if (!preco.trim() || Number.isNaN(Number(preco))) { setError("Informe um preço válido."); return; }
    try {
      const payload: CreateServicoDTO = { nome: normalizedNome, descricao: descricao.trim() || undefined, preco: Number(preco) };
      await createServico(payload);
      setFeedback("Serviço cadastrado com sucesso.");
      setNome(""); setDescricao(""); setPreco(""); setShowForm(false);
      await loadServicos();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao cadastrar serviço.")); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="mt-0.5 text-sm text-gray-500">Catálogo de serviços com descrição e preço.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setPreco(""); setError(""); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo serviço"}</span>
        </button>
      </div>

      {feedback && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreateSubmit} className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Novo Serviço</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} placeholder="Ex: Banho e Tosa" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">Descrição</label>
              <input className={inputCls} placeholder="Descrição opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Preço (R$) *</label>
              <input
                type="text"
                inputMode="decimal"
                maxLength={10}
                className={inputCls}
                placeholder="0,00"
                value={preco}
                onChange={(e) => setPreco(sanitizePriceInput(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      {/* Category filter */}
      {!loading && servicos.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex overflow-x-auto">
            {CATS.map((cat) => {
              const count = cat.id === "todos"
                ? servicos.length
                : servicos.filter((s) => getCat(s.nome) === cat.id).length;
              if (count === 0 && cat.id !== "todos") return null;
              const CatIcon = cat.icon;
              const isActive = catFilter === cat.id;
              const { active, ring } = getCatColor(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setCatFilter(cat.id)}
                  className={`group relative flex flex-1 shrink-0 flex-col items-center gap-1 px-3 py-3.5 transition sm:flex-row sm:justify-center sm:gap-2 sm:px-5 sm:py-4 ${
                    isActive
                      ? `${active} text-white ring-inset ring-1 ${ring}`
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <CatIcon
                    size={15}
                    className={isActive ? "text-white/90 shrink-0" : "shrink-0 text-gray-400 group-hover:text-gray-500"}
                  />
                  <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">{cat.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold leading-none tabular-nums ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">Carregando serviços...</div>
      ) : servicos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Sparkles size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum serviço cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">Criar primeiro serviço</button>
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Nenhum serviço nesta categoria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicosFiltrados.map((s) => {
            const Icon = getIcon(s.nome);
            const col  = getColor(s.nome);
            return (
              <div key={s.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#1c46f3]/25 hover:shadow-md">
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${col.bg}`}>
                      <Icon size={16} className={col.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug text-gray-900">{fixAccents(s.nome)}</h3>
                      {s.descricao && (
                        <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">{s.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-50 pt-3">
                    <p className="text-xs text-gray-400">Preço</p>
                    <p className="text-base font-bold text-gray-900">R$ {Number(s.preco).toFixed(2)}</p>
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
