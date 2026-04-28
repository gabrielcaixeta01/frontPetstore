import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  created_at: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // campos editáveis
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);
    setUser(parsed);

    setName(parsed.name);
    setEmail(parsed.email);
    setPhone(parsed.phone || "");
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  async function handleSave() {
    if (!user) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        name,
        email,
        phone,
      });

      const response = await fetch(
        `${API_URL}/user/${user.id}?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao atualizar perfil");
      }

      // atualizar localStorage
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003c2f]">
              Meu Perfil
            </h1>
            <p className="text-gray-600 mt-2">
              Visualize e edite suas informações
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#007a53] text-white font-semibold hover:bg-[#006445] transition"
            >
              Editar perfil
            </button>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          
          {/* Nome */}
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            ) : (
              <p className="text-lg font-semibold">{user.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-gray-500">E-mail</p>
            {isEditing ? (
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            ) : (
              <p className="text-lg font-semibold">{user.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <p className="text-sm text-gray-500">Telefone</p>
            {isEditing ? (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            ) : (
              <p className="text-lg font-semibold">
                {user.phone || "Não informado"}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="text-lg font-semibold capitalize">
              {user.role}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                user.active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.active ? "Ativo" : "Inativo"}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t flex gap-3 flex-wrap">
            
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-xl border"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#007a53] text-white font-semibold hover:bg-[#006445]"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/")}
                  className="px-5 py-2 rounded-xl border"
                >
                  Voltar
                </button>

                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}