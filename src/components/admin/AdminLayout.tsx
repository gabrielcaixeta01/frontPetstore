import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PawPrint, CalendarCheck, LayoutGrid, Scissors,
  Store, Tag, Users, Home, LogOut, Menu, X, ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

const TEAL  = "#0D7377";
const AMBER = "#F59E0B";
const COAL  = "#1E293B";
const BG    = "#F8FAFC";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";

const navSections = [
  {
    label: "Painel",
    items: [
      { to: "/",             label: "Início",       icon: Home,          end: true  },
    ],
  },
  {
    label: "Administração",
    items: [
      { to: "/pets",         label: "Pets",         icon: PawPrint,      end: false },
      { to: "/atendimentos", label: "Atendimentos", icon: CalendarCheck, end: false },
      { to: "/servicos",     label: "Serviços",     icon: Scissors,      end: false },
      { to: "/categorias",   label: "Categorias",   icon: LayoutGrid,    end: false },
      { to: "/lojas",        label: "Lojas",        icon: Store,         end: false },
      { to: "/usuarios",     label: "Usuários",     icon: Users,         end: false },
      { to: "/tags",         label: "Tags",         icon: Tag,           end: false },
    ],
  },
];

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getStoredUser();
  const initials = user.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "A";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>

      {/* ── Mobile header ── */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex h-[52px] items-center gap-3 px-4 md:hidden"
        style={{ background: COAL, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-8 w-8 items-center justify-center text-white/60 transition hover:bg-white/10 hover:text-white"
          style={{ borderRadius: "6px" }}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-1.5">
          <PawPrint size={16} style={{ color: TEAL }} />
          <span className="text-base font-black tracking-tight text-white">Pet Club</span>
        </div>
      </header>

      {/* ── Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-col transition-transform duration-200 ease-in-out",
          "md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ background: COAL }}
      >
        {/* Brand */}
        <div className="flex-shrink-0 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={18} style={{ color: TEAL }} />
              <span className="text-base font-black tracking-tight text-white">Pet Club</span>
            </div>
            <button
              onClick={closeSidebar}
              className="flex h-7 w-7 items-center justify-center text-white/40 transition hover:text-white md:hidden"
              style={{ borderRadius: "4px" }}
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5"
            style={{ background: "rgba(13,115,119,0.25)", borderRadius: "999px" }}>
            <ShieldCheck size={10} style={{ color: TEAL }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEAL }}>
              Painel Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1.5 px-4 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.30)" }}>
                {section.label}
              </p>
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeSidebar}
                    className="block"
                  >
                    {({ isActive }) => (
                      <div
                        className="flex items-center gap-2.5 px-2 py-[7px] text-[13px] transition-all"
                        style={{
                          borderRadius: "6px",
                          background: isActive ? TEAL : "transparent",
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.62)",
                          fontWeight: isActive ? 600 : 500,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.90)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)";
                        }}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center"
                          style={{
                            borderRadius: "6px",
                            background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                          }}
                        >
                          <item.icon size={14} color={isActive ? "#ffffff" : "rgba(255,255,255,0.45)"} />
                        </div>
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <NavLink
            to="/perfil"
            onClick={closeSidebar}
            className="flex items-center gap-2.5 p-2 transition-colors"
            style={{ borderRadius: "6px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: AMBER, color: COAL }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[12px] font-bold text-white">{user.name ?? "Admin"}</p>
                <ShieldCheck size={10} style={{ color: TEAL, flexShrink: 0 }} />
              </div>
              <p className="truncate text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{user.email ?? ""}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 px-2.5 py-1.5 text-[12px] transition-colors hover:bg-red-500/10 hover:text-red-400"
            style={{ borderRadius: "6px", color: "rgba(255,255,255,0.40)" }}
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
