import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { apexTheme } from "./lib/theme";

// Shared / public
import Navbar from "./components/Navbar";
import Home from "./pages/funcionario/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Employee pages (funcionario)
import CategoriasPage from "./pages/funcionario/CategoriasPage";
import LojasPage from "./pages/funcionario/LojasPage";
import LojaPage from "./pages/funcionario/LojaPage";
import AtendimentosPage from "./pages/funcionario/AtendimentosPage";
import PetsPage from "./pages/funcionario/PetsPage";
import ServicosPage from "./pages/funcionario/ServicosPage";
import TagsPage from "./pages/funcionario/TagsPage";
import UsersPage from "./pages/funcionario/UsersPage";
import ProfilePage from "./pages/funcionario/ProfilePage";

// Cliente layout + pages
import ClienteLayout from "./components/cliente/ClienteLayout";
import ClienteHome from "./pages/cliente/Home";
import ClientePetsPage from "./pages/cliente/PetsPage";
import ClienteCategoriasPage from "./pages/cliente/CategoriasPage";
import ClienteServicosPage from "./pages/cliente/ServicosPage";
import ClienteTagsPage from "./pages/cliente/TagsPage";
import ClienteLojasPage from "./pages/cliente/LojasPage";
import ClienteLojaPage from "./pages/cliente/LojaPage";
import ClienteAtendimentosPage from "./pages/cliente/AtendimentosPage";
import ClienteProfilePage from "./pages/cliente/ProfilePage";

type UserRole = "cliente" | "funcionario" | string | null;

function getStoredRole(): UserRole {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const user = JSON.parse(stored);
    // backend may return role as "role", "profile_type", or "tipo_perfil"
    return user.role ?? user.profile_type ?? user.tipo_perfil ?? null;
  } catch {
    return null;
  }
}

function ClienteShell() {
  return (
    <ClienteLayout>
      <Routes>
        <Route path="/" element={<ClienteHome />} />
        <Route path="/pets" element={<ClientePetsPage />} />
        <Route path="/categorias" element={<ClienteCategoriasPage />} />
        <Route path="/servicos" element={<ClienteServicosPage />} />
        <Route path="/tags" element={<ClienteTagsPage />} />
        <Route path="/lojas" element={<ClienteLojasPage />} />
        <Route path="/lojas/:id" element={<ClienteLojaPage />} />
        <Route path="/atendimentos" element={<ClienteAtendimentosPage />} />
        <Route path="/perfil" element={<ClienteProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClienteLayout>
  );
}

function FuncionarioShell() {
  const c = apexTheme.colors;
  return (
    <div className={`min-h-screen ${c.bg}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pets" element={<PetsPage />} />
        <Route path="/servicos" element={<ServicosPage />} />
        <Route path="/lojas" element={<LojasPage />} />
        <Route path="/lojas/:id" element={<LojaPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/atendimentos" element={<AtendimentosPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

function AppShell() {
  // useLocation causes re-render on every navigation, so reading
  // localStorage here (synchronously) always gets the latest role
  useLocation();
  const userRole = getStoredRole();

  if (userRole === "cliente") {
    return <ClienteShell />;
  }

  return <FuncionarioShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
