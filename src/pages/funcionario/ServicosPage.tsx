import { useEffect, useMemo, useState } from "react";
import {
  Scissors, Plus, X,
  Droplets, Stethoscope, Shield, Star, Home, Sparkles, LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { createServico, getServicos } from "../../services/servicoService";
import type { CreateServicoDTO, Servico } from "../../types/servico";

const BLUE  = "#1A3CB8";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BORD  = "#E0E0E0";
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

function strip(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function fixAccents(nome: string): string {
  const map: [RegExp, string][] = [
    [/vacinac[aã]o/gi, "Vacinação"], [/castrac[aã]o/gi, "Castração"],
    [/hidratac[aã]o/gi, "Hidratação"], [/adestramento b[aá]sico/gi, "Adestramento Básico"],
    [/consulta m[eé]dica/gi, "Consulta Médica"], [/c[aâ]es/gi, "cães"],
  ];
  let r = nome;
  map.forEach(([re, rep]) => { r = r.replace(re, rep); });
  return r;
}

type ServiceCat = "todos" | "higiene" | "estetica" | "saude" | "comportamento" | "outros";
const CATS: { id: ServiceCat; label: string; icon: LucideIcon }[] = [
  { id: "todos",         label: "Todos",           icon: LayoutGrid  },
  { id: "higiene",       label: "Banho & Higiene",  icon: Droplets    },
  { id: "estetica",      label: "Estética",         icon: Scissors    },
  { id: "saude",         label: "Saúde",            icon: Stethoscope },
  { id: "comportamento", label: "Comportamento",    icon: Star        },
  { id: "outros",        label: "Outros",           icon: Sparkles    },
];

function getCat(nome: string): Exclude<ServiceCat, "todos"> {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat|dental|dente/.test(n))                     return "higiene";
  if (/tosa|corte|pelos|unhas|estetica|grooming/.test(n))                     return "estetica";
  if (/vacin|vermifug|castrac|cirurgi|consult|exame|fisio|veterinar/.test(n)) return "saude";
  if (/adestramento|treino|comportamento|socializac/.test(n))                  return "comportamento";
  return "outros";
}
function getIcon(nome: string): LucideIcon {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat/.test(n))       return Droplets;
  if (/tosa|corte|pelos|unhas/.test(n))            return Scissors;
  if (/vacin|vermifug|castrac|cirurgi/.test(n))    return Shield;
  if (/consult|exame|fisio|veterinar/.test(n))     return Stethoscope;
  if (/adestramento|treino|comportamento/.test(n)) return Star;
  if (/hospedagem|hotel|creche/.test(n))           return Home;
  return Sparkles;
}
function getColor(nome: string): { bg: string; icon: string; accent: string } {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat/.test(n))       return { bg: "bg-blue-100",    icon: "text-blue-600",    accent: "#3B82F6" };
  if (/tosa|corte|pelos|unhas/.test(n))            return { bg: "bg-purple-100",  icon: "text-purple-600",  accent: "#7C3AED" };
  if (/vacin|vermifug|castrac|cirurgi/.test(n))    return { bg: "bg-red-100",     icon: "text-red-500",     accent: "#EF4444" };
  if (/consult|exame|fisio|veterinar/.test(n))     return { bg: "bg-emerald-100", icon: "text-emerald-600", accent: GREEN };
  if (/adestramento|treino|comportamento/.test(n)) return { bg: "bg-orange-100",  icon: "text-orange-500",  accent: "#F97316" };
  if (/hospedagem|hotel|creche/.test(n))           return { bg: "bg-indigo-100",  icon: "text-indigo-600",  accent: "#4F46E5" };
  return { bg: "bg-blue-50", icon: "text-blue-700", accent: BLUE };
}
function getCatAccent(id: ServiceCat): string {
  switch (id) {
    case "higiene":       return "#3B82F6";
    case "estetica":      return "#7C3AED";
    case "saude":         return GREEN;
    case "comportamento": return "#F97316";
    case "outros":        return MUTED;
    default:              return BLUE;
  }
}

function sanitizePriceInput(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
  const [integerPart = "", decimalPart = ""] = cleaned.split(".");
  if (decimalPart.length === 0) return integerPart.slice(0, 5);
  return `${integerPart.slice(0, 5)}.${decimalPart.slice(0, 2)}`;
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
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError]       = useState("");
  const [nome, setNome]         = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco]       = useState("");
  const [catFilter, setCatFilter] = useState<ServiceCat>("todos");

  const servicosFiltrados = useMemo(() =>
    catFilter === "todos" ? servicos : servicos.filter((s) => getCat(s.nome) === catFilter),
    [servicos, catFilter],
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
    const n = nome.trim();
    if (n.length < 2) { setError("O nome do serviço deve ter no mínimo 2 caracteres."); return; }
    if (!preco.trim() || Number.isNaN(Number(preco))) { setError("Informe um preço válido."); return; }
    try {
      await createServico({ nome: n, descricao: descricao.trim() || undefined, preco: Number(preco) } as CreateServicoDTO);
      setFeedback("Serviço cadastrado com sucesso.");
      setNome(""); setDescricao(""); setPreco(""); setShowForm(false);
      await loadServicos();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao cadastrar serviço.")); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero banner */}
      <div className="relative mb-8 overflow-hidden px-8 py-10" style={{ background: BLUE, borderRadius: "8px" }}>
        <div className="relative z-10 max-w-md">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: YELL }}>Catálogo</p>
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            Serviços <span style={{ color: YELL }}>disponíveis</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/75">Confira nossa lista completa de serviços com preços e descrições.</p>
        </div>
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 rotate-45" style={{ background: YELL }} />
            <div className="h-6 w-6 rounded-full border-2" style={{ borderColor: GREEN }} />
            <div className="h-3 w-3" style={{ background: GREEN }} />
          </div>
          <div className="mt-5 flex flex-col items-center gap-2">
            <div style={{ width:0, height:0, borderLeft:"12px solid transparent", borderRight:"12px solid transparent", borderBottom:`20px solid ${YELL}` }} />
            <div className="h-8 w-8 bg-white/15" />
            <div className="h-5 w-5 rounded-full" style={{ background: GREEN }} />
          </div>
          <div className="-mt-2 flex flex-col items-center gap-2">
            <div className="h-5 w-5 rotate-45 border-2" style={{ borderColor: YELL }} />
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div style={{ width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"15px solid rgba(255,255,255,0.35)" }} />
          </div>
        </div>
      </div>

      {/* Sub-header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
            Catálogo
          </span>
          <h2 className="text-lg font-extrabold" style={{ color: "#1a1a1a" }}>Todos os serviços</h2>
          <p className="mt-0.5 text-xs" style={{ color: MUTED }}>Filtre por categoria para encontrar o que procura.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setPreco(""); setError(""); }}
          className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: showForm ? MUTED : BLUE, borderRadius: "4px" }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo"}</span>
        </button>
      </div>

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
        <form onSubmit={handleCreateSubmit} className="mb-6 bg-white p-5 shadow-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: "#1a1a1a" }}>Novo Serviço</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
              <input minLength={2} required placeholder="Ex: Banho e Tosa"
                value={nome} onChange={(e) => setNome(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Descrição</label>
              <input placeholder="Descrição opcional"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Preço (R$) *</label>
              <input type="text" inputMode="decimal" maxLength={10} required placeholder="0,00"
                value={preco} onChange={(e) => setPreco(sanitizePriceInput(e.target.value))}
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

      {/* Category filter — tab bar */}
      {!loading && servicos.length > 0 && (
        <div className="mb-6 overflow-hidden bg-white shadow-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
          <div className="flex overflow-x-auto">
            {CATS.map((cat) => {
              const count = cat.id === "todos"
                ? servicos.length
                : servicos.filter((s) => getCat(s.nome) === cat.id).length;
              if (count === 0 && cat.id !== "todos") return null;
              const CatIcon = cat.icon;
              const isActive = catFilter === cat.id;
              const accent = getCatAccent(cat.id);
              return (
                <button key={cat.id} onClick={() => setCatFilter(cat.id)}
                  className="group relative flex flex-1 shrink-0 flex-col items-center gap-1 px-3 py-3 transition sm:flex-row sm:justify-center sm:gap-2 sm:px-5"
                  style={{
                    background: isActive ? accent : "transparent",
                    color: isActive ? "#fff" : MUTED,
                  }}>
                  <CatIcon size={15} className="shrink-0" />
                  <span className="whitespace-nowrap text-xs font-bold sm:text-sm">{cat.label}</span>
                  <span className="px-1.5 py-0.5 text-xs font-bold leading-none"
                    style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#F4F4F4", borderRadius: "20px", color: isActive ? "#fff" : MUTED }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="p-8 text-center text-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
          Carregando serviços...
        </div>
      ) : servicos.length === 0 ? (
        <div className="p-12 text-center"
          style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff" }}>
          <Sparkles size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Nenhum serviço cadastrado.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-bold transition hover:opacity-70" style={{ color: BLUE }}>
            Criar primeiro serviço
          </button>
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="p-10 text-center text-sm"
          style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
          Nenhum serviço nesta categoria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicosFiltrados.map((s) => {
            const Icon = getIcon(s.nome);
            const col  = getColor(s.nome);
            return (
              <div key={s.id}
                className="relative flex flex-col overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
                <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: col.accent }} />
                <div className="flex flex-1 flex-col p-5 pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${col.bg}`}
                      style={{ borderRadius: "8px" }}>
                      <Icon size={16} className={col.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-snug" style={{ color: "#1a1a1a" }}>{fixAccents(s.nome)}</h3>
                      {s.descricao && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: MUTED }}>{s.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${BORD}` }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>Preço</p>
                    <p className="text-base font-extrabold" style={{ color: "#1a1a1a" }}>
                      R$ {Number(s.preco).toFixed(2)}
                    </p>
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
