import {
  HomeIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ChartBarIcon, // Statistique/Comptabilité
  CubeIcon, // Produit
  FolderIcon, // Catégorie
  ReceiptPercentIcon,
  Squares2X2Icon, // Vente
  InboxStackIcon, // Commandes en ligne
  BanknotesIcon, // Paiements
  Cog6ToothIcon, // Paramètres boutique
} from "@heroicons/react/24/solid";

import { Home, Profile, Tables, Client } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Clients from "./pages/dashboard/client";
import Produit from "./pages/dashboard/produit";
import Stock from "./pages/dashboard/stock";
import Categorie from "./pages/dashboard/categorie";
import Fournisseur from "./pages/dashboard/fournisseur";
import Vente from "./pages/dashboard/vente";
import Vendre from "./pages/dashboard/vendre";
import Statistique from "./pages/dashboard/statistique";
import AuthGuard from "./pages/dashboard/authguard";
import Unit from "./pages/dashboard/unit";
import Notifications from "./pages/dashboard/notifications";
import User from "./pages/dashboard/user";
import CommandesEnLigne from "./pages/dashboard/commandes";
import Livraisons from "./pages/dashboard/livraisons";
import Paiements from "./pages/dashboard/paiements";
import ParametresBoutique from "./pages/dashboard/parametres";
import SuperAdmin from "./pages/dashboard/superadmin";

const icon = {
  className: "w-5 h-5 text-inherit",
};
const notificationsCount = parseInt(localStorage.getItem("notificationsCount"), 10) || 0;

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Opération de Vente",
        path: "/operation",
        element: <Vendre />,
      },
      // ─── Boutique en ligne (nouveaux modules — socle conservé) ───
      {
        icon: <InboxStackIcon {...icon} />,
        name: "Commandes en ligne",
        path: "/commandes",
        element: <CommandesEnLigne />,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Livraisons",
        path: "/livraisons",
        element: <Livraisons />,
      },
      {
        icon: <BanknotesIcon {...icon} />,
        name: "Paiements",
        path: "/paiements",
        element: <Paiements />,
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Paramètres boutique",
        path: "/parametres",
        element: <ParametresBoutique />,
      },
      // ─── Gestion (socle conservé) ───
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Client",
        path: "/client",
        element: <Clients />,
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "Produit",
        path: "/produit",
        element: <Produit />,
      },
      {
        icon: <FolderIcon {...icon} />,
        name: "Catégorie",
        path: "/categorie",
        element: <Categorie />,
      },
      {
        icon: <Squares2X2Icon {...icon} />,
        name: "Unité",
        path: "/unite",
        element: <Unit />,
      },
      {
        icon: <ArchiveBoxIcon {...icon} />,
        name: "Stock",
        path: "/stock",
        element: <Stock />,
      },
      {
        icon: <ChartBarIcon {...icon} />,
        name: "Statistique/Comptabilité",
        path: "/statistique",
        element: <Statistique />,
      },
      {
        icon: <ReceiptPercentIcon {...icon} />,
        name: "Vente",
        path: "/vente",
        element: <Vente />,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Fournisseur",
        path: "/fournisseur",
        element: <Fournisseur />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: `Notifications (${notificationsCount})`,
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Utilisateurs",
        path: "/Utilisateurs",
        element: <User />,
      },
      // ─── Super Admin (visible uniquement aux super admins) ───
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Super Admin",
        path: "/superadmin",
        element: <SuperAdmin />,
        superAdminOnly: true,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Option-Utilisateurs",
        path: "/sign-in",
        element: (
          <AuthGuard>
            <SignIn />
          </AuthGuard>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Inscription utilisateur",
        path: "/sign-up",
        element: (
          <AuthGuard>
            <SignUp />
          </AuthGuard>
        ),
      },
    ],
  },
];

export default routes;
