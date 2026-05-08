import { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditUserForm from "../../components/user/EditUserForm";
import UserForm from "../../components/user/UserForm";
import UserList from "../../components/user/UserList";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from "../../services/usuarioService";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";

export default function UsersPage() {
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
    <div className="px-8 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c46f3]/10">
              <Users size={20} className="text-[#1c46f3]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Gerencie pessoas do sistema com perfil, documentos e status.
              </p>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Lista de usuários</h2>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Atualizar
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
            />
          )}
        </section>
      </div>
    </div>
  );
}
