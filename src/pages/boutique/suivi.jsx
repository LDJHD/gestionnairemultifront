/* ===========================================================================
 * « LE GESTIONNAIRE » — SUIVI PUBLIC DE COMMANDE (client, sans connexion)
 * Étapes : en attente → confirmée → préparation → prête → en route → livrée
 * Actualisation automatique tant que la commande est active.
 *
 * ⚠️ AUCUNE RÈGLE MÉTIER N'A ÉTÉ MODIFIÉE : mêmes endpoints, mêmes statuts
 * terminaux, même rythme d'actualisation (10 s). Seule la présentation a été
 * alignée sur l'identité de la vitrine (crème / espresso / vert profond).
 * =========================================================================== */

import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingBagIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { BarreVitrine, fmt } from "./ui";

const API = import.meta.env.VITE_API_URL;

const ICONES_ETAPES = {
  CONFIRMEE: CheckCircleIcon,
  EN_PREPARATION: ClockIcon,
  PRETE: ShoppingBagIcon,
  EN_LIVRAISON: TruckIcon,
  LIVREE: CheckCircleIcon,
  RETIREE: CheckCircleIcon,
};

export default function SuiviCommande() {
  const [params] = useSearchParams();
  const [reference, setReference] = useState(params.get("reference") || "");
  const [commande, setCommande] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const charger = useCallback(async (ref) => {
    const refNettoyee = (ref || "").trim();
    if (!refNettoyee) return;
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch(`${API}/api/v1/commande/suivi/${encodeURIComponent(refNettoyee)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur || "Commande introuvable.");
      setCommande(json);
    } catch (e) {
      setCommande(null);
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (params.get("reference")) charger(params.get("reference"));
  }, [params, charger]);

  // Actualisation auto tant que la commande n'est pas terminée
  useEffect(() => {
    if (!commande) return undefined;
    const terminales = ["CLOTUREE", "ANNULEE", "REMBOURSEE", "LIVREE", "RETIREE"];
    if (terminales.includes(commande.statut)) return undefined;
    const timer = setInterval(() => charger(commande.reference), 10_000);
    return () => clearInterval(timer);
  }, [commande, charger]);

  const soumettre = (e) => {
    e.preventDefault();
    charger(reference);
  };

  const terminales = ["CLOTUREE", "ANNULEE", "REMBOURSEE", "LIVREE", "RETIREE"];
  const terminee = commande && terminales.includes(commande.statut);
  const etapes = commande?.etapes || [];
  const nbFaites = etapes.filter((e) => e.fait).length;
  const progression = etapes.length ? Math.round((nbFaites / etapes.length) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-boutique-50 font-sans text-boutique-900">
      <BarreVitrine>
        <Link
          to="/auth/sign-in"
          className="rounded-full border border-boutique-200 bg-white px-4 py-2 text-[12.5px] font-bold text-boutique-700 transition-colors hover:border-boutique-300 hover:bg-boutique-100"
        >
          Espace gestionnaire
        </Link>
      </BarreVitrine>

      {/* ══════════════ Héros ══════════════ */}
      <section className="relative overflow-hidden bg-boutique-deep text-boutique-100">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-forest-500/25 blur-[90px]" />
          <div className="absolute -bottom-28 left-4 h-64 w-64 rounded-full bg-boutique-500/25 blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,.10) 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 py-14 text-center sm:px-8 sm:py-16">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur">
            <TruckIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Suivre ma commande
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-boutique-200/80">
            Saisissez votre numéro de commande pour connaître son état d'avancement, étape par
            étape.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
        {/* Recherche par référence */}
        <form
          onSubmit={soumettre}
          className="flex flex-col gap-3 rounded-2xl border border-boutique-200/70 bg-white p-5 shadow-card sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="mb-1.5 block text-[13px] font-semibold text-boutique-700" htmlFor="reference">
              Numéro de commande
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-boutique-400" />
              <input
                id="reference"
                className="w-full rounded-xl border border-boutique-200 bg-boutique-50 py-2.5 pr-4 pl-11 font-mono text-sm text-boutique-900 outline-none transition-all placeholder:font-sans placeholder:text-boutique-400 focus:border-boutique-400 focus:bg-white focus:ring-4 focus:ring-boutique-200/50"
                placeholder="CMD-2026-0001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={chargement}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-boutique-900 px-5 py-2.5 text-sm font-bold text-boutique-50 shadow-soft transition-all duration-200 hover:bg-boutique-800 active:scale-[0.98] disabled:opacity-60"
          >
            {chargement ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-boutique-400/40 border-t-boutique-50" />
                Recherche…
              </>
            ) : (
              "Suivre"
            )}
          </button>
        </form>

        {/* Erreur */}
        {erreur && (
          <div className="mt-6 animate-pop-in rounded-2xl border border-boutique-200/70 bg-white p-8 text-center shadow-card">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500">
              <ExclamationTriangleIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 font-display text-lg font-extrabold tracking-tight text-boutique-900">
              {erreur}
            </p>
            <p className="mt-1 text-sm text-boutique-500">
              Vérifiez le numéro figurant dans votre email de confirmation.
            </p>
          </div>
        )}

        {/* Commande */}
        {commande && (
          <article className="mt-6 animate-slide-up overflow-hidden rounded-2xl border border-boutique-200/70 bg-white shadow-card">
            {/* Résumé */}
            <div className="border-b border-boutique-200 bg-boutique-50 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-lg font-extrabold tracking-tight text-boutique-900">
                    {commande.reference}
                  </p>
                  <p className="mt-0.5 text-[13px] text-boutique-500">
                    {commande.created_at
                      ? new Date(commande.created_at).toLocaleString("fr-FR")
                      : ""}
                  </p>
                </div>
                <span className="rounded-full bg-boutique-900 px-3 py-1.5 text-[11px] font-bold text-boutique-50">
                  {commande.statut_libelle}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
                <p className="text-sm text-boutique-500">
                  Total{" "}
                  <strong className="font-display text-lg font-extrabold text-forest-700 tabular">
                    {fmt(commande.montant_total)}
                  </strong>
                </p>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-boutique-600">
                  {commande.mode_recuperation === "livraison" ? (
                    <>
                      <TruckIcon className="h-[18px] w-[18px] text-forest-600" /> Livraison à
                      domicile
                    </>
                  ) : (
                    <>
                      <BuildingStorefrontIcon className="h-[18px] w-[18px] text-forest-600" />{" "}
                      Retrait en boutique
                    </>
                  )}
                </span>
              </div>

              {/* Barre de progression */}
              <div className="mt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-boutique-200">
                  <div
                    className="h-full rounded-full bg-forest-gradient transition-all duration-700 ease-smooth"
                    style={{ width: `${progression}%` }}
                  />
                </div>
                <p className="mt-2 text-[11.5px] font-semibold text-boutique-400">
                  {nbFaites} étape{nbFaites > 1 ? "s" : ""} sur {etapes.length} · {progression} %
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-5 sm:p-6">
              <ol>
                {etapes.map((etape, i) => {
                  const Icone = etape.fait ? ICONES_ETAPES[etape.statut] || CheckCircleIcon : ClockIcon;
                  const derniere = i === etapes.length - 1;
                  return (
                    <li key={etape.statut} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`grid h-10 w-10 flex-none place-items-center rounded-full transition-all duration-500 ${
                            etape.fait
                              ? "bg-forest-gradient text-white shadow-soft"
                              : "bg-boutique-100 text-boutique-400 ring-1 ring-inset ring-boutique-200"
                          }`}
                        >
                          <Icone className="h-[18px] w-[18px]" />
                        </span>
                        {!derniere && (
                          <span
                            className={`w-0.5 flex-1 ${etape.fait ? "bg-forest-300" : "bg-boutique-200"}`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`text-sm ${
                            etape.fait
                              ? "font-bold text-boutique-900"
                              : "font-medium text-boutique-400"
                          }`}
                        >
                          {etape.libelle}
                        </p>
                        {etape.statut === "EN_LIVRAISON" &&
                          etape.fait &&
                          commande.livraison?.livreur && (
                            <p className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-boutique-100 px-2.5 py-1 text-[12.5px] text-boutique-700">
                              <MapPinIcon className="h-3.5 w-3.5 flex-none text-forest-600" />
                              Livreur : {commande.livraison.livreur}
                            </p>
                          )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {["ANNULEE", "REMBOURSEE"].includes(commande.statut) && (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-[13px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                  <ExclamationTriangleIcon className="h-[18px] w-[18px] shrink-0 text-amber-600" />
                  <span>
                    Cette commande a été{" "}
                    {commande.statut === "ANNULEE" ? "annulée" : "remboursée"}.
                  </span>
                </div>
              )}
            </div>
          </article>
        )}

        {/* Info actualisation */}
        {commande && !terminee && (
          <p className="mt-6 flex items-center justify-center gap-2 text-[12px] text-boutique-400">
            <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
            Actualisation automatique toutes les 10 secondes
          </p>
        )}

        {/* Aide */}
        {!commande && !erreur && (
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { n: "1", t: "Commandez", d: "Panier → paiement ou à la livraison." },
              { n: "2", t: "Recevez une référence", d: "Affichée à l'écran et envoyée par email." },
              { n: "3", t: "Suivez ici", d: "Chaque étape en temps réel." },
            ].map((e) => (
              <div
                key={e.n}
                className="rounded-2xl border border-boutique-200/70 bg-white/70 px-4 py-4"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-boutique-900 text-[12px] font-extrabold text-boutique-50">
                  {e.n}
                </span>
                <p className="mt-3 text-[13px] font-bold text-boutique-900">{e.t}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-boutique-500">{e.d}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-boutique-200 bg-boutique-100/70">
        <div className="mx-auto max-w-[1400px] px-4 py-6 text-center text-[12.5px] text-boutique-500 sm:px-8">
          © {new Date().getFullYear()} —{" "}
          <strong className="font-bold text-boutique-700">Le Gestionnaire · TO CONNECT</strong>
        </div>
      </footer>
    </div>
  );
}