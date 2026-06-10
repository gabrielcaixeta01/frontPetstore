import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Mail, ChevronRight, Navigation } from "lucide-react";
import { getLojas } from "../../services/lojaService";
import type { Loja } from "../../types/loja";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}
function getUserCity(): string {
  const u = getStoredUser();
  return (u.city ?? u.cidade ?? "").toLowerCase().trim();
}

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

export default function ClienteLojasPage() {
  const navigate = useNavigate();
  const [lojas, setLojas]     = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
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
    } catch { setError("Erro ao carregar lojas."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadLojas(); }, [userCity]);

  const cityList = useMemo(() => {
    const map: Record<string, { city: string; state: string; count: number }> = {};
    lojas.forEach((l) => {
      const key = `${l.city.trim()}/${l.state.trim().toUpperCase()}`;
      if (!map[key]) map[key] = { city: l.city.trim(), state: l.state.trim().toUpperCase(), count: 0 };
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [lojas]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-5 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Nossas Unidades</p>
          <div className="flex items-center gap-2">
            <Store size={22} className="text-white/80" />
            <h1 className="text-2xl font-extrabold text-white">Nossas Lojas</h1>
          </div>
          <p className="mt-0.5 text-sm text-white/70">
            {userCity
              ? `Lojas próximas a você em ${userCity.charAt(0).toUpperCase() + userCity.slice(1)} aparecem primeiro.`
              : "Encontre a unidade mais conveniente para você."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
          Carregando lojas...
        </div>
      ) : lojas.length === 0 ? (
        <div className="p-12 text-center" style={{ border: `1px dashed ${BORD}`, borderRadius: "10px", background: "#fff" }}>
          <Store size={36} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: MUTED }}>Nenhuma loja encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cityList.length > 0 && (
            <div className="bg-white px-5 py-4" style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Distribuição geográfica</p>
              <div className="flex flex-wrap gap-2">
                {cityList.map(({ city, state, count }) => (
                  <div key={`${city}-${state}`} className="flex items-center gap-1.5 px-3 py-1.5"
                    style={{ border: `1px solid ${BORD}`, borderRadius: "20px", background: "#F8FAFC" }}>
                    <MapPin size={12} style={{ color: TEAL }} />
                    <span className="text-sm font-medium" style={{ color: COAL }}>{city}</span>
                    <span className="text-xs" style={{ color: MUTED }}>{state}</span>
                    {count > 1 && (
                      <span className="px-1.5 py-0.5 text-xs font-bold"
                        style={{ background: "#e6f5f5", borderRadius: "20px", color: TDARK }}>
                        {count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {lojas.map((loja) => {
              const isNearby = userCity && loja.city.toLowerCase().trim() === userCity;
              return (
                <div key={loja.id}
                  className="overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
                  <div onClick={() => navigate(`/lojas/${loja.id}`)} className="cursor-pointer p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "#e6f5f5" }}>
                        <Store size={20} style={{ color: TEAL }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold" style={{ color: COAL }}>{loja.nome}</h3>
                          {isNearby && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold"
                              style={{ background: "#e6f5f5", borderRadius: "20px", color: TDARK }}>
                              <Navigation size={10} /> Próxima
                            </span>
                          )}
                          <ChevronRight size={14} className="ml-auto" style={{ color: "#D1D5DB" }} />
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                          <MapPin size={11} className="shrink-0" />
                          {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                          <Phone size={11} /> {loja.telefone}
                          <span className="mx-1" style={{ color: BORD }}>·</span>
                          <Mail size={11} /> {loja.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 text-xs" style={{ borderTop: `1px solid ${BORD}`, background: "#F8FAFC", color: MUTED }}>
                    CNPJ: {loja.cnpj}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
