import { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditUserForm from "../../components/user/EditUserForm";
import UserForm from "../../components/user/UserForm";
import UserList from "../../components/user/UserList";
import { apexTheme } from "../../lib/theme";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from "../../services/usuarioService";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";

export default function UsersPage() {
  const c = apexTheme.colors;
  const [users, setUsers] = useState<Usuario[]>([]);
  const [userBeingEdited, setUserBeingEdited] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsers(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(data: CreateUsuarioDTO) {
    try {
      await createUsuario(data);
      setFeedback("Usuário cadastrado com sucesso.");
      setUserBeingEdited(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar usuário.");
    }
  }

  async function handleUpdateUser(id: number, data: UpdateUsuarioDTO) {
    try {
      await updateUsuario(id, data);
      setFeedback("Usuário atualizado com sucesso.");
      setUserBeingEdited(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar usuário.");
    }
  }

  async function handleDeleteUser(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await deleteUsuario(id);
      setFeedback("Usuário excluído com sucesso.");
      if (userBeingEdited?.id === id) setUserBeingEdited(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir usuário.");
    }
  }

  return (
    <div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c46f3]/10">
              <Users size={26} className="text-[#1c46f3]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Usuários</h1>
              <p className={`mt-1 text-sm ${c.textSoft}`}>
                Gerencie pessoas do sistema com perfil, documentos e status.
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

        <UserForm
          userBeingEdited={null}
          onCreate={handleCreateUser}
          onUpdate={handleUpdateUser}
          onCancelEdit={() => setUserBeingEdited(null)}
        />

        <EditModal
          isOpen={Boolean(userBeingEdited)}
          title="Editar Usuário"
          onClose={() => setUserBeingEdited(null)}
        >
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
            <h2 className="text-2xl font-bold">Lista de usuários</h2>
            <button
              onClick={loadUsers}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
              Carregando usuários...
            </div>
          ) : (
            <UserList
              users={users}
              onEdit={setUserBeingEdited}
              onDelete={handleDeleteUser}
            />
          )}
        </section>
      </div>
    </div>
  );
}