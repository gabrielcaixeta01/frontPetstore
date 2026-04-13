import { apexTheme } from "../../lib/theme";
import type { User } from "../../types/user";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const c = apexTheme.colors;
  if (users.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${c.border} ${c.card} ${c.textMuted}`}>
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className={`rounded-2xl border p-5 shadow-lg ${c.border} ${c.card}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className={`text-xl font-bold ${c.text}`}>{user.username}</h3>
              <p className={`text-sm ${c.textSoft}`}>ID: {user.id}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Nome: {user.firstName ?? "-"} {user.lastName ?? ""}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Email: {user.email ?? "-"}</p>
              <p className={`text-sm ${c.textSoft}`}>Phone: {user.phone ?? "-"}</p>
              <p className={`text-sm ${c.textSoft}`}>Role: {user.role}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Ativo: {user.user_active ? "Sim" : "Não"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(user)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:${c.bgSoft}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${c.danger}`}
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