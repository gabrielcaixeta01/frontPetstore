import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  PawPrint,
  ShieldCheck,
  Zap,
  ArrowRight,
  Building2,
  CreditCard,
  MapPin,
  Map,
} from "lucide-react";
import { api } from "../services/api";

const features = [
  { icon: PawPrint, text: "Cadastre e acompanhe seus pets" },
  { icon: ShieldCheck, text: "Dados seguros e sempre acessíveis" },
  { icon: Zap, text: "Acesso imediato após o cadastro" },
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

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#00bb69] focus:ring-2 focus:ring-[#00bb69]/20";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [clientType, setClientType] = useState<"pessoa_fisica" | "pessoa_juridica">("pessoa_fisica");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        name,
        email,
        phone,
        password,
        profile_type: "cliente",
        client_type: clientType,
      };

      if (clientType === "pessoa_fisica") {
        payload.cpf = cpf;
      } else {
        payload.cnpj = cnpj;
      }

      if (cep) payload.cep = cep;
      if (state) payload.state = state;
      if (city) payload.city = city;

      const data = await api.post("/auth/register", payload).then((r) => r.data);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const errorMessage = Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? String(d)).join(", ")
        : typeof detail === "string"
        ? detail
        : err?.message || "Erro ao criar conta.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Painel esquerdo ── */}
      <div className="relative hidden lg:flex lg:w-[480px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00bb69] via-[#009b57] to-[#1c46f3] p-12 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-0 h-72 w-72 translate-x-1/2 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#ffd200]/10" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <PawPrint size={20} className="text-[#ffd200]" />
          </div>
          <span className="text-xl font-bold tracking-tight">Apex Petstore</span>
        </div>

        <div className="relative space-y-6">
          <div>
            <span className="inline-block rounded-full bg-[#ffd200] px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-900">
              Novo por aqui
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight">
              Comece a cuidar<br />melhor dos pets.
            </h1>
            <p className="mt-4 text-base text-white/70">
              Crie sua conta e tenha acesso completo à plataforma em segundos.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon size={15} />
                </div>
                <span className="text-sm text-white/85">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative border-t border-white/20 pt-6 text-sm text-white/60">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold text-white hover:text-[#ffd200] transition-colors">
            Entrar
          </Link>
        </div>
      </div>

      {/* ── Painel direito (form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <PawPrint size={22} className="text-[#1c46f3]" />
          <span className="text-lg font-bold text-gray-900">Apex Petstore</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
            <p className="mt-1 text-sm text-gray-500">Preencha os dados abaixo para começar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de cliente */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Tipo de cadastro</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setClientType("pessoa_fisica"); setCnpj(""); }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                    clientType === "pessoa_fisica"
                      ? "border-[#00bb69] bg-[#00bb69]/10 text-[#009b57]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <User size={15} />
                  Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => { setClientType("pessoa_juridica"); setCpf(""); }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                    clientType === "pessoa_juridica"
                      ? "border-[#00bb69] bg-[#00bb69]/10 text-[#009b57]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Building2 size={15} />
                  Pessoa Jurídica
                </button>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                {clientType === "pessoa_fisica" ? "Nome completo" : "Razão social"}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={clientType === "pessoa_fisica" ? "Seu nome completo" : "Nome da empresa"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* E-mail + Telefone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="(61) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* CPF ou CNPJ */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                {clientType === "pessoa_fisica" ? "CPF" : "CNPJ"}
              </label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {clientType === "pessoa_fisica" ? (
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    className={inputCls}
                  />
                )}
              </div>
            </div>

            {/* Endereço: CEP + Estado + Cidade */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(maskCEP(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className="relative">
                  <Map size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#00bb69] focus:ring-2 focus:ring-[#00bb69]/20 appearance-none"
                  >
                    <option value="">UF</option>
                    {BR_STATES.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:border-[#00bb69] focus:ring-2 focus:ring-[#00bb69]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00bb69] to-[#009b57] py-3 text-sm font-semibold text-white shadow-md shadow-[#00bb69]/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Criando conta..." : (
                <>
                  Criar conta
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
            Já tem conta?{" "}
            <Link to="/login" className="font-semibold text-[#1c46f3] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
