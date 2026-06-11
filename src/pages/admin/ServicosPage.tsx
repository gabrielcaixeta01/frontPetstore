import { useEffect, useMemo, useState } from "react";
import {
  Scissors, Plus, X, Pencil, Trash2,
  Droplets, Stethoscope, Shield, Star, Home, Sparkles,
  type LucideIcon,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import { createServico, deleteServico, getServicos, updateServico } from "../../services/servicoService";
import type { CreateServicoDTO, Servico, UpdateServicoDTO } from "../../types/servico";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "8px 12px", fontSize: "14px",
  border: `1px solid ${BORD}`, borderRadius: "4px",
  background: "#fff", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = TEAL;
  e.target.style.boxShadow = "0 0 0 3px rgba(13,115,119,0.12)";
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
const CATS: { id: ServiceCat; label: string }[] = [
  { id: "todos",         label: "Todos" },
  { id: "higiene",       label: "Banho & Higiene" },
  { id: "estetica",      label: "Estética" },
  { id: "saude",         label: "Saúde" },
  { id: "comportamento", label: "Comportamento" },
  { id: "outros",        label: "Outros" },
];

function getCat(nome: string): Exclude<ServiceCat, "todos"> {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat|dental|dente/.test(n))                      return "higiene";
  if (/tosa|corte|pelos|unhas|estetica|grooming/.test(n))                      return "estetica";
  if (/vacin|vermifug|castrac|cirurgi|consult|exame|fisio|veterinar/.test(n))  return "saude";
  if (/adestramento|treino|comportamento|socializac/.test(n))                   return "comportamento";
  return "outros";
}
function getIcon(nome: string): LucideIcon {
  const n = strip(nome);
  if (/banho|higien|shampoo|hidrat/.test(n))          return Droplets;
  if (/tosa|corte|pelos|unhas/.test(n))               return Scissors;
  if (/vacin|vermifug|castrac|cirurgi/.test(n))       return Shield;
  if (/consult|exame|fisio|veterinar/.test(n))        return Stethoscope;
  if (/adestramento|treino|comportamento/.test(n))    return Star;
  if (/hospedagem|hotel|creche/.test(n))              return Home;
  return Sparkles;
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

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

export default function ServicosPage() {
  const [servicos, setServicos]                       = useState<Servico[]>([]);
  const [servicoBeingEdited, setServicoBeingEdited]   = useState<Servico | null>(null);
  const [loading, setLoading]                         = useState(true);
  const [showForm, setShowForm]                       = useState(false);
  const [feedback, setFeedback]                       = useState("");
  const [error, setError]                             = useState("");
  const [nome, setNome]                               = useState("");
  const [descricao, setDescricao]                     = useState("");
  const [preco, setPreco]                             = useState("");
  const [editNome, setEditNome]                       = useState("");
  const [editDescricao, setEditDescricao]             = useState("");
  const [editPreco, setEditPreco]                     = useState("");
  const [catFilter, setCatFilter]                     = useState<ServiceCat>("todos");

  const servicosFiltrados = useMemo(() => {
    const list = catFilter === "todos" ? servicos : servicos.filter((s) => getCat(s.nome) === catFilter);
    return [...list].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [servicos, catFilter]);

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

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!servicoBeingEdited) return;
    const n = editNome.trim();
    if (n.length < 2) { setError("O nome do serviço deve ter no mínimo 2 caracteres."); return; }
    if (!editPreco.trim() || Number.isNaN(Number(editPreco))) { setError("Informe um preço válido."); return; }
    try {
      await updateServico(servicoBeingEdited.id, { nome: n, descricao: editDescricao.trim(), preco: Number(editPreco) } as UpdateServicoDTO);
      setFeedback("Serviço atualizado.");
      setServicoBeingEdited(null);
      await loadServicos();
    } catch (err) { setError(getApiErrorMessage(err, "Erro ao atualizar serviço.")); }
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

      {/* Hero */}
      <div className="relative mb-8 overflow-hidden px-8 py-10" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10 max-w-md">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Catálogo</p>
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            Serviços <span style={{ color: AMBER }}>disponíveis</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/75">Gerencie o catálogo completo com descrição e preço.</p>
        </div>
      </div>

      {/* Sub-header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
            Gerenciamento
          </span>
          <h2 className="text-lg font-extrabold" style={{ color: COAL }}>Todos os serviços</h2>
          <p className="mt-0.5 text-xs" style={{ color: MUTED }}>Filtre por categoria para encontrar o que procura.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setNome(""); setDescricao(""); setPreco(""); setError(""); }}
          className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition"
          style={{ background: showForm ? MUTED : TEAL, borderRadius: "6px" }}
          onMouseEnter={(e) => { if (!showForm) (e.currentTarget as HTMLButtonElement).style.background = TDARK; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = showForm ? MUTED : TEAL; }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo serviço"}</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 px-4 py-3 text-sm font-medium"
          style={{ borderRadius: "6px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
          {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 text-sm font-medium"
          style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="mb-6 bg-white p-5 shadow-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: COAL }}>Novo Serviço</h2>
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
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: TEAL, borderRadius: "6px" }}>
              <Plus size={14} /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      <EditModal isOpen={Boolean(servicoBeingEdited)} title="Editar Serviço" onClose={() => setServicoBeingEdited(null)}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
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
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: MUTED }}>Preço (R$) *</label>
              <input type="text" inputMode="decimal" maxLength={10} required
                value={editPreco} onChange={(e) => setEditPreco(sanitizePriceInput(e.target.value))}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: TEAL, borderRadius: "6px" }}>
              Salvar
            </button>
            <button type="button" onClick={() => setServicoBeingEdited(null)}
              className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
              Cancelar
            </button>
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
            const isActive = catFilter === cat.id;
            return (
              <button key={cat.id} onClick={() => setCatFilter(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition"
                style={{
                  borderRadius: "6px",
                  border: `1px solid ${isActive ? "transparent" : BORD}`,
                  background: isActive ? TEAL : "#fff",
                  color: isActive ? "#fff" : COAL,
                }}>
                {cat.label}
                <span className="px-1.5 py-0.5 text-xs font-bold"
                  style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#F1F5F9", borderRadius: "20px", color: isActive ? "#fff" : MUTED }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="p-8 text-center text-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
          Carregando serviços...
        </div>
      ) : servicos.length === 0 ? (
        <div className="p-12 text-center"
          style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
          <Sparkles size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Nenhum serviço cadastrado.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-bold transition hover:opacity-70" style={{ color: TEAL }}>
            Criar primeiro serviço
          </button>
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="p-10 text-center text-sm"
          style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
          Nenhum serviço nesta categoria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicosFiltrados.map((s) => {
            const Icon = getIcon(s.nome);
            return (
              <div key={s.id}
                className="flex flex-col bg-white transition hover:shadow-md"
                style={{ border: `1px solid ${BORD}`, borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center"
                      style={{ borderRadius: "8px", background: "#e6f5f5" }}>
                      <Icon size={16} style={{ color: TEAL }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug" style={{ color: COAL }}>{fixAccents(s.nome)}</h3>
                      {s.descricao && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed" style={{ color: MUTED }}>{s.descricao}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${BORD}` }}>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest" style={{ color: MUTED }}>Preço</p>
                      <p className="text-base font-extrabold" style={{ color: COAL }}>
                        R$ {Number(s.preco).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setServicoBeingEdited(s)} title="Editar"
                        className="flex h-8 w-8 items-center justify-center transition hover:bg-gray-100"
                        style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} title="Excluir"
                        className="flex h-8 w-8 items-center justify-center transition hover:bg-red-50"
                        style={{ border: "1px solid #FECACA", borderRadius: "6px", color: "#EF4444" }}>
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
