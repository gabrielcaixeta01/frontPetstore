import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apexTheme } from "../lib/theme";
import { login, saveToken } from "../services/authService";

export default function LoginPage() {
  const c = apexTheme.colors;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login({
        username: username.trim(),
        password,
      });

      saveToken(response.access_token);
      navigate("/");
    } catch (err) {
      console.error("Erro no login:");
      const message = err || "Não foi possível fazer login. Verifique suas credenciais.";
      setError(typeof message === "string" ? message : "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen ${c.bg} ${c.text}`}>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,168,137,0.24),transparent_35%),radial-gradient(circle_at_left,rgba(242,201,76,0.14),transparent_28%)]" />
          <div className="relative flex w-full flex-col justify-between p-12">
            <div>
              <div className="inline-flex rounded-full border border-[#2d726b] bg-[#0f2f2d]/80 px-4 py-2 text-sm text-[#cfe6e2] backdrop-blur">
                Petstore da ApexBrasil
              </div>
            </div>

            <div className="max-w-xl space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Plataforma moderna para gestão completa da Petstore.
              </h1>
              <p className={`text-lg ${c.textSoft}`}>
                Acesse o painel para administrar pets, usuários, pedidos e tags
                com uma interface limpa, rápida e integrada ao backend FastAPI.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`rounded-2xl border ${c.border} ${c.card} p-5`}>
                  <p className={`text-sm ${c.textMuted}`}>Segurança</p>
                  <p className="mt-2 text-xl font-semibold">JWT</p>
                </div>
                <div className={`rounded-2xl border ${c.border} ${c.card} p-5`}>
                  <p className={`text-sm ${c.textMuted}`}>Frontend</p>
                  <p className="mt-2 text-xl font-semibold">React</p>
                </div>
                <div className={`rounded-2xl border ${c.border} ${c.card} p-5`}>
                  <p className={`text-sm ${c.textMuted}`}>Backend</p>
                  <p className="mt-2 text-xl font-semibold">FastAPI</p>
                </div>
              </div>
            </div>

            <p className={`text-sm ${c.textMuted}`}>
              ApexBrasil • Petstore Management
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className={`w-full max-w-md rounded-3xl border ${c.border} ${c.card} p-8 shadow-2xl`}>
            <div className="mb-8">
              <p className={`text-sm ${c.textMuted}`}>Acesso seguro</p>
              <h2 className="mt-2 text-3xl font-bold">Entrar</h2>
              <p className={`mt-2 text-sm ${c.textSoft}`}>
                Faça login para acessar o painel administrativo da Petstore.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-[#d7ece8]"
                >
                  Usuário
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full rounded-2xl border border-[#2d726b] bg-[#0b2725] px-4 py-3 text-white outline-none transition placeholder:text-[#7ea8a1] focus:border-[#00a889]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#d7ece8]"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-[#2d726b] bg-[#0b2725] px-4 py-3 text-white outline-none transition placeholder:text-[#7ea8a1] focus:border-[#00a889]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-5 py-3 font-semibold transition ${c.primary} ${c.primaryText} ${c.primaryHover} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}