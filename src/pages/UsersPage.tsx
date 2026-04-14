import { useEffect, useState } from "react";
import EditUserForm from "../components/user/EditUserForm";
import UserForm from "../components/user/UserForm";
import UserList from "../components/user/UserList";
import { apexTheme } from "../lib/theme";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../services/userService";
import type { CreateUserDTO, UpdateUserDTO, User } from "../types/user";

export default function UsersPage() {
  const c = apexTheme.colors;
  const [users, setUsers] = useState<User[]>([]);
  const [userBeingEdited, setUserBeingEdited] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
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

  async function handleCreateUser(data: CreateUserDTO) {
    try {
      await createUser(data);
      setFeedback("Usuário cadastrado com sucesso.");
      setUserBeingEdited(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar usuário.");
    }
  }

  async function handleUpdateUser(id: number, data: UpdateUserDTO) {
    try {
      await updateUser(id, data);
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
      await deleteUser(id);
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
          <p className={`text-sm ${c.textMuted}`}>Módulo</p>
          <h1 className="mt-2 text-4xl font-bold">Usuários</h1>
          <p className={`mt-3 ${c.textSoft}`}>
            Gerencie pessoas do sistema com perfil, documentos e status.
          </p>
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

        {userBeingEdited && (
          <EditUserForm
            user={userBeingEdited}
            onUpdate={handleUpdateUser}
            onCancel={() => setUserBeingEdited(null)}
          />
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de usuários</h2>
            <button
              onClick={loadUsers}
              className={`rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
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