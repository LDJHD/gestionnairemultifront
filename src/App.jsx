import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import './index.css';
import Detail from "./pages/dashboard/detail";
import Detailproduit from "./pages/dashboard/detailproduit";
import Detailvente from "./pages/dashboard/detailvente";
import Vendre from "./pages/dashboard/vendre";
import { SignUp } from "./pages/auth";
import { ResetPassword } from "./pages/auth/reset-password";
import Boutique from "./pages/boutique";
import SuiviCommande from "./pages/boutique/suivi";
import PaiementRetour from "./pages/boutique/paiement-retour";

function App() {
  return (
    <Routes>
      {/* Espace gestion (socle conservé) */}
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/detail/*" element={<Detail />} />
      <Route path="/operation" element={<Vendre />} />
      <Route path="/detailproduit/*" element={<Detailproduit />} />
      <Route path="/detailvente/*" element={<Detailvente />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/auth/sign-up" element={<SignUp />} />
      <Route path="/auth/reinitialiser-mot-de-passe" element={<ResetPassword />} />

      {/* Espace client public — boutique en ligne (nouveaux modules) */}
      <Route path="/boutique/:slug" element={<Boutique />} />
      <Route path="/commande/suivi" element={<SuiviCommande />} />
      <Route path="/paiement/retour" element={<PaiementRetour />} />

      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}

export default App;
