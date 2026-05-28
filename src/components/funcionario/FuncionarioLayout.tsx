import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  LayoutGrid,
  Scissors,
  Store,
  Tag,
  Users,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/pets", label: "Pets", icon: PawPrint, end: false },
  { to: "/atendimentos", label: "Atendimentos", icon: CalendarCheck, end: false },
  { to: "/servicos", label: "Serviços", icon: Scissors, end: false },
  { to: "/categorias", label: "Categorias", icon: LayoutGrid, end: false },
  { to: "/lojas", label: "Minha Loja", icon: Store, end: false },
  { to: "/usuarios", label: "Usuários", icon: Users, end: false },
  { to: "/tags", label: "Tags", icon: Tag, end: false },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export default function FuncionarioLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getStoredUser();
  const initials = user.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "F";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Mobile header ── */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo_apex.png" alt="Apex" className="h-7 w-7" />
          <span className="text-sm font-semibold text-gray-900">Apex Petstore</span>
        </div>
      </header>

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-200 ease-in-out",
          "md:sticky md:top-0 md:h-screen md:w-60 md:translate-x-0 md:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo_apex.png" alt="Apex" className="h-8 w-8" />
            <div>
              <span className="bg-gradient-to-r from-[#1c46f3] to-[#00bb69] bg-clip-text text-sm font-bold text-transparent">
                Apex
              </span>
              <span className="text-sm font-light text-gray-900"> Petstore</span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 md:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Gestão
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
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
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1c46f3]/15 to-[#00bb69]/15 text-sm font-bold text-[#1c46f3]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user.name ?? "Funcionário"}
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
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
