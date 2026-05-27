import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

// Public shell (unauthenticated)
import Navbar from "./components/Navbar";
import PublicHome from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Admin layout + pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/Home";
import AdminAtendimentosPage from "./pages/admin/AtendimentosPage";
import AdminPetsPage from "./pages/admin/PetsPage";
import AdminServicosPage from "./pages/admin/ServicosPage";
import AdminCategoriasPage from "./pages/admin/CategoriasPage";
import AdminLojasPage from "./pages/admin/LojasPage";
import AdminLojaPage from "./pages/admin/LojaPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminTagsPage from "./pages/admin/TagsPage";
import AdminProfilePage from "./pages/admin/ProfilePage";

// Funcionario layout + pages
import FuncionarioLayout from "./components/funcionario/FuncionarioLayout";
import FuncionarioHome from "./pages/funcionario/Home";
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
import ClienteServicosPage from "./pages/cliente/ServicosPage";
import ClienteTagsPage from "./pages/cliente/TagsPage";
import ClienteLojasPage from "./pages/cliente/LojasPage";
import ClienteLojaPage from "./pages/cliente/LojaPage";
import ClienteAtendimentosPage from "./pages/cliente/AtendimentosPage";
import ClienteProfilePage from "./pages/cliente/ProfilePage";

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function PublicShell() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function AdminShell() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/pets" element={<AdminPetsPage />} />
        <Route path="/atendimentos" element={<AdminAtendimentosPage />} />
        <Route path="/servicos" element={<AdminServicosPage />} />
        <Route path="/categorias" element={<AdminCategoriasPage />} />
        <Route path="/lojas" element={<AdminLojasPage />} />
        <Route path="/lojas/:id" element={<AdminLojaPage />} />
        <Route path="/usuarios" element={<AdminUsersPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/tags" element={<AdminTagsPage />} />
        <Route path="/perfil" element={<AdminProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function ClienteShell() {
  return (
    <ClienteLayout>
      <Routes>
        <Route path="/" element={<ClienteHome />} />
        <Route path="/pets" element={<ClientePetsPage />} />
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
  return (
    <FuncionarioLayout>
      <Routes>
        <Route path="/" element={<FuncionarioHome />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FuncionarioLayout>
  );
}

function AppShell() {
  useLocation();
  const isLogged = !!localStorage.getItem("token");
  const user = getStoredUser();

  if (!isLogged) return <PublicShell />;

  const role = user?.role ?? user?.profile_type ?? user?.tipo_perfil;
  const isSuperuser = user?.is_superuser === true;

  if (role === "cliente") return <ClienteShell />;
  if (isSuperuser) return <AdminShell />;
  return <FuncionarioShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
