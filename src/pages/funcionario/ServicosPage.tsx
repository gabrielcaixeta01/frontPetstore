import { useEffect, useState } from "react";
import { Scissors, Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import EditModal from "../../components/EditModal";
import { apexTheme } from "../../lib/theme";
import {
  createServico,
  deleteServico,
  getServicos,
  updateServico,
} from "../../services/servicoService";
import type { CreateServicoDTO, Servico, UpdateServicoDTO } from "../../types/servico";

function getIsCliente() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role === "cliente" : false;
  } catch {
    return false;
  }
}

export default function ServicosPage() {
  const c = apexTheme.colors;
  const isCliente = getIsCliente();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoBeingEdited, setServicoBeingEdited] = useState<Servico | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");

  async function loadServicos() {
    try {
      setLoading(true);
      const data = await getServicos();
      setServicos(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServicos();
  }, []);

  useEffect(() => {
    if (!servicoBeingEdited) {
      setEditNome("");
      setEditDescricao("");
      setEditPreco("");
      return;
    }

    setEditNome(servicoBeingEdited.nome);
    setEditDescricao(servicoBeingEdited.descricao ?? "");
    setEditPreco(String(servicoBeingEdited.preco));
  }, [servicoBeingEdited]);

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome do serviço.");
      return;
    }

    if (!preco.trim() || Number.isNaN(Number(preco))) {
      alert("Informe um preço válido.");
      return;
    }

    const payload: CreateServicoDTO = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      preco: Number(preco),
    };

    try {
      await createServico(payload);
      setFeedback("Serviço cadastrado com sucesso.");
      setNome("");
      setDescricao("");
      setPreco("");
      await loadServicos();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar serviço.");
    }
  }

  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!servicoBeingEdited) return;

    if (!editNome.trim()) {
      alert("Informe o nome do serviço.");
      return;
    }

    if (!editPreco.trim() || Number.isNaN(Number(editPreco))) {
      alert("Informe um preço válido.");
      return;
    }

    const updatePayload: UpdateServicoDTO = {
      nome: editNome.trim(),
      descricao: editDescricao.trim() || undefined,
      preco: Number(editPreco),
    };

    try {
      await updateServico(servicoBeingEdited.id, updatePayload);
      setFeedback("Serviço atualizado com sucesso.");
      setServicoBeingEdited(null);
      await loadServicos();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar serviço.");
    }
  }

  async function handleDeleteServico(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      await deleteServico(id);
      setFeedback("Serviço excluído com sucesso.");
      if (servicoBeingEdited?.id === id) setServicoBeingEdited(null);
      await loadServicos();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir serviço.");
    }
  }

  return (
    <div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
              <Scissors size={26} className="text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Serviços</h1>
              <p className={`mt-1 text-sm ${c.textSoft}`}>
                Gerencie os serviços oferecidos com descrição e preço.
              </p>
            </div>
          </div>
        </header>

        {feedback && (
          <div className="rounded-2xl border border-emerald-800 bg-emerald-950 px-4 py-3 text-emerald-300">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {!isCliente && <form
          onSubmit={handleCreateSubmit}
          className={`space-y-4 rounded-2xl border ${c.border} ${c.card} p-6 shadow-lg`}
        >
          <h2 className={`text-2xl font-bold ${c.text}`}>Cadastrar Serviço</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="servico-nome" className={`mb-1 block text-sm ${c.textSoft}`}>
                Nome
              </label>
              <input
                id="servico-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
              />
            </div>

            <div>
              <label htmlFor="servico-descricao" className={`mb-1 block text-sm ${c.textSoft}`}>
                Descrição
              </label>
              <input
                id="servico-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
              />
            </div>

            <div>
              <label htmlFor="servico-preco" className={`mb-1 block text-sm ${c.textSoft}`}>
                Preço
              </label>
              <input
                id="servico-preco"
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
                className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className={`flex items-center gap-2 rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90`}
            >
              <Plus size={16} />
              Cadastrar
            </button>
          </div>
        </form>}

        {!isCliente && <EditModal
          isOpen={Boolean(servicoBeingEdited)}
          title="Editar Serviço"
          onClose={() => setServicoBeingEdited(null)}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="servico-edit-nome" className={`mb-1 block text-sm ${c.textSoft}`}>
                  Nome
                </label>
                <input
                  id="servico-edit-nome"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  required
                  className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
                />
              </div>
              <div>
                <label htmlFor="servico-edit-descricao" className={`mb-1 block text-sm ${c.textSoft}`}>
                  Descrição
                </label>
                <input
                  id="servico-edit-descricao"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
                />
              </div>
              <div>
                <label htmlFor="servico-edit-preco" className={`mb-1 block text-sm ${c.textSoft}`}>
                  Preço
                </label>
                <input
                  id="servico-edit-preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPreco}
                  onChange={(e) => setEditPreco(e.target.value)}
                  required
                  className={`w-full rounded-xl border ${c.border} ${c.cardSoft} px-4 py-3 ${c.text} outline-none focus:ring-2 focus:ring-[#1c46f3]`}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className={`flex items-center gap-2 rounded-xl ${c.primary} ${c.primaryText} px-5 py-3 font-semibold transition hover:opacity-90`}
              >
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={() => setServicoBeingEdited(null)}
                className={`rounded-xl border ${c.border} px-5 py-3 font-semibold ${c.text} transition hover:${c.bgSoft}`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </EditModal>}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de serviços</h2>
            <button
              onClick={loadServicos}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
              Carregando serviços...
            </div>
          ) : servicos.length === 0 ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textMuted}`}>
              Nenhum serviço encontrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  className={`rounded-2xl border ${c.border} ${c.card} p-5 shadow-lg`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <h3 className={`text-xl font-bold ${c.text}`}>{servico.nome}</h3>
                      <p className={`text-sm ${c.textSoft}`}>
                        Descrição: {servico.descricao ?? "-"}
                      </p>
                      <p className={`text-sm ${c.textSoft}`}>
                        Preço: R$ {Number(servico.preco).toFixed(2)}
                      </p>
                    </div>

                    {!isCliente && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setServicoBeingEdited(servico)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:bg-gray-50`}
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteServico(servico.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Excluir
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
