import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFuncionarioStore } from "../../hooks/useFuncionarioStore";

const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

export default function LojasPage() {
  const { lojaId, loading } = useFuncionarioStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && lojaId != null) {
      navigate(`/lojas/${lojaId}`, { replace: true });
    }
  }, [lojaId, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="p-8 text-center text-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
          Carregando sua loja...
        </div>
      </div>
    );
  }

  if (!lojaId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="p-8 text-center text-sm"
          style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
          Nenhuma loja associada a este funcionário.
        </div>
      </div>
    );
  }

  return null;
}
