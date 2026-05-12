import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Mail, ChevronRight, Navigation, RefreshCw } from "lucide-react";
import { getLojas } from "../../services/lojaService";
import type { Loja } from "../../types/loja";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

function getUserCity(): string {
  const u = getStoredUser();
  return (u.city ?? u.cidade ?? "").toLowerCase().trim();
}

export default function ClienteLojasPage() {
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userCity = getUserCity();

  async function loadLojas() {
    try {
      setLoading(true);
      const data = await getLojas();
      if (userCity) {
        const nearby = data.filter((l) => l.city.toLowerCase().trim() === userCity);
        const others = data.filter((l) => l.city.toLowerCase().trim() !== userCity);
        setLojas([...nearby, ...others]);
      } else {
        setLojas(data);
      }
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar lojas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLojas();
  }, [userCity]);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nossas Lojas</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {userCity
                ? `Lojas próximas a você${userCity ? ` em ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}` : ""} aparecem primeiro.`
                : "Encontre a unidade mais conveniente para você."}
            </p>
          </div>
          <button
            onClick={loadLojas}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            Carregando lojas...
          </div>
        ) : lojas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <Store size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">Nenhuma loja encontrada.</p>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {lojas.map((loja) => {
                const isNearby = userCity && loja.city.toLowerCase().trim() === userCity;
                return (
                  <div
                    key={loja.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md hover:border-[#1c46f3]/20"
                  >
                    {/* Clickable area */}
                    <div
                      onClick={() => navigate(`/lojas/${loja.id}`)}
                      className="cursor-pointer p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                          <Store size={20} className="text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-[#1c46f3] transition-colors">
                              {loja.nome}
                            </h3>
                            {isNearby && (
                              <span className="flex items-center gap-1 rounded-full bg-[#00bb69]/10 px-2 py-0.5 text-xs font-semibold text-[#00bb69]">
                                <Navigation size={10} />
                                Próxima
                              </span>
                            )}
                            <ChevronRight size={14} className="ml-auto text-gray-300 transition group-hover:text-[#1c46f3] group-hover:translate-x-0.5" />
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={11} className="shrink-0" />
                            {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone size={11} /> {loja.telefone}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail size={11} /> {loja.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-50 px-5 py-2.5 text-xs text-gray-400">
                      CNPJ: {loja.cnpj}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

