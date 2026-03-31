import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import Home from "./pages/Home";
import OrdersPage from "./pages/OrdersPage";
import PetsPage from "./pages/PetsPage";
import TagsPage from "./pages/TagsPage";
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#071c1b]">
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;