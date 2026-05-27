import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFuncionarioStore } from "../../hooks/useFuncionarioStore";

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
        <p className="text-sm text-gray-400">Carregando sua loja...</p>
      </div>
    );
  }

  if (!lojaId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-400">Nenhuma loja associada a este funcionário.</p>
      </div>
    );
  }

  return null;
}
