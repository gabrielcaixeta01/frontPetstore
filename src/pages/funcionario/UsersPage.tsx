import { useEffect, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false);
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
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="mt-0.5 text-sm text-gray-500">Gerencie clientes e funcionários do sistema.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancelar" : "Novo usuário"}
          </button>
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

        {showForm && (
          <UserForm
            userBeingEdited={null}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onCancelEdit={() => { setUserBeingEdited(null); setShowForm(false); }}
          />
        )}

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
