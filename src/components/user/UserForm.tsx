import { useState } from "react";
import { apexTheme } from "../../lib/theme";
import type { CreateUserDTO, UpdateUserDTO, User } from "../../types/user";

interface UserFormProps {
  userBeingEdited: User | null;
  onCreate: (data: CreateUserDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateUserDTO) => Promise<void>;
  onCancelEdit: () => void;
}

export default function UserForm({
  userBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
}: UserFormProps) {
  const c = apexTheme.colors;
  const [username, setUsername] = useState(userBeingEdited?.username ?? "");
  const [firstName, setFirstName] = useState(userBeingEdited?.firstName ?? "");
  const [lastName, setLastName] = useState(userBeingEdited?.lastName ?? "");
  const [email, setEmail] = useState(userBeingEdited?.email ?? "");
  const [phone, setPhone] = useState(userBeingEdited?.phone ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(userBeingEdited?.role ?? "user");
  const [userActive, setUserActive] = useState(
    userBeingEdited?.user_active ?? true
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim()) {
      alert("Informe o username.");
      return;
    }

    const payload: CreateUserDTO | UpdateUserDTO = {
      username: username.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      password: password.trim() || undefined,
      role,
      user_active: userActive,
    };

    if (userBeingEdited) {
      await onUpdate(userBeingEdited.id, payload);
    } else {
      await onCreate(payload as CreateUserDTO);
      setUsername("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("user");
      setUserActive(true);
    }
  }

  return (
    <form
      key={userBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border p-6 shadow-lg ${c.border} ${c.card}`}
    >
      <div>
        <h2 className={`text-2xl font-bold ${c.text}`}>
          {userBeingEdited ? "Editar Usuário" : "Cadastrar Usuário"}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="username" className={`mb-1 block text-sm ${c.textSoft}`}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="role" className={`mb-1 block text-sm ${c.textSoft}`}>
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="firstName" className={`mb-1 block text-sm ${c.textSoft}`}>
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="lastName" className={`mb-1 block text-sm ${c.textSoft}`}>
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="email" className={`mb-1 block text-sm ${c.textSoft}`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="phone" className={`mb-1 block text-sm ${c.textSoft}`}>
            Phone
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="password" className={`mb-1 block text-sm ${c.textSoft}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="user_active"
            type="checkbox"
            checked={userActive}
            onChange={(e) => setUserActive(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="user_active" className={`text-sm ${c.textSoft}`}>
            Usuário ativo
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`rounded-xl px-5 py-3 font-semibold transition hover:opacity-90 ${c.primary} ${c.primaryText}`}
        >
          {userBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {userBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`rounded-xl border px-5 py-3 font-semibold transition ${c.border} ${c.text} hover:${c.bgSoft}`}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}