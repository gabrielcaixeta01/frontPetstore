import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { apexTheme } from "../lib/theme";


export default function LoginPage() {
  const navigate = useNavigate();
  const c = apexTheme.colors;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post("/auth/login", { email, password }).then(r => r.data);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Erro ao fazer login.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`min-h-screen ${c.bgSoft} flex items-center justify-center px-4 py-10`}>
      <section className={`w-full max-w-5xl overflow-hidden rounded-3xl border ${c.border} bg-white shadow-xl`}>
        <div className="flex flex-col justify-between bg-linear-to-br from-[#1c46f3] via-[#1840e0] to-[#00bb69] p-10 text-white">
          <div>
            <span className="inline-block rounded-full bg-[#ffd200] px-3 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-gray-900">
              Petstore Apex
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Bem-vindo de volta
            </h1>

            <p className="mt-4 text-white/80">
              Acesse sua conta para gerenciar pets, atendimentos, serviços e
              clientes de forma simples e segura.
            </p>
          </div>

          <div className="mt-10 border-t border-white/20 pt-6">
            <p className="text-sm text-white/80">
              Visual alinhado ao sistema: cores institucionais, contraste claro
              e foco em leitura rápida.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h2 className={`text-2xl font-bold ${c.text}`}>Entrar</h2>
          <p className={`mt-2 text-sm ${c.textMuted}`}>
            Informe seus dados para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className={`block text-sm font-medium ${c.textSoft}`}>
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${c.border} px-4 py-3 outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/20`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${c.textSoft}`}>
                Senha
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${c.border} px-4 py-3 outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/20`}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${c.primary} ${c.primaryHover} ${c.primaryText}`}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${c.textMuted}`}>
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#1c46f3] hover:underline"
            >
              Criar cadastro
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}