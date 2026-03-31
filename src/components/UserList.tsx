import type { User } from "../types/user";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{user.username}</h3>
              <p className="text-sm text-zinc-300">ID: {user.id}</p>
              <p className="text-sm text-zinc-300">
                Nome: {user.firstName ?? "-"} {user.lastName ?? ""}
              </p>
              <p className="text-sm text-zinc-300">Email: {user.email ?? "-"}</p>
              <p className="text-sm text-zinc-300">Phone: {user.phone ?? "-"}</p>
              <p className="text-sm text-zinc-300">Role: {user.role}</p>
              <p className="text-sm text-zinc-300">
                Ativo: {user.user_active ? "Sim" : "Não"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(user)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}