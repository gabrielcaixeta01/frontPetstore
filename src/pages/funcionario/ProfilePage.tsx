import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  LogOut,
  Pencil,
  X,
  Save,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { apexTheme } from "../../lib/theme";
import { api } from "../../services/api";

type UserData = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  created_at: string;
};

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-700" },
  funcionario: { label: "Funcionário", color: "bg-blue-100 text-blue-700" },
  cliente: { label: "Cliente", color: "bg-emerald-100 text-emerald-700" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const c = apexTheme.colors;

  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    setName(parsed.name);
    setEmail(parsed.email);
    setPhone(parsed.phone || "");
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function handleCancelEdit() {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setError("");
    setIsEditing(false);
  }

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const params = { name, email, phone };
      const data = await api
        .put(`/user/${user.id}`, null, { params })
        .then((r) => r.data);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setIsEditing(false);
    } catch {
      setError("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const roleInfo = roleLabels[user.role] ?? {
    label: user.role,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <main className={`min-h-screen ${c.bgSoft} px-4 py-10`}>
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </button>

        {/* Avatar + identidade */}
        <div className={`rounded-3xl border ${c.border} bg-white shadow-sm overflow-hidden`}>
          {/* Topo colorido */}
          <div className="h-24 bg-gradient-to-r from-[#1c46f3] to-[#00bb69]" />

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-[#1c46f3] text-2xl font-bold text-white shadow-md">
                {getInitials(user.name)}
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              )}
            </div>

            {/* Nome e badges */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${roleInfo.color}`}>
                  <Shield size={12} />
                  {roleInfo.label}
                </span>

                {user.active ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle size={12} />
                    Conta ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                    <XCircle size={12} />
                    Conta inativa
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Campos */}
        <div className={`rounded-3xl border ${c.border} bg-white shadow-sm p-8 space-y-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Informações pessoais
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              icon={<User size={16} />}
              label="Nome completo"
              editing={isEditing}
              value={name}
              onChange={setName}
              displayValue={user.name}
            />
            <Field
              icon={<Mail size={16} />}
              label="E-mail"
              editing={isEditing}
              value={email}
              onChange={setEmail}
              displayValue={user.email}
              type="email"
            />
            <Field
              icon={<Phone size={16} />}
              label="Telefone"
              editing={isEditing}
              value={phone}
              onChange={setPhone}
              displayValue={user.phone || "Não informado"}
              placeholder="(00) 00000-0000"
            />
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Calendar size={14} />
                Membro desde
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          {/* Ações */}
          {isEditing && (
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#1c46f3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1538c9] disabled:opacity-60"
              >
                <Save size={15} />
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <X size={15} />
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className={`rounded-3xl border border-red-100 bg-white shadow-sm p-6`}>
          <h2 className="mb-1 text-sm font-semibold text-gray-800">Encerrar sessão</h2>
          <p className="mb-4 text-sm text-gray-500">
            Você será redirecionado para a tela de login.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
          >
            <LogOut size={15} />
            Sair da conta
          </button>
        </div>
      </div>
    </main>
  );
}

type FieldProps = {
  icon: React.ReactNode;
  label: string;
  editing: boolean;
  value: string;
  onChange: (v: string) => void;
  displayValue: string;
  type?: string;
  placeholder?: string;
};

function Field({ icon, label, editing, value, onChange, displayValue, type = "text", placeholder }: FieldProps) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-2 text-xs font-medium text-gray-400">
        {icon}
        {label}
      </p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/20 transition"
        />
      ) : (
        <p className="text-sm font-semibold text-gray-800">{displayValue}</p>
      )}
    </div>
  );
}
