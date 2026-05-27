import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  PawPrint, ShieldCheck, Zap, ArrowRight,
  Building2, CreditCard, MapPin, Map,
} from "lucide-react";
import { api } from "../services/api";

const BLUE  = "#1A3CB8";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BG    = "#F4F4F4";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

const features = [
  { icon: PawPrint,    text: "Cadastre e acompanhe seus pets" },
  { icon: ShieldCheck, text: "Dados seguros e sempre acessíveis" },
  { icon: Zap,         text: "Acesso imediato após o cadastro" },
];

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function maskCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCNPJ(v: string) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8)
    .replace(/(\d{5})(\d{1,3})/, "$1-$2");
}

const inputBase: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 16px 10px 40px",
  fontSize: "14px",
  border: `1px solid ${BORD}`,
  borderRadius: "4px",
  background: "#FFFFFF",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = BLUE;
  e.target.style.boxShadow  = "0 0 0 3px rgba(26,60,184,0.10)";
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow  = "none";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: "#1A1A1A" }}>{label}</label>
      {children}
    </div>
  );
}

function GeometricDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute right-8 top-10 h-14 w-14 opacity-85"
        style={{ background: YELL, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
      <div className="absolute right-3 top-[38%] h-10 w-10 rotate-45 opacity-75"
        style={{ background: GREEN }} />
      <div className="absolute right-24 top-[16%] h-16 w-16 rounded-full"
        style={{ border: "2.5px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute bottom-20 right-6 h-7 w-7 opacity-55"
        style={{ background: YELL }} />
      <div className="absolute right-40 bottom-14 h-10 w-10 opacity-10"
        style={{ background: "#FFFFFF", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
      <div className="absolute right-0 top-[58%] h-24 w-12 rounded-l-full opacity-12"
        style={{ background: GREEN }} />
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [clientType, setClientType] = useState<"pessoa_fisica" | "pessoa_juridica">("pessoa_fisica");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [cpf, setCpf]               = useState("");
  const [cnpj, setCnpj]             = useState("");
  const [cep, setCep]               = useState("");
  const [state, setState]           = useState("");
  const [city, setCity]             = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        name, email, phone, password,
        profile_type: "cliente",
        client_type: clientType,
      };
      if (clientType === "pessoa_fisica") payload.cpf = cpf;
      else payload.cnpj = cnpj;
      if (cep)   payload.cep   = cep;
      if (state) payload.state = state;
      if (city)  payload.city  = city;

      const data = await api.post("/auth/register", payload).then((r) => r.data);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail.map((d: any) => d?.msg ?? String(d)).join(", ")
        : typeof detail === "string" ? detail
        : err?.message || "Erro ao criar conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  const typeBtn = (active: boolean) => ({
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "8px",
    padding: "10px 0",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "4px",
    transition: "all 0.15s",
    border: active ? `1.5px solid ${BLUE}` : `1px solid ${BORD}`,
    background: active ? `rgba(26,60,184,0.07)` : "#FFFFFF",
    color: active ? BLUE : MUTED,
    cursor: "pointer",
    width: "100%",
  });

  return (
    <main className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div
        className="relative hidden lg:flex lg:w-[480px] flex-col justify-between overflow-hidden p-12 text-white"
        style={{ background: BLUE }}
      >
        <GeometricDecor />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", borderRadius: "4px" }}>
            <PawPrint size={20} style={{ color: YELL }} />
          </div>
          <span className="text-xl font-bold tracking-tight">Apex Petstore</span>
        </div>

        <div className="relative space-y-6">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-900"
              style={{ background: YELL, borderRadius: "20px" }}>
              Novo por aqui
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight">
              Comece a cuidar<br />melhor dos pets.
            </h1>
            <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.72)" }}>
              Crie sua conta e tenha acesso completo à plataforma em segundos.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)", borderRadius: "4px" }}>
                  <f.icon size={15} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative pt-6 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.60)" }}>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold text-white hover:opacity-80 transition-opacity">
            Entrar
          </Link>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ background: BG }}>
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Criar conta</h2>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>Preencha os dados abaixo para começar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <Field label="Tipo de cadastro">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" style={typeBtn(clientType === "pessoa_fisica")}
                  onClick={() => { setClientType("pessoa_fisica"); setCnpj(""); }}>
                  <User size={15} /> Pessoa Física
                </button>
                <button type="button" style={typeBtn(clientType === "pessoa_juridica")}
                  onClick={() => { setClientType("pessoa_juridica"); setCpf(""); }}>
                  <Building2 size={15} /> Pessoa Jurídica
                </button>
              </div>
            </Field>

            {/* Nome */}
            <Field label={clientType === "pessoa_fisica" ? "Nome completo" : "Razão social"}>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type="text" required autoComplete="name"
                  placeholder={clientType === "pessoa_fisica" ? "Seu nome completo" : "Nome da empresa"}
                  value={name} onChange={(e) => setName(e.target.value)}
                  style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </Field>

            {/* E-mail + Telefone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <input
                    type="email" required autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </Field>
              <Field label="Telefone">
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <input
                    type="tel" required autoComplete="tel"
                    placeholder="(61) 99999-9999"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </Field>
            </div>

            {/* CPF ou CNPJ */}
            <Field label={clientType === "pessoa_fisica" ? "CPF" : "CNPJ"}>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                {clientType === "pessoa_fisica" ? (
                  <input type="text" required placeholder="000.000.000-00"
                    value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                ) : (
                  <input type="text" required placeholder="00.000.000/0000-00"
                    value={cnpj} onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                )}
              </div>
            </Field>

            {/* Endereço */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="CEP">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <input type="text" placeholder="00000-000"
                    value={cep} onChange={(e) => setCep(maskCEP(e.target.value))}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </Field>
              <Field label="Estado">
                <div className="relative">
                  <Map size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <select
                    value={state} onChange={(e) => setState(e.target.value)}
                    style={{ ...inputBase, appearance: "none" as const }}
                    onFocus={focusStyle as any} onBlur={blurStyle as any}
                  >
                    <option value="">UF</option>
                    {BR_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Cidade">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <input type="text" placeholder="São Paulo"
                    value={city} onChange={(e) => setCity(e.target.value)}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </Field>
            </div>

            {/* Senha */}
            <Field label="Senha">
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required minLength={6} autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputBase, paddingRight: "44px" }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-70"
                  style={{ color: MUTED }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && (
              <div className="px-4 py-3 text-sm"
                style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.3)", color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: BLUE, borderRadius: "4px" }}
            >
              {loading ? "Criando conta..." : <><span>Criar conta</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm lg:hidden" style={{ color: MUTED }}>
            Já tem conta?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: BLUE }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
