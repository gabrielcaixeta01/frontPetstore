import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

// Public shell (unauthenticated)
const Navbar = lazy(() => import("./components/Navbar"));
const PublicHome = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const RegisterFuncionarioPage = lazy(() => import("./pages/RegisterFuncionarioPage"));

// Admin layout + pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminHome = lazy(() => import("./pages/admin/Home"));
const AdminAtendimentosPage = lazy(() => import("./pages/admin/AtendimentosPage"));
const AdminPetsPage = lazy(() => import("./pages/admin/PetsPage"));
const AdminServicosPage = lazy(() => import("./pages/admin/ServicosPage"));
const AdminCategoriasPage = lazy(() => import("./pages/admin/CategoriasPage"));
const AdminLojasPage = lazy(() => import("./pages/admin/LojasPage"));
const AdminLojaPage = lazy(() => import("./pages/admin/LojaPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminTagsPage = lazy(() => import("./pages/admin/TagsPage"));
const AdminProfilePage = lazy(() => import("./pages/admin/ProfilePage"));

// Funcionario layout + pages
const FuncionarioLayout = lazy(() => import("./components/funcionario/FuncionarioLayout"));
const FuncionarioHome = lazy(() => import("./pages/funcionario/Home"));
const CategoriasPage = lazy(() => import("./pages/funcionario/CategoriasPage"));
const LojasPage = lazy(() => import("./pages/funcionario/LojasPage"));
const LojaPage = lazy(() => import("./pages/funcionario/LojaPage"));
const AtendimentosPage = lazy(() => import("./pages/funcionario/AtendimentosPage"));
const PetsPage = lazy(() => import("./pages/funcionario/PetsPage"));
const ServicosPage = lazy(() => import("./pages/funcionario/ServicosPage"));
const TagsPage = lazy(() => import("./pages/funcionario/TagsPage"));
const UsersPage = lazy(() => import("./pages/funcionario/UsersPage"));
const ProfilePage = lazy(() => import("./pages/funcionario/ProfilePage"));

// Cliente layout + pages
const ClienteLayout = lazy(() => import("./components/cliente/ClienteLayout"));
const ClienteHome = lazy(() => import("./pages/cliente/Home"));
const ClientePetsPage = lazy(() => import("./pages/cliente/PetsPage"));
const ClienteServicosPage = lazy(() => import("./pages/cliente/ServicosPage"));
const ClienteTagsPage = lazy(() => import("./pages/cliente/TagsPage"));
const ClienteLojasPage = lazy(() => import("./pages/cliente/LojasPage"));
const ClienteLojaPage = lazy(() => import("./pages/cliente/LojaPage"));
const ClienteAtendimentosPage = lazy(() => import("./pages/cliente/AtendimentosPage"));
const ClienteProfilePage = lazy(() => import("./pages/cliente/ProfilePage"));

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
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-funcionario" element={<RegisterFuncionarioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Suspense>
  );
}

function AdminShell() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
    </Suspense>
  );
}

function ClienteShell() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
    </Suspense>
  );
}

function FuncionarioShell() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
    </Suspense>
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
