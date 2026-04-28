import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  const c = apexTheme.colors;

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;