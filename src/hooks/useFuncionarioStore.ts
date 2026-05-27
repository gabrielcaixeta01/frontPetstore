import { useEffect, useState } from "react";
import { getUsuarioById } from "../services/usuarioService";

function getStoredUserId(): number | null {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return typeof user.id === "number" ? user.id : null;
  } catch {
    return null;
  }
}

export function useFuncionarioStore(): { lojaId: number | null; loading: boolean } {
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) { setLoading(false); return; }
    getUsuarioById(userId)
      .then((u) => setLojaId(u.employee_profile?.loja_id ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { lojaId, loading };
}
