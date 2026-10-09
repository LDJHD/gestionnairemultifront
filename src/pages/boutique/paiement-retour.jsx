/* ===========================================================================
 * « LE GESTIONNAIRE » — RETOUR DE PAIEMENT FEDAPAY (client public)
 * Le client revient du checkout → vérification SERVEUR du paiement
 * (anti-falsification §4.6) → reçu affiché + téléchargeable (§4.7-7).
 *
 * ⚠️ Logique inchangée : mêmes endpoints, mêmes statuts, même relance auto (5 s).
 * Seule la présentation est alignée sur l'identité de la vitrine.
 * =========================================================================== */

import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LockClosedIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { BarreVitrine } from "./ui";

const API = import.meta.env.VITE_API_URL;

const PAYES = ["PAYEE", "PAYEE_A_LA_LIVRAISON", "CLOTUREE", "LIVREE", "RETIREE"];
const TERMINALES = [...PAYES, "ANNULEE", "REMBOURSEE", "ECHOUEE"];

const principal = (extra = "") =>
  `inline-flex w-full items-center justify-center gap-2 rounded-full bg-boutique-900 px-6 py-3.5 text-sm font-bold text-boutique-50 shadow-soft transition-all duration-200 hover:bg-boutique-800 hover:shadow-lift active:scale-[0.98] disabled:opacity-60 ${extra}`;
const secondaire = (extra = "") =>
  `inline-flex w-full items-center justify-center gap-2 rounded-full border border-boutique-200 bg-white px-6 py-3.5 text-[13px] font-bold text-boutique-700 transition-colors hover:bg-boutique-50 disabled:opacity-60 ${extra}`;

export default function PaiementRetour() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || "";

  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [verification, setVerification] = useState(false);

  const verifier = useCallback(async () => {
    if (!reference) return;
    setVerification(true);
    setErreur(null);
    try {
      const res = await fetch(`${API}/api/v1/paiement/verifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur || "Vérification impossible.");
      setResultat(json);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setVerification(false);
    }
  }, [reference]);

  useEffect(() => {
    verifier();
  }, [verifier]);

  // Relance auto tant que le paiement n'est pas tranché
  useEffect(() => {
    if (!resultat || TERMINALES.includes(resultat.statut)) return undefined;
    const timer = setInterval(verifier, 5000);
    return () => clearInterval(timer);
  }, [resultat, verifier]);

  const payee = resultat && PAYES.includes(resultat.statut);
  const annulee = resultat && ["ANNULEE", "REMBOURSEE"].includes(resultat.statut);
  const enAttente = resultat && !payee && !annulee;

  const relancerCheckout = async () => {
    try {
      const res = await fetch(`${API}/api/v1/paiement/initier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const json = await res.json();
      if (res.ok && json.url_checkout) {
        window.location.href = json.url_checkout;
        return;
      }
      throw new Error(json.erreur || "Relance impossible.");
    } catch (e) {
      setErreur(e.message);
    }
  };

  /* ── Déterminer la teinte de l'écran ── */
  const ton = !reference || erreur || annulee
    ? "bg-gradient-to-br from-amber-500 to-orange-600"
    : payee
      ? "bg-forest-gradient"
      : "bg-boutique-deep";

  return (
    <div className="flex min-h-screen flex-col bg-boutique-50 font-sans text-boutique-900">
      <BarreVitrine />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg animate-pop-in overflow-hidden rounded-3xl border border-boutique-200/70 bg-white shadow-card">
          {/* ══════════════ Bannière ══════════════ */}
          <div className={`relative overflow-hidden px-6 py-11 text-center text-white ${ton}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
                {/* Aucune référence */}
                {!reference && <ExclamationTriangleIcon className="h-8 w-8" />}

                {/* Vérification en cours */}
                {reference && verification && !resultat && (
                  <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/35 border-t-white" />
                )}

                {/* Erreur réseau */}
                {reference && erreur && !resultat && <ExclamationTriangleIcon className="h-8 w-8" />}

                {/* Confirmé */}
                {resultat && payee && <CheckCircleIcon className="h-9 w-9" />}

                {/* En attente */}
                {resultat && enAttente && <ArrowPathIcon className="h-8 w-8 animate-spin" />}

                {/* Annulé */}
                {resultat && annulee && <ExclamationTriangleIcon className="h-8 w-8" />}
              </span>

              <h1 className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-tight">
                {!reference && "Référence de commande manquante"}
                {reference && verification && !resultat && "Vérification du paiement…"}
                {erreur && !resultat && "Vérification impossible"}
                {resultat && payee && "Paiement confirmé !"}
                {resultat && enAttente && (resultat.statut_libelle || "Paiement en cours de validation")}
                {resultat && annulee && `Paiement ${resultat.statut_libelle?.toLowerCase()}`}
              </h1>

              {(resultat || reference) && (
                <p className="mt-3 text-[14px] text-white/75">
                  Référence{" "}
                  <span className="rounded-lg bg-white/15 px-2 py-0.5 font-mono text-[13px] font-bold ring-1 ring-inset ring-white/20">
                    {resultat?.reference || reference}
                  </span>
                </p>
              )}

              {resultat && enAttente && (
                <p className="mx-auto mt-2 max-w-sm text-[13px] text-white/65">
                  Nous interrogeons FedaPay — cette page s'actualise automatiquement, inutile de
                  recharger.
                </p>
              )}
            </div>
          </div>

          {/* ══════════════ Actions ══════════════ */}
          <div className="space-y-3 p-6 sm:p-7">
            {erreur && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-[13px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                <ExclamationTriangleIcon className="h-[18px] w-[18px] shrink-0 text-amber-600" />
                <span>{erreur}</span>
              </div>
            )}

            {/* Aucune référence */}
            {!reference && (
              <Link to="/commande/suivi" className={principal()}>
                <ShoppingBagIcon className="h-[18px] w-[18px]" />
                Suivre ma commande
              </Link>
            )}

            {/* Confirmé */}
            {resultat && payee && (
              <>
                {resultat.recu_url ? (
                  <div className="rounded-2xl bg-forest-50 p-5 ring-1 ring-inset ring-forest-100">
                    <p className="flex items-center justify-center gap-2 text-sm font-extrabold text-forest-800">
                      <DocumentTextIcon className="h-5 w-5 shrink-0" />
                      Votre reçu est prêt
                    </p>
                    <div className="mt-3.5 flex flex-wrap justify-center gap-2">
                      <a
                        href={`${API}${resultat.recu_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-forest-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Afficher le reçu
                      </a>
                      <a
                        href={`${API}${resultat.recu_url}`}
                        download
                        className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-forest-700 transition-colors hover:bg-forest-50"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Télécharger (PDF)
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-xl bg-forest-50 p-3 text-center text-[13px] font-semibold text-forest-700 ring-1 ring-inset ring-forest-100">
                    <DocumentTextIcon className="mr-1.5 inline h-4 w-4" />
                    Génération du reçu en cours…
                  </p>
                )}

                <Link
                  to={`/commande/suivi?reference=${encodeURIComponent(reference)}`}
                  className={secondaire()}
                >
                  <ShoppingBagIcon className="h-[18px] w-[18px]" />
                  Suivre ma commande
                </Link>
              </>
            )}

            {/* En attente */}
            {resultat && enAttente && (
              <>
                <button type="button" className={secondaire()} onClick={verifier} disabled={verification}>
                  <ArrowPathIcon className={`h-4 w-4 ${verification ? "animate-spin" : ""}`} />
                  {verification ? "Vérification…" : "Vérifier maintenant"}
                </button>
                <button type="button" className={principal()} onClick={relancerCheckout}>
                  <CreditCardIcon className="h-[18px] w-[18px]" />
                  Relancer le paiement
                </button>
              </>
            )}

            {/* Annulé / échoué */}
            {resultat && annulee && (
              <button type="button" className={principal()} onClick={relancerCheckout}>
                <CreditCardIcon className="h-[18px] w-[18px]" />
                Réessayer le paiement
              </button>
            )}

            <p className="flex items-start gap-2 pt-2 text-[11px] leading-snug text-boutique-400">
              <LockClosedIcon className="mt-px h-3.5 w-3.5 flex-none" />
              <span>
                Le statut est confirmé par notre serveur auprès de FedaPay — il ne peut pas être
                falsifié depuis le navigateur.
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}