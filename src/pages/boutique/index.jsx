/* ===========================================================================
 * « LE GESTIONNAIRE » — VITRINE PUBLIQUE (espace client)
 * ---------------------------------------------------------------------------
 * Catalogue + panier avec contrôle du stock en temps réel + checkout
 * (paiement en ligne FedaPay ou à la livraison, selon le réglage du
 * gestionnaire) + reçu automatique affiché et téléchargeable.
 *
 * ⚠️ AUCUNE RÈGLE MÉTIER N'A ÉTÉ MODIFIÉE. Les endpoints, les corps de
 * requête, les champs envoyés à /api/v1/commande, le contrôle du stock et les
 * règles de paiement sont strictement identiques à l'existant. Seule la
 * présentation a été refaite, et l'IDENTIQUE est extraite dans ./ui.jsx.
 * =========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TagIcon,
  TrashIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BandeauAnnonce,
  BandeauConfiance,
  BarreSticky,
  BoutonVitrine,
  EnteteVitrine,
  EtatVide,
  PiedVitrine,
  PastilleCategorie,
  PastilleStock,
  SelecteurQuantite,
  SelecteurTri,
  TuileVisuel,
  fmt,
} from "./ui";

const API = import.meta.env.VITE_API_URL;

/** Options de tri du catalogue. */
const TRIS = [
  { valeur: "defaut", label: "Tri : recommended" },
  { valeur: "prix_asc", label: "Prix croissant" },
  { valeur: "prix_desc", label: "Prix décroissant" },
  { valeur: "nom", label: "Nom (A → Z)" },
  { valeur: "stock", label: "Disponibilité" },
];

/** Nombre de références affichées par page de catalogue. */
const PAR_PAGE = 24;

/** Avantages affichés sous le héros — alimentés par les réglages réels. */
function avantages({ vitrine, paiements }) {
  const seuil = Number(vitrine?.livraison_gratuite_des || 0);
  return [
    {
      Icone: TruckIcon,
      titre: vitrine?.livraison_active ? "Livraison à domicile" : "Retrait en boutique",
      texte:
        (vitrine?.zones || []).length > 0
          ? `${vitrine.zones.length} zone(s) · dès ${fmt(Math.min(...vitrine.zones.map((z) => Number(z.frais || 0))))}`
          : "Disponible immédiatement",
    },
    {
      Icone: ShieldCheckIcon,
      titre: paiements?.en_ligne ? "Paiement sécurisé" : "Paiement simplifié",
      texte: paiements?.en_ligne ? "Carte via FedaPay, reçu automatique" : "Réglez à la réception",
    },
    {
      Icone: TagIcon,
      titre: seuil > 0 ? `Offerte dès ${fmt(seuil)}` : "Frais transparents",
      texte: seuil > 0 ? "Livraison offerte au-delà du seuil" : "Aucun frais caché",
    },
    {
      Icone: ClockIcon,
      titre: "Suivi en temps réel",
      texte: "Chaque étape de votre commande",
    },
  ];
}

/* ===========================================================================
 * 1. HÉROS ÉDITORIAL
 * =========================================================================== */
function Hero({ data }) {
  const { activite, vitrine, paiements, produits } = data;

  // Mosaïque des plus grandes catégories → donne un ancrage visuel au héros
  // même quand le catalogue n'a aucune photo.
  const topCategories = useMemo(() => {
    const compte = new Map();
    for (const p of produits) {
      const c = (p.categorie || "").trim();
      if (!c) continue;
      compte.set(c, (compte.get(c) || 0) + 1);
    }
    return [...compte.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [produits]);

  const enStock = produits.filter((p) => !p.en_rupture).length;
  const plafond = Number(vitrine?.frais_livraison_defaut || 0);

  return (
    <section className="relative overflow-hidden bg-boutique-deep text-boutique-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-forest-500/20 blur-[100px]" />
        <div className="absolute -right-32 -bottom-32 h-[30rem] w-[30rem] rounded-full bg-boutique-500/25 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.10) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
        {/* Colonne éditoriale */}
        <div className="lg:col-span-6 xl:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-boutique-200 uppercase backdrop-blur">
            <SparklesIcon className="h-3.5 w-3.5 text-forest-300" />
            Boutique officielle · Le Gestionnaire
          </span>

          <h1 className="mt-6 font-display text-[38px] leading-[1.05] font-extrabold tracking-tight text-white sm:text-6xl">
            {activite.nom}
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-boutique-200/85 sm:text-base">
            {produits.length} article{produits.length > 1 ? "s" : ""} en catalogue
            {topCategories.length > 0 && (
              <>
                {" "}
                — {topCategories.length} grandes familles de produits
              </>
            )}
            {vitrine?.livraison_active
              ? ", livrés chez vous ou à retirer en boutique."
              : ", disponibles en retrait en boutique."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-boutique-900 shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow active:scale-[0.98]"
            >
              Découvrir le catalogue
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <Link
              to="/commande/suivi"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white/90 backdrop-blur transition-all duration-200 hover:border-white/40 hover:bg-white/5"
            >
              <TruckIcon className="h-[18px] w-[18px]" />
              Suivre ma commande
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-7">
            {[
              { v: String(produits.length), l: "Références" },
              { v: String(enStock), l: "En stock" },
              { v: plafond > 0 ? fmt(plafond) : "—", l: "Livraison dès" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-[11.5px] font-semibold tracking-wider text-boutique-300/80 uppercase">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Mosaïque de catégories */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {topCategories.map(([cat, n], i) => (
              <a
                key={cat}
                href="#catalogue"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(`[data-cat="${CSS.escape(cat)}"]`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lift backdrop-blur transition-transform duration-300 hover:-translate-y-1 ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                }`}
              >
                <TuileVisuel
                  produit={{ nom: cat, categorie: cat }}
                  api={API}
                  className="absolute inset-0 h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-boutique-950/85 via-boutique-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="truncate text-[12.5px] font-extrabold tracking-tight text-white sm:text-sm">
                    {cat}
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-white/65 tabular">{n} réf.</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================================================================
 * 2. CARTE ARTICLE
 * =========================================================================== */
function CarteProduit({ produit, api, onApercu, onAjouter, ajoute }) {
  const dispo = !produit.en_rupture && Number(produit.stock_disponible) > 0;
  const prix = Number(produit.prix || 0);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-boutique-200/70 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-boutique-300 hover:shadow-lift">
      <button
        type="button"
        onClick={() => onApercu(produit)}
        aria-label={`Aperçu de ${produit.nom}`}
        className="relative block aspect-square w-full overflow-hidden"
      >
        <TuileVisuel produit={produit} api={api} className="absolute inset-0 h-full w-full" />

        <PastilleStock produit={produit} className="absolute top-3 left-3" />

        {/* Appel à l'action au survol (desktop) / toujours visible (mobile) */}
        <span className="absolute inset-x-3 bottom-3 flex translate-y-2 justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[11.5px] font-bold text-boutique-900 shadow-soft backdrop-blur">
            <EyeIcon className="h-3.5 w-3.5" />
            Aperçu rapide
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <PastilleCategorie categorie={produit.categorie} />

        <h3 className="mt-2 min-h-[2.6rem] text-[13.5px] leading-snug font-bold text-boutique-900 lg-clamp-2">
          {produit.nom || "Article sans nom"}
        </h3>

        {produit.description && (
          <p className="mt-1 truncate text-[11.5px] text-boutique-400">{produit.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="font-display text-[17px] leading-none font-extrabold tracking-tight text-forest-700 tabular">
            {prix > 0 ? fmt(prix) : "—"}
          </p>

          <button
            type="button"
            disabled={!dispo}
            onClick={() => onAjouter(produit)}
            aria-label={`Ajouter ${produit.nom} au panier`}
            className={`inline-flex h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold transition-all duration-200 active:scale-[0.96] ${
              dispo
                ? ajoute
                  ? "bg-forest-600 text-white"
                  : "bg-boutique-900 text-boutique-50 hover:bg-boutique-800"
                : "cursor-not-allowed bg-boutique-100 text-boutique-400"
            }`}
          >
            {dispo ? (
              ajoute ? (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Ajouté
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="h-4 w-4" />
                  Ajouter
                </>
              )
            ) : (
              "Indisponible"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ===========================================================================
 * 3. PAGINATION
 * =========================================================================== */

/** Fenêtre de pages compacte : 1 … 4 5 [6] 7 8 … 17 */
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

function Pagination({ page, nbPages, allerPage }) {
  const bouton =
    "grid h-9 min-w-9 place-items-center rounded-full px-2 text-[13px] font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <nav aria-label="Pagination du catalogue" className="mt-12 flex justify-center">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => allerPage(page - 1)}
          disabled={page === 1}
          aria-label="Page précédente"
          className={`${bouton} border border-boutique-200 bg-white text-boutique-600 hover:border-boutique-300 hover:bg-boutique-100`}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {fenetrePages(page, nbPages).map((n, i) =>
          n === "…" ? (
            <span key={`e${i}`} className="px-1 text-[13px] text-boutique-400">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => allerPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={`${bouton} ${
                n === page
                  ? "bg-boutique-900 text-boutique-50 shadow-soft"
                  : "border border-boutique-200 bg-white text-boutique-600 hover:border-boutique-300 hover:bg-boutique-100"
              }`}
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
          className={`${bouton} border border-boutique-200 bg-white text-boutique-600 hover:border-boutique-300 hover:bg-boutique-100`}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

/* ===========================================================================
 * 4. APERÇU RAPIDE
 * =========================================================================== */
function ApercuRapide({ produit, api, onFermer, onAjouter, ajoute }) {
  useEffect(() => {
    const surTouche = (e) => e.key === "Escape" && onFermer();
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [onFermer]);

  const dispo = !produit.en_rupture && Number(produit.stock_disponible) > 0;
  const stock = Number(produit.stock_disponible || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-boutique-950/60 backdrop-blur-sm"
        onClick={onFermer}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu de ${produit.nom}`}
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-boutique-50 shadow-lift animate-pop-in sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer l'aperçu"
          className="absolute top-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-boutique-700 shadow-soft backdrop-blur transition-colors hover:bg-white hover:text-boutique-900"
        >
          <XMarkIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="grid sm:grid-cols-2">
          <div className="relative">
            <TuileVisuel produit={produit} api={api} taille="grande" className="aspect-square w-full sm:h-full sm:min-h-[26rem]" />
            <PastilleStock produit={produit} className="absolute top-4 left-4" />
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <PastilleCategorie categorie={produit.categorie} />

            <h2 className="mt-3 font-display text-2xl leading-tight font-extrabold tracking-tight text-boutique-900">
              {produit.nom || "Article sans nom"}
            </h2>

            {produit.description && (
              <p className="mt-2 text-sm leading-relaxed text-boutique-500">{produit.description}</p>
            )}

            <p className="mt-6 font-display text-3xl font-extrabold tracking-tight text-forest-700 tabular">
              {fmt(produit.prix)}
            </p>

            <ul className="mt-6 space-y-2.5 border-t border-boutique-200 pt-5 text-[13px] text-boutique-600">
              {produit.code_barre && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-boutique-400">Code-barres</span>
                  <span className="font-mono text-[12px] font-semibold text-boutique-800">
                    {produit.code_barre}
                  </span>
                </li>
              )}
              <li className="flex items-center justify-between gap-3">
                <span className="text-boutique-400">Disponibilité</span>
                <span className="font-bold text-boutique-800">
                  {produit.en_rupture ? "Rupture de stock" : `${stock} unité${stock > 1 ? "s" : ""}`}
                </span>
              </li>
            </ul>

            <div className="mt-auto pt-7">
              <button
                type="button"
                disabled={!dispo}
                onClick={() => onAjouter(produit)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  dispo
                    ? ajoute
                      ? "bg-forest-600 text-white shadow-soft"
                      : "bg-boutique-900 text-boutique-50 shadow-soft hover:bg-boutique-800 hover:shadow-lift"
                    : "cursor-not-allowed bg-boutique-200 text-boutique-400"
                }`}
              >
                {dispo ? (
                  <>
                    {ajoute ? (
                      <CheckCircleIcon className="h-[18px] w-[18px]" />
                    ) : (
                      <ShoppingBagIcon className="h-[18px] w-[18px]" />
                    )}
                    {ajoute ? "Ajouté au panier" : "Ajouter au panier"}
                  </>
                ) : (
                  "Indisponible pour le moment"
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-boutique-400">
                <LockClosedIcon className="h-3.5 w-3.5" />
                Stock contrôlé en temps réel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
 * 5. TIROIR PANIER
 * =========================================================================== */
function PanierTiroir({
  ouvert,
  onFermer,
  panier,
  changerQuantite,
  viderPanier,
  totalArticles,
  seuil,
  api,
  onCommander,
}) {
  useEffect(() => {
    if (!ouvert) return undefined;
    const surTouche = (e) => e.key === "Escape" && onFermer();
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  const nombre = panier.reduce((t, p) => t + p.quantite, 0);
  const reste = Math.max(0, seuil - totalArticles);
  const progression = seuil > 0 ? Math.min(100, (totalArticles / seuil) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-boutique-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onFermer}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
        className="relative flex h-full w-full max-w-[27rem] flex-col bg-boutique-50 shadow-lift animate-slide-up sm:animate-none"
      >
        <header className="flex items-center justify-between gap-3 border-b border-boutique-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-boutique-900">
              Votre panier
            </h2>
            <p className="text-[12px] font-semibold text-boutique-400">
              {nombre} article{nombre > 1 ? "s" : ""}
              {panier.length > 0 && ` · ${panier.length} ligne${panier.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer le panier"
            className="grid h-9 w-9 flex-none place-items-center rounded-full text-boutique-500 transition-colors hover:bg-boutique-200/70 hover:text-boutique-900"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        {/* Progression vers la livraison offerte */}
        {seuil > 0 && (
          <div className="border-b border-boutique-200 bg-white px-5 py-3.5">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-boutique-700">
              <TruckIcon className="h-4 w-4 text-forest-600" />
              {reste > 0 ? (
                <>
                  Plus que <span className="tabular">{fmt(reste)}</span> pour la livraison offerte
                </>
              ) : (
                "Livraison offerte débloquée"
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-boutique-200">
              <div
                className="h-full rounded-full bg-forest-gradient transition-all duration-500 ease-smooth"
                style={{ width: `${progression}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {panier.length === 0 ? (
            <EtatVide
              Icone={ShoppingBagIcon}
              titre="Votre panier est vide"
              texte="Parcourez le catalogue et ajoutez vos articles pour commencer."
              action={
                <BoutonVitrine onClick={onFermer} variante="principal" className="px-6 py-3">
                  Voir le catalogue
                </BoutonVitrine>
              }
            />
          ) : (
            <ul className="divide-y divide-boutique-200">
              {panier.map((p) => (
                <li key={p.id} className="flex gap-3.5 p-4 transition-colors hover:bg-white sm:p-5">
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-boutique-200">
                    <TuileVisuel produit={p} api={api} className="h-full w-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug font-bold text-boutique-900 lg-clamp-2">
                      {p.nom}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-boutique-400 tabular">
                      {fmt(p.prix)} / unité · max {p.stock}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <SelecteurQuantite
                        valeur={p.quantite}
                        max={p.stock}
                        libelle={p.nom}
                        onChange={(d) => changerQuantite(p.id, d)}
                      />
                      <span className="text-[13px] font-extrabold text-boutique-900 tabular">
                        {fmt(p.prix * p.quantite)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => changerQuantite(p.id, -p.quantite)}
                    aria-label={`Retirer ${p.nom} du panier`}
                    className="h-7 w-7 flex-none rounded-lg text-boutique-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {panier.length > 0 && (
          <footer className="border-t border-boutique-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-boutique-600">Sous-total</span>
              <span className="font-display text-xl font-extrabold text-boutique-900 tabular">
                {fmt(totalArticles)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-boutique-400">
              Frais de livraison calculés à l'étape suivante
            </p>
            <button
              type="button"
              onClick={onCommander}
              className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-boutique-900 px-6 py-4 text-sm font-bold text-boutique-50 shadow-soft transition-all duration-200 hover:bg-boutique-800 hover:shadow-lift active:scale-[0.98]"
            >
              Passer commande
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={viderPanier}
              className="mt-2 w-full py-2 text-[12px] font-semibold text-boutique-400 transition-colors hover:text-rose-600"
            >
              Vider le panier
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

/* ===========================================================================
 * 6. CHECKOUT (ex-panier)
 * =========================================================================== */
/* Petit composant d'en-tête d'étape numérotée.
   ⚠️ DOIT rester défini HORS du composant : défini à l'intérieur de
   CheckoutView, il changeait d'identité à chaque frappe → React
   démontait/remontait <Etape> → les champs perdaient le focus à chaque lettre. */
function Etape({ n, titre, children }) {
  return (
    <section className="rounded-2xl border border-boutique-200/70 bg-white p-5 shadow-xs sm:p-6">
      <h2 className="flex items-center gap-3 font-display text-base font-extrabold tracking-tight text-boutique-900">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-boutique-900 text-[12px] font-extrabold text-boutique-50">
          {n}
        </span>
        {titre}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CheckoutView({
  panier,
  changerQuantite,
  viderPanier,
  retour,
  totalArticles,
  vitrine,
  paiements,
  slug,
  api,
  sauverPanier,
  surConfirmation,
}) {
  const [form, setForm] = useState({
    client_nom: "",
    client_prenom: "",
    client_email: "",
    client_contact: "",
    mode_recuperation: vitrine?.livraison_active ? "livraison" : "retrait",
    mode_paiement:
      paiements?.mode_impose || (paiements?.en_ligne ? "en_ligne" : "a_la_livraison"),
    adresse_livraison: "",
    zone_livraison: "",
    creneau_souhaite: "",
    note_client: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreurStock, setErreurStock] = useState(null);

  const zoneChoisie = vitrine?.zones?.find((z) => z.nom === form.zone_livraison);
  const frais =
    form.mode_recuperation === "livraison"
      ? Number(zoneChoisie?.frais ?? vitrine?.frais_livraison_defaut ?? 0)
      : 0;
  const gratuite =
    vitrine?.livraison_gratuite_des != null && totalArticles >= Number(vitrine.livraison_gratuite_des);
  const fraisEffectifs = gratuite ? 0 : frais;
  const total = totalArticles + fraisEffectifs;

  const majForm = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validerCommande = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreurStock(null);
    try {
      const res = await fetch(`${API}/api/v1/commande`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          items: panier.map((p) => ({ produit_id: p.id, quantite: p.quantite })),
          ...form,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.manquants?.length) {
          setErreurStock(json.erreur);
          // Mettre à jour le stock local avec les quantités réellement dispo
          sauverPanier(
            panier
              .map((p) => {
                const m = json.manquants.find((x) => x.produit_id === p.id);
                return m
                  ? {
                      ...p,
                      stock: m.disponible,
                      quantite: Math.min(p.quantite, Math.max(m.disponible, 0)),
                    }
                  : p;
              })
              .filter((p) => p.quantite > 0)
          );
          return;
        }
        throw new Error(json.erreur || "Erreur lors de la commande");
      }
      viderPanier();
      surConfirmation(json.commande);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  /* ---------------- Commande via WhatsApp ----------------
     La commande est d'abord ENREGISTRÉE (même logique que la commande
     classique, mode paiement « à la livraison »), puis le client envoie
     le récapitulatif sur le WhatsApp du gestionnaire (paramètre
     whatsapp_gestionnaire de la boutique). */
  const commanderParWhatsApp = async () => {
    if (!vitrine?.whatsapp) {
      toast.error("Aucun numéro WhatsApp configuré pour cette boutique.");
      return;
    }
    if (!form.client_nom || !form.client_contact) {
      toast.warning("Renseignez d'abord votre nom et votre contact.");
      return;
    }
    setEnvoi(true);
    setErreurStock(null);
    // Ouvre l'onglet immédiatement (dans le geste utilisateur) : Chrome bloque
    // les window.open exécutés après un fetch asynchrone (anti-popup).
    let onglet = null;
    try {
      onglet = window.open("", "_blank");
    } catch {
      onglet = null;
    }
    try {
      const res = await fetch(`${API}/api/v1/commande`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          items: panier.map((p) => ({ produit_id: p.id, quantite: p.quantite })),
          ...form,
          mode_paiement: "a_la_livraison",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur || "Erreur lors de la commande");

      // Construit le message WhatsApp
      const lignes = panier
        .map((p) => `• ${p.nom} x${p.quantite} — ${fmt(p.prix * p.quantite)}`)
        .join("\n");
      const msg =
        `*Commande ${json.commande.reference}*\n` +
        `${form.client_nom}${form.client_prenom ? " " + form.client_prenom : ""}\n` +
        `Contact : ${form.client_contact}\n\n` +
        `${lignes}\n\n` +
        `Frais livraison : ${fmt(fraisEffectifs)}\n` +
        `*Total : ${json.commande.montant_total ? fmt(json.commande.montant_total) : fmt(total)}*\n\n` +
        (form.adresse_livraison ? `Livraison : ${form.adresse_livraison} (${form.zone_livraison || "—"})\n` : "") +
        (form.note_client ? `Note : ${form.note_client}` : "");

      const num = String(vitrine.whatsapp).replace(/[^\d]/g, "");
      const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
      if (onglet) {
        onglet.location.href = url;
      } else {
        // Popup bloquée : on ouvre WhatsApp dans le même onglet (la commande est déjà enregistrée)
        window.location.href = url;
      }
      viderPanier();
      surConfirmation(json.commande);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-6 pb-4 sm:px-8 animate-fade-in">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-bold text-boutique-500 transition-colors hover:bg-boutique-100 hover:text-boutique-900"
        onClick={retour}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Continuer mes achats
      </button>

      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-boutique-900 sm:text-4xl">
        Finaliser la commande
      </h1>
      <p className="mt-2 text-sm text-boutique-500">
        Trois étapes, aucun compte à créer. Montants recalculés et vérifiés côté serveur.
      </p>

      {erreurStock && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-4 text-[13px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" />
          <span>
            {erreurStock} — quantités ajustées au stock disponible.
          </span>
        </div>
      )}

      <form onSubmit={validerCommande} className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* ── Colonne étapes ── */}
        <div className="space-y-5 lg:col-span-7">
          {/* Étape 1 — récupération */}
          <Etape n={1} titre="Mode de récupération">
            {vitrine?.livraison_active ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    v: "livraison",
                    Icone: TruckIcon,
                    titre: "Livraison à domicile",
                    texte: (vitrine.zones || []).length
                      ? `${vitrine.zones.length} zone(s) disponible(s)`
                      : `Dès ${fmt(vitrine.frais_livraison_defaut)}`,
                  },
                  {
                    v: "retrait",
                    Icone: BuildingStorefrontIcon,
                    titre: "Retrait en boutique",
                    texte: "Gratuit · prêt rapidement",
                  },
                ].map(({ v, Icone, titre, texte }) => {
                  const actif = form.mode_recuperation === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          mode_recuperation: v,
                          zone_livraison: v === "retrait" ? "" : f.zone_livraison,
                        }))
                      }
                      className={`flex items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                        actif
                          ? "border-forest-600 bg-forest-50 shadow-soft"
                          : "border-boutique-200 bg-boutique-50 hover:border-boutique-300 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${
                          actif ? "bg-forest-600 text-white" : "bg-white text-boutique-400"
                        }`}
                      >
                        <Icone className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-bold text-boutique-900">
                          {titre}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-boutique-500">{texte}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-boutique-600">
                Cette boutique propose uniquement le retrait en boutique.
              </p>
            )}

            {form.mode_recuperation === "livraison" && (
              <div className="mt-5 grid gap-4 animate-slide-down sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="lg-label" htmlFor="c_adr">
                    Adresse de livraison *
                  </label>
                  <input
                    id="c_adr"
                    className="w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all placeholder:text-boutique-400 focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                    required
                    value={form.adresse_livraison}
                    name="adresse_livraison"
                    onChange={majForm}
                    placeholder="Quartier, rue, repère…"
                  />
                </div>
                <div>
                  <label className="lg-label" htmlFor="c_zone">
                    Zone de livraison
                  </label>
                  <div className="relative">
                    <select
                      id="c_zone"
                      className="w-full appearance-none rounded-xl border border-boutique-200 bg-boutique-50 py-3 pr-10 pl-4 text-sm text-boutique-900 outline-none transition-all focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                      value={form.zone_livraison}
                      name="zone_livraison"
                      onChange={majForm}
                    >
                      <option value="">— Choisir une zone —</option>
                      {(vitrine?.zones || []).map((z) => (
                        <option key={z.id} value={z.nom}>
                          {z.nom} ({fmt(z.frais)})
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-boutique-400" />
                  </div>
                </div>
                <div>
                  <label className="lg-label" htmlFor="c_cre">
                    Créneau souhaité
                  </label>
                  <input
                    id="c_cre"
                    className="w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all placeholder:text-boutique-400 focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                    value={form.creneau_souhaite}
                    name="creneau_souhaite"
                    onChange={majForm}
                    placeholder="Ex. : demain matin"
                  />
                </div>
              </div>
            )}
          </Etape>

          {/* Étape 2 — coordonnées */}
          <Etape n={2} titre="Vos coordonnées">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="lg-label" htmlFor="c_nom">
                  Nom *
                </label>
                <input
                  id="c_nom"
                  className="w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                  required
                  value={form.client_nom}
                  name="client_nom"
                  onChange={majForm}
                />
              </div>
              <div>
                <label className="lg-label" htmlFor="c_prenom">
                  Prénom
                </label>
                <input
                  id="c_prenom"
                  className="w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                  value={form.client_prenom}
                  name="client_prenom"
                  onChange={majForm}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="lg-label" htmlFor="c_contact">
                  Contact (WhatsApp / Tél.) *
                </label>
                <input
                  id="c_contact"
                  className="w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all placeholder:text-boutique-400 focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                  required
                  value={form.client_contact}
                  name="client_contact"
                  onChange={majForm}
                  placeholder="+229 90 00 00 00"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="lg-label" htmlFor="c_email">
                  Email <span className="font-normal text-boutique-400">(pour le reçu)</span>
                </label>
                <input
                  id="c_email"
                  className="w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                  type="email"
                  value={form.client_email}
                  name="client_email"
                  onChange={majForm}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="lg-label" htmlFor="c_note">
                  Note <span className="font-normal text-boutique-400">(optionnel)</span>
                </label>
                <textarea
                  id="c_note"
                  className="min-h-[84px] w-full rounded-xl border border-boutique-200 bg-boutique-50 px-4 py-3 text-sm text-boutique-900 outline-none transition-all focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                  value={form.note_client}
                  name="note_client"
                  onChange={majForm}
                />
              </div>
            </div>
          </Etape>

          {/* Étape 3 — paiement */}
          <Etape n={3} titre="Paiement">
            {paiements?.mode_impose || !paiements?.choix_libre ? (
              <div className="flex items-center gap-3 rounded-xl bg-forest-50 p-4 text-[13px] font-bold text-forest-800 ring-1 ring-inset ring-forest-200">
                {form.mode_paiement === "en_ligne" ? (
                  <>
                    <CreditCardIcon className="h-5 w-5 shrink-0" />
                    Paiement en ligne obligatoire (FedaPay)
                  </>
                ) : (
                  <>
                    <BanknotesIcon className="h-5 w-5 shrink-0" />
                    Paiement à la livraison obligatoire
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {[
                  {
                    v: "en_ligne",
                    label: "Je souhaite payer maintenant (en ligne)",
                    Icone: CreditCardIcon,
                  },
                  { v: "a_la_livraison", label: "Je souhaite payer à la livraison", Icone: BanknotesIcon },
                ].map(({ v, label, Icone }) => {
                  const actif = form.mode_paiement === v;
                  return (
                    <label
                      key={v}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-xl border-2 p-4 text-[13px] font-medium transition-all duration-200 ${
                        actif
                          ? "border-forest-600 bg-forest-50 font-bold text-forest-800"
                          : "border-boutique-200 bg-boutique-50 text-boutique-600 hover:border-boutique-300 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mode_paiement"
                        value={v}
                        checked={actif}
                        onChange={majForm}
                        className="h-4 w-4 flex-none accent-forest-600"
                      />
                      <Icone className="h-5 w-5 flex-none text-boutique-400" />
                      {label}
                    </label>
                  );
                })}
              </div>
            )}
          </Etape>
        </div>

        {/* ── Colonne récapitulatif ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 overflow-hidden rounded-2xl border border-boutique-200/70 bg-white shadow-card">
            <header className="flex items-center justify-between gap-3 border-b border-boutique-200 px-5 py-4">
              <h2 className="font-display text-base font-extrabold tracking-tight text-boutique-900">
                Votre commande
              </h2>
              {panier.length > 0 && (
                <button
                  type="button"
                  onClick={viderPanier}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-boutique-400 transition-colors hover:text-rose-600"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Vider
                </button>
              )}
            </header>

            {panier.length === 0 ? (
              <EtatVide
                Icone={ShoppingBagIcon}
                titre="Panier vide"
                texte="Ajoutez des articles depuis le catalogue."
                action={
                  <BoutonVitrine onClick={retour} variante="principal" className="px-5 py-3">
                    Voir le catalogue
                  </BoutonVitrine>
                }
              />
            ) : (
              <>
                <ul className="max-h-[19rem] divide-y divide-boutique-100 overflow-y-auto">
                  {panier.map((p) => (
                    <li key={p.id} className="flex items-center gap-3.5 px-5 py-3.5">
                      <div className="h-12 w-12 flex-none overflow-hidden rounded-lg border border-boutique-200">
                        <TuileVisuel produit={p} api={api} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-boutique-900">{p.nom}</p>
                        <p className="mt-0.5 text-[11.5px] text-boutique-400 tabular">
                          {fmt(p.prix)} × {p.quantite}
                        </p>
                      </div>
                      <span className="text-[13px] font-extrabold text-boutique-900 tabular">
                        {fmt(p.prix * p.quantite)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 border-t border-boutique-200 px-5 py-4 text-sm">
                  <div className="flex justify-between text-boutique-500">
                    <span>Sous-total</span>
                    <span className="tabular">{fmt(totalArticles)}</span>
                  </div>
                  {form.mode_recuperation === "livraison" ? (
                    <div className="flex justify-between text-boutique-500">
                      <span>
                        Livraison
                        {gratuite && (
                          <span className="ml-1 font-bold text-forest-600">(offerte)</span>
                        )}
                      </span>
                      <span className="tabular">
                        {gratuite ? (
                          <s className="text-boutique-300">{fmt(frais)}</s>
                        ) : (
                          fmt(fraisEffectifs)
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-boutique-500">
                      <span>Retrait en boutique</span>
                      <span className="font-bold text-forest-600">Gratuit</span>
                    </div>
                  )}
                  <div className="flex items-end justify-between border-t border-boutique-200 pt-3">
                    <span className="font-display text-base font-extrabold text-boutique-900">
                      Total
                    </span>
                    <span className="font-display text-2xl font-extrabold text-forest-700 tabular">
                      {fmt(total)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-boutique-200 bg-boutique-50 p-5">
                  <button
                    type="submit"
                    disabled={envoi}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-boutique-900 px-6 py-4 text-sm font-bold text-boutique-50 shadow-soft transition-all duration-200 hover:bg-boutique-800 hover:shadow-lift active:scale-[0.98] disabled:opacity-60"
                  >
                    {envoi ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-boutique-400/40 border-t-boutique-50" />
                        Traitement…
                      </>
                    ) : form.mode_paiement === "en_ligne" ? (
                      <>
                        <CreditCardIcon className="h-[18px] w-[18px]" />
                        Payer maintenant
                      </>
                    ) : (
                      <>
                        <ShoppingBagIcon className="h-[18px] w-[18px]" />
                        Commander (payer à la livraison)
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={envoi}
                    onClick={commanderParWhatsApp}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-600 bg-white px-6 py-3.5 text-sm font-bold text-forest-700 shadow-soft transition-all duration-200 hover:bg-forest-50 active:scale-[0.98] disabled:opacity-60"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] text-forest-600">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Commander par WhatsApp
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-boutique-400">
                    <LockClosedIcon className="h-3.5 w-3.5 flex-none" />
                    Montants recalculés et vérifiés côté serveur
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

/* ===========================================================================
 * 7. CONFIRMATION
 * =========================================================================== */
function ConfirmationView({ commande, api, slug }) {
  const [etat, setEtat] = useState(commande);
  const [recuUrl, setRecuUrl] = useState(null);
  const [verification, setVerification] = useState(false);

  const payee = ["PAYEE", "PAYEE_A_LA_LIVRAISON", "CLOTUREE", "LIVREE", "RETIREE"].includes(
    etat.statut
  );
  const annulee = ["ANNULEE", "REMBOURSEE"].includes(etat.statut);

  const verifierPaiement = async () => {
    setVerification(true);
    try {
      const res = await fetch(`${api}/api/v1/commande/${etat.reference}/verifier`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        setEtat((prev) => ({
          ...prev,
          statut: json.statut || prev.statut,
          statut_libelle: json.statut_libelle || prev.statut_libelle,
        }));
        if (json.recu_url) setRecuUrl(json.recu_url);
      }
    } catch {
      /* réseau — nouvelle tentative au prochain tour */
    } finally {
      setVerification(false);
    }
  };

  // Paiement en ligne : vérification automatique tant que non payé
  useEffect(() => {
    if (etat.mode_paiement !== "en_ligne" || payee || annulee) return undefined;
    const timer = setInterval(verifierPaiement, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.reference, etat.statut, etat.mode_paiement]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-6 sm:px-8 animate-pop-in">
      <div className="overflow-hidden rounded-3xl border border-boutique-200/70 bg-white shadow-card">
        {/* En-tête coloré selon l'état */}
        <div
          className={`relative overflow-hidden px-6 pt-12 pb-10 text-center text-white ${
            annulee
              ? "bg-gradient-to-br from-amber-500 to-orange-600"
              : payee
                ? "bg-forest-gradient"
                : "bg-boutique-deep"
          }`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              {annulee ? (
                <ExclamationTriangleIcon className="h-8 w-8" />
              ) : payee ? (
                <CheckCircleIcon className="h-9 w-9" />
              ) : (
                <DocumentTextIcon className="h-8 w-8" />
              )}
            </span>

            <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
              {payee
                ? "Merci pour votre commande !"
                : annulee
                  ? `Commande ${etat.statut_libelle?.toLowerCase()}`
                  : "Commande enregistrée !"}
            </h1>
            <p className="mt-2 text-[15px] text-white/80">
              Référence{" "}
              <span className="rounded-lg bg-white/15 px-2 py-0.5 font-mono text-sm font-bold ring-1 ring-inset ring-white/20">
                {etat.reference}
              </span>
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-bold ring-1 ring-inset ring-white/20">
              {etat.statut_libelle}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Récapitulatif (montants SERVEUR — §4.7-2) */}
          <div className="space-y-2.5 rounded-2xl bg-boutique-50 p-5 text-sm ring-1 ring-inset ring-boutique-200">
            {[
              { l: "Articles", v: fmt(etat.montant_articles), c: "" },
              { l: "TVA", v: fmt(etat.tva), c: "", si: Number(etat.tva) > 0 },
              { l: "Remise", v: `− ${fmt(etat.remise)}`, c: "text-forest-600", si: Number(etat.remise) > 0 },
              {
                l: "Livraison",
                v: fmt(etat.frais_livraison),
                c: "",
                si: Number(etat.frais_livraison) > 0,
              },
            ]
              .filter((x) => x.si !== false)
              .map((x) => (
                <div key={x.l} className={`flex justify-between text-boutique-500`}>
                  <span>{x.l}</span>
                  <span className={`tabular ${x.c}`}>{x.v}</span>
                </div>
              ))}
            <div className="flex items-end justify-between border-t border-boutique-200 pt-3">
              <span className="font-display text-base font-extrabold text-boutique-900">Total</span>
              <span className="font-display text-2xl font-extrabold text-forest-700 tabular">
                {fmt(etat.montant_total)}
              </span>
            </div>
          </div>

          {/* Paiement à la livraison (règles §4.6) */}
          {etat.mode_paiement === "a_la_livraison" && !payee && !annulee && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 p-4 text-[13px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
              <BanknotesIcon className="h-5 w-5 shrink-0 text-amber-600" />
              <span>Vous réglerez {fmt(etat.montant_total)} au livreur à la réception.</span>
            </div>
          )}

          {/* Paiement en ligne en attente → checkout FedaPay + vérification */}
          {etat.mode_paiement === "en_ligne" && !payee && !annulee && (
            <div className="mt-4 space-y-2.5">
              {etat.checkout_url ? (
                <>
                  <a
                    href={etat.checkout_url}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-6 py-4 text-sm font-bold text-white shadow-soft transition-all duration-200 hover:bg-forest-700 hover:shadow-lift active:scale-[0.98]"
                  >
                    <CreditCardIcon className="h-[18px] w-[18px]" />
                    Payer maintenant{etat.simulation ? " (mode test)" : ""}
                  </a>
                  <button
                    type="button"
                    onClick={verifierPaiement}
                    disabled={verification}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-boutique-200 bg-white px-6 py-3.5 text-[13px] font-bold text-boutique-700 transition-colors hover:bg-boutique-50 disabled:opacity-60"
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 ${verification ? "animate-spin" : ""}`}
                    />
                    {verification ? "Vérification…" : "J'ai payé — vérifier mon paiement"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={verifierPaiement}
                  disabled={verification}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-boutique-200 bg-white px-6 py-3.5 text-[13px] font-bold text-boutique-700 transition-colors hover:bg-boutique-50 disabled:opacity-60"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${verification ? "animate-spin" : ""}`} />
                  {verification ? "Vérification…" : "Vérifier l'état du paiement"}
                </button>
              )}
              <p className="text-center text-[11px] text-boutique-400">
                Vérification automatique toutes les 5 s · montant recalculé côté serveur
              </p>
            </div>
          )}

          {/* REÇU AUTO : affiché + téléchargeable (§4.7-7) */}
          {(payee || recuUrl) && (
            <div className="mt-5 rounded-2xl bg-forest-50 p-5 ring-1 ring-inset ring-forest-100">
              <p className="flex items-center gap-2 text-sm font-extrabold text-forest-800">
                <DocumentTextIcon className="h-5 w-5 shrink-0" />
                Votre reçu est prêt
              </p>
              {recuUrl ? (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <a
                    href={`${api}${recuUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-forest-700"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Afficher le reçu
                  </a>
                  <a
                    href={`${api}${recuUrl}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-forest-700 transition-colors hover:bg-forest-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Télécharger (PDF)
                  </a>
                </div>
              ) : (
                <p className="mt-1 text-[13px] text-forest-700">
                  Génération en cours — actualisation automatique…
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to={`/commande/suivi?reference=${encodeURIComponent(etat.reference)}`}
              className="inline-flex items-center gap-2 rounded-full border border-boutique-200 bg-white px-5 py-3 text-[13px] font-bold text-boutique-700 transition-colors hover:bg-boutique-100"
            >
              <TruckIcon className="h-4 w-4" />
              Suivre ma commande
            </Link>
            {slug && (
              <Link
                to={`/boutique/${slug}`}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-bold text-boutique-500 transition-colors hover:bg-boutique-100 hover:text-boutique-900"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour à la boutique
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================================================================
 * 8. PAGE
 * =========================================================================== */
export default function Boutique() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [vue, setVue] = useState("catalogue"); // catalogue | panier | confirmation
  const [recherche, setRecherche] = useState("");
  const [categorieFiltre, setCategorieFiltre] = useState("Tous");
  const [tri, setTri] = useState("defaut");
  const [pageDemandee, setPageDemandee] = useState(1);
  const [commande, setCommande] = useState(null);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [apercu, setApercu] = useState(null);
  const [ajouteId, setAjouteId] = useState(null);

  // Panier persistant par boutique
  const [panier, setPanier] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`panier_${slug}`) || "[]");
    } catch {
      return [];
    }
  });

  const sauverPanier = (nouveau) => {
    setPanier(nouveau);
    localStorage.setItem(`panier_${slug}`, JSON.stringify(nouveau));
  };

  // ----------------------------- Chargement -----------------------------
  const chargerBoutique = async () => {
    setChargement(true);
    try {
      const res = await fetch(`${API}/api/v1/boutique/${slug}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur || "Boutique indisponible");
      setData(json);
      setErreur(null);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerBoutique();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ----------------------------- Panier -----------------------------
  const ajouterAuPanier = (produit) => {
    const existant = panier.find((p) => p.id === produit.id);
    const quantiteActuelle = existant ? existant.quantite : 0;
    // RÈGLE ABSOLUE : jamais plus que le stock disponible
    if (quantiteActuelle + 1 > produit.stock_disponible) {
      toast.warning(`Stock insuffisant : seulement ${produit.stock_disponible} disponible(s).`);
      return;
    }
    sauverPanier(
      existant
        ? panier.map((p) => (p.id === produit.id ? { ...p, quantite: p.quantite + 1 } : p))
        : [
            ...panier,
            {
              id: produit.id,
              nom: produit.nom,
              prix: Number(produit.prix || 0),
              quantite: 1,
              stock: produit.stock_disponible,
              image: produit.image || null,
            },
          ]
    );
    // Retours visuels : la pastille du bouton devient « Ajouté » 1,6 s
    setAjouteId(produit.id);
    setTiroirOuvert(true);
  };

  // Remet le bouton à son état normal après l'animation « Ajouté »
  useEffect(() => {
    if (ajouteId == null) return undefined;
    const t = setTimeout(() => setAjouteId(null), 1600);
    return () => clearTimeout(t);
  }, [ajouteId]);

  const changerQuantite = (id, delta) => {
    const maj = panier
      .map((p) =>
        p.id === id
          ? { ...p, quantite: Math.min(Math.max(p.quantite + delta, 0), p.stock || 99) }
          : p
      )
      .filter((p) => p.quantite > 0);
    sauverPanier(maj);
  };

  const viderPanier = () => sauverPanier([]);

  const totalArticles = panier.reduce((t, p) => t + p.prix * p.quantite, 0);
  const nombreArticles = panier.reduce((t, p) => t + p.quantite, 0);

  const produitsVendables = useMemo(
    () => (data?.produits || []).filter((p) => String(p.nom || "").trim() && Number(p.prix) > 0),
    [data]
  );

  const categories = useMemo(() => {
    if (!data?.produits) return ["Tous"];
    const compte = new Map();
    for (const p of produitsVendables) {
      const c = (p.categorie || "").trim();
      if (c) compte.set(c, (compte.get(c) || 0) + 1);
    }
    return [
      { nom: "Tous", n: produitsVendables.length },
      ...[...compte.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([nom, n]) => ({ nom, n })),
    ];
  }, [data, produitsVendables]);

  /* La recherche porte sur le nom, la description ET la catégorie : dans un
     catalogue de supérette beaucoup de références ont un nom opaque (« Atan
     1.5L », « 600966160352 ») — taper « vins » ou « yaourt » doit donc
     remonter la bonne famille. */
  const produitsFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const liste = produitsVendables.filter(
      (p) =>
        (categorieFiltre === "Tous" || p.categorie === categorieFiltre) &&
        (!q ||
          String(p.nom || "").toLowerCase().includes(q) ||
          String(p.description || "").toLowerCase().includes(q) ||
          String(p.categorie || "").toLowerCase().includes(q))
    );
    const copie = [...liste];
    if (tri === "prix_asc") copie.sort((a, b) => Number(a.prix) - Number(b.prix));
    else if (tri === "prix_desc") copie.sort((a, b) => Number(b.prix) - Number(a.prix));
    else if (tri === "nom")
      copie.sort((a, b) => String(a.nom || "").localeCompare(String(b.nom || ""), "fr"));
    else if (tri === "stock")
      copie.sort((a, b) => Number(b.stock_disponible) - Number(a.stock_disponible));
    return copie;
  }, [produitsVendables, recherche, categorieFiltre, tri]);

  /* ── Pagination ──────────────────────────────────────────────────────────
     Une supérette easily dépasse 300 références : tout afficher d'un bloc
     produisait une page de 56 000 px (390 cartes) et un scroll interminable.
     On affiche une page de PAR_PAGE références avec une pagination compacte
     façon marketplace, et on revient à la page 1 à chaque changement de filtre. */
  const nbPages = Math.max(1, Math.ceil(produitsFiltres.length / PAR_PAGE));
  const page = Math.min(pageDemandee, nbPages);
  const debut = (page - 1) * PAR_PAGE;
  const produitsAffiches = produitsFiltres.slice(debut, debut + PAR_PAGE);

  useEffect(() => {
    setPageDemandee(1);
  }, [recherche, categorieFiltre, tri]);

  const allerPage = (p) => {
    setPageDemandee(p);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Rail des catégories : molette souris → défilement horizontal ─────────
     La scrollbar est volontairement masquée : sur desktop, les catégories
     restantes étaient inaccessibles (molette verticale ne scrollait pas). */
  const railCategories = useRef(null);
  useEffect(() => {
    const el = railCategories.current;
    if (!el) return undefined;
    const surMolette = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", surMolette, { passive: false });
    return () => el.removeEventListener("wheel", surMolette);
  }, [chargement, vue]);

  const ruptures = produitsFiltres.filter((p) => p.en_rupture).length;

  // ----------------------------- États -----------------------------
  if (chargement) {
    return (
      <div className="min-h-screen bg-boutique-50">
        <BandeauAnnonce activite={data?.activite} />
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
          <div className="lg-skeleton h-4 w-48" />
          <div className="mt-6 lg-skeleton h-12 w-2/3 max-w-xl" />
          <div className="mt-4 lg-skeleton h-4 w-full max-w-lg" />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-boutique-200/70 bg-white"
              >
                <div className="lg-skeleton aspect-square w-full rounded-none" />
                <div className="space-y-2.5 p-4">
                  <div className="lg-skeleton h-2.5 w-1/3" />
                  <div className="lg-skeleton h-3.5 w-full" />
                  <div className="lg-skeleton h-6 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="grid min-h-screen place-items-center bg-boutique-50 p-6">
        <div className="max-w-md rounded-3xl border border-boutique-200/70 bg-white p-10 text-center shadow-card">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-500">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-xl font-extrabold tracking-tight text-boutique-900">
            Boutique indisponible
          </h1>
          <p className="mt-2 text-sm text-boutique-500">{erreur}</p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-boutique-900 px-6 py-3 text-sm font-bold text-boutique-50 transition-colors hover:bg-boutique-800"
            onClick={chargerBoutique}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { activite, vitrine, paiements } = data;
  const seuil = Number(vitrine?.livraison_gratuite_des || 0);

  return (
    <div className="min-h-screen bg-boutique-50 font-sans text-boutique-900">
      <BandeauAnnonce activite={activite} vitrine={vitrine} paiements={paiements} />

      {/* ══════════════ ENTÊTE + RAIL (un seul bloc collant) ══════════════
          En-tête et rail partagent le même conteneur `sticky` : aucun décalage
          en pixels à maintenir, la hauteur de l'en-tête varie selon que la
          recherche est dans la barre (≥ md) ou sur une 2ᵉ ligne (< md). */}
      {vue === "catalogue" && (
        <BarreSticky>
          <EnteteVitrine
            activite={activite}
            recherche={recherche}
            setRecherche={setRecherche}
            nombreArticles={nombreArticles}
            onOuvrirPanier={() =>
              panier.length ? setTiroirOuvert(true) : toast.info("Votre panier est vide.")
            }
          />

          {/* ── Rail des catégories ── */}
          <div className="border-t border-boutique-200 bg-boutique-50/92 backdrop-blur-xl">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
              <div ref={railCategories} className="flex items-center gap-3 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((cat) => {
                  const actif = categorieFiltre === cat.nom;
                  return (
                    <button
                      key={cat.nom}
                      type="button"
                      data-cat={cat.nom}
                      onClick={() => setCategorieFiltre(cat.nom)}
                      aria-pressed={actif}
                      className={`flex flex-none items-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-bold whitespace-nowrap transition-all duration-200 ${
                        actif
                          ? "border-boutique-900 bg-boutique-900 text-boutique-50 shadow-soft"
                          : "border-boutique-200 bg-white text-boutique-600 hover:border-boutique-300 hover:bg-boutique-100"
                      }`}
                    >
                      {cat.nom}
                      <span className={`tabular ${actif ? "text-boutique-300" : "text-boutique-400"}`}>
                        {cat.n}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BarreSticky>
      )}

      {vue !== "catalogue" && (
        <div className="sticky top-0 z-40">
          <EnteteVitrine
            activite={activite}
            recherche={recherche}
            setRecherche={setRecherche}
            nombreArticles={nombreArticles}
            onOuvrirPanier={() =>
              panier.length ? setTiroirOuvert(true) : toast.info("Votre panier est vide.")
            }
          />
        </div>
      )}

      <main>
        {/* ══════════════ CATALOGUE ══════════════ */}
        {vue === "catalogue" && (
          <>
            <Hero data={data} />

            <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
              <div className="border-b border-boutique-200 pb-8">
                <BandeauConfiance items={avantages({ vitrine, paiements })} />
              </div>
            </div>

            {/* ── Barre d'outils ── */}
            <section id="catalogue" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-extrabold tracking-tight text-boutique-900">
                    {categorieFiltre === "Tous" ? "Tout le catalogue" : categorieFiltre}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-boutique-500">
                    {produitsFiltres.length} article{produitsFiltres.length > 1 ? "s" : ""}
                    {recherche && ` pour « ${recherche} »`}
                    {nbPages > 1 && ` · page ${page} sur ${nbPages}`}
                    {ruptures > 0 && ` · ${ruptures} en rupture`}
                  </p>
                </div>
                <SelecteurTri valeur={tri} options={TRIS} onChange={setTri} />
              </div>

              {produitsFiltres.length > 0 ? (
                <>
                  <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
                    {produitsAffiches.map((p) => (
                      <CarteProduit
                        key={p.id}
                        produit={p}
                        api={API}
                        onApercu={setApercu}
                        onAjouter={ajouterAuPanier}
                        ajoute={ajouteId === p.id}
                      />
                    ))}
                  </div>

                  {nbPages > 1 && (
                    <Pagination page={page} nbPages={nbPages} allerPage={allerPage} />
                  )}
                </>
              ) : (
                <EtatVide
                  Icone={recherche ? undefined : ShoppingBagIcon}
                  titre={recherche ? "Aucun résultat" : "Aucun article dans cette catégorie"}
                  texte={
                    recherche
                      ? `Rien ne correspond à « ${recherche} ».`
                      : "Le catalogue s'étoffe, revenez bientôt."
                  }
                  action={
                    (recherche || categorieFiltre !== "Tous") && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-boutique-200 bg-white px-5 py-3 text-[13px] font-bold text-boutique-700 transition-colors hover:bg-boutique-100"
                        onClick={() => {
                          setRecherche("");
                          setCategorieFiltre("Tous");
                        }}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        Réinitialiser les filtres
                      </button>
                    )
                  }
                />
              )}
            </section>
          </>
        )}

        {/* ══════════════ CHECKOUT ══════════════ */}
        {vue === "panier" && (
          <CheckoutView
            panier={panier}
            changerQuantite={changerQuantite}
            viderPanier={viderPanier}
            retour={() => {
              setVue("catalogue");
              setTiroirOuvert(false);
            }}
            totalArticles={totalArticles}
            vitrine={vitrine}
            paiements={paiements}
            slug={slug}
            api={API}
            sauverPanier={sauverPanier}
            surConfirmation={(c) => {
              setCommande(c);
              setVue("confirmation");
              setTiroirOuvert(false);
            }}
          />
        )}

        {/* ══════════════ CONFIRMATION ══════════════ */}
        {vue === "confirmation" && commande && (
          <ConfirmationView commande={commande} api={API} slug={slug} />
        )}
      </main>

      <PiedVitrine activite={activite} vitrine={vitrine} paiements={paiements} />

      {/* ══════════════ TIROIR PANIER ══════════════ */}
      <PanierTiroir
        ouvert={tiroirOuvert}
        onFermer={() => setTiroirOuvert(false)}
        panier={panier}
        changerQuantite={changerQuantite}
        viderPanier={viderPanier}
        totalArticles={totalArticles}
        seuil={seuil}
        api={API}
        onCommander={() => {
          setTiroirOuvert(false);
          setVue("panier");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* ══════════════ APERÇU RAPIDE ══════════════ */}
      {apercu && (
        <ApercuRapide
          produit={apercu}
          api={API}
          onFermer={() => setApercu(null)}
          onAjouter={ajouterAuPanier}
          ajoute={ajouteId === apercu.id}
        />
      )}
    </div>
  );
}