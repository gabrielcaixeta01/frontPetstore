import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { apexTheme } from "./lib/theme";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CategoriasPage from "./pages/CategoriasPage";
import LojasPage from "./pages/LojasPage";
import LojaPage from "./pages/LojaPage";
import AtendimentosPage from "./pages/AtendimentosPage";
import PetsPage from "./pages/PetsPage";
import ServicosPage from "./pages/ServicosPage";
import TagsPage from "./pages/TagsPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";

type UserRole = "cliente" | "funcionario" | string | null;

function getStoredRole(): UserRole {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role : null;
  } catch {
    return null;
  }
}

function AppShell() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>(() => getStoredRole());

  useEffect(() => {
    setUserRole(getStoredRole());
  }, [location.pathname]);

  const isCliente = userRole === "cliente";
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
        <Route
          path="/usuarios"
          element={isCliente ? <Navigate to="/" replace /> : <UsersPage />}
        />
        <Route
          path="/users"
          element={isCliente ? <Navigate to="/" replace /> : <UsersPage />}
        />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/atendimentos" element={<AtendimentosPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
