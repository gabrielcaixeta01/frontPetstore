import { useEffect, useState } from "react";
import { Scissors, Plus, X, Pencil, Trash2 } from "lucide-react";
import EditModal from "../../components/EditModal";
import { createServico, deleteServico, getServicos, updateServico } from "../../services/servicoService";
import type { CreateServicoDTO, Servico, UpdateServicoDTO } from "../../types/servico";

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gerencie o catálogo com descrição e preço.</p>
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

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">Carregando serviços...</div>
      ) : servicos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Scissors size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum serviço cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-semibold text-[#1c46f3] hover:underline">Criar primeiro serviço</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <div key={s.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#1c46f3]/25 hover:shadow-md">
              {/* Accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#1c46f3] to-[#00bb69]" />

              <div className="flex flex-1 flex-col p-5">
                {/* Icon + name + desc */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c46f3]/10 transition group-hover:bg-[#1c46f3]/15">
                    <Scissors size={16} className="text-[#1c46f3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-snug text-gray-900">{s.nome}</h3>
                    {s.descricao && (
                      <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">{s.descricao}</p>
                    )}
                  </div>
                </div>

                {/* Footer: price + actions */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Preço</p>
                    <p className="text-base font-medium text-[#1c46f3]">
                      R$ {Number(s.preco).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setServicoBeingEdited(s)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
