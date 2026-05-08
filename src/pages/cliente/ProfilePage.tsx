import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield, LogOut, CalendarDays, Pencil, X, Save } from "lucide-react";
import EditModal from "../../components/EditModal";
import { getUsuarios, updateUsuario } from "../../services/usuarioService";
import { updateCliente } from "../../services/clienteService";
import { api } from "../../services/api";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  role: string;
  active: boolean;
  created_at: string;
  client_profile?: {
    client_type: string;
    cep: string;
    state: string;
    city: string;
    cpf?: string;
    cnpj?: string;
  } | null;
};

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

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function ClienteProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editState, setEditState] = useState("");
  const [editCity, setEditCity] = useState("");

  useEffect(() => {
    api.get<UserProfile>("/auth/me")
      .then((r) => setProfile(r.data))
      .catch(() => {
        const stored = localStorage.getItem("user");
        if (stored) setProfile(JSON.parse(stored));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profile) return;

    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone ?? "");
    setEditCep(profile.client_profile?.cep ?? "");
    setEditState(profile.client_profile?.state ?? "");
    setEditCity(profile.client_profile?.city ?? "");
  }, [profile]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function startEditing() {
    if (!profile) return;

    setEditError("");
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone ?? "");
    setEditCep(profile.client_profile?.cep ?? "");
    setEditState(profile.client_profile?.state ?? "");
    setEditCity(profile.client_profile?.city ?? "");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (!profile) return;

    setEditError("");
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone ?? "");
    setEditCep(profile.client_profile?.cep ?? "");
    setEditState(profile.client_profile?.state ?? "");
    setEditCity(profile.client_profile?.city ?? "");
    setIsEditing(false);
  }

  async function saveProfile() {
    if (!profile) return;

    const normalizedName = editName.trim();
    const normalizedEmail = editEmail.trim();
    const normalizedPhone = editPhone.trim();
    const normalizedCep = editCep.trim();
    const normalizedState = editState.trim().toUpperCase();
    const normalizedCity = editCity.trim();

    if (!normalizedName) {
      setEditError("Informe o nome.");
      return;
    }

    if (!normalizedEmail) {
      setEditError("Informe o e-mail.");
      return;
    }

    if (!normalizedPhone) {
      setEditError("Informe o telefone.");
      return;
    }

    if (!normalizedCep) {
      setEditError("Informe o CEP.");
      return;
    }

    if (!normalizedState) {
      setEditError("Informe o estado.");
      return;
    }

    if (!normalizedCity) {
      setEditError("Informe a cidade.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      const existingUsers = await getUsuarios();
      const duplicatedEmail = existingUsers.some(
        (userItem) => userItem.id !== profile.id && userItem.email.trim().toLowerCase() === normalizedEmail.toLowerCase()
      );

      if (duplicatedEmail) {
        setEditError("Este e-mail já está em uso por outro usuário.");
        return;
      }

      await updateUsuario(profile.id, {
        nome: normalizedName,
        email: normalizedEmail,
        telefone: normalizedPhone,
      });

      await updateCliente(profile.id, {
        end_cep: normalizedCep,
        end_estado: normalizedState,
        end_cidade: normalizedCity,
      });

      const refreshed = await api.get<UserProfile>("/auth/me").then((response) => response.data);

      setProfile(refreshed);
      localStorage.setItem("user", JSON.stringify(refreshed));
      setIsEditing(false);
    } catch {
      setEditError("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm text-gray-400">Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm text-red-500">Não foi possível carregar o perfil.</p>
      </div>
    );
  }

  const cp = profile.client_profile;
  const clientTypeLabel = cp?.client_type === "pessoa_juridica" ? "Pessoa Jurídica" : "Pessoa Física";
  const hasCnpj = Boolean(profile.cnpj ?? cp?.cnpj);
  const docLabel = hasCnpj ? "CNPJ" : "CPF";
  const docValue = profile.cnpj ?? cp?.cnpj ?? profile.cpf ?? cp?.cpf;
  const cepValue = cp?.cep ?? "";
  const stateValue = cp?.state ?? "";
  const cityValue = cp?.city ?? "";

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
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Cliente
              </span>
              {cp && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {clientTypeLabel}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.active ? "bg-[#00bb69]/10 text-[#00bb69]" : "bg-red-100 text-red-600"}`}>
                {profile.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Pencil size={14} />
            Editar perfil
          </button>
        </div>

        {/* Dados pessoais */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Dados pessoais</h3>
          <div className="divide-y divide-gray-50">
            <InfoRow icon={<User size={14} />} label="Nome completo" value={profile.name} />
            <InfoRow icon={<Mail size={14} />} label="E-mail" value={profile.email} />
            <InfoRow icon={<Phone size={14} />} label="Telefone" value={profile.phone} />
            <InfoRow icon={<Shield size={14} />} label={docLabel} value={docValue} />
            <InfoRow icon={<CalendarDays size={14} />} label="Membro desde" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : undefined} />
          </div>
        </div>

        {/* Endereço */}
        {cp && (cepValue || cityValue || stateValue) && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Endereço</h3>
            <div className="divide-y divide-gray-50">
              {cityValue && <InfoRow icon={<Shield size={14} />} label="Cidade" value={cityValue} />}
              {stateValue && <InfoRow icon={<Shield size={14} />} label="Estado" value={stateValue} />}
              {cepValue && cepValue !== "00000-000" && <InfoRow icon={<Shield size={14} />} label="CEP" value={cepValue} />}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      </div>

      <EditModal
        isOpen={isEditing}
        title="Editar perfil"
        onClose={cancelEditing}
      >
        <div className="space-y-4">
          {editError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {editError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">CEP</label>
              <input
                type="text"
                value={editCep}
                onChange={(e) => setEditCep(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
              <input
                type="text"
                value={editState}
                onChange={(e) => setEditState(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#1c46f3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1538c9] disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      </EditModal>
    </div>
  );
}
