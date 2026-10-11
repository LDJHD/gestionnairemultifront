import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { XMarkIcon, ChevronRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { IconButton } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useEffect, useState } from "react";

/* ===========================================================================
   « LE GESTIONNAIRE » — BARRE LATÉRALE v2
   Design : panneau blanc « elevated », groupes avec libellé en capitales,
   élément actif = pastille indigo pleine + barre d'accent à gauche,
   badge temps réel des nouvelles commandes.
   =========================================================================== */

function grouperPages(pages) {
  const enLigne = ["Commandes en ligne", "Livraisons", "Paiements", "Paramètres boutique"];
  return {
    general: pages.filter((p) => ["Dashboard", "Opération de Vente"].includes(p.name)),
    gestion: pages.filter((p) =>
      ["Client", "Produit", "Catégorie", "Unité", "Stock", "Fournisseur"].includes(p.name)
    ),
    finances: pages.filter((p) =>
      ["Statistique/Comptabilité", "Vente"].includes(p.name)
    ),
    enligne: pages.filter((p) => enLigne.includes(p.name)),
    admin: pages.filter((p) => ["Notifications", "Utilisateurs"].includes(p.name)),
  };
}

const SECTION_LABELS = {
  general: "Pilotage",
  gestion: "Gestion",
  finances: "Ventes & comptabilité",
  enligne: "Boutique en ligne",
  admin: "Administration",
};

export function Sidenav({ brandImg, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav, sidenavColor, sidenavType } = controller;
  const [userStatus, setUserStatus] = useState(null);
  const [nouvellesCommandes, setNouvellesCommandes] = useState(0);

  // ── Thème du menu latéral (personnalisation) ───────────────
  // Type : « white » (clair, design par défaut), « transparent »
  // ou « dark » (dégradé coloré selon sidenavColor).
  const estFonce = sidenavType === "dark";
  const fondClasses =
    sidenavType === "white"
      ? "bg-white/85 backdrop-blur-xl"
      : sidenavType === "transparent"
        ? "bg-transparent"
        : `bg-gradient-to-br ${
            ({
              white: "from-gray-100 to-gray-200",
              dark: "from-ink-900 to-ink-950",
              green: "from-green-400 to-green-600",
              orange: "from-orange-400 to-orange-600",
              red: "from-red-400 to-red-600",
              pink: "from-pink-400 to-pink-600",
            })[sidenavColor] || "from-ink-900 to-ink-950"
          }`;
  const titreClasses = estFonce ? "text-white" : "text-ink-900";
  const sousTitreClasses = estFonce ? "text-white/60" : "text-ink-400";
  const etiquetteClasses = estFonce ? "text-white/50" : "text-ink-400";
  const itemInactifClasses = estFonce
    ? "text-white/80 hover:bg-white/10 hover:text-white"
    : "text-ink-600 hover:bg-ink-100/80 hover:text-ink-900";
  const chevronClasses = estFonce ? "text-white/40" : "text-ink-300";
  const separateurClasses = estFonce
    ? "from-transparent via-white/20 to-transparent"
    : "from-transparent via-ink-200 to-transparent";

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        setUserStatus(d.status);
      }
    } catch {
      /* silencieux */
    }
  };

  const fetchNouvellesCommandes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/commande-admin/listall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        setNouvellesCommandes(d.nouvelles || 0);
      }
    } catch {
      /* silencieux — module peut ne pas être migré */
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNouvellesCommandes();
    const t = setInterval(fetchNouvellesCommandes, 30_000);
    return () => clearInterval(t);
  }, []);

  // Filtrage des accès selon le rôle (socle conservé)
  const filterRoutes = (routs) =>
    routs.map((section) => ({
      ...section,
      pages: section.pages.filter((page) => {
        if (!userStatus) return false;
        if (userStatus === "Admin") return true;
        if (userStatus === "user")
          return ![
            "Utilisateurs",
            "Statistique/Comptabilité",
            "Inscription utilisateur",
            "Vente",
            "Paiements",
          ].includes(page.name);
        if (userStatus === "Caissiere") return ["Opération de Vente"].includes(page.name);
        if (userStatus === "Gestionnaire")
          return !["Inscription utilisateur", "Utilisateurs"].includes(page.name);
        return false;
      }),
    }));

  const rendreSection = (pages, cle) => {
    if (!pages.length) return null;
    return (
      <li key={cle} className="mb-5">
        <p className={`mb-2 ml-3 text-[10px] font-bold tracking-[.12em] uppercase ${etiquetteClasses}`}>
          {SECTION_LABELS[cle] || cle}
        </p>
        <ul className="flex flex-col gap-0.5">
          {pages.map(({ icon, name, path }) => (
            <li key={name}>
              <NavLink to={`/dashboard${path}`} end={path === "/hom"}>
                {({ isActive }) => (
                  <span
                    className={`lg-nav-item ${
                      isActive
                        ? "bg-brand-gradient text-white shadow-glow"
                        : itemInactifClasses
                    }`}
                  >
                    {/* Barre d'accent à gauche de l'élément actif */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-500 transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className={`[&>svg]:h-[19px] [&>svg]:w-[19px] ${isActive ? "text-white" : estFonce ? "text-white/60 group-hover:text-white" : "text-ink-400 group-hover:text-ink-600"}`}>
                      {icon}
                    </span>
                    <span className="flex-1 truncate">{name}</span>
                    {name === "Commandes en ligne" && nouvellesCommandes > 0 && (
                      <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white tabular">
                        {nouvellesCommandes}
                      </span>
                    )}
                    <ChevronRightIcon
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                        isActive ? "text-white/70" : chevronClasses
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </li>
    );
  };

  return (
    <>
      {/* Voile mobile */}
      <div
        onClick={() => setOpenSidenav(dispatch, false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          openSidenav ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-300 ease-smooth ${
          sidenavType === "white"
            ? "border-r border-ink-200/80"
            : "border-r border-white/10"
        } ${fondClasses} ${
          openSidenav ? "translate-x-0 shadow-lift" : "-translate-x-full"
        } xl:translate-x-0 xl:rounded-r-3xl xl:shadow-soft`}
      >
        {/* ── Marque ── */}
        <div className="relative flex items-center gap-3 px-5 pt-6 pb-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            {brandImg ? (
              <img
                src={brandImg}
                alt=""
                className="h-6 w-6 rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <SparklesIcon className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className={`font-display text-[15px] leading-tight font-extrabold ${titreClasses}`}>
              Le Gestionnaire
            </p>
            <p className={`text-[11px] font-medium ${sousTitreClasses}`}>
              Gestion & boutique en ligne
            </p>
          </div>
          <IconButton
            variant="text"
            size="sm"
            ripple={false}
            aria-label="Fermer le menu"
            className="absolute top-5 right-3 grid rounded-lg xl:hidden"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={2.5} className={`h-5 w-5 ${estFonce ? "text-white/70" : "text-ink-500"}`} />
          </IconButton>
        </div>

        {/* Séparateur */}
        <div className={`mx-5 h-px bg-gradient-to-r ${separateurClasses}`} />

        {/* ── Navigation ── */}
        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-6">
          {filterRoutes(routes)
            .filter((s) => s.layout === "dashboard")
            .map(({ pages }) => {
              const g = grouperPages(pages);
              return (
                <ul key="sections" className="flex flex-col">
                  {rendreSection(g.general, "general")}
                  {rendreSection(g.gestion, "gestion")}
                  {rendreSection(g.finances, "finances")}
                  {rendreSection(g.enligne, "enligne")}
                  {rendreSection(g.admin, "admin")}
                </ul>
              );
            })}
        </nav>
      </aside>
    </>
  );
}

Sidenav.defaultProps = { brandImg: "/image/logo.png" };
Sidenav.propTypes = {
  brandImg: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};
Sidenav.displayName = "Sidenav";

export default Sidenav;