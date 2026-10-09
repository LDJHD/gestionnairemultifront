import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  InboxStackIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PrinterIcon,
  BanknotesIcon,
  BellAlertIcon,
  XMarkIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;
const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} F`;

// ===========================================================================
// « LE GESTIONNAIRE » — COMMANDES EN LIGNE (back-office admin)
// Liste temps réel (badge + son à l'arrivée), filtres, détail, actions de
// traitement (confirmer/refuser/préparer/livrer/clôturer), assignation
// livreur, conversion en vente interne (§4.7-6) et bon PDF (§4.7-4).
// ===========================================================================

const STATUTS = {
  EN_ATTENTE_PAIEMENT: "En attente de paiement",
  EN_ATTENTE_PAIEMENT_LIVRAISON: "Paiement à la livraison",
  PAYEE: "Payée",
  PAYEE_A_LA_LIVRAISON: "Payée à la livraison",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
  RETIREE: "Retirée",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
  REMBOURSEE: "Remboursée",
};

const COULEURS_STATUT = {
  EN_ATTENTE_PAIEMENT: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  EN_ATTENTE_PAIEMENT_LIVRAISON: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  PAYEE: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100",
  PAYEE_A_LA_LIVRAISON: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100",
  CONFIRMEE: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  EN_PREPARATION: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
  PRETE: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-100",
  EN_LIVRAISON: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100",
  LIVREE: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  RETIREE: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  CLOTUREE: "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200",
  ANNULEE: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  REMBOURSEE: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
};

// Actions admin permises selon le statut courant (transitions §4.7-3)
const ACTIONS_PAR_STATUT = {
  EN_ATTENTE_PAIEMENT: [{ statut: "ANNULEE", label: "Annuler", danger: true }],
  EN_ATTENTE_PAIEMENT_LIVRAISON: [
    { statut: "CONFIRMEE", label: "Confirmer" },
    { statut: "ANNULEE", label: "Annuler", danger: true },
  ],
  PAYEE: [
    { statut: "CONFIRMEE", label: "Confirmer" },
    { statut: "REMBOURSEE", label: "Refuser + rembourser", danger: true },
  ],
  PAYEE_A_LA_LIVRAISON: [
    { statut: "CONFIRMEE", label: "Confirmer" },
    { statut: "LIVREE", label: "Marquer livrée" },
  ],
  CONFIRMEE: [
    { statut: "EN_PREPARATION", label: "Préparer" },
    { statut: "REMBOURSEE", label: "Refuser + rembourser", danger: true },
  ],
  EN_PREPARATION: [
    { statut: "PRETE", label: "Prête" },
    { statut: "EN_LIVRAISON", label: "En livraison" },
  ],
  PRETE: [
    { statut: "EN_LIVRAISON", label: "En livraison" },
    { statut: "RETIREE", label: "Retirée" },
    { statut: "CLOTUREE", label: "Clôturer" },
  ],
  EN_LIVRAISON: [{ statut: "LIVREE", label: "Livrée" }],
  LIVREE: [{ statut: "CLOTUREE", label: "Clôturer" }],
  RETIREE: [{ statut: "CLOTUREE", label: "Clôturer" }],
  CLOTUREE: [],
  ANNULEE: [],
  REMBOURSEE: [],
};

const CONVERTIBLES = ["PAYEE", "PAYEE_A_LA_LIVRAISON", "CONFIRMEE", "EN_PREPARATION", "PRETE", "EN_LIVRAISON", "LIVREE", "RETIREE", "CLOTUREE"];

const sonner = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    /* audio indisponible */
  }
};

export default function CommandesEnLigne() {
  const [commandes, setCommandes] = useState([]);
  const [compteurs, setCompteurs] = useState({});
  const [filtreStatut, setFiltreStatut] = useState("");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [detail, setDetail] = useState(null);
  const [assignation, setAssignation] = useState(null); // { commande, livreurs }
  const nouvellesPrecedentes = useRef(null);

  const charger = useCallback(async (silencieux = true) => {
    if (!silencieux) setChargement(true);
    try {
      const token = localStorage.getItem("token");
      const qs = new URLSearchParams();
      if (filtreStatut) qs.set("statut", filtreStatut);
      if (recherche.trim()) qs.set("q", recherche.trim());
      const res = await fetch(`${API}/api/v1/commande-admin/listall?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      setCommandes(json.commandes || []);
      setCompteurs(json.compteurs || {});

      // 🔔 Nouvelle commande → son + toast (§4.7-4)
      if (nouvellesPrecedentes.current != null && json.nouvelles > nouvellesPrecedentes.current) {
        sonner();
        toast.success("Nouvelle commande reçue !");
      }
      nouvellesPrecedentes.current = json.nouvelles || 0;
    } catch {
      /* module non migré ou réseau — silencieux en polling */
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, [filtreStatut, recherche]);

  useEffect(() => {
    charger(false);
    const timer = setInterval(() => charger(true), 15_000);
    return () => clearInterval(timer);
  }, [charger]);

  const changerStatut = async (id, statut, label) => {
    const confirm = await Swal.fire({
      title: label ? `${label} ?` : "Confirmer l'action ?",
      text: "Le client sera notifié du changement de statut.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui, appliquer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#0f766e",
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/commande-admin/statut`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, statut }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message || "Statut mis à jour.");
      charger(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const convertirEnVente = async (id, reference) => {
    const confirm = await Swal.fire({
      title: "Convertir en vente interne ?",
      text: `La commande ${reference} sera enregistrée dans les statistiques (montant articles ; rémunération livreur hors transactions).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Convertir",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#0f766e",
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/commande-admin/convertir`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      charger(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const genererBon = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/commande-admin/bon`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      window.open(`${API}${json.url}`, "_blank");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const ouvrirDetail = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/commande-admin/detailById`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      setDetail(json);
      charger(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const ouvrirAssignation = async (commande) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/livreur/listall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const livreurs = await res.json();
      setAssignation({ commande, livreurs: Array.isArray(livreurs) ? livreurs : [] });
    } catch {
      toast.error("Impossible de charger les livreurs.");
    }
  };

  const totalNouvelles = (compteurs.EN_ATTENTE_PAIEMENT || 0) + (compteurs.EN_ATTENTE_PAIEMENT_LIVRAISON || 0);

  return (
    <div className="mt-6 mb-10 animate-fade-in space-y-6">
      {/* ══════════════ En-tête ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">Boutique en ligne</p>
          <h1 className="lg-page-title">Commandes en ligne</h1>
          <p className="lg-page-sub">
            Traitement en temps réel · actualisation automatique toutes les 15 s
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={`lg-badge px-3 py-1.5 text-[12px] ${
              totalNouvelles > 0
                ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200"
                : "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200"
            }`}
          >
            <BellAlertIcon className="h-3.5 w-3.5" />
            {totalNouvelles} nouvelle{totalNouvelles > 1 ? "s" : ""}
          </span>
          <button type="button" className="lg-btn-neutral" onClick={() => charger(false)}>
            <ArrowPathIcon className={`h-4 w-4 ${chargement ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </header>

      {/* ══════════════ Compteurs par statut ══════════════ */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { cle: "EN_ATTENTE_PAIEMENT", label: "En attente de paiement", ton: "bg-amber-50 text-amber-600 ring-amber-100" },
          { cle: "EN_PREPARATION", label: "En préparation", ton: "bg-brand-50 text-brand-600 ring-brand-100" },
          { cle: "PRETE", label: "Prêtes", ton: "bg-cyan-50 text-cyan-600 ring-cyan-100" },
          { cle: "EN_LIVRAISON", label: "En livraison", ton: "bg-violet-50 text-violet-600 ring-violet-100" },
          { cle: "LIVREE", label: "Livrées", ton: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
          { cle: "CLOTUREE", label: "Clôturées", ton: "bg-ink-100 text-ink-600 ring-ink-200" },
        ].map(({ cle, label, ton }) => (
          <button
            key={cle}
            type="button"
            onClick={() => setFiltreStatut(filtreStatut === cle ? "" : cle)}
            className={`rounded-2xl border bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
              filtreStatut === cle ? "border-brand-300 ring-2 ring-brand-500/20" : "border-ink-200/80"
            }`}
          >
            <span className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ring-inset ${ton}`}>
              {cle === "EN_ATTENTE_PAIEMENT" ? (
                <ClockIcon className="h-[18px] w-[18px]" />
              ) : cle === "EN_PREPARATION" ? (
                <InboxStackIcon className="h-[18px] w-[18px]" />
              ) : cle === "PRETE" ? (
                <CheckCircleIcon className="h-[18px] w-[18px]" />
              ) : cle === "EN_LIVRAISON" ? (
                <TruckIcon className="h-[18px] w-[18px]" />
              ) : cle === "LIVREE" ? (
                <BuildingStorefrontIcon className="h-[18px] w-[18px]" />
              ) : (
                <DocumentTextIcon className="h-[18px] w-[18px]" />
              )}
            </span>
            <p className="mt-2.5 font-display text-2xl leading-none font-extrabold text-ink-900 tabular">
              {compteurs[cle] || 0}
            </p>
            <p className="mt-1 text-[11.5px] leading-snug font-medium text-ink-500">{label}</p>
          </button>
        ))}
      </section>

      {/* ══════════════ Filtres + table ══════════════ */}
      <div className="lg-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
            <input
              className="lg-input pl-11"
              placeholder="Rechercher (référence, client, contact)…"
              aria-label="Rechercher une commande"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && charger(false)}
            />
          </div>
          <select
            className="lg-select lg:w-64"
            aria-label="Filtrer par statut"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v} {compteurs[k] ? `(${compteurs[k]})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[1000px]">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Récupération</th>
                <th>Paiement</th>
                <th className="!text-right">Montant</th>
                <th>Statut</th>
                <th className="!text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargement && commandes.length === 0 && (
                <tr>
                  <td colSpan={7} className="lg-td !p-10">
                    <div className="flex flex-col items-center gap-3">
                      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
                      <p className="text-sm text-ink-500">Chargement des commandes…</p>
                    </div>
                  </td>
                </tr>
              )}

              {!chargement && commandes.length === 0 && (
                <tr>
                  <td colSpan={7} className="lg-td !p-12">
                    <div className="flex flex-col items-center text-center">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                        <InboxStackIcon className="h-6 w-6" />
                      </span>
                      <p className="mt-3.5 text-sm font-semibold text-ink-700">
                        Aucune commande pour ce filtre
                      </p>
                      <p className="mt-1 text-[13px] text-ink-500">
                        Les commandes de votre boutique en ligne apparaîtront ici.
                      </p>
                      {(filtreStatut || recherche) && (
                        <button
                          type="button"
                          className="lg-btn-soft mt-4"
                          onClick={() => {
                            setFiltreStatut("");
                            setRecherche("");
                          }}
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {commandes.map((c) => {
                const actions = ACTIONS_PAR_STATUT[c.statut] || [];
                const convertible = CONVERTIBLES.includes(c.statut) && !c.vente_id;
                return (
                  <tr key={c.id}>
                    <td className="lg-td">
                      <span className="font-mono text-xs font-bold text-brand-700">{c.reference}</span>
                      <div className="text-[11px] text-ink-400">
                        {c.created_at ? new Date(c.created_at).toLocaleString("fr-FR") : ""}
                      </div>
                    </td>
                    <td className="lg-td">
                      <div className="font-semibold text-ink-800">
                        {c.client_prenom ? `${c.client_prenom} ` : ""}
                        {c.client_nom}
                      </div>
                      <div className="text-[11px] text-ink-400">{c.client_contact}</div>
                    </td>
                    <td className="lg-td text-xs">
                      <span className="flex items-start gap-1.5 text-ink-600">
                        {c.mode_recuperation === "livraison" ? (
                          <>
                            <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                            <span>
                              {c.adresse_livraison || "—"}
                              {c.zone_livraison ? ` (${c.zone_livraison})` : ""}
                            </span>
                          </>
                        ) : (
                          <>
                            <BuildingStorefrontIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                            <span>Retrait sur place</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="lg-td text-xs">
                      <span className="flex items-center gap-1.5 text-ink-600">
                        {c.mode_paiement === "en_ligne" ? (
                          <>
                            <CreditCardIcon className="h-4 w-4 shrink-0 text-ink-400" />
                            <span>En ligne</span>
                          </>
                        ) : (
                          <>
                            <BanknotesIcon className="h-4 w-4 shrink-0 text-ink-400" />
                            <span>À la livraison</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="lg-td !text-right">
                      <div className="font-display font-extrabold text-ink-900 tabular">
                        {fmt(c.montant_total)}
                      </div>
                      {Number(c.frais_livraison) > 0 && (
                        <div className="text-[11px] text-ink-400 tabular">
                          dont livraison {fmt(c.frais_livraison)}
                        </div>
                      )}
                    </td>
                    <td className="lg-td">
                      <span className={`lg-badge ${COULEURS_STATUT[c.statut] || "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200"}`}>
                        {c.statut_libelle || STATUTS[c.statut] || c.statut}
                      </span>
                      {c.vente_id && (
                        <div className="mt-1 text-[11px] font-semibold text-accent-600">
                          Vente #{c.vente_id}
                        </div>
                      )}
                    </td>
                    <td className="lg-td">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {actions.map((a) => (
                          <button
                            key={a.statut}
                            type="button"
                            onClick={() => changerStatut(c.id, a.statut, a.label)}
                            className={`lg-btn !rounded-lg !px-2.5 !py-1.5 !text-[11px] ${
                              a.danger ? "lg-btn-danger" : "lg-btn-soft"
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                        {c.statut === "CONFIRMEE" && c.mode_recuperation === "livraison" && (
                          <button
                            type="button"
                            onClick={() => ouvrirAssignation(c)}
                            className="lg-btn-neutral !rounded-lg !px-2.5 !py-1.5 !text-[11px]"
                          >
                            <TruckIcon className="h-3.5 w-3.5" />
                            Livreur
                          </button>
                        )}
                        {convertible && (
                          <button
                            type="button"
                            onClick={() => convertirEnVente(c.id, c.reference)}
                            className="lg-btn-neutral !rounded-lg !px-2.5 !py-1.5 !text-[11px]"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                            En vente
                          </button>
                        )}
                        <button
                          type="button"
                          title="Détail"
                          aria-label={`Détail de la commande ${c.reference}`}
                          onClick={() => ouvrirDetail(c.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Bon de commande"
                          aria-label={`Bon de commande ${c.reference}`}
                          onClick={() => genererBon(c.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Détail commande */}
      {detail && <DetailModal detail={detail} fermer={() => setDetail(null)} ouvrirAssignation={ouvrirAssignation} />}

      {/* Assignation livreur */}
      {assignation && (
        <AssignationModal
          data={assignation}
          fermer={() => setAssignation(null)}
          fait={() => {
            setAssignation(null);
            charger(true);
          }}
        />
      )}
    </div>
  );
}

// ===========================================================================
// DÉTAIL COMMANDE (client, articles, montants, adresses, note)
// ===========================================================================
function DetailModal({ detail, fermer, ouvrirAssignation }) {
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink-900/50 p-4 backdrop-blur-sm"
      onClick={fermer}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl animate-pop-in overflow-y-auto rounded-2xl border border-ink-200/80 bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-100 bg-white/90 p-5 backdrop-blur-xl">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold text-ink-900">
              Commande {detail.reference}
            </h2>
            <span className={`lg-badge mt-1.5 ${COULEURS_STATUT[detail.statut] || "bg-ink-100 text-ink-600"}`}>
              {detail.statut_libelle}
            </span>
          </div>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer"
            className="grid h-8 w-8 flex-none place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Client / Récupération */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-ink-50 p-4 ring-1 ring-inset ring-ink-200/70">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-ink-400 uppercase">
                <UserGroupIcon className="h-3.5 w-3.5" /> Client
              </p>
              <p className="mt-1.5 font-semibold text-ink-900">
                {detail.client_prenom} {detail.client_nom}
              </p>
              <p className="text-[13px] text-ink-500">{detail.client_contact}</p>
              <p className="text-[13px] text-ink-500">{detail.client_email}</p>
            </div>
            <div className="rounded-2xl bg-ink-50 p-4 ring-1 ring-inset ring-ink-200/70">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-ink-400 uppercase">
                {detail.mode_recuperation === "livraison" ? (
                  <TruckIcon className="h-3.5 w-3.5" />
                ) : (
                  <BuildingStorefrontIcon className="h-3.5 w-3.5" />
                )}
                {detail.mode_recuperation === "livraison" ? "Livraison" : "Retrait"}
              </p>
              {detail.mode_recuperation === "livraison" ? (
                <>
                  <p className="mt-1.5 font-semibold text-ink-900">{detail.adresse_livraison}</p>
                  <p className="text-[13px] text-ink-500">
                    Zone : {detail.zone_livraison || "—"} · Créneau : {detail.creneau_souhaite || "—"}
                  </p>
                </>
              ) : (
                <p className="mt-1.5 font-semibold text-ink-900">Retrait sur place</p>
              )}
            </div>
          </div>

          {/* Lignes */}
          <div>
            <p className="mb-2 font-display text-sm font-extrabold text-ink-900">
              Articles commandés
            </p>
            <div className="overflow-hidden rounded-2xl border border-ink-200/80">
              <div className="lg-table-wrap">
                <table className="lg-table w-full min-w-[440px]">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th className="!text-center">Qté</th>
                      <th className="!text-right">P.U.</th>
                      <th className="!text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.lignes || []).map((l) => (
                      <tr key={l.id || l.produit_id}>
                        <td className="lg-td font-semibold text-ink-800">
                          {l.nom_produit || `Produit #${l.produit_id}`}
                        </td>
                        <td className="lg-td !text-center tabular">{l.quantite}</td>
                        <td className="lg-td !text-right text-ink-600 tabular">
                          {fmt(l.prix_unitaire)}
                        </td>
                        <td className="lg-td !text-right font-bold text-ink-900 tabular">
                          {fmt(l.prix_unitaire * l.quantite)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Montants */}
          <div className="space-y-2 rounded-2xl bg-ink-50 p-4 text-sm ring-1 ring-inset ring-ink-200/70">
            <div className="flex justify-between text-ink-500">
              <span>Articles</span>
              <span className="tabular">{fmt(detail.montant_articles)}</span>
            </div>
            {Number(detail.tva) > 0 && (
              <div className="flex justify-between text-ink-500">
                <span>TVA</span>
                <span className="tabular">{fmt(detail.tva)}</span>
              </div>
            )}
            {Number(detail.remise) > 0 && (
              <div className="flex justify-between text-ink-500">
                <span>Remise</span>
                <span className="tabular text-accent-600">− {fmt(detail.remise)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-500">
              <span>Frais de livraison</span>
              <span className="tabular">{fmt(detail.frais_livraison)}</span>
            </div>
            <div className="flex items-end justify-between border-t border-ink-200 pt-2.5">
              <span className="font-display text-base font-extrabold text-ink-900">Total client</span>
              <span className="font-display text-xl font-extrabold text-brand-700 tabular">
                {fmt(detail.montant_total)}
              </span>
            </div>
            <p className="flex items-start gap-1.5 pt-1 text-[11px] text-ink-400">
              <ExclamationTriangleIcon className="mt-px h-3.5 w-3.5 flex-none" />
              <span>
                Montant transactionnel (statistiques) :{" "}
                {fmt(detail.montant_transactionnel ?? detail.montant_articles)} — la rémunération
                du livreur reste hors transactions.
              </span>
            </p>
          </div>

          {detail.mode_recuperation === "livraison" && (
            <button
              type="button"
              className="lg-btn-soft w-full"
              onClick={() => {
                fermer();
                ouvrirAssignation(detail);
              }}
            >
              <TruckIcon className="h-4 w-4" />
              Assigner / gérer le livreur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ASSIGNATION LIVREUR (suivi interne — rémunération hors transactions 🔴)
// ===========================================================================
function AssignationModal({ data, fermer, fait }) {
  const { commande, livreurs } = data;
  const [livreurId, setLivreurId] = useState(commande.livreur_id || "");
  const [montant, setMontant] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const assigner = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/livraison/assigner`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          commande_id: commande.id,
          livreur_id: livreurId,
          ...(montant !== "" ? { montant_livreur: Number(montant) } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      fait();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink-900/50 p-4 backdrop-blur-sm"
      onClick={fermer}
    >
      <form
        className="w-full max-w-md animate-pop-in rounded-2xl border border-ink-200/80 bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
        onSubmit={assigner}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold text-ink-900">Assigner un livreur</h2>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Commande{" "}
              <span className="font-mono font-bold text-brand-700">{commande.reference}</span>
              {commande.livreur_nom ? ` — actuellement : ${commande.livreur_nom}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer"
            className="grid h-8 w-8 flex-none place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <label className="lg-label mt-5" htmlFor="livreur">
          Livreur
        </label>
        <select
          id="livreur"
          className="lg-select"
          value={livreurId}
          onChange={(e) => setLivreurId(e.target.value)}
          required
        >
          <option value="">— Choisir un livreur —</option>
          {livreurs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nom}
              {l.vehicule ? ` (${l.vehicule})` : ""}
              {l.actif === 0 ? " — inactif" : ""}
            </option>
          ))}
        </select>
        {livreurs.length === 0 && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-amber-700">
            <ExclamationTriangleIcon className="h-4 w-4 flex-none" />
            Aucun livreur enregistré — créez-en un dans « Livraisons ».
          </p>
        )}

        <label className="lg-label mt-4" htmlFor="montant-livreur">
          Rémunération du livreur (optionnel)
        </label>
        <input
          id="montant-livreur"
          type="number"
          min="0"
          className="lg-input"
          placeholder="Par défaut : part calculée sur les frais"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
        />

        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[12px] leading-snug font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
          <ExclamationTriangleIcon className="mt-px h-4 w-4 flex-none text-amber-600" />
          <span>
            Suivi interne uniquement : cette rémunération n'est <strong>JAMAIS</strong> incluse
            dans les ventes / factures / paiements ni dans le chiffre d'affaires.
          </span>
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="lg-btn-ghost" onClick={fermer}>
            Annuler
          </button>
          <button type="submit" className="lg-btn-primary" disabled={envoi || !livreurId}>
            <BanknotesIcon className="h-4 w-4" />
            {envoi ? "Enregistrement…" : "Assigner"}
          </button>
        </div>
      </form>
    </div>
  );
}
