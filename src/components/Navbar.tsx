import NavCliente from "./cliente/NavCliente";
import NavFuncionario from "./funcionario/NavFuncionario";

type UserRole = "cliente" | "funcionario" | string | null;

function getStoredRole(): UserRole {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role : null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const role = getStoredRole();

  return role === "cliente" ? <NavCliente /> : <NavFuncionario />;
}