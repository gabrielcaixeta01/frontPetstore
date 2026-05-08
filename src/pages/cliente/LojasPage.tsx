import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Mail, ChevronRight, Navigation } from "lucide-react";
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
  const userCity = getUserCity();

  useEffect(() => {
    getLojas()
      .then((data) => {
        if (userCity) {
          const nearby = data.filter((l) => l.end_cidade.toLowerCase().trim() === userCity);
          const others = data.filter((l) => l.end_cidade.toLowerCase().trim() !== userCity);
          setLojas([...nearby, ...others]);
        } else {
          setLojas(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userCity]);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nossas Lojas</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {userCity
            ? `Lojas próximas a você${userCity ? ` em ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}` : ""} aparecem primeiro.`
            : "Encontre a unidade mais conveniente para você."}
        </p>
      </div>

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
        <div className="grid gap-4 lg:grid-cols-2">
          {lojas.map((loja) => {
            const isNearby = userCity && loja.end_cidade.toLowerCase().trim() === userCity;
            return (
              <div
                key={loja.id}
                onClick={() => navigate(`/lojas/${loja.id}`)}
                className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1c46f3]/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                      <Store size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{loja.nome}</h3>
                        {isNearby && (
                          <span className="flex items-center gap-1 rounded-full bg-[#00bb69]/10 px-2 py-0.5 text-xs font-semibold text-[#00bb69]">
                            <Navigation size={10} />
                            Próxima de você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">CNPJ: {loja.cnpj}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="mt-1 shrink-0 text-gray-300 transition group-hover:text-[#1c46f3]" />
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={13} className="shrink-0 text-gray-400" />
                    <span>
                      {loja.end_rua}, {loja.end_numero} — {loja.end_bairro},{" "}
                      {loja.end_cidade}/{loja.end_estado}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone size={12} /> {loja.telefone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail size={12} /> {loja.email}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
