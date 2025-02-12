import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ChartBarIcon, // Ajouté pour Statistique/Comptabilité
  CubeIcon, // Ajouté pour Produit
  FolderIcon, // Ajouté pour Catégorie
  ReceiptPercentIcon, // Ajouté pour Vente
} from "@heroicons/react/24/solid";

import { Home, Profile, Tables, Notifications, Client } from "@/pages/dashboard";
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

const icon = {
  className: "w-5 h-5 text-inherit",
};

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
        name: "Notifications",
        path: "/notifications",
        element: <Notifications />,
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
