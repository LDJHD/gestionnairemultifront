import React from "react";
import {
  AdjustmentsHorizontalIcon,
  Bars3BottomLeftIcon,
  PaintBrushIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/context";
import {
  appliquerThemeBoutique,
  lireCouleurBoutique,
  COULEUR_DEFAUT,
} from "@/utils/themeBoutique";

function formatNumber(number, decPlaces) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      number += abbrev[i];

      break;
    }
  }

  return number;
}

/** Interrupteur accessible (remplace le Switch Material) */
function Interrupteur({ id, checked, onChange, label }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-brand-600" : "bg-ink-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function Configurator() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar } =
    controller;
  const [stars, setStars] = React.useState(0);
  const [couleurPerso, setCouleurPerso] = React.useState(lireCouleurBoutique);
  const [couleurSidenav, setCouleurSidenav] = React.useState(() => {
    try { return localStorage.getItem("lg-couleur-sidenav") || ""; } catch { return ""; }
  });

  const choisirCouleurBoutique = (c) => {
    setCouleurPerso(c);
    appliquerThemeBoutique(c, true);
  };
  const appliquerCouleurSidenav = (c) => {
    setCouleurSidenav(c);
    try { localStorage.setItem("lg-couleur-sidenav", c); } catch {}
  };

  const sidenavColors = {
    white: "from-gray-100 to-gray-100 border-gray-200",
    dark: "from-black to-black border-gray-200",
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-400 to-pink-600",
  };

  const labelsColors = {
    white: "Blanc",
    dark: "Noir",
    green: "Vert",
    orange: "Orange",
    red: "Rouge",
    pink: "Rose",
  };

  React.useEffect(() => {
    const stars = fetch(
      "https://api.github.com/repos/creativetimofficial/material-tailwind-dashboard-react"
    )
      .then((response) => response.json())
      .then((data) => setStars(formatNumber(data.stargazers_count, 1)));
  }, []);

  return (
    <aside
      aria-label="Personnalisation de l'interface"
      className={`fixed top-0 right-0 z-50 flex h-screen w-80 flex-col overflow-y-auto rounded-l-3xl border-l border-ink-200 bg-white shadow-lift transition-transform duration-300 ease-smooth ${
        openConfigurator ? "translate-x-0" : "translate-x-80"
      }`}
    >
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
            <AdjustmentsHorizontalIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-base font-extrabold text-ink-900">
              Personnalisation
            </h2>
            <p className="text-[13px] text-ink-500">Vos options d'affichage.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpenConfigurator(dispatch, false)}
          aria-label="Fermer la personnalisation"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink-500 ring-1 ring-inset ring-ink-200 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900"
        >
          <XMarkIcon strokeWidth={2.5} className="h-4 w-4" />
        </button>
      </div>

      {/* ── Réglages ── */}
      <div className="flex flex-col gap-5 px-5 py-5">
        {/* Couleur du menu latéral */}
        <section className="rounded-xl border border-ink-200 p-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-8 w-8 bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200">
              <PaintBrushIcon className="h-4 w-4" />
            </span>
            <h3 className="font-display text-[13px] font-extrabold text-ink-900">
              Couleur du menu latéral
            </h3>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {Object.keys(sidenavColors).map((color) => (
              <button
                key={color}
                type="button"
                title={labelsColors[color]}
                aria-label={`Couleur ${labelsColors[color]}`}
                aria-pressed={sidenavColor === color}
                onClick={() => setSidenavColor(dispatch, color)}
                className={`h-6 w-6 rounded-full bg-gradient-to-br transition-transform duration-200 hover:scale-105 ${
                  sidenavColors[color]
                } ${
                  sidenavColor === color
                    ? "border-brand-600 ring-2 ring-brand-500/[0.25]"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Couleur personnalisée du menu latéral */}
        <section className="rounded-xl border border-ink-200 p-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-8 w-8 bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200">
              <PaintBrushIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-[13px] font-extrabold text-ink-900">
                Couleur personnalisée
              </h3>
              <p className="text-[12px] text-ink-500">
                Choisissez votre propre couleur pour le menu.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="color"
              value={couleurSidenav || "#0f766e"}
              onChange={(e) => appliquerCouleurSidenav(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-ink-200"
              aria-label="Couleur personnalisée du menu"
            />
            <span className="font-mono text-[12px] text-ink-500">{couleurSidenav || "Par défaut"}</span>
            {couleurSidenav && (
              <button
                type="button"
                onClick={() => appliquerCouleurSidenav("")}
                className="text-[11px] text-ink-400 hover:text-ink-600"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </section>

        {/* Couleur de la boutique */}
        <section className="rounded-xl border border-ink-200 p-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-8 w-8 bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200">
              <PaintBrushIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-[13px] font-extrabold text-ink-900">
                Couleur de la boutique
              </h3>
              <p className="text-[12px] text-ink-500">
                Couleur d'accent de votre site de vente.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="color"
              value={couleurPerso}
              onChange={(e) => choisirCouleurBoutique(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-ink-200"
              aria-label="Couleur de la boutique"
            />
            <span className="font-mono text-[12px] text-ink-500">{couleurPerso}</span>
            <button
              type="button"
              onClick={() => choisirCouleurBoutique(COULEUR_DEFAUT)}
              className="ml-auto text-[11px] text-ink-400 hover:text-ink-600"
            >
              Par défaut
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["#0f766e", "#1d4ed8", "#dc2626", "#d97706", "#7c3aed", "#059669", "#e11d48", "#0891b2"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => choisirCouleurBoutique(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  couleurPerso === c ? "border-ink-900" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Couleur ${c}`}
              />
            ))}
          </div>
        </section>

        {/* Type de menu latéral */}
        <section className="rounded-xl border border-ink-200 p-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-8 w-8 bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200">
              <Bars3BottomLeftIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-[13px] font-extrabold text-ink-900">
                Type de menu latéral
              </h3>
              <p className="text-[12px] text-ink-500">
                Choisir entre les trois types.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: "dark", label: "Noir" },
              { value: "transparent", label: "Transp." },
              { value: "white", label: "Blanc" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={sidenavType === value}
                onClick={() => setSidenavType(dispatch, value)}
                className={
                  sidenavType === value ? "lg-btn-soft px-2" : "lg-btn-neutral px-2"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Menu horizontal fixe */}
        <section className="rounded-xl border border-ink-200 p-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-8 w-8 bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200">
              <Squares2X2Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-[13px] font-extrabold text-ink-900">
                Menu horizontal fixe
              </h3>
              <p className="text-[12px] text-ink-500">
                {fixedNavbar ? "Always visible" : "Masqué au défilement"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-600">
              {fixedNavbar ? "Activé" : "Désactivé"}
            </span>
            <Interrupteur
              id="navbar-fixed"
              checked={fixedNavbar}
              label="Menu horizontal fixe"
              onChange={() => setFixedNavbar(dispatch, !fixedNavbar)}
            />
          </div>
        </section>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;
