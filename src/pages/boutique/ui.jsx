/* ===========================================================================
 * « LE GESTIONNAIRE » — DESIGN SYSTEM DE LA VITRINE PUBLIQUE
 * ---------------------------------------------------------------------------
 * Le catalogue ne contient presque aucune photo (1 image pour 390 articles).
 * Un design « grille d'images » serait donc vide et laid. La vitrine repose
 * donc sur trois partis pris :
 *
 *   1. une identité CHAUDE (crème / espresso / vert profond) volontairement
 *      distincte du back-office indigo — la vitrine est une marque grand
 *      public, pas un outil de gestion ;
 *   2. une VISUALISATION GÉNÉRÉE par article : chaque catégorie reçoit une
 *      teinte et une icône déterministes, l'article affiche une grande
 *      initiale sur un dégradé teinté. L'absence de photo devient un parti
 *      pris graphique au lieu d'un trou ;
 *   3. un style ÉDITORIAL : beaucoup de blanc, une typographie.display large,
 *      des cartes fines, des ombres douces.
 *
 * Ce fichier ne contient QUE de la présentation : aucune requête, aucun état.
 * Les règles métier (stock, paiement, livraison) restent dans index.jsx.
 * =========================================================================== */

import {
  BanknotesIcon,
  BeakerIcon,
  BoltIcon,
  CakeIcon,
  ChevronDownIcon,
  ClockIcon,
  CreditCardIcon,
  CubeIcon,
  FireIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SparklesIcon,
  SunIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} F`;

/* ===========================================================================
 * 1. TEINTES PAR CATÉGORIE
 * =========================================================================== */

/** Dégradés disponibles pour les visuels générés (fond + dégradé). */
const TONS = [
  { from: "from-boutique-100", to: "to-boutique-300", ink: "text-boutique-700", chip: "bg-boutique-200/70 text-boutique-800" },
  { from: "from-forest-100", to: "to-forest-300", ink: "text-forest-700", chip: "bg-forest-100 text-forest-700" },
  { from: "from-amber-50", to: "to-amber-200", ink: "text-amber-700", chip: "bg-amber-100 text-amber-800" },
  { from: "from-rose-50", to: "to-rose-200", ink: "text-rose-700", chip: "bg-rose-100 text-rose-700" },
  { from: "from-sky-50", to: "to-sky-200", ink: "text-sky-700", chip: "bg-sky-100 text-sky-700" },
  { from: "from-violet-50", to: "to-violet-200", ink: "text-violet-700", chip: "bg-violet-100 text-violet-700" },
  { from: "from-emerald-50", to: "to-emerald-200", ink: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700" },
  { from: "from-orange-50", to: "to-orange-200", ink: "text-orange-700", chip: "bg-orange-100 text-orange-800" },
];

/** Icône décorative déterministe selon le nom de la catégorie. */
const ICONES_PAR_MOTS = [
  [/(vin|whisky|biere|alcool|liqueur|champagne|cocktail)/i, BeakerIcon],
  [/(biscuit|chocolat|candy|confiserie|bonbon|chewing|gateau|biscuiterie|sucre)/i, CakeIcon],
  [/(lait|yaourt|fromage|creme|beurre|yaourts)/i, SunIcon],
  [/(jus|nectar|eau|boisson|soda|limonade)/i, SparklesIcon],
  [/(cafe|thé|the|cafeine|energy|boisson)/i, BoltIcon],
  [/(riz|pate|farine|huile|epice|conserve|legumineuse|semoule|sucree)/i, CubeIcon],
  [/(viande|poisson|charcuterie|grill|plat|cuisine|froid|congele)/i, FireIcon],
  [/(hygiene|beaut|parfum|rasoir|savon|soin|dentaire|cosmetic)/i, SparklesIcon],
  [/(menage|entretien|plastique|papeterie)/i, HomeIcon],
  [/(medicament|pharm|sante)/i, SparklesIcon],
];

/** Hash stable → la même catégorie garde toujours la même teinte. */
function hash(texte) {
  let h = 0;
  for (let i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) >>> 0;
  return h;
}

/** Renvoie la palette et l'icône d'une catégorie (jamais undefined). */
export function tonCategorie(categorie) {
  const nom = (categorie || "").trim();
  if (!nom) return { ...TONS[0], icone: ShoppingBagIcon };
  const trouve = ICONES_PAR_MOTS.find(([re]) => re.test(nom));
  return { ...TONS[hash(nom) % TONS.length], icone: trouve ? trouve[1] : ShoppingBagIcon };
}

/** Initiales affichées sur le visuel généré (2 lettres maximum). */
function initiales(nom) {
  const mots = String(nom || "")
    .trim()
    .split(/[\s\-_/]+/)
    .filter(Boolean);
  if (mots.length === 0) return "?";
  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase();
  return (mots[0][0] + mots[1][0]).toUpperCase();
}

export function urlImage(produit, api) {
  if (!produit?.image) return null;
  return produit.image.startsWith("http") ? produit.image : `${api}/${produit.image}`;
}

/* ===========================================================================
 * 2. VISUEL D'ARTICLE
 * =========================================================================== */

/**
 * Tuile visuelle d'un article.
 * — photo réelle si elle existe ;
 * — sinon dégradé teinté par catégorie + grandes initiales + trame pointillée
 *   et pastille d'icône. Rendu volontairement « dessiné » plutôt que vide.
 */
export function TuileVisuel({ produit, api, className = "", taille = "normale" }) {
  const ton = tonCategorie(produit.categorie);
  const Icone = ton.icone;
  const src = urlImage(produit, api);
  const gros = taille === "grande";

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${ton.from} ${ton.to}`} />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,.55) 1px, transparent 0)",
          backgroundSize: gros ? "20px 20px" : "14px 14px",
        }}
      />
      <div
        aria-hidden="true"
        className={`absolute -right-6 -bottom-8 rounded-full bg-white/25 blur-2xl ${gros ? "h-40 w-40" : "h-24 w-24"}`}
      />

      {src ? (
        <img
          src={src}
          alt={produit.nom}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span
            className={`font-display font-extrabold tracking-tight text-white/90 drop-sm ${gros ? "text-6xl" : "text-4xl"}`}
          >
            {initiales(produit.nom)}
          </span>
          <Icone className={`text-white/70 ${gros ? "h-9 w-9" : "h-6 w-6"}`} />
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
 * 3. PASTILLES
 * =========================================================================== */

export function PastilleStock({ produit, className = "" }) {
  const stock = Number(produit.stock_disponible || 0);
  if (produit.en_rupture || stock <= 0) {
    return (
      <span className={`lg-badge bg-white/95 text-rose-700 shadow-soft ring-1 ring-inset ring-rose-200 ${className}`}>
        Rupture
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className={`lg-badge bg-amber-500 text-white shadow-soft ${className}`}>
        Plus que {stock}
      </span>
    );
  }
  return (
    <span className={`lg-badge bg-white/95 text-forest-700 shadow-soft ring-1 ring-inset ring-forest-100 ${className}`}>
      En stock
    </span>
  );
}

export function PastilleCategorie({ categorie }) {
  if (!categorie) return null;
  const ton = tonCategorie(categorie);
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 text-[10.5px] font-bold tracking-[0.12em] uppercase ${ton.ink}`}>
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${ton.chip.split(" ")[0]}`} />
      <span className="truncate">{categorie}</span>
    </span>
  );
}

/* ===========================================================================
 * 4. BANDEAU D'ANNONCE
 * =========================================================================== */

/** Messages dérivés des réglages réels du gestionnaire (rien d'inventé). */
export function annonces({ vitrine, paiements, activite }) {
  const liste = [];
  if (vitrine?.livraison_active) {
    const seuil = Number(vitrine.livraison_gratuite_des || 0);
    if (seuil > 0) {
      liste.push({ Icone: TruckIcon, texte: `Livraison offerte dès ${fmt(seuil)} d'achat` });
    }
    if ((vitrine.zones || []).length) {
      liste.push({ Icone: MapPinIcon, texte: `${vitrine.zones.length} zone(s) desservie(s)` });
    } else {
      liste.push({ Icone: MapPinIcon, texte: `Livraison dès ${fmt(vitrine.frais_livraison_defaut)}` });
    }
  }
  if (paiements?.en_ligne) liste.push({ Icone: CreditCardIcon, texte: "Paiement sécurisé FedaPay" });
  if (paiements?.a_la_livraison) liste.push({ Icone: ShoppingBagIcon, texte: "Paiement à la livraison" });
  if (!liste.length) liste.push({ Icone: ShoppingBagIcon, texte: `${activite?.nom || "Boutique"} — commande en ligne` });
  return liste;
}

export function BandeauAnnonce({ vitrine, paiements, activite }) {
  const liste = annonces({ vitrine, paiements, activite });
  return (
    <div className="bg-boutique-950 text-boutique-100">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 overflow-hidden px-4 py-2 sm:px-8">
        {liste.map(({ Icone, texte }, i) => (
          <span
            key={texte}
            className={`flex flex-none items-center gap-1.5 text-[11.5px] font-semibold tracking-wide ${
              i === 0 ? "text-white" : "text-boutique-300"
            } ${i > 1 ? "hidden md:flex" : ""}`}
          >
            <Icone className="h-3.5 w-3.5 flex-none opacity-70" />
            {texte}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ===========================================================================
 * 5. EN-TÊTE
 * =========================================================================== */

export function EnteteVitrine({
  activite,
  recherche,
  setRecherche,
  nombreArticles,
  onOuvrirPanier,
  children,
}) {
  return (
    <header className="border-b border-boutique-200/80 bg-boutique-50/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-8 sm:py-4">
        <Link to={`/boutique/${activite?.slug || ""}`} className="group flex min-w-0 flex-none items-center gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-boutique-900 text-boutique-50 shadow-soft transition-transform duration-300 group-hover:-rotate-3">
            <IconeSecteur secteur={activite?.secteur} className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[15px] leading-tight font-extrabold tracking-tight text-boutique-900">
              {activite?.nom}
            </span>
            <span className="block text-[10.5px] font-semibold tracking-[0.16em] text-boutique-400 uppercase">
              Boutique en ligne
            </span>
          </span>
        </Link>

        {/* Recherche — centrée entre le logo et le panier (≥ md).
            `mx-auto` absorbe tout l'espace libre de la ligne : le bouton Panier
            se retrouve donc plaqué contre le bord droit du conteneur. */}
        <div className="relative order-last hidden w-full max-w-md flex-1 md:order-none md:mx-auto md:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-boutique-400" />
          <input
            className="w-full rounded-full border border-boutique-200 bg-white py-2.5 pr-4 pl-11 text-sm text-boutique-900 shadow-xs transition-shadow outline-none placeholder:text-boutique-400 focus:border-boutique-300 focus:ring-4 focus:ring-boutique-200/50"
            placeholder="Rechercher un article, une marque…"
            aria-label="Rechercher un article"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        {children}

        {/* < md : pas de recherche dans la barre, ce pousseur renvoie le bouton
            Panier contre le bord droit (le `md:mx-auto` de la recherche joue ce
            rôle au-delà de `md`). */}
        <div aria-hidden="true" className="min-w-0 flex-1 md:hidden" />

        <button
          type="button"
          onClick={onOuvrirPanier}
          aria-label="Ouvrir le panier"
          className="group relative flex flex-none items-center gap-2.5 rounded-full bg-boutique-900 px-4 py-2.5 text-sm font-bold text-boutique-50 shadow-soft transition-all duration-200 hover:bg-boutique-800 hover:shadow-lift active:scale-[0.97]"
        >
          <span className="relative">
            <ShoppingCartIcon className="h-[18px] w-[18px]" />
            {nombreArticles > 0 && (
              <span className="absolute -top-2 -right-2.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-forest-500 px-1 text-[10px] font-extrabold text-white tabular ring-2 ring-boutique-50">
                {nombreArticles}
              </span>
            )}
          </span>
          <span className="hidden sm:inline">Panier</span>
        </button>
      </div>

      {/* Recherche mobile */}
      <div className="border-t border-boutique-200/70 px-4 py-2.5 md:hidden">
        <div className="relative mx-auto max-w-[1400px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-boutique-400" />
          <input
            className="w-full rounded-full border border-boutique-200 bg-white py-2.5 pr-4 pl-11 text-sm text-boutique-900 outline-none placeholder:text-boutique-400 focus:border-boutique-300 focus:ring-4 focus:ring-boutique-200/50"
            placeholder="Rechercher un article, une marque…"
            aria-label="Rechercher un article"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}

/* ===========================================================================
 * 6. PIED DE PAGE
 * =========================================================================== */

export function PiedVitrine({ activite, vitrine, paiements }) {
  const annee = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-boutique-200 bg-boutique-100/70">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-boutique-900 text-boutique-50">
                <ShoppingBagIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-boutique-900">
                {activite?.nom}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-boutique-600">
              Catalogue servi par <strong className="font-bold text-boutique-800">Le Gestionnaire</strong>.
              Commandez en quelques clics, avec retrait en boutique ou livraison à domicile.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {paiements?.en_ligne && (
                <span className="lg-badge border-boutique-200 bg-white text-boutique-700">
                  <ShieldCheckIcon className="h-3.5 w-3.5" /> Paiement sécurisé
                </span>
              )}
              {paiements?.a_la_livraison && (
                <span className="lg-badge border-boutique-200 bg-white text-boutique-700">
                  <BanknotesIcon className="h-3.5 w-3.5" /> Paiement à la livraison
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-bold tracking-[0.16em] text-boutique-500 uppercase">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              <li>
                <Link to={`/boutique/${activite?.slug || ""}`} className="text-boutique-700 transition-colors hover:text-forest-600">
                  Tout le catalogue
                </Link>
              </li>
              <li>
                <Link to="/commande/suivi" className="text-boutique-700 transition-colors hover:text-forest-600">
                  Suivre ma commande
                </Link>
              </li>
              <li>
                <Link to="/auth/sign-in" className="text-boutique-700 transition-colors hover:text-forest-600">
                  Espace gestionnaire
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-[11px] font-bold tracking-[0.16em] text-boutique-500 uppercase">
              {vitrine?.livraison_active ? "Zones & frais de livraison" : "Retrait en boutique"}
            </h3>
            {(vitrine?.zones || []).length ? (
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {vitrine.zones.map((z) => (
                  <li
                    key={z.id ?? z.nom}
                    className="flex items-center justify-between rounded-xl border border-boutique-200/80 bg-white px-3.5 py-2.5 text-[13px]"
                  >
                    <span className="flex items-center gap-2 font-semibold text-boutique-800">
                      <MapPinIcon className="h-4 w-4 flex-none text-forest-500" />
                      {z.nom}
                    </span>
                    <span className="font-bold text-boutique-600 tabular">{fmt(z.frais)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13.5px] text-boutique-600">
                Retrait sur place au point de vente
                {vitrine?.frais_livraison_defaut
                  ? ` · Livraison ${fmt(vitrine.frais_livraison_defaut)} par défaut`
                  : ""}
                .
              </p>
            )}
            {vitrine?.livraison_gratuite_des > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 text-[12px] font-bold text-forest-700">
                <TruckIcon className="h-3.5 w-3.5" />
                Livraison offerte dès {fmt(vitrine.livraison_gratuite_des)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-boutique-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-boutique-500">
            © {annee} — {activite?.nom}. Conception et développement :{" "}
            <strong className="font-bold text-boutique-700">Le Gestionnaire · TO CONNECT</strong>
          </p>
          <p className="flex items-center gap-1.5 text-[12px] text-boutique-400">
            <ClockIcon className="h-3.5 w-3.5" />
            Montants vérifiés et recalculés côté serveur
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ===========================================================================
 * 7. SÉLECTEUR DE QUANTITÉ
 * =========================================================================== */

export function SelecteurQuantite({ valeur, max, onChange, libelle }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-boutique-200 bg-white p-1">
      <button
        type="button"
        aria-label={`Retirer un article${libelle ? ` — ${libelle}` : ""}`}
        onClick={() => onChange(-1)}
        className="grid h-8 w-8 place-items-center rounded-full text-boutique-600 transition-colors hover:bg-boutique-100 hover:text-boutique-900 disabled:opacity-30"
      >
        <MinusIcon className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-extrabold text-boutique-900 tabular">{valeur}</span>
      <button
        type="button"
        aria-label={`Ajouter un article${libelle ? ` — ${libelle}` : ""}`}
        disabled={valeur >= (max || 99)}
        onClick={() => onChange(1)}
        className="grid h-8 w-8 place-items-center rounded-full text-boutique-600 transition-colors hover:bg-boutique-100 hover:text-boutique-900 disabled:opacity-30"
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ===========================================================================
 * 8. ÉTATS VIDES / ERREUR / SQUELETTES
 * =========================================================================== */

export function EtatVide({ Icone = ShoppingBagIcon, titre, texte, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl border border-boutique-200 bg-white text-boutique-300 shadow-soft">
        <Icone className="h-9 w-9" />
      </span>
      <h3 className="mt-6 font-display text-xl font-extrabold tracking-tight text-boutique-900">{titre}</h3>
      {texte && <p className="mt-2 max-w-sm text-sm leading-relaxed text-boutique-500">{texte}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SqueletteGrille({ nombre = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {Array.from({ length: nombre }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-boutique-200/70 bg-white shadow-xs"
        >
          <div className="lg-skeleton aspect-square w-full rounded-none" />
          <div className="space-y-2.5 p-4">
            <div className="lg-skeleton h-2.5 w-1/3" />
            <div className="lg-skeleton h-3.5 w-full" />
            <div className="lg-skeleton h-3.5 w-2/3" />
            <div className="lg-skeleton h-6 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bouton principal espresso, cohérent avec l'identité de la vitrine. */
export function BoutonVitrine({ children, className = "", variante = "principal", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
  const variantes = {
    principal: "bg-boutique-900 text-boutique-50 shadow-soft hover:bg-boutique-800 hover:shadow-lift",
    clair: "border border-boutique-200 bg-white text-boutique-800 hover:border-boutique-300 hover:bg-boutique-50",
    accent: "bg-forest-600 text-white shadow-soft hover:bg-forest-700 hover:shadow-lift",
    fantome: "text-boutique-600 hover:bg-boutique-100 hover:text-boutique-900",
  };
  return (
    <button type="button" className={`${base} ${variantes[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/** Bandeau de réassurance (icônes + texte court). */
export function BandeauConfiance({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ Icone, titre, texte }) => (
        <div
          key={titre}
          className="flex items-start gap-3 rounded-2xl border border-boutique-200/70 bg-white/70 px-4 py-3.5"
        >
          <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-forest-100 text-forest-700">
            <Icone className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-boutique-900">{titre}</span>
            <span className="block text-[12px] leading-snug text-boutique-500">{texte}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Icône de secteur pour les en-têtes hors boutique (suivi, retour paiement). */
export function IconeSecteur({ secteur = "", className = "h-6 w-6" }) {
  const map = {
    restaurant: FireIcon,
    salon: SparklesIcon,
    sante: ShieldCheckIcon,
    supermarche: ShoppingCartIcon,
    sup_ermarche: ShoppingCartIcon,
  };
  const Icone = map[String(secteur).toLowerCase()] || ShoppingBagIcon;
  return <Icone className={className} />;
}

/* ===========================================================================
 * 9. BARRE SUPÉRIEURE (pages hors catalogue)
 * =========================================================================== */

/**
 * En-tête collant de la vitrine : logo + recherche + panier, puis le rail des
 * catégories.
 *
 * ⚠️ Les deux barreaux sont rendus DANS un même conteneur `sticky top-0` par
 * l'appelant. Il n'y a donc aucun décalage en pixels à maintenir : le rail suit
 * la hauteur réelle de l'en-tête, qui change selon que la recherche est dans la
 * barre (≥ md) ou sur une seconde ligne (< md). Un `top-[77px]` en dur aurait
 * décalé le rail de plusieurs dizaines de pixels sur mobile.
 */
export function BarreSticky({ children }) {
  return (
    <div className="sticky top-0 z-40 shadow-[0_1px_0_0_rgb(216_200_173/0.9)]">
      {children}
    </div>
  );
}

/**
 * En-tête réduit des pages de service (suivi de commande, retour de paiement).
 * Le slug de la boutique étant inconnu à ces routes, on ne propose pas de lien
 * « retour au catalogue » — ce dernier resterait un 404. Le lien vers l'espace
 * gestionnaire est en revanche toujours valide.
 */
export function BarreVitrine({ children }) {
  return (
    <div className="bg-boutique-50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-boutique-900 text-boutique-50">
            <ShoppingBagIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[15px] leading-tight font-extrabold tracking-tight text-boutique-900">
              Le Gestionnaire
            </span>
            <span className="block text-[10.5px] font-semibold tracking-[0.16em] text-boutique-400 uppercase">
              Boutique en ligne
            </span>
          </span>
        </div>
        {children && <div className="flex flex-none items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

/** Icône de tri / sélecteur compacte. */
export function SelecteurTri({ valeur, options, onChange }) {
  return (
    <div className="relative">
      <select
        aria-label="Trier les articles"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-boutique-200 bg-white py-2 pr-9 pl-3.5 text-[12.5px] font-bold text-boutique-700 outline-none transition-colors hover:border-boutique-300 focus:border-boutique-300 focus:ring-4 focus:ring-boutique-200/50"
      >
        {options.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-boutique-400" />
    </div>
  );
}