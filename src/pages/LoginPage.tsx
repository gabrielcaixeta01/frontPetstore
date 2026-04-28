import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao fazer login.");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center px-4">
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-[#003c2f] p-10 text-white flex flex-col justify-between">
          <div>
            <span className="inline-block text-sm font-semibold tracking-[0.25em] uppercase text-[#f5c542]">
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
            <p className="text-sm text-white/70">
              Inspirado na identidade visual institucional da ApexBrasil:
              moderno, limpo e profissional.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#003c2f]">Entrar</h2>
          <p className="mt-2 text-sm text-gray-500">
            Informe seus dados para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#007a53] focus:ring-2 focus:ring-[#007a53]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#007a53] focus:ring-2 focus:ring-[#007a53]/20"
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
              className="w-full rounded-xl bg-[#007a53] px-4 py-3 font-semibold text-white transition hover:bg-[#006445] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#007a53] hover:underline"
            >
              Criar cadastro
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}