import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: "cliente",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao criar conta.");
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
              Crie sua conta
            </h1>

            <p className="mt-4 text-white/80">
              Cadastre-se para acompanhar seus pets, atendimentos e serviços em
              uma plataforma clara e eficiente.
            </p>
          </div>

          <div className="mt-10 border-t border-white/20 pt-6">
            <p className="text-sm text-white/70">
              Gestão moderna para uma experiência mais simples no petshop.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#003c2f]">Cadastro</h2>
          <p className="mt-2 text-sm text-gray-500">
            Preencha os dados abaixo para começar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                type="text"
                required
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#007a53] focus:ring-2 focus:ring-[#007a53]/20"
              />
            </div>

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
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(61) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                placeholder="Mínimo de 8 caracteres"
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
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#007a53] hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}