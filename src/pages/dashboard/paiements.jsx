import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  BanknotesIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  CreditCardIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;
const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} F`;

// ===========================================================================
// « LE GESTIONNAIRE » — PAIEMENTS (conciliation)
// Table `paiement` = paiements DU CLIENT uniquement + commandes payées.
// 🔴 La rémunération du livreur n'apparaît JAMAIS ici (suivi « Livraisons »).
// ===========================================================================

const PAYES = ["PAYEE", "PAYEE_A_LA_LIVRAISON", "CLOTUREE"];

export default function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [commandesPayees, setCommandesPayees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/paiement/listall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setPaiements(json.paiements || []);
        setCommandesPayees(json.commandes_payees || []);
      }
    } catch {
      /* module non migré — silencieux */
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const rembourser = async (reference) => {
    const confirm = await Swal.fire({
      title: "Rembourser cette commande ?",
      text: `Le paiement de ${reference} sera remboursé via FedaPay (mode test : simulation).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rembourser",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#b91c1c",
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/paiement/rembourser`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reference }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      charger();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalEncaisse = commandesPayees.reduce((t, c) => t + Number(c.montant_total || 0), 0);
  const totalEnLigne = commandesPayees.filter((c) => c.mode_paiement === "en_ligne").length;
  const totalLivraison = commandesPayees.filter((c) => c.mode_paiement !== "en_ligne").length;

  const filtre = (obj) =>
    !recherche.trim() ||
    JSON.stringify(obj).toLowerCase().includes(recherche.toLowerCase());

  const commandesFiltrees = commandesPayees.filter(filtre);
  const paiementsFiltres = paiements.filter(filtre);

  return (
    <div className="mt-6 mb-10 animate-fade-in space-y-6">
      {/* ══════════════ En-tête ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">Conciliation</p>
          <h1 className="lg-page-title">Paiements</h1>
          <p className="lg-page-sub">
            FedaPay &amp; encaissements à la livraison — paiements clients uniquement
          </p>
        </div>
        <button type="button" className="lg-btn-neutral" onClick={charger}>
          <ArrowPathIcon className={`h-4 w-4 ${chargement ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </header>

      {/* ══════════════ KPI ══════════════ */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total encaissé",
            valeur: fmt(totalEncaisse),
            Icone: BanknotesIcon,
            ton: "bg-brand-50 text-brand-600 ring-brand-100",
          },
          {
            label: "En ligne (FedaPay)",
            valeur: totalEnLigne,
            suffixe: "commande(s)",
            Icone: CreditCardIcon,
            ton: "bg-sky-50 text-sky-600 ring-sky-100",
          },
          {
            label: "À la livraison",
            valeur: totalLivraison,
            suffixe: "commande(s)",
            Icone: TruckIcon,
            ton: "bg-amber-50 text-amber-600 ring-amber-100",
          },
        ].map(({ label, valeur, suffixe, Icone, ton }) => (
          <div key={label} className="lg-card-hover p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-semibold text-ink-500">{label}</p>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${ton}`}>
                <Icone className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-[26px] leading-none font-extrabold text-ink-900 tabular">
              {valeur}
            </p>
            {suffixe && <p className="mt-1.5 text-[12px] text-ink-400">{suffixe}</p>}
          </div>
        ))}
      </section>

      {/* ══════════════ Recherche ══════════════ */}
      <div className="relative lg:max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
        <input
          className="lg-input pl-11"
          placeholder="Rechercher (référence, client)…"
          aria-label="Rechercher un paiement"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {/* ══════════════ Commandes payées ══════════════ */}
      <section className="lg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
            <CheckCircleIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-base font-extrabold text-ink-900">Commandes payées</h2>
            <p className="text-[13px] text-ink-500">{commandesFiltrees.length} commande(s)</p>
          </div>
        </div>

        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[820px]">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Mode</th>
                <th className="!text-right">Montant</th>
                <th>Date</th>
                <th className="!text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {chargement && commandesFiltrees.length === 0 && (
                <tr>
                  <td colSpan={6} className="lg-td !p-10">
                    <div className="flex flex-col items-center gap-3">
                      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
                      <p className="text-sm text-ink-500">Chargement…</p>
                    </div>
                  </td>
                </tr>
              )}
              {!chargement && commandesFiltrees.length === 0 && (
                <tr>
                  <td colSpan={6} className="lg-td !p-12">
                    <div className="flex flex-col items-center text-center">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                        <BanknotesIcon className="h-6 w-6" />
                      </span>
                      <p className="mt-3.5 text-sm font-semibold text-ink-700">
                        Aucun paiement enregistré
                      </p>
                      <p className="mt-1 text-[13px] text-ink-500">
                        Les commandes réglées apparaîtront ici automatiquement.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {commandesFiltrees.map((c) => (
                <tr key={c.id}>
                  <td className="lg-td font-mono text-xs font-bold text-brand-700">{c.reference}</td>
                  <td className="lg-td text-xs font-semibold text-ink-800">{c.client_nom || "—"}</td>
                  <td className="lg-td text-xs">
                    <span className="flex items-center gap-1.5 text-ink-600">
                      {c.mode_paiement === "en_ligne" ? (
                        <>
                          <CreditCardIcon className="h-4 w-4 shrink-0 text-ink-400" />
                          <span>En ligne</span>
                        </>
                      ) : (
                        <>
                          <TruckIcon className="h-4 w-4 shrink-0 text-ink-400" />
                          <span>À la livraison</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="lg-td !text-right font-display font-extrabold text-ink-900 tabular">
                    {fmt(c.montant_total)}
                  </td>
                  <td className="lg-td text-xs text-ink-500">
                    {c.created_at ? new Date(c.created_at).toLocaleString("fr-FR") : "—"}
                  </td>
                  <td className="lg-td !text-center">
                    {c.mode_paiement === "en_ligne" && PAYES.includes(c.statut) && (
                      <button
                        type="button"
                        className="lg-btn-danger !px-2.5 !py-1.5 !text-[11px]"
                        onClick={() => rembourser(c.reference)}
                      >
                        <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                        Rembourser
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ══════════════ Journal des paiements ══════════════ */}
      <section className="lg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="lg-icon-chip h-9 w-9 bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100">
            <DocumentTextIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-base font-extrabold text-ink-900">
              Journal des paiements
            </h2>
            <p className="text-[13px] text-ink-500">{paiementsFiltres.length} ligne(s)</p>
          </div>
        </div>

        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Moyen</th>
                <th>Statut</th>
                <th className="!text-right">Montant</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paiementsFiltres.length === 0 && (
                <tr>
                  <td colSpan={5} className="lg-td !p-10 text-center text-sm text-ink-400">
                    Aucune ligne de journal.
                  </td>
                </tr>
              )}
              {paiementsFiltres.map((p) => (
                <tr key={p.id}>
                  <td className="lg-td font-mono text-xs font-bold text-brand-700">
                    {p.commande_reference || `#${p.commande_id}`}
                  </td>
                  <td className="lg-td text-xs text-ink-600">{p.moyen || p.mode || "—"}</td>
                  <td className="lg-td">
                    <span
                      className={`lg-badge ${
                        p.statut === "PAYE" || p.statut === "PAYEE"
                          ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100"
                          : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                      }`}
                    >
                      {p.statut || "—"}
                    </span>
                  </td>
                  <td className="lg-td !text-right font-bold text-ink-900 tabular">{fmt(p.montant)}</td>
                  <td className="lg-td text-xs text-ink-500">
                    {p.created_at ? new Date(p.created_at).toLocaleString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rappel métier */}
        <div className="flex items-start gap-2.5 border-t border-ink-100 bg-amber-50/60 p-4">
          <ExclamationTriangleIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
          <p className="text-[12px] leading-snug text-amber-800">
            <strong>Rappel :</strong> la rémunération des livreurs n'est pas un paiement client.
            Elle est suivie uniquement dans la page « Livraisons » et n'entre jamais dans ce
            journal ni dans le chiffre d'affaires.
          </p>
        </div>
      </section>
    </div>
  );
}
