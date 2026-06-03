import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PawPrint, CalendarCheck, LayoutGrid, Scissors,
  Store, Tag, Home, LogOut, Menu, X,
} from "lucide-react";
import type { ReactNode } from "react";

const BLUE  = "#1A3CB8";
const YELL  = "#F5A800";
const BDARK = "#0D2580";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

const navSections = [
  {
    label: "Painel",
    items: [
      { to: "/", label: "Início", icon: Home, end: true },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/pets",         label: "Pets",         icon: PawPrint,     end: false },
      { to: "/atendimentos", label: "Atendimentos",  icon: CalendarCheck, end: false },
      { to: "/servicos",     label: "Serviços",      icon: Scissors,     end: false },
      { to: "/categorias",   label: "Categorias",    icon: LayoutGrid,   end: false },
      { to: "/lojas",        label: "Minha Loja",    icon: Store,        end: false },
      { to: "/tags",         label: "Tags",          icon: Tag,          end: false },
    ],
  },
];

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
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

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <div className="flex min-h-screen" style={{ background: "#F4F4F4" }}>

      {/* ── Mobile header ── */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex h-[52px] items-center gap-3 px-4 md:hidden"
        style={{ background: BLUE }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-8 w-8 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white"
          style={{ borderRadius: "6px" }}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <img
          src="/logo_apex.png" alt="Apex Petstore"
          className="h-7 w-auto"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </header>

      {/* ── Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-col bg-white transition-transform duration-200 ease-in-out",
          "md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ borderRight: `1px solid ${BORD}` }}
      >
        {/* Brand header — blue */}
        <div className="flex-shrink-0 px-4 py-4" style={{ background: BLUE }}>
          <div className="flex items-center justify-between">
            <img
              src="/logo_apex.png" alt="Apex Petstore"
              className="h-8 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <button
              onClick={closeSidebar}
              className="flex h-7 w-7 items-center justify-center text-white/60 transition hover:text-white md:hidden"
              style={{ borderRadius: "4px" }}
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
          </div>
          {/* Role indicator */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1"
            style={{ background: "rgba(255,255,255,0.12)", borderRadius: "4px" }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.7)" }}>
              Funcionário
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-3">
              <p className="mb-1 px-4 text-[9px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeSidebar}
                    className="group relative mx-2 block"
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div
                            className="absolute -left-2 bottom-1.5 top-1.5 w-[3px]"
                            style={{ background: BLUE, borderRadius: "0 2px 2px 0" }}
                          />
                        )}
                        <div
                          className={`flex items-center gap-2.5 px-2 py-[7px] text-[13px] transition-all ${
                            isActive
                              ? "font-bold"
                              : "font-medium text-gray-600 hover:text-[#1A3CB8]"
                          }`}
                          style={{
                            borderRadius: "6px",
                            background: isActive ? "rgba(26,60,184,0.08)" : undefined,
                            color: isActive ? BLUE : undefined,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(26,60,184,0.05)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) (e.currentTarget as HTMLElement).style.background = "";
                          }}
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center transition-colors"
                            style={{
                              borderRadius: "6px",
                              background: isActive ? BLUE : "#F4F4F4",
                            }}
                          >
                            <item.icon size={14} color={isActive ? "#ffffff" : MUTED} />
                          </div>
                          {item.label}
                        </div>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: `1px solid ${BORD}` }}>
          <NavLink
            to="/perfil"
            onClick={closeSidebar}
            className="flex items-center gap-2.5 p-2 transition-colors hover:bg-gray-50"
            style={{ borderRadius: "6px" }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: YELL, color: BDARK, border: `2px solid ${BLUE}` }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-gray-900">{user.name ?? "Funcionário"}</p>
              <p className="truncate text-[10px]" style={{ color: MUTED }}>{user.email ?? ""}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 px-2.5 py-1.5 text-[12px] transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ borderRadius: "6px", color: MUTED }}
          >
            <LogOut size={13} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden pt-[52px] md:pt-0">
        {children}
      </div>
    </div>
  );
}
