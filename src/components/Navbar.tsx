import { NavLink, useLocation, useNavigate } from "react-router-dom";

const links = [
  { to: "/pets", label: "Pets" },
  { to: "/categorias", label: "Categorias" },
  { to: "/servicos", label: "Serviços" },
  { to: "/lojas", label: "Lojas" },
  { to: "/usuarios", label: "Usuários" },
  { to: "/tags", label: "Tags" },
  { to: "/atendimentos", label: "Atendimentos" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLogged = !!token;

  const isHome = location.pathname === "/";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-linear-to-r from-[#1c46f3] to-[#00bb69] bg-clip-text text-transparent">
            Apex
          </div>
          <div className="text-2xl font-light text-gray-900">Petstore</div>
        </NavLink>

        {/* NAV */}
        <nav className="flex items-center gap-2">
          
          {/* 🔒 Usuário logado → mostrar navegação (exceto na home, se quiser esconder) */}
          {isLogged && !isHome && (
            <>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-[#1c46f3] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      : "text-gray-700 hover:text-[#1c46f3] px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-50"
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </>
          )}

          {/* 🔓 NÃO LOGADO → Login + Cadastro */}
          {!isLogged && (
            <>
              <NavLink
                to="/login"
                className="text-gray-700 hover:text-[#1c46f3] px-4 py-2 text-sm font-medium"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="bg-[#007a53] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#006445] transition"
              >
                Cadastro
              </NavLink>
            </>
          )}

          {/* 🔒 LOGADO → Perfil + Logout */}
          {isLogged && (
            <>
              <NavLink
                to="/perfil"
                className="text-gray-700 hover:text-[#1c46f3] px-4 py-2 text-sm font-medium"
              >
                Perfil
              </NavLink>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
              >
                Sair
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}