import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/pets", label: "Pets" },
  { to: "/users", label: "Usuários" },
  { to: "/tags", label: "Tags" },
  { to: "/orders", label: "Pedidos" },
];

export default function AppNavbar() {

  return (
    <header className="sticky top-0 z-50 border-b border-[#1f5a55] bg-[#071c1b]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-xl font-bold text-white">
          Petstore ApexBrasil
        </NavLink>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#00a889] text-[#071c1b]"
                    : "text-[#d7ece8] hover:bg-[#123d3a]"
                }`
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