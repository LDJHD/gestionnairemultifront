/* ===========================================================================
 * « LE GESTIONNAIRE » — SITE 3 : VITRINE ÉDITORIALE PREMIUM
 * ---------------------------------------------------------------------------
 * Nouveau modèle de boutique en ligne (template_boutique = "site3").
 * Univers : ivoire, encre et or. Typographie serif éditoriale, grandes
 * respirations, cadres fins, boutons « intelligents » et micro-interactions.
 *
 * Ce fichier ne contient QUE de la présentation. Le panier, le contrôle du
 * stock, le checkout et la confirmation restent gérés par index.jsx.
 * =========================================================================== */

import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { annonces, fmt, TuileVisuel } from "./ui";

/* ---------------------------------------------------------------------------
 * Palette & typographie
 * ------------------------------------------------------------------------- */
const INK = "#14110f";
const INK_SOFT = "#5b5147";
const INK_MUTED = "#8a7d6f";
const IVORY = "#faf6ee";
const CREAM = "#f3ecdf";
const GOLD = "#b8924a";
const GOLD_LIGHT = "#e6d2a4";
const LINE = "rgba(20,17,15,0.10)";
const LINE_LIGHT = "rgba(250,246,238,0.16)";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "'Montserrat', 'Inter', system-ui, sans-serif";

const eyebrow = {
  fontFamily: SANS,
  fontSize: 9.5,
  fontWeight: 800,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: GOLD,
};
const sectionTitle = {
  fontFamily: SERIF,
  color: INK,
  fontSize: "clamp(1.8rem, 3.4vw, 2.8rem)",
  fontWeight: 700,
  lineHeight: 1.05,
  letterSpacing: "-0.02em",
};
const navLink = {
  fontFamily: SANS,
  color: INK_SOFT,
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

/* ---------------------------------------------------------------------------
 * 1. BANDEAU D'ANNONCE
 * ------------------------------------------------------------------------- */
export function Site3Bandeau({ activite, vitrine, paiements }) {
  const liste = annonces({ vitrine, paiements, activite });
  return (
    <div style={{ backgroundColor: INK, color: IVORY }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-7 overflow-hidden px-4 py-2.5 sm:px-8">
        {liste.map(({ Icone, texte }, i) => (
          <span
            key={texte}
            className={`flex flex-none items-center gap-2 ${i > 1 ? "hidden md:flex" : ""}`}
            style={{
              color: i === 0 ? GOLD_LIGHT : "rgba(250,246,238,0.72)",
              fontFamily: SANS,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <Icone className="h-3.5 w-3.5 flex-none" style={{ opacity: 0.8 }} />
            {texte}
          </span>
        ))}
        <span
          className="ml-auto hidden flex-none lg:block"
          style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: GOLD_LIGHT }}
        >
          L&apos;excellence, à portée de clic.
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 2. EN-TÊTE
 * ------------------------------------------------------------------------- */
export function Site3Header({
  activite,
  recherche,
  setRecherche,
  nombreArticles,
  onOuvrirPanier,
  categories = [],
  categorieFiltre,
  setCategorieFiltre,
}) {
  const nom = activite?.nom || "Boutique";
  const initiale = String(nom).trim().charAt(0).toUpperCase() || "B";
  const avecRail = categories.length > 1 && typeof setCategorieFiltre === "function";

  return (
    <header
      style={{
        backgroundColor: "rgba(250,246,238,0.97)",
        borderBottom: "1px solid rgba(20,17,15,0.10)",
      }}
      className="backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="flex items-center gap-3 py-3.5 sm:gap-6 sm:py-4">
          <Link
            to={`/boutique/${activite?.slug || ""}`}
            className="group flex min-w-0 flex-none items-center gap-3"
          >
            <span
              className="grid h-11 w-11 flex-none place-items-center rounded-full transition-transform duration-300 group-hover:-rotate-6"
              style={{ border: `1px solid ${GOLD}`, fontFamily: SERIF, color: INK, fontSize: 20, fontWeight: 700, backgroundColor: "#fff" }}
            >
              {initiale}
            </span>
            <span className="min-w-0">
              <span
                className="block truncate"
                style={{ fontFamily: SERIF, color: INK, fontSize: 17, fontWeight: 700, lineHeight: 1.1 }}
              >
                {nom}
              </span>
              <span className="block" style={{ color: GOLD, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.32em", textTransform: "uppercase" }}>
                Maison officielle
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            <a href="#catalogue" style={navLink} className="transition-opacity hover:opacity-60">
              Collection
            </a>
            <a href="#univers" style={navLink} className="transition-opacity hover:opacity-60">
              Univers
            </a>
            <Link to="/commande/suivi" style={navLink} className="transition-opacity hover:opacity-60">
              Suivi
            </Link>
          </nav>

          <div className="relative order-last hidden w-full max-w-xs flex-1 md:order-none md:mx-auto md:block lg:max-w-[250px]">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-4 h-[16px] w-[16px] -translate-y-1/2"
              style={{ color: INK_MUTED }}
            />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une pièce…"
              aria-label="Rechercher un article"
              className="w-full rounded-full py-2.5 pr-4 pl-10 text-[12.5px] font-semibold outline-none transition-shadow placeholder:font-normal"
              style={{
                fontFamily: SANS,
                backgroundColor: "#fff",
                border: `1px solid ${LINE}`,
                color: INK,
              }}
            />
          </div>

          <div aria-hidden="true" className="min-w-0 flex-1 md:hidden" />

          <button
            type="button"
            onClick={onOuvrirPanier}
            aria-label="Ouvrir le panier"
            className="group relative flex flex-none items-center gap-2.5 rounded-full px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            style={{ backgroundColor: INK, color: IVORY }}
          >
            <span className="relative">
              <ShoppingCartIcon className="h-[17px] w-[17px]" />
              {nombreArticles > 0 && (
                <span
                  className="absolute -top-2 -right-2.5 grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[9.5px] font-extrabold tabular"
                  style={{ backgroundColor: GOLD, color: INK }}
                >
                  {nombreArticles}
                </span>
              )}
            </span>
            <span
              className="hidden sm:inline"
              style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Panier
            </span>
          </button>
        </div>

        {avecRail && (
          <div
            className="flex items-center gap-6 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderTop: `1px solid ${LINE}` }}
          >
            {categories.slice(0, 10).map((cat) => {
              const actif = categorieFiltre === cat.nom;
              return (
                <button
                  key={cat.nom}
                  type="button"
                  onClick={() => setCategorieFiltre(cat.nom)}
                  aria-pressed={actif}
                  className="flex flex-none items-center gap-1.5 pb-1 whitespace-nowrap transition-colors"
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: actif ? INK : INK_MUTED,
                    borderBottom: `1.5px solid ${actif ? GOLD : "transparent"}`,
                  }}
                >
                  {cat.nom}
                  <span style={{ fontSize: 9, color: actif ? GOLD : "rgba(138,125,111,0.7)" }}>{cat.n}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="pb-3 md:hidden">
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-4 h-[16px] w-[16px] -translate-y-1/2"
              style={{ color: INK_MUTED }}
            />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une pièce…"
              aria-label="Rechercher un article"
              className="w-full rounded-full py-2.5 pr-4 pl-10 text-[13px] font-semibold outline-none"
              style={{ fontFamily: SANS, backgroundColor: "#fff", border: `1px solid ${LINE}`, color: INK }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * 3. HERO ÉDITORIAL
 * ------------------------------------------------------------------------- */
export function Site3Hero({ data, api, heroFond = 1 }) {
  const { activite, vitrine, produits = [] } = data;
  const seuil = Number(vitrine?.livraison_gratuite_des || 0);
  const sombre = !!heroFond;

  /* Un catalogue peut contenir des centaines de références sans photo.
     Le hero privilégie donc les articles réellement illustrés : le rendu
     paraît beaucoup plus « maison » qu'une suite d'initiales générées. */
  const avecImage = produits.filter((p) => p.image);
  const sansImage = produits.filter((p) => !p.image);
  const bases = [...avecImage, ...sansImage];
  const visuels =
    bases.length > 0
      ? bases.slice(0, 3)
      : [
          { nom: activite?.nom || "Collection", categorie: "" },
          { nom: "Signature", categorie: "" },
          { nom: "Édition", categorie: "" },
        ];

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: sombre ? INK : IVORY, color: sombre ? IVORY : INK }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: sombre
            ? "radial-gradient(ellipse at 78% 16%, rgba(184,146,74,0.24), transparent 55%), radial-gradient(ellipse at 8% 88%, rgba(184,146,74,0.10), transparent 48%)"
            : "radial-gradient(ellipse at 82% 0%, rgba(184,146,74,0.20), transparent 56%), radial-gradient(ellipse at 4% 90%, rgba(184,146,74,0.08), transparent 42%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(184,146,74,0.55) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.18fr_0.82fr] lg:gap-8 lg:items-center">
        <div className="min-w-0 max-w-2xl">
          <p className="flex items-center gap-3" style={eyebrow}>
            <span className="h-px w-10" style={{ backgroundColor: GOLD }} />
            Maison officielle
          </p>
          <h1
            className="mt-6"
            style={{
              fontFamily: SERIF,
              color: sombre ? IVORY : INK,
              fontSize: "clamp(3rem, 6.6vw, 6.2rem)",
              fontWeight: 700,
              lineHeight: 0.94,
              letterSpacing: "-0.035em",
              overflowWrap: "break-word",
            }}
          >
            {activite?.nom}
          </h1>
          <p
            className="mt-6 max-w-md text-[15px] leading-relaxed"
            style={{ fontFamily: SANS, color: sombre ? "rgba(250,246,238,0.72)" : INK_SOFT }}
          >
            Une sélection pensée pour durer. {produits.length} référence{produits.length > 1 ? "s" : ""},
            une livraison soignée et un paiement sécurisé — l&apos;excellence à portée de clic.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: GOLD,
                color: INK,
                fontFamily: SANS,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Découvrir la collection
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <Link
              to="/commande/suivi"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                border: `1px solid ${sombre ? "rgba(250,246,238,0.28)" : "rgba(20,17,15,0.2)"}`,
                color: sombre ? IVORY : INK,
                fontFamily: SANS,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Suivre ma commande
            </Link>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t pt-6" style={{ borderColor: sombre ? LINE_LIGHT : LINE }}>
            {[
              { v: `+${produits.length}`, l: "Références" },
              { v: vitrine?.livraison_active ? "24–48h" : "Retrait", l: vitrine?.livraison_active ? "Livraison" : "En boutique" },
              { v: seuil > 0 ? fmt(seuil) : "100 %", l: seuil > 0 ? "Livraison offerte" : "Paiement sécurisé" },
            ].map((s) => (
              <div key={s.l}>
                <p style={{ fontFamily: SERIF, color: sombre ? GOLD_LIGHT : INK, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                  {s.v}
                </p>
                <p className="mt-1.5" style={{ fontFamily: SANS, color: sombre ? "rgba(250,246,238,0.55)" : INK_MUTED, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Collage éditorial — plein cadre, jamais un « cadre arrondi » léger. */}
        <div className="relative mx-auto h-[430px] w-full max-w-[540px] sm:h-[520px]">
          <div
            className="absolute top-0 left-0 h-[240px] w-[190px] -rotate-6 overflow-hidden rounded-[24px] sm:h-[290px] sm:w-[225px]"
            style={{ border: "1px solid rgba(184,146,74,0.45)", boxShadow: "0 40px 80px -42px rgba(0,0,0,0.75)" }}
          >
            <TuileVisuel produit={visuels[0]} api={api} className="h-full w-full" />
          </div>

          <div
            className="absolute top-1/2 left-1/2 h-[330px] w-[270px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[30px] sm:h-[400px] sm:w-[320px]"
            style={{ border: `1px solid ${GOLD}`, boxShadow: "0 56px 110px -46px rgba(0,0,0,0.85)" }}
          >
            <TuileVisuel produit={visuels[1] || visuels[0]} api={api} taille="grande" className="h-full w-full" />
            <span
              className="absolute top-3 right-3 rounded-full px-2.5 py-1"
              style={{ backgroundColor: IVORY, color: INK, fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}
            >
              Sélection
            </span>
          </div>

          <div
            className="absolute bottom-0 right-0 h-[250px] w-[200px] rotate-6 overflow-hidden rounded-[24px] sm:h-[300px] sm:w-[248px]"
            style={{ border: "1px solid rgba(184,146,74,0.45)", boxShadow: "0 40px 80px -42px rgba(0,0,0,0.75)" }}
          >
            <TuileVisuel produit={visuels[2] || visuels[0]} api={api} className="h-full w-full" />
          </div>

          <div
            className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3"
            style={{ backgroundColor: GOLD, color: INK, boxShadow: "0 22px 46px -20px rgba(184,146,74,0.95)" }}
          >
            <ShieldCheckIcon className="h-4 w-4" />
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {seuil > 0 ? `Livraison offerte dès ${fmt(seuil)}` : "Paiement 100 % sécurisé"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * 4. RÉASSURANCE
 * ------------------------------------------------------------------------- */
export function Site3Trust({ items }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
      <div
        className="grid gap-3 rounded-[26px] px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4"
        style={{ backgroundColor: CREAM, border: `1px solid ${LINE}` }}
      >
        {items.map(({ Icone, titre, texte }) => (
          <div key={titre} className="flex items-start gap-3 px-1 py-1">
            <span
              className="grid h-10 w-10 flex-none place-items-center rounded-full"
              style={{ border: `1px solid ${GOLD}`, color: GOLD, backgroundColor: "rgba(255,255,255,0.55)" }}
            >
              <Icone className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block" style={{ fontFamily: SANS, color: INK, fontSize: 12, fontWeight: 800 }}>
                {titre}
              </span>
              <span className="mt-0.5 block" style={{ fontFamily: SANS, color: INK_MUTED, fontSize: 11, lineHeight: 1.45 }}>
                {texte}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * 5. UNIVERS / CATÉGORIES
 * ------------------------------------------------------------------------- */
export function Site3Univers({ categories, categorieFiltre, setCategorieFiltre }) {
  const liste = (categories || []).filter((c) => c.nom !== "Tous").slice(0, 6);
  if (!liste.length) return null;

  /* Bouton « intelligent » : on filtre ET on amène l'utilisateur au catalogue,
     au lieu de le laisser devant une section qui ne bouge pas. */
  const choisir = (nom) => {
    setCategorieFiltre?.(nom);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="univers" className="mx-auto max-w-[1400px] px-4 pt-14 sm:px-8 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p style={eyebrow}>Nos univers</p>
          <h2 className="mt-2" style={sectionTitle}>
            Explorer par catégorie
          </h2>
        </div>
        <button
          type="button"
          onClick={() => choisir("Tous")}
          className="inline-flex items-center gap-2 pb-1 transition-opacity hover:opacity-60"
          style={{ ...navLink, borderBottom: `1px solid ${GOLD}` }}
        >
          Tout voir
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {liste.map((cat, i) => {
          const actif = categorieFiltre === cat.nom;
          return (
            <button
              key={cat.nom}
              type="button"
              onClick={() => choisir(cat.nom)}
              className="group relative overflow-hidden rounded-2xl px-4 pt-4 pb-5 text-left transition-all duration-300 hover:-translate-y-1"
              style={{
                background: actif ? INK : "linear-gradient(145deg, #f8f2e8 0%, #f1e9db 100%)",
                border: `1px solid ${actif ? INK : LINE}`,
                minHeight: 136,
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -bottom-8 select-none"
                style={{
                  fontFamily: SERIF,
                  fontSize: 78,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: actif ? "rgba(230,210,164,0.16)" : "rgba(20,17,15,0.055)",
                }}
              >
                {String(cat.nom || "•").charAt(0).toUpperCase()}
              </span>

              <span className="relative flex items-center justify-between">
                <span style={{ fontFamily: SANS, color: actif ? GOLD_LIGHT : GOLD, fontSize: 8, fontWeight: 800, letterSpacing: "0.22em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowRightIcon
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: actif ? GOLD_LIGHT : GOLD }}
                />
              </span>

              <span className="relative mt-6 block pr-2" style={{ fontFamily: SERIF, color: actif ? IVORY : INK, fontSize: 15.5, fontWeight: 700, lineHeight: 1.15 }}>
                {cat.nom}
              </span>
              <span className="relative mt-2 block" style={{ fontFamily: SANS, color: actif ? GOLD_LIGHT : INK_MUTED, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {cat.n} article{cat.n > 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * 6. BANDEAU SIGNATURE
 * ------------------------------------------------------------------------- */
export function Site3Promo({ vitrine, seuil }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-14 sm:px-8">
      <div
        className="relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-12 sm:py-12"
        style={{ backgroundColor: INK, color: IVORY }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 86% 18%, rgba(184,146,74,0.28), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(184,146,74,0.12), transparent 45%)",
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p style={eyebrow}>Service signature</p>
            <h3
              className="mt-2"
              style={{ fontFamily: SERIF, color: IVORY, fontSize: "clamp(1.7rem, 3.6vw, 2.7rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              {seuil > 0 ? `La livraison offerte dès ${fmt(seuil)}` : "Une expérience d'achat d'exception"}
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed" style={{ fontFamily: SANS, color: "rgba(250,246,238,0.68)" }}>
              {vitrine?.livraison_active
                ? "Livraison à domicile, retrait en boutique et paiement sécurisé : chaque commande est suivie de bout en bout."
                : "Retrait en boutique et paiement sécurisé : chaque commande est suivie de bout en bout."}
            </p>
          </div>
          <a
            href="#catalogue"
            className="inline-flex flex-none items-center gap-2 rounded-full px-7 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: GOLD, color: INK, fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Explorer la collection
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * 7. CARTE PRODUIT
 * ------------------------------------------------------------------------- */
export function Site3CarteProduit({ produit, api, onApercu, onAjouter, ajoute }) {
  const dispo = !produit.en_rupture && Number(produit.stock_disponible) > 0;
  const prix = Number(produit.prix || 0);

  return (
    <article className="group">
      <button
        type="button"
        onClick={() => onApercu(produit)}
        aria-label={`Aperçu de ${produit.nom}`}
        className="relative block w-full overflow-hidden rounded-2xl"
        style={{ backgroundColor: CREAM, border: `1px solid ${LINE}` }}
      >
        <div className="relative aspect-[3/4] w-full">
          <TuileVisuel
            produit={produit}
            api={api}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.045]"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "linear-gradient(to top, rgba(20,17,15,0.34), transparent 55%)" }}
        />

        <span
          className="absolute top-3 left-3 rounded-full px-2.5 py-1"
          style={{
            backgroundColor: dispo ? "rgba(250,246,238,0.94)" : "rgba(255,255,255,0.96)",
            color: dispo ? INK : "#a3231b",
            fontFamily: SANS,
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {dispo ? "En stock" : "Épuisé"}
        </span>

        <span className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: "rgba(20,17,15,0.84)", color: IVORY, fontFamily: SANS, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Aperçu rapide
          </span>
        </span>
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {produit.categorie && (
            <p style={{ fontFamily: SANS, color: GOLD, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {produit.categorie}
            </p>
          )}
          <h3
            className="mt-1 lg-clamp-2"
            style={{ fontFamily: SERIF, color: INK, fontSize: 15.5, fontWeight: 600, lineHeight: 1.25 }}
          >
            {produit.nom || "Article sans nom"}
          </h3>
          <p className="mt-1.5" style={{ fontFamily: SERIF, color: INK, fontSize: 15, fontWeight: 700 }}>
            {prix > 0 ? fmt(prix) : "—"}
          </p>
        </div>

        <button
          type="button"
          disabled={!dispo}
          onClick={() => onAjouter(produit)}
          aria-label={`Ajouter ${produit.nom} au panier`}
          className="site3-add mt-1 grid h-10 w-10 flex-none place-items-center rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed"
          style={{
            backgroundColor: dispo ? INK : "transparent",
            color: dispo ? IVORY : INK_MUTED,
            border: dispo ? "1px solid transparent" : `1px solid ${LINE}`,
          }}
        >
          {ajoute ? <CheckIcon className="h-[18px] w-[18px]" /> : <PlusIcon className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------------
 * 8. CATALOGUE
 * ------------------------------------------------------------------------- */
function fenetrePages(page, nbPages) {
  if (nbPages <= 7) return Array.from({ length: nbPages }, (_, i) => i + 1);
  const nums = new Set([1, nbPages, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => nums.add(n));
  if (page >= nbPages - 2) [nbPages - 3, nbPages - 2, nbPages - 1].forEach((n) => nums.add(n));
  const tri = [...nums].filter((n) => n >= 1 && n <= nbPages).sort((a, b) => a - b);
  const out = [];
  tri.forEach((n, i) => {
    if (i && n - tri[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Site3Catalogue({
  produitsAffiches = [],
  total = 0,
  categories = [],
  categorieFiltre,
  setCategorieFiltre,
  recherche,
  setRecherche,
  tri,
  setTri,
  tris = [],
  page,
  nbPages,
  allerPage,
  ruptures = 0,
  api,
  onApercu,
  onAjouter,
  ajouteId,
}) {
  return (
    <section id="catalogue" className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-4 pb-7 sm:flex-row sm:items-end sm:justify-between" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div>
          <p style={eyebrow}>La collection</p>
          <h2 className="mt-2" style={sectionTitle}>
            {categorieFiltre === "Tous" ? "Toutes nos pièces" : categorieFiltre}
          </h2>
          <p className="mt-2" style={{ fontFamily: SANS, color: INK_MUTED, fontSize: 11.5, fontWeight: 600 }}>
            {total} article{total > 1 ? "s" : ""}
            {recherche && ` pour « ${recherche} »`}
            {nbPages > 1 && ` · page ${page} sur ${nbPages}`}
            {ruptures > 0 && ` · ${ruptures} épuisé${ruptures > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="relative">
          <select
            aria-label="Trier les articles"
            value={tri}
            onChange={(e) => setTri(e.target.value)}
            className="appearance-none rounded-full py-2.5 pr-9 pl-4 outline-none transition-colors"
            style={{ fontFamily: SANS, backgroundColor: "#fff", border: `1px solid ${LINE}`, color: INK, fontSize: 11.5, fontWeight: 700 }}
          >
            {tris.map((o) => (
              <option key={o.valeur} value={o.valeur}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            style={{ color: INK_MUTED }}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const actif = categorieFiltre === cat.nom;
          return (
            <button
              key={cat.nom}
              type="button"
              onClick={() => setCategorieFiltre(cat.nom)}
              aria-pressed={actif}
              className="flex flex-none items-center gap-1.5 rounded-full px-4 py-2 transition-colors"
              style={{
                backgroundColor: actif ? INK : "#fff",
                border: `1px solid ${actif ? INK : LINE}`,
                color: actif ? IVORY : INK_SOFT,
                fontFamily: SANS,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              {cat.nom}
              <span style={{ color: actif ? GOLD_LIGHT : INK_MUTED, fontSize: 9.5 }}>{cat.n}</span>
            </button>
          );
        })}
      </div>

      {produitsAffiches.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
          {produitsAffiches.map((p) => (
            <Site3CarteProduit
              key={p.id}
              produit={p}
              api={api}
              onApercu={onApercu}
              onAjouter={onAjouter}
              ajoute={ajouteId === p.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <span
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ border: `1px solid ${GOLD}`, color: GOLD }}
          >
            <ShoppingBagIcon className="h-8 w-8" />
          </span>
          <h3 className="mt-6" style={{ fontFamily: SERIF, color: INK, fontSize: 24, fontWeight: 700 }}>
            {recherche ? "Aucun résultat" : "Cette sélection arrive bientôt"}
          </h3>
          <p className="mt-2 max-w-sm" style={{ fontFamily: SANS, color: INK_MUTED, fontSize: 12.5 }}>
            {recherche
              ? `Rien ne correspond à « ${recherche} ».`
              : "Le catalogue s'étoffe, revenez très bientôt."}
          </p>
          {(recherche || categorieFiltre !== "Tous") && (
            <button
              type="button"
              onClick={() => {
                setRecherche("");
                setCategorieFiltre("Tous");
              }}
              className="mt-6 rounded-full px-5 py-2.5"
              style={{ backgroundColor: INK, color: IVORY, fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Tout afficher
            </button>
          )}
        </div>
      )}

      {nbPages > 1 && (
        <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination du catalogue">
          <button
            type="button"
            onClick={() => allerPage(page - 1)}
            disabled={page === 1}
            aria-label="Page précédente"
            className="grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-30"
            style={{ border: `1px solid ${LINE}`, color: INK }}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {fenetrePages(page, nbPages).map((n, i) =>
            n === "…" ? (
              <span key={`e${i}`} style={{ color: INK_MUTED, fontSize: 13 }}>
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => allerPage(n)}
                aria-current={n === page ? "page" : undefined}
                className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-[12px] font-bold transition-colors"
                style={{
                  backgroundColor: n === page ? INK : "#fff",
                  border: `1px solid ${n === page ? INK : LINE}`,
                  color: n === page ? IVORY : INK_SOFT,
                  fontFamily: SANS,
                }}
              >
                {n}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => allerPage(page + 1)}
            disabled={page === nbPages}
            aria-label="Page suivante"
            className="grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-30"
            style={{ border: `1px solid ${LINE}`, color: INK }}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </nav>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * 9. PIED DE PAGE
 * ------------------------------------------------------------------------- */
export function Site3Footer({ activite, vitrine, paiements }) {
  const annee = new Date().getFullYear();
  const nom = activite?.nom || "Boutique";
  const initiale = String(nom).trim().charAt(0).toUpperCase() || "B";
  const zones = vitrine?.zones || [];

  return (
    <footer className="mt-20" style={{ backgroundColor: INK, color: IVORY }}>
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 flex-none place-items-center rounded-full"
                style={{ border: `1px solid ${GOLD}`, color: GOLD, fontFamily: SERIF, fontSize: 21, fontWeight: 700 }}
              >
                {initiale}
              </span>
              <div>
                <p style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{nom}</p>
                <p style={{ color: GOLD, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.32em", textTransform: "uppercase" }}>
                  Maison officielle
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-[12.5px] leading-relaxed" style={{ color: "rgba(250,246,238,0.62)" }}>
              Une sélection d&apos;exception, commandée en quelques clics et livrée avec soin.
              Chaque commande est suivie de bout en bout.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {paiements?.en_ligne && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ border: `1px solid ${LINE_LIGHT}`, color: "rgba(250,246,238,0.78)", fontSize: 9.5, fontWeight: 700 }}
                >
                  <ShieldCheckIcon className="h-3.5 w-3.5" style={{ color: GOLD }} /> Paiement sécurisé
                </span>
              )}
              {paiements?.a_la_livraison && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ border: `1px solid ${LINE_LIGHT}`, color: "rgba(250,246,238,0.78)", fontSize: 9.5, fontWeight: 700 }}
                >
                  <BanknotesIcon className="h-3.5 w-3.5" style={{ color: GOLD }} /> À la livraison
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 style={{ color: GOLD, fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase" }}>
              La maison
            </h4>
            <ul className="mt-4 space-y-2.5" style={{ fontSize: 12.5, fontWeight: 600 }}>
              <li>
                <a href="#catalogue" style={{ color: "rgba(250,246,238,0.7)" }} className="transition-colors hover:text-white">
                  La collection
                </a>
              </li>
              <li>
                <a href="#univers" style={{ color: "rgba(250,246,238,0.7)" }} className="transition-colors hover:text-white">
                  Nos univers
                </a>
              </li>
              <li>
                <Link to="/commande/suivi" style={{ color: "rgba(250,246,238,0.7)" }} className="transition-colors hover:text-white">
                  Suivre ma commande
                </Link>
              </li>
              <li>
                <Link to="/auth/sign-in" style={{ color: "rgba(250,246,238,0.7)" }} className="transition-colors hover:text-white">
                  Espace gestionnaire
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 style={{ color: GOLD, fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase" }}>
              {vitrine?.livraison_active ? "Livraison & retrait" : "Retrait en boutique"}
            </h4>
            {zones.length ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {zones.map((z) => (
                  <li
                    key={z.id ?? z.nom}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ border: `1px solid ${LINE_LIGHT}`, fontSize: 11.5 }}
                  >
                    <span className="flex items-center gap-1.5" style={{ color: "rgba(250,246,238,0.78)" }}>
                      <MapPinIcon className="h-3.5 w-3.5" style={{ color: GOLD }} />
                      {z.nom}
                    </span>
                    <span style={{ color: GOLD_LIGHT, fontWeight: 700 }}>{fmt(z.frais)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "rgba(250,246,238,0.62)" }}>
                Retrait sur place au point de vente.
                {vitrine?.frais_livraison_defaut > 0 && ` Livraison ${fmt(vitrine.frais_livraison_defaut)}.`}
              </p>
            )}
            {vitrine?.livraison_gratuite_des > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ border: `1px solid rgba(184,146,74,0.4)`, color: GOLD_LIGHT, fontSize: 9.5, fontWeight: 700 }}>
                <TruckIcon className="h-3.5 w-3.5" />
                Offerte dès {fmt(vitrine.livraison_gratuite_des)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: `1px solid ${LINE_LIGHT}` }}>
          <p style={{ color: "rgba(250,246,238,0.45)", fontSize: 10.5 }}>
            © {annee} {nom}. Tous droits réservés.
          </p>
          <p style={{ color: "rgba(250,246,238,0.45)", fontSize: 10.5 }}>
            Conçu par <strong style={{ color: GOLD_LIGHT }}>Le Gestionnaire · TO CONNECT</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
