import { apexTheme } from "../../lib/theme";
import type { Usuario } from "../../types/usuario";

interface UserListProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
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
              <h3 className={`text-xl font-bold ${c.text}`}>{user.nome}</h3>
              <p className={`text-sm ${c.textSoft}`}>ID: {user.id}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Email: {user.email}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Telefone: {user.telefone}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Perfil: {user.tipo_perfil}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                CPF: {user.cpf ?? "-"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                CNPJ: {user.cnpj ?? "-"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Ativo: {user.ativo ? "Sim" : "Não"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Superuser: {user.is_superuser ? "Sim" : "Não"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Cadastro: {user.data_cadastro}
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
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
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