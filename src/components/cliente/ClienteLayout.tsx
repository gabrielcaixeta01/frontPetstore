import { NavLink, useNavigate } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  LayoutGrid,
  Scissors,
  Store,
  Tag,
  Home,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/pets", label: "Meus Pets", icon: PawPrint, end: false },
  { to: "/atendimentos", label: "Atendimentos", icon: CalendarCheck, end: false },
  { to: "/servicos", label: "Serviços", icon: Scissors, end: false },
  { to: "/categorias", label: "Categorias", icon: LayoutGrid, end: false },
  { to: "/lojas", label: "Lojas", icon: Store, end: false },
  { to: "/tags", label: "Tags", icon: Tag, end: false },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export default function ClienteLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const initials = user.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "U";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c46f3] to-[#00bb69]">
            <PawPrint size={15} className="text-white" />
          </div>
          <div>
            <span className="bg-gradient-to-r from-[#1c46f3] to-[#00bb69] bg-clip-text text-sm font-bold text-transparent">
              Apex
            </span>
            <span className="text-sm font-light text-gray-900"> Petstore</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Menu
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-[#1c46f3] to-[#1840e0] text-white shadow-sm shadow-[#1c46f3]/20"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-4">
          <NavLink
            to="/perfil"
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1c46f3]/15 to-[#00bb69]/15 text-sm font-bold text-[#1c46f3]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user.name ?? "Usuário"}
              </p>
              <p className="truncate text-xs text-gray-400">{user.email ?? ""}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
