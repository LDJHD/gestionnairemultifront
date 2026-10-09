// Composant Clients
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
} from "@/widgets/layout";
import routes from "@/routes";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";


import { useState } from "react";
import Modaleditproduit from "@/widgets/modal/modaleditproduit";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CubeIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

/** Petits squelettes de chargement réutilisés par les panneaux. */
function Squelettes({ lignes = 4 }) {
  return (
    <div className="lg-card p-5">
      <div className="space-y-3">
        {Array.from({ length: lignes }).map((_, i) => (
          <div key={i} className="lg-skeleton h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

/** État vide générique du design system v2. */
function EtatVide({ icone: Icone, titre, texte, children }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
        <Icone className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink-700">{titre}</p>
      <p className="mt-1 text-[13px] text-ink-500">{texte}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

// Component for detailed view of vente tab
function VenteTabContent({ vente }) {
  // ⚠️ `toast` est réservé à l'API react-toastify importée plus bas.
  const [toastOuvert, setToastOuvert] = useState(false);
  const handletoast = () => {
    setToastOuvert(true);
  };

  if (!vente) {
    return <Squelettes lignes={4} />; // Display a loading state while vente is null/undefined
  }

  return (
    <div className="lg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
            <ShoppingCartIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="font-display text-base font-extrabold text-ink-900">Lignes de vente</p>
            <p className="text-[13px] text-ink-500">
              {vente.length} article(s) facturé(s)
            </p>
          </div>
        </div>
        <span className="lg-badge-brand tabular">{vente.length}</span>
      </div>

      {vente.length === 0 ? (
        <EtatVide
          icone={ShoppingCartIcon}
          titre="Aucune ligne de vente"
          texte="Cette vente ne contient encore aucun article."
        />
      ) : (
        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th className="w-16">N°</th>
                <th>Nom du produit</th>
                <th className="text-right">Quantité</th>
                <th className="text-right">Prix Unitaire</th>
              </tr>
            </thead>
            <tbody>
              {vente.map((venteItem, key) => (
                <tr key={venteItem.id}>
                  <td className="lg-td text-[13px] font-semibold text-ink-400 tabular">
                    {String(key + 1).padStart(2, "0")}
                  </td>
                  <td className="lg-td font-semibold text-ink-800">
                    {venteItem.nom_produit}
                  </td>
                  <td className="lg-td text-right text-sm font-semibold text-ink-700 tabular">
                    {venteItem.quantite}
                  </td>
                  <td className="lg-td text-right text-sm font-bold text-ink-900 tabular">
                    {venteItem.prix_unitaire}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink-200 bg-ink-50/60">
                <td colSpan={3} className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Total :
                </td>
                <td className="px-5 py-3.5 text-right font-display text-base font-extrabold text-brand-700 tabular">
                  {vente.reduce((sum, venteItem) => sum + venteItem.prix_unitaire, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}


// Composant pour les données "En Stock"
function FactureTabContent({ facture }) {
  const handleDownload = (pdfPath) => {
    if (!pdfPath) {
      toast.error("Aucun fichier PDF disponible pour téléchargement.");
      return;
    };
   
    // Construire l'URL complète en ajoutant l'URL de base (backend)
    const fullUrl = `${import.meta.env.VITE_API_URL}${pdfPath}`;
   
    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement("a");
    link.href = fullUrl; // URL complète du fichier PDF
    link.download = pdfPath.split('/').pop(); // Nom du fichier
    link.target = "_blank"; // Ouvrir dans un nouvel onglet
    link.click(); // Simuler un clic
  };
  

  if (!facture) {
    return <Squelettes lignes={3} />;
  }

  const sansFacture = !facture.clientnom && !facture.clientifu && !facture.pdf;

  return (
    <div className="lg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
            <DocumentTextIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="font-display text-base font-extrabold text-ink-900">Facture</p>
            <p className="text-[13px] text-ink-500">Document lié à cette vente</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleDownload(facture.pdf)}
          className="lg-btn-primary lg-btn-sm"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Télécharger le PDF
        </button>
      </div>

      {sansFacture ? (
        <EtatVide
          icone={DocumentTextIcon}
          titre="Aucune facture associée"
          texte="La facture de cette vente n'a pas encore été générée."
        />
      ) : (
        <div className="grid gap-5 p-5 lg:grid-cols-3">
          <div className="lg-card-hover p-5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-8 w-8 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <CubeIcon className="h-4 w-4" />
              </span>
              <p className="text-[13px] font-semibold text-ink-500">Client facturé</p>
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-ink-900">
              {facture.clientnom} <span className="font-semibold">{facture.clientprenom}</span>
            </p>
          </div>

          <div className="lg-card-hover p-5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-8 w-8 bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
                <DocumentTextIcon className="h-4 w-4" />
              </span>
              <p className="text-[13px] font-semibold text-ink-500">IFU</p>
            </div>
            <p className="mt-3 font-mono text-lg font-bold text-ink-900 tabular">
              {facture.clientifu || "—"}
            </p>
          </div>

          <div className="lg-card-hover p-5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-8 w-8 bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100">
                <ArrowDownTrayIcon className="h-4 w-4" />
              </span>
              <p className="text-[13px] font-semibold text-ink-500">Fichier</p>
            </div>
            {facture.pdf ? (
              <button
                type="button"
                onClick={() => handleDownload(facture.pdf)}
                className="mt-3 text-[13px] font-semibold text-brand-600 underline-offset-2 transition-colors hover:text-brand-800 hover:underline"
              >
                Télécharger ici
              </button>
            ) : (
              <p className="mt-3 text-[13px] font-semibold text-ink-400">Aucun PDF disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




export function Detailvente() {
  const [searchParams] = useSearchParams(); // Permet d'accéder aux paramètres de l'URL
  const [facture, setfacture] = useState([]);
  // Récupération de l'ID
  const id = searchParams.get('id');
  const [activeTab, setActiveTab] = useState("vente");
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const [vente, setvente] = useState([]);

  const data = [
    { label: "Vente", value: "vente" },
    { label: "Facture", value: "facture" }
  ];





  // Fonction pour récupérer les détails du produit
  const fetchventeDetails = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/detailById`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        }
      );

      const vente = response.data;
      setvente(vente);

    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };


  // Fonction pour récupérer les détails du produit
  const fetchfactureDetails = async (vente_id) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/facture/detailById`,
        { vente_id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        }
      );

      const facture = response.data;
      setfacture(facture);
      console.log(facture);

    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };


  useEffect(() => {
    if (id) {
      console.log(id);
      fetchventeDetails(id); // Charger les détails si l'ID du produit est fourni
      fetchfactureDetails(id); // Charger les détails si l'ID du produit est fourni

    } else {
      console.log('loose');
    }
  }, [id]);


  return (
    <div className="mb-8 flex flex-col gap-12">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          className="fixed bottom-8 right-8 z-40 rounded-full bg-white text-ink-600 shadow-ink-900/10 ring-1 ring-inset ring-ink-200"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>

        <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
          {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link to="/dashboard/vente" className="mb-2 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800">
                <ArrowLeftIcon className="h-4 w-4" />
                Retour aux ventes
              </Link>
              <h1 className="lg-page-title">Détail de la vente</h1>
              <p className="lg-page-sub">
                Lignes de vente et facture associée à la transaction.
              </p>
            </div>
            <span className="lg-badge-brand tabular">Réf. #{id || "—"}</span>
          </header>

          {/* ══════════════ ONGLETS ══════════════ */}
          <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-ink-100 p-1">
            {data.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  activeTab === value
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ══════════════ PANNEAU ACTIF ══════════════ */}
          {activeTab === "vente" ? (
            <VenteTabContent vente={vente} />
          ) : (
            <FactureTabContent facture={facture} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Detailvente;