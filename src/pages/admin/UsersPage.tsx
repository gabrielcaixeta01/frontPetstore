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
import type { Loja } from "../../types/loja";

const BLUE  = "#1A3CB8";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

export default function UsersPage() {
  const [users, setUsers]                   = useState<Usuario[]>([]);
  const [petsByUser, setPetsByUser]         = useState<Record<number, Pet[]>>({});
  const [lojas, setLojas]                   = useState<Loja[]>([]);
  const [lojaById, setLojaById]             = useState<Record<number, string>>({});
  const [gastoByUser, setGastoByUser]       = useState<Record<number, number>>({});
  const [userBeingEdited, setUserBeingEdited] = useState<Usuario | null>(null);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [feedback, setFeedback]             = useState("");
  const [error, setError]                   = useState("");

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
      petData.forEach((p) => { if (!petMap[p.dono_id]) petMap[p.dono_id] = []; petMap[p.dono_id].push(p); });
      setPetsByUser(petMap);

      setLojas(lojaData);
      const lojaMap: Record<number, string> = {};
      lojaData.forEach((l) => { lojaMap[l.id] = l.nome; });
      setLojaById(lojaMap);

      const gastoMap: Record<number, number> = {};
      atendData.forEach((at) => {
        if (at.status === "concluido") {
          gastoMap[at.cliente_id] = (gastoMap[at.cliente_id] ?? 0) + (Number(at.valor_final) || 0);
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

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
              Gerenciamento
            </span>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Usuários</h1>
            <p className="mt-0.5 text-sm" style={{ color: MUTED }}>Gerencie clientes e funcionários do sistema.</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: showForm ? MUTED : BLUE, borderRadius: "4px" }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span className="hidden sm:inline">{showForm ? "Cancelar" : "Novo usuário"}</span>
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="px-4 py-3 text-sm font-medium"
            style={{ borderRadius: "4px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
            {feedback}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 text-sm font-medium"
            style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
            {error}
          </div>
        )}

        {showForm && (
          <UserForm
            userBeingEdited={null}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onCancelEdit={() => { setUserBeingEdited(null); setShowForm(false); }}
            lojas={lojas}
          />
        )}

        <EditModal isOpen={Boolean(userBeingEdited)} title="Editar Usuário" onClose={() => setUserBeingEdited(null)}>
          {userBeingEdited && (
            <EditUserForm user={userBeingEdited} onUpdate={handleUpdateUser} onCancel={() => setUserBeingEdited(null)} />
          )}
        </EditModal>

        {/* List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "#1a1a1a" }}>
              Base de usuários
              {!loading && (
                <span className="ml-2 text-sm font-normal" style={{ color: MUTED }}>({users.length})</span>
              )}
            </h2>
            <button onClick={loadAll}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
              style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
              <RefreshCw size={13} /> Atualizar
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-sm"
              style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
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
