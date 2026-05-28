import { useEffect, useMemo, useState } from "react";
import {
  Scissors, Plus, X, Pencil, Trash2,
  Droplets, Stethoscope, Shield, Star, Home, Sparkles,
  type LucideIcon,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import { createServico, deleteServico, getServicos, updateServico } from "../../services/servicoService";
import type { CreateServicoDTO, Servico, UpdateServicoDTO } from "../../types/servico";

const inputCls = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white";

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

function sanitizePriceInput(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
  const [integerPart = "", decimalPart = ""] = cleaned.split(".");
  const limitedInteger = integerPart.slice(0, 5);

  if (decimalPart.length === 0) {
    return limitedInteger;
  }

  return `${limitedInteger}.${decimalPart.slice(0, 2)}`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;

  const axiosError = error as { response?: { status?: number; data?: unknown } };
  if (axiosError.response?.status === 422) {
    return "Nome do serviço inválido. Use pelo menos 2 caracteres.";
  }

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
  const [servicoBeingEdited, setServicoBeingEdited] = useState<Servico | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");
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

  useEffect(() => {
    if (!servicoBeingEdited) { setEditNome(""); setEditDescricao(""); setEditPreco(""); return; }
    setEditNome(servicoBeingEdited.nome);
    setEditDescricao(servicoBeingEdited.descricao ?? "");
    setEditPreco(String(servicoBeingEdited.preco));
  }, [servicoBeingEdited]);

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
    } catch (error) { setError(getApiErrorMessage(error, "Erro ao cadastrar serviço.")); }
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!servicoBeingEdited) return;
    const normalizedNome = editNome.trim();
    if (normalizedNome.length < 2) { setError("O nome do serviço deve ter no mínimo 2 caracteres."); return; }
    if (!editPreco.trim() || Number.isNaN(Number(editPreco))) { setError("Informe um preço válido."); return; }
    try {
      const payload: UpdateServicoDTO = { nome: normalizedNome, descricao: editDescricao.trim(), preco: Number(editPreco) };
      await updateServico(servicoBeingEdited.id, payload);
      setFeedback("Serviço atualizado.");
      setServicoBeingEdited(null);
      await loadServicos();
    } catch (error) { setError(getApiErrorMessage(error, "Erro ao atualizar serviço.")); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Excluir este serviço?")) return;
    try {
      await deleteServico(id);
      setFeedback("Serviço excluído.");
      if (servicoBeingEdited?.id === id) setServicoBeingEdited(null);
      await loadServicos();
    } catch { setError("Erro ao excluir serviço."); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative mb-8 overflow-hidden rounded-md bg-[#1c46f3] px-8 py-10">
        <div className="relative z-10 max-w-md">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#F5A800]">
            Catálogo
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            Serviços <span className="text-[#F5A800]">disponíveis</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-white/75">
            Gerencie o catálogo completo com descrição e preço.
          </p>
        </div>
        {/* decorative shapes */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 rotate-45 rounded bg-[#F5A800]" />
            <div className="h-6 w-6 rounded-full border-2 border-[#00A651]" />
            <div className="h-3 w-3 rounded bg-[#00A651]" />
          </div>
          <div className="mt-5 flex flex-col items-center gap-2">
            <div style={{ width:0, height:0, borderLeft:"12px solid transparent", borderRight:"12px solid transparent", borderBottom:"20px solid #F5A800" }} />
            <div className="h-8 w-8 rounded bg-white/15" />
            <div className="h-5 w-5 rounded-full bg-[#00A651]" />
          </div>
          <div className="-mt-2 flex flex-col items-center gap-2">
            <div className="h-5 w-5 rotate-45 rounded border-2 border-[#F5A800]" />
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div style={{ width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"15px solid rgba(255,255,255,0.35)" }} />
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Todos os serviços</h2>
          <p className="mt-0.5 text-xs text-gray-500">Filtre por categoria para encontrar o que procura.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setPreco(""); setError(""); }}
          className="flex items-center gap-2 rounded bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo"}</span>
        </button>
      </div>

      {feedback && <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

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

      <EditModal isOpen={Boolean(servicoBeingEdited)} title="Editar Serviço" onClose={() => setServicoBeingEdited(null)}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Nome *</label>
              <input minLength={2} className={inputCls} value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Descrição</label>
              <input className={inputCls} value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Preço (R$) *</label>
              <input
                type="text"
                inputMode="decimal"
                maxLength={10}
                className={inputCls}
                value={editPreco}
                onChange={(e) => setEditPreco(sanitizePriceInput(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">Salvar</button>
            <button type="button" onClick={() => setServicoBeingEdited(null)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </EditModal>

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
                    ? "border-transparent bg-[#1c46f3] text-white"
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
            <div key={s.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#1c46f3]/25 hover:shadow-md">
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
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Preço</p>
                    <p className="text-base font-bold text-gray-900">R$ {Number(s.preco).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setServicoBeingEdited(s)} title="Editar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} title="Excluir"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  </div>
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
