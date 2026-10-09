import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  TruckIcon,
  UserPlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  BanknotesIcon,
  XMarkIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;
const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} F`;

// ===========================================================================
// « LE GESTIONNAIRE » — LIVRAISONS & LIVREURS
// CRUD livreurs, suivi des courses (statuts, preuve), et paiement du
// LIVREUR (sa rémunération) — 🔴 suivi interne UNIQUEMENT : jamais écrit
// dans vente/facture/paiement, jamais compté dans le chiffre d'affaires.
// ===========================================================================

const STATUTS_LIVRAISON = {
  EN_ATTENTE: { label: "En attente", classe: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" },
  EN_COURS: { label: "En cours", classe: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100" },
  LIVREE: { label: "Livrée", classe: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100" },
  ANNULEE: { label: "Annulée", classe: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100" },
};

export default function Livraisons() {
  const [onglet, setOnglet] = useState("livraisons"); // livraisons | livreurs
  const [livraisons, setLivraisons] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [formLivreur, setFormLivreur] = useState(null); // null | {} | {id, ...}

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const token = localStorage.getItem("token");
      const [resL, resLr] = await Promise.all([
        fetch(`${API}/api/v1/livraison/listall`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/v1/livreur/listall`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (resL.ok) setLivraisons(await resL.json());
      if (resLr.ok) setLivreurs(await resLr.json());
    } catch {
      /* module non migré — silencieux */
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // ---------------------------- Livreurs CRUD ----------------------------
  const enregistrerLivreur = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = formLivreur.id ? "/api/v1/livreur/update" : "/api/v1/livreur/create";
      const res = await fetch(`${API}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formLivreur),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      setFormLivreur(null);
      charger();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const supprimerLivreur = async (l) => {
    const confirm = await Swal.fire({
      title: `Supprimer ${l.nom} ?`,
      text: "Le livreur sera retiré définitivement.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#b91c1c",
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/livreur/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: l.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      charger();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ------------------------- Statut d'une course -------------------------
  const changerStatut = async (livraison, statut) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/livraison/statut`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commande_id: livraison.commande_id, statut }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      charger();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 🔴 Paiement du LIVREUR — écrit UNIQUEMENT dans `livraison`
  const payerLivreur = async (livraison) => {
    const { value: form } = await Swal.fire({
      title: "Paiement du livreur (suivi interne)",
      html: `
        <input id="swal-montant" type="number" min="0" class="swal2-input"
               placeholder="Montant (F)" value="${Number(livraison.montant_livreur || 0)}">
        <select id="swal-statut" class="swal2-input">
          <option value="PAYE" ${livraison.statut_paiement_livreur === "PAYE" ? "selected" : ""}>Payé</option>
          <option value="NON_PAYE" ${livraison.statut_paiement_livreur !== "PAYE" ? "selected" : ""}>Non payé</option>
        </select>
        <p style="font-size:12px;color:#b45309"><strong>Suivi interne.</strong> Cette rémunération
        n'apparaît dans aucune vente, facture ni paiement client.</p>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Enregistrer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#0f766e",
      preConfirm: () => ({
        montant_livreur: Number(document.getElementById("swal-montant").value || 0),
        statut_paiement_livreur: document.getElementById("swal-statut").value,
      }),
    });
    if (!form) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/livraison/paiement-livreur`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commande_id: livraison.commande_id, ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message);
      charger();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-6 mb-10 animate-fade-in space-y-6">
      {/* ══════════════ En-tête ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">Boutique en ligne</p>
          <h1 className="lg-page-title">Livraisons</h1>
          <p className="lg-page-sub">
            Suivi des courses · rémunération des livreurs en suivi interne
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" className="lg-btn-neutral" onClick={charger}>
            <ArrowPathIcon className={`h-4 w-4 ${chargement ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            type="button"
            className="lg-btn-primary"
            onClick={() => {
              setOnglet("livreurs");
              setFormLivreur({ nom: "", contact: "", vehicule: "" });
            }}
          >
            <UserPlusIcon className="h-4 w-4" />
            Ajouter un livreur
          </button>
        </div>
      </header>

      {/* ══════════════ Onglets ══════════════ */}
      <div className="inline-flex gap-1 rounded-2xl border border-ink-200/80 bg-white p-1 shadow-xs">
        {[
          { cle: "livraisons", label: "Courses", n: livraisons.length, Icone: TruckIcon },
          { cle: "livreurs", label: "Livreurs", n: livreurs.length, Icone: UserGroupIcon },
        ].map(({ cle, label, n, Icone }) => (
          <button
            key={cle}
            type="button"
            onClick={() => setOnglet(cle)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
              onglet === cle
                ? "bg-brand-gradient text-white shadow-glow"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }`}
          >
            <Icone className="h-4 w-4" />
            {label}
            <span className={`tabular ${onglet === cle ? "text-white/70" : "text-ink-400"}`}>{n}</span>
          </button>
        ))}
      </div>

      {/* ══════════════ Courses ══════════════ */}
      {onglet === "livraisons" && (
        <section className="lg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
            <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <TruckIcon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="font-display text-base font-extrabold text-ink-900">Courses</h2>
              <p className="text-[13px] text-ink-500">{livraisons.length} livraison(s) suivie(s)</p>
            </div>
          </div>

          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[940px]">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client / Adresse</th>
                  <th>Livreur</th>
                  <th>Zone / Frais</th>
                  <th>Statut</th>
                  <th>Rémun. livreur</th>
                  <th className="!text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargement && livraisons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="lg-td !p-10">
                      <div className="flex flex-col items-center gap-3">
                        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
                        <p className="text-sm text-ink-500">Chargement…</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!chargement && livraisons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="lg-td !p-12">
                      <div className="flex flex-col items-center text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                          <TruckIcon className="h-6 w-6" />
                        </span>
                        <p className="mt-3.5 text-sm font-semibold text-ink-700">Aucune livraison</p>
                        <p className="mt-1 text-[13px] text-ink-500">
                          Assignez des livreurs depuis « Commandes en ligne ».
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {livraisons.map((l) => {
                  const sl = STATUTS_LIVRAISON[l.statut] || {
                    label: l.statut,
                    classe: "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200",
                  };
                  return (
                    <tr key={l.id}>
                      <td className="lg-td">
                        <span className="font-mono text-xs font-bold text-brand-700">
                          {l.reference || `#${l.commande_id}`}
                        </span>
                        <div className="text-[11px] text-ink-400">{l.commande_statut}</div>
                      </td>
                      <td className="lg-td text-xs">
                        <div className="font-semibold text-ink-800">
                          {l.client_prenom} {l.client_nom}
                        </div>
                        <div className="text-ink-500">{l.adresse_livraison}</div>
                      </td>
                      <td className="lg-td text-xs">
                        {l.livreur_nom ? (
                          <>
                            <div className="font-semibold text-ink-800">{l.livreur_nom}</div>
                            <div className="text-ink-500">{l.livreur_contact}</div>
                          </>
                        ) : (
                          <span className="lg-badge-warn">Non assigné</span>
                        )}
                      </td>
                      <td className="lg-td text-xs">
                        <div className="font-medium text-ink-700">{l.zone || "—"}</div>
                        <div className="text-ink-500 tabular">{fmt(l.frais)}</div>
                      </td>
                      <td className="lg-td">
                        <span className={`lg-badge ${sl.classe}`}>{sl.label}</span>
                      </td>
                      <td className="lg-td text-xs">
                        <div className="font-display font-bold text-ink-900 tabular">
                          {fmt(l.montant_livreur)}
                        </div>
                        <span
                          className={`lg-badge mt-1 ${
                            l.statut_paiement_livreur === "PAYE"
                              ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100"
                              : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                          }`}
                        >
                          {l.statut_paiement_livreur === "PAYE" ? "Payé" : "Non payé"}
                        </span>
                        <div className="mt-1 text-[10px] text-ink-400">hors transactions</div>
                      </td>
                      <td className="lg-td">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {l.statut === "EN_ATTENTE" && (
                            <button
                              type="button"
                              className="lg-btn-soft !rounded-lg !px-2.5 !py-1.5 !text-[11px]"
                              onClick={() => changerStatut(l, "EN_COURS")}
                            >
                              En route
                            </button>
                          )}
                          {l.statut === "EN_COURS" && (
                            <button
                              type="button"
                              className="lg-btn-accent !rounded-lg !px-2.5 !py-1.5 !text-[11px]"
                              onClick={() => changerStatut(l, "LIVREE")}
                            >
                              Livrée
                            </button>
                          )}
                          <button
                            type="button"
                            className="lg-btn-neutral !rounded-lg !px-2.5 !py-1.5 !text-[11px]"
                            onClick={() => payerLivreur(l)}
                          >
                            <BanknotesIcon className="h-3.5 w-3.5" />
                            Payer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ══════════════ Livreurs ══════════════ */}
      {onglet === "livreurs" && (
        <section className="lg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
                <UserGroupIcon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold text-ink-900">Livreurs</h2>
                <p className="text-[13px] text-ink-500">{livreurs.length} enregistré(s)</p>
              </div>
            </div>
            <button
              type="button"
              className="lg-btn-primary lg-btn-sm"
              onClick={() => setFormLivreur({ nom: "", contact: "", vehicule: "" })}
            >
              <UserPlusIcon className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[620px]">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Véhicule</th>
                  <th>État</th>
                  <th className="!text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {livreurs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="lg-td !p-12">
                      <div className="flex flex-col items-center text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                          <UserGroupIcon className="h-6 w-6" />
                        </span>
                        <p className="mt-3.5 text-sm font-semibold text-ink-700">
                          Aucun livreur enregistré
                        </p>
                        <p className="mt-1 text-[13px] text-ink-500">
                          Ajoutez vos livreurs pour pouvoir assigner des courses.
                        </p>
                        <button
                          type="button"
                          className="lg-btn-primary lg-btn-sm mt-4"
                          onClick={() => setFormLivreur({ nom: "", contact: "", vehicule: "" })}
                        >
                          <UserPlusIcon className="h-4 w-4" />
                          Ajouter un livreur
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {livreurs.map((l) => (
                  <tr key={l.id}>
                    <td className="lg-td font-semibold text-ink-800">{l.nom}</td>
                    <td className="lg-td text-xs text-ink-600">{l.contact || "—"}</td>
                    <td className="lg-td text-xs text-ink-600">{l.vehicule || "—"}</td>
                    <td className="lg-td">
                      <span
                        className={`lg-badge ${
                          l.actif
                            ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100"
                            : "bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200"
                        }`}
                      >
                        {l.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="lg-td">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          aria-label={`Modifier ${l.nom}`}
                          onClick={() => setFormLivreur({ ...l })}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <PencilSquareIcon className="h-[18px] w-[18px]" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer ${l.nom}`}
                          onClick={() => supprimerLivreur(l)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ══════════════ Formulaire livreur (ajout / édition) ══════════════ */}
      {formLivreur && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink-900/50 p-4 backdrop-blur-sm"
          onClick={() => setFormLivreur(null)}
        >
          <form
            className="w-full max-w-md animate-pop-in rounded-2xl border border-ink-200/80 bg-white p-6 shadow-lift"
            onClick={(e) => e.stopPropagation()}
            onSubmit={enregistrerLivreur}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold text-ink-900">
                {formLivreur.id ? "Modifier le livreur" : "Nouveau livreur"}
              </h2>
              <button
                type="button"
                onClick={() => setFormLivreur(null)}
                aria-label="Fermer"
                className="grid h-8 w-8 flex-none place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <label className="lg-label mt-5" htmlFor="lr-nom">
              Nom *
            </label>
            <input
              id="lr-nom"
              className="lg-input"
              required
              value={formLivreur.nom}
              onChange={(e) => setFormLivreur({ ...formLivreur, nom: e.target.value })}
            />

            <label className="lg-label mt-4" htmlFor="lr-contact">
              Contact
            </label>
            <input
              id="lr-contact"
              className="lg-input"
              placeholder="+229 90 00 00 00"
              value={formLivreur.contact || ""}
              onChange={(e) => setFormLivreur({ ...formLivreur, contact: e.target.value })}
            />

            <label className="lg-label mt-4" htmlFor="lr-vehicule">
              Véhicule
            </label>
            <input
              id="lr-vehicule"
              className="lg-input"
              placeholder="Moto, voiture, tricycle…"
              value={formLivreur.vehicule || ""}
              onChange={(e) => setFormLivreur({ ...formLivreur, vehicule: e.target.value })}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="lg-btn-ghost" onClick={() => setFormLivreur(null)}>
                Annuler
              </button>
              <button type="submit" className="lg-btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
