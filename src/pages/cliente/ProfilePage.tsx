import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield, LogOut, CalendarDays } from "lucide-react";
import { api } from "../../services/api";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string;
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

  useEffect(() => {
    api.get<UserProfile>("/auth/me")
      .then((r) => setProfile(r.data))
      .catch(() => {
        const stored = localStorage.getItem("user");
        if (stored) setProfile(JSON.parse(stored));
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
  const docLabel = cp?.client_type === "pessoa_juridica" ? "CNPJ" : "CPF";
  const docValue = cp?.cnpj ?? cp?.cpf;

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
        {cp && (cp.cep || cp.city || cp.state) && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Endereço</h3>
            <div className="divide-y divide-gray-50">
              {cp.city && <InfoRow icon={<Shield size={14} />} label="Cidade" value={cp.city} />}
              {cp.state && <InfoRow icon={<Shield size={14} />} label="Estado" value={cp.state} />}
              {cp.cep && cp.cep !== "00000-000" && <InfoRow icon={<Shield size={14} />} label="CEP" value={cp.cep} />}
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
    </div>
  );
}
