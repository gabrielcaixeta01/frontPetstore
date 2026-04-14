import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/pets", label: "Pets" },
  { to: "/usuarios", label: "Usuários" },
  { to: "/tags", label: "Tags" },
  { to: "/atendimentos", label: "Atendimentos" },
];

export default function AppNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-linear-to-r from-[#1c46f3] to-[#00bb69] bg-clip-text text-transparent">
            Apex
          </div>
          <div className="text-2xl font-light text-gray-900">Petstore</div>
        </NavLink>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#1c46f3] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  : "text-gray-700 hover:text-[#1c46f3] px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-50"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}