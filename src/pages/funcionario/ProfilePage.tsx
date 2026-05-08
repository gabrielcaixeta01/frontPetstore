import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield, CalendarDays, LogOut, Pencil, Save, X, CheckCircle, XCircle } from "lucide-react";
import { api } from "../../services/api";

type UserData = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profile_type?: string;
  active: boolean;
  created_at: string;
};

const roleLabels: Record<string, { label: string; cls: string }> = {
  admin:       { label: "Administrador", cls: "bg-purple-100 text-purple-700" },
  funcionario: { label: "Funcionário",   cls: "bg-blue-100 text-blue-700" },
  cliente:     { label: "Cliente",       cls: "bg-emerald-100 text-emerald-700" },
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function FuncionarioProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    api.get<UserData>("/auth/me")
      .then((r) => setProfile(r.data))
      .catch(() => {
        const stored = localStorage.getItem("user");
        if (stored) setProfile(JSON.parse(stored));
        else navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone ?? "");
  }, [profile]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function startEdit() { setError(""); setIsEditing(true); }

  function cancelEdit() {
    if (!profile) return;
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone ?? "");
    setError("");
    setIsEditing(false);
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const params = { name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() };
      const data = await api.put<UserData>(`/user/${profile.id}`, null, { params }).then((r) => r.data);
      localStorage.setItem("user", JSON.stringify(data));
      setProfile(data);
      setIsEditing(false);
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="px-8 py-8 text-sm text-gray-400">Carregando perfil...</div>;
  if (!profile) return null;

  const roleKey = profile.role ?? profile.profile_type ?? "";
  const roleCfg = roleLabels[roleKey] ?? { label: roleKey || "Usuário", cls: "bg-gray-100 text-gray-700" };

  const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-0.5 text-sm text-gray-500">Suas informações cadastradas no Apex Petstore.</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        {/* Avatar card */}
        <div className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1c46f3] to-[#00bb69] text-xl font-bold text-white shadow-md shadow-[#1c46f3]/20">
            {getInitials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleCfg.cls}`}>
                {roleCfg.label}
              </span>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.active ? "bg-[#00bb69]/10 text-[#00bb69]" : "bg-red-100 text-red-600"}`}>
                {profile.active ? <><CheckCircle size={11} /> Ativo</> : <><XCircle size={11} /> Inativo</>}
              </span>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={startEdit}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Pencil size={13} /> Editar
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Info / Edit card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Dados pessoais</h3>

          {isEditing ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Nome completo</label>
                <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">E-mail</label>
                <input type="email" className={inputCls} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Telefone</label>
                <input className={inputCls} placeholder="(00) 00000-0000" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 disabled:opacity-60"
                >
                  <Save size={13} /> {saving ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={cancelEdit} className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              <InfoRow icon={<User size={14} />} label="Nome completo" value={profile.name} />
              <InfoRow icon={<Mail size={14} />} label="E-mail" value={profile.email} />
              <InfoRow icon={<Phone size={14} />} label="Telefone" value={profile.phone} />
              <InfoRow icon={<Shield size={14} />} label="Perfil" value={roleCfg.label} />
              <InfoRow
                icon={<CalendarDays size={14} />}
                label="Membro desde"
                value={profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                  : undefined}
              />
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={15} /> Sair da conta
        </button>
      </div>
    </div>
  );
}
