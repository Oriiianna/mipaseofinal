import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import NotFound from "./pages/public/NotFound";
import Account from "./pages/account/Account";
import OwnerWalks from "./pages/owner/OwnerWalks";
import MyPets from "./pages/owner/MyPets";
import SearchWalkers from "./pages/owner/SearchWalkers";
import WalkerProfile from "./pages/owner/WalkerProfile";
import WalkerWalks from "./pages/walker/WalkerWalks";
import WalkerSettings from "./pages/walker/WalkerSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWalks from "./pages/admin/AdminWalks";
import AdminReviews from "./pages/admin/AdminReviews";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Layout from "./components/layout/Layout";

/** Rutas de la app: las públicas y las privadas agrupadas por rol. */
export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        <Route
          element={<ProtectedRoute roles={["owner", "walker", "admin"]} />}
        >
          <Route element={<Layout />}>
            <Route path="/cuenta" element={<Account />} />

            <Route element={<ProtectedRoute roles={["owner"]} />}>
              <Route path="/duenio/paseos" element={<OwnerWalks />} />
              <Route path="/duenio/mascotas" element={<MyPets />} />
              <Route path="/duenio/buscar" element={<SearchWalkers />} />
            </Route>

            <Route element={<ProtectedRoute roles={["owner", "admin"]} />}>
              <Route path="/paseadores/:id" element={<WalkerProfile />} />
            </Route>

            <Route element={<ProtectedRoute roles={["walker"]} />}>
              <Route path="/paseador/paseos" element={<WalkerWalks />} />
              <Route path="/paseador/perfil" element={<WalkerSettings />} />
            </Route>

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/paseos" element={<AdminWalks />} />
              <Route path="/admin/resenas" element={<AdminReviews />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
