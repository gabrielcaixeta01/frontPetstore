import { useEffect, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditUserForm from "../../components/user/EditUserForm";
import UserForm from "../../components/user/UserForm";
import UserList from "../../components/user/UserList";
import { createUsuario, deleteUsuario, getUsuarios, updateUsuario } from "../../services/usuarioService";
import { getPets } from "../../services/petService";
import { getLojas } from "../../services/lojaService";
import { getAppointments } from "../../services/atendimentoService";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";
import type { Pet } from "../../types/pet";

export default function UsersPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [petsByUser, setPetsByUser] = useState<Record<number, Pet[]>>({});
  const [lojaById, setLojaById] = useState<Record<number, string>>({});
  const [gastoByUser, setGastoByUser] = useState<Record<number, number>>({});
  const [userBeingEdited, setUserBeingEdited] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      const [userData, petData, lojaData, atendData] = await Promise.all([
        getUsuarios(),
        getPets().catch(() => [] as Pet[]),
        getLojas().catch(() => []),
        getAppointments().catch(() => []),
      ]);

      setUsers(userData);

      const petMap: Record<number, Pet[]> = {};
      petData.forEach((p) => {
        if (!petMap[p.dono_id]) petMap[p.dono_id] = [];
        petMap[p.dono_id].push(p);
      });
      setPetsByUser(petMap);

      const lojaMap: Record<number, string> = {};
      lojaData.forEach((l) => { lojaMap[l.id] = l.nome; });
      setLojaById(lojaMap);

      const gastoMap: Record<number, number> = {};
      atendData.forEach((at) => {
        if (at.status === "concluido") {
          gastoMap[at.cliente_id] = (gastoMap[at.cliente_id] ?? 0) + at.valor_final;
        }
      });
      setGastoByUser(gastoMap);

      setError("");
    } catch {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  function extractApiError(err: unknown, fallback: string): string {
    const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(" · ");
    return fallback;
  }

  async function handleCreateUser(data: CreateUsuarioDTO) {
    try {
      await createUsuario(data);
      setFeedback("Usuário cadastrado com sucesso.");
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Erro ao cadastrar usuário. Verifique os dados e tente novamente."));
    }
  }

  async function handleUpdateUser(id: number, data: UpdateUsuarioDTO) {
    try {
      await updateUsuario(id, data);
      setFeedback("Usuário atualizado com sucesso.");
      setUserBeingEdited(null);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Erro ao atualizar usuário."));
    }
  }

  async function handleDeleteUser(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await deleteUsuario(id);
      setFeedback("Usuário excluído com sucesso.");
      if (userBeingEdited?.id === id) setUserBeingEdited(null);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Erro ao excluir usuário."));
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="mt-0.5 text-sm text-gray-500">Gerencie clientes e funcionários do sistema.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 sm:px-4 sm:py-2.5"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo usuário"}</span>
          </button>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {showForm && (
          <UserForm
            userBeingEdited={null}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onCancelEdit={() => { setUserBeingEdited(null); setShowForm(false); }}
          />
        )}

        <EditModal isOpen={Boolean(userBeingEdited)} title="Editar Usuário" onClose={() => setUserBeingEdited(null)}>
          {userBeingEdited && (
            <EditUserForm
              user={userBeingEdited}
              onUpdate={handleUpdateUser}
              onCancel={() => setUserBeingEdited(null)}
            />
          )}
        </EditModal>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Base de usuários</h2>
            <button
              onClick={loadAll}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} /> Atualizar
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
              Carregando usuários...
            </div>
          ) : (
            <UserList
              users={users}
              onEdit={setUserBeingEdited}
              onDelete={handleDeleteUser}
              petsByUser={petsByUser}
              lojaById={lojaById}
              gastoByUser={gastoByUser}
            />
          )}
        </section>
      </div>
    </div>
  );
}
