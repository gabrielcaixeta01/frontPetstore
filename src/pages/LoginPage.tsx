import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, PawPrint, CalendarCheck, Store, ArrowRight } from "lucide-react";
import { api } from "../services/api";

const BLUE  = "#1A3CB8";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BG    = "#F4F4F4";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

const features = [
  { icon: PawPrint,      text: "Gerencie pets, raças e histórico de saúde" },
  { icon: CalendarCheck, text: "Acompanhe atendimentos em tempo real" },
  { icon: Store,         text: "Controle lojas, serviços e equipes" },
];

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

const inputCls = {
  display: "block" as const,
  width: "100%",
  padding: "10px 16px 10px 40px",
  fontSize: "14px",
  border: `1px solid ${BORD}`,
  borderRadius: "4px",
  background: "#FFFFFF",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: "#1A1A1A" }}>{label}</label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email, password }).then((r) => r.data);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err: any) {
      const detail: string = err?.response?.data?.detail || err?.message || "Credenciais inválidas.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = BLUE;
    e.target.style.boxShadow  = "0 0 0 3px rgba(26,60,184,0.10)";
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = BORD;
    e.target.style.boxShadow  = "none";
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div
        className="relative hidden lg:flex lg:w-[480px] flex-col justify-between overflow-hidden p-12 text-white lg:pt-20"
        style={{ background: `url('/apex4.jpg') center/cover no-repeat` }}
      >
        {/* Blue overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(10, 28, 110, 0.80)" }} />

        <GeometricDecor />

        {/* Logo */}
        <div className="relative">
          <img src="/logo_apex.png" alt="Pet Club" className="h-10 w-auto"
            style={{ filter: "brightness(0) invert(1)" }} />
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ background: YELL, color: "#0D2580", borderRadius: "20px" }}>
              Bem-vindo de volta
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight">
              Tudo do seu petshop,<br />em um só lugar.
            </h1>
            <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.75)" }}>
              Entre na sua conta e acesse a gestão completa da sua operação.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px" }}>
                  <f.icon size={15} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative pt-6 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.60)" }}>
          Ainda não tem conta?{" "}
          <Link to="/register" className="font-semibold text-white hover:opacity-80 transition-opacity">
            Criar cadastro
          </Link>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ background: BG }}>
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Acesse sua conta</h2>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>Informe seu e-mail e senha para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="E-mail">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputCls}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </Field>

            <Field label="Senha">
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputCls, paddingRight: "44px" }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
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
              <div className="px-4 py-3 text-sm" style={{
                borderRadius: "4px",
                border: error.toLowerCase().includes("desativada") ? `1px solid ${YELL}` : "1px solid #FECACA",
                background: error.toLowerCase().includes("desativada") ? "rgba(245,168,0,0.08)" : "rgba(254,202,202,0.3)",
                color: error.toLowerCase().includes("desativada") ? "#92400E" : "#DC2626",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: BLUE, borderRadius: "4px" }}
            >
              {loading ? "Entrando..." : <><span>Entrar</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm lg:hidden" style={{ color: MUTED }}>
            Não tem conta?{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: BLUE }}>
              Criar cadastro
            </Link>
          </p>
          <p className="mt-2 text-center text-sm" style={{ color: MUTED }}>
            É funcionário?{" "}
            <Link to="/register-funcionario" className="font-semibold hover:underline" style={{ color: BLUE }}>
              Cadastro de funcionário
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
