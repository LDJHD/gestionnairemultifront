import { useEffect, useState } from "react";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  UsersIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { estSuperAdmin } from "@/utils/auth";

/* ===========================================================================
   « LE GESTIONNAIRE » — GÉRER LES ENTREPRISES (super administrateur)
   - Approuver une entreprise en attente
   - Deux interrupteurs distincts :
       1) Entreprise  : autorise l'entreprise (et sa vitrine)
       2) Connexions  : autorise les comptes utilisateurs à se connecter
   - Créer un compte entreprise
   =========================================================================== */

const API = import.meta.env.VITE_API_URL;

const SECTEUR_LABELS = {
  supermarche: "Supermarché",
  restaurant: "Restaurant",
  boutique: "Boutique",
  salon: "Salon",
  pharmacie: "Pharmacie",
  sante: "Santé",
  entrepot: "Entrepôt",
  autre: "Autre",
};

/* ── Interrupteur réutilisable ── */
function Interrupteur({ actif, onChange, label, enCours = false, desactive = false }) {
  const bloque = enCours || desactive;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      title={desactive ? "Activez d'abord l'entreprise" : label}
      disabled={bloque}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        actif ? "bg-green-500" : "bg-ink-300"
      } ${enCours ? "cursor-wait opacity-60" : desactive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          actif ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

/* ── Carte statistique ── */
function StatCard({ icone: Icone, label, valeur, couleur }) {
  const couleurs = {
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    green: "bg-green-50 text-green-600 ring-green-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
  };
  return (
    <div className="lg-card flex items-center gap-4 p-5">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${
          couleurs[couleur] || couleurs.brand
        }`}
      >
        <Icone className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold text-ink-900 tabular">{valeur ?? "—"}</p>
        <p className="text-[12px] font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/** L'entreprise a-t-elle tous ses comptes actifs ? */
function comptesActifs(ent) {
  return Number(ent.nb_utilisateurs) > 0 && Number(ent.nb_utilisateurs_actifs) === Number(ent.nb_utilisateurs);
}

export function SuperAdmin() {
  const [statistiques, setStatistiques] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modaleCreer, setModaleCreer] = useState(false);
  const [actionEnCours, setActionEnCours] = useState(null);

  useEffect(() => {
    if (!estSuperAdmin()) {
      toast.error("Accès réservé au super administrateur.");
    }
  }, []);

  const fetchStatistiques = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/superadmin/statistiques`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStatistiques(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEntreprises = async () => {
    try {
      setChargement(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/superadmin/entreprises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.erreur || "Impossible de charger les entreprises.");
        setEntreprises([]);
        return;
      }
      setEntreprises(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Erreur de connexion au serveur.");
      setEntreprises([]);
    } finally {
      setChargement(false);
    }
  };

  const rafraichir = () => {
    fetchEntreprises();
    fetchStatistiques();
  };

  useEffect(() => {
    rafraichir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Appelle une route super admin et retourne { ok, data }. */
  const appeler = async (chemin, corps) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}${chemin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(corps),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  };

  /** Active / désactive l'entreprise et sa vitrine. */
  const basculerEntreprise = async (ent) => {
    const nouvelEtat = Number(ent.actif) === 1 ? 0 : 1;
    setActionEnCours(`entreprise-${ent.id}`);
    try {
      const { ok, data } = await appeler("/api/v1/superadmin/entreprise/activer", {
        id: ent.id,
        actif: nouvelEtat,
      });
      if (ok) {
        toast.success(data.message || "Statut de l'entreprise mis à jour.");
        await rafraichir();
      } else {
        toast.error(data.erreur || "Erreur lors de la mise à jour de l'entreprise.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setActionEnCours(null);
    }
  };

  /** Autorise / bloque tous les comptes utilisateurs de l'entreprise. */
  const basculerComptes = async (ent) => {
    const nouvelEtat = comptesActifs(ent) ? 0 : 1;
    setActionEnCours(`comptes-${ent.id}`);
    try {
      const { ok, data } = await appeler("/api/v1/superadmin/entreprise/comptes", {
        id: ent.id,
        actif: nouvelEtat,
      });
      if (ok) {
        toast.success(data.message || "Accès des comptes mis à jour.");
        await rafraichir();
      } else {
        toast.error(data.erreur || "Erreur lors de la mise à jour des comptes.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setActionEnCours(null);
    }
  };

  /** Approuve une entreprise : active l'entreprise ET ses connexions. */
  const approuver = async (ent) => {
    setActionEnCours(`approbation-${ent.id}`);
    try {
      const etape1 = await appeler("/api/v1/superadmin/entreprise/activer", { id: ent.id, actif: 1 });
      if (!etape1.ok) {
        toast.error(etape1.data.erreur || "Impossible d'activer l'entreprise.");
        return;
      }
      const etape2 = await appeler("/api/v1/superadmin/entreprise/comptes", { id: ent.id, actif: 1 });
      if (!etape2.ok) {
        toast.error(etape2.data.erreur || "Entreprise activée, mais les comptes n'ont pas pu être autorisés.");
        return;
      }
      toast.success("Entreprise approuvée : ses comptes peuvent maintenant se connecter.");
      await rafraichir();
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setActionEnCours(null);
    }
  };

  if (!estSuperAdmin()) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        <h1 className="font-display text-xl font-extrabold text-red-700">Accès refusé</h1>
        <p className="text-[14px] text-red-600">
          Cette interface est réservée au super administrateur de plateforme.
        </p>
      </div>
    );
  }

  const entreprisesEnAttente = entreprises.filter((e) => Number(e.actif) !== 1);
  const entreprisesActives = entreprises.filter((e) => Number(e.actif) === 1);

  return (
    <div className="mt-6 mb-10 animate-fade-in">
      {/* ══════════════ EN-TÊTE ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">Plateforme</p>
          <h1 className="lg-page-title">Gérer les entreprises</h1>
          <p className="lg-page-sub">
            Approuvez les entreprises en attente et autorisez leurs comptes à se connecter.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={rafraichir} className="lg-btn-neutral">
            <ArrowPathIcon className="h-[18px] w-[18px]" />
            Rafraîchir
          </button>
          <button onClick={() => setModaleCreer(true)} className="lg-btn-primary">
            <PlusIcon className="h-[18px] w-[18px]" />
            Créer une entreprise
          </button>
        </div>
      </header>

      {/* ══════════════ STATISTIQUES ══════════════ */}
      {statistiques && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icone={BuildingStorefrontIcon} label="Entreprises" valeur={statistiques.total_entreprises} couleur="brand" />
          <StatCard icone={CheckCircleIcon} label="Entreprises actives" valeur={statistiques.entreprises_actives} couleur="green" />
          <StatCard icone={ExclamationTriangleIcon} label="En attente" valeur={statistiques.entreprises_en_attente} couleur="amber" />
          <StatCard icone={UsersIcon} label="Utilisateurs" valeur={statistiques.total_utilisateurs} couleur="blue" />
        </div>
      )}

      {/* ══════════════ ENTREPRISES EN ATTENTE ══════════════ */}
      {entreprisesEnAttente.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 shadow-card">
          <div className="flex flex-col gap-2 border-b border-amber-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold text-ink-900">
                  Entreprises en attente d'approbation ({entreprisesEnAttente.length})
                </h2>
                <p className="text-[12.5px] text-amber-700">
                  Tant qu'elles ne sont pas approuvées, leurs utilisateurs ne peuvent pas se connecter.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {entreprisesEnAttente.map((ent) => (
              <div key={ent.id} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{ent.nom}</p>
                    <p className="mt-0.5 truncate text-[12px] text-ink-500">
                      {SECTEUR_LABELS[ent.secteur] || ent.secteur || "—"}
                      {ent.ifu ? ` · ${ent.ifu}` : ""}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-400">{ent.email || "—"}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    En attente
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-50/70 px-3 py-2 text-[11.5px] text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <UsersIcon className="h-3.5 w-3.5" />
                    {ent.nb_utilisateurs || 0} compte(s)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <LinkIcon className="h-3.5 w-3.5" />
                    {ent.slug ? `/boutique/${ent.slug}` : "vitrine non créée"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => approuver(ent)}
                  disabled={actionEnCours === `approbation-${ent.id}`}
                  className="lg-btn-primary mt-3 w-full"
                >
                  {actionEnCours === `approbation-${ent.id}` ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Approbation…
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      Approuver l'entreprise
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ TOUTES LES ENTREPRISES ══════════════ */}
      <section className="lg-card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-extrabold text-ink-900">Toutes les entreprises</h2>
            <p className="text-[12.5px] text-ink-500">
              <span className="font-semibold text-ink-700">Entreprise</span> = autorisation de l'espace ·{" "}
              <span className="font-semibold text-ink-700">Connexions</span> = autorisation des comptes.
            </p>
          </div>
          <span className="lg-badge-neutral">
            {entreprisesActives.length} active(s) · {entreprisesEnAttente.length} en attente
          </span>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center gap-3 p-10 text-ink-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
            Chargement…
          </div>
        ) : entreprises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <BuildingStorefrontIcon className="h-10 w-10 text-ink-300" />
            <p className="text-[14px] text-ink-500">Aucune entreprise enregistrée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-[11px] tracking-wide text-ink-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Entreprise</th>
                  <th className="px-5 py-3 font-semibold">Secteur</th>
                  <th className="px-5 py-3 font-semibold">Boutique</th>
                  <th className="px-5 py-3 font-semibold">Comptes</th>
                  <th className="px-5 py-3 text-center font-semibold">Entreprise</th>
                  <th className="px-5 py-3 text-center font-semibold">Connexions</th>
                  <th className="px-5 py-3 text-right font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {entreprises.map((ent) => {
                  const entrepriseActive = Number(ent.actif) === 1;
                  const tousComptesActifs = comptesActifs(ent);
                  return (
                    <tr
                      key={ent.id}
                      className="border-b border-ink-50 transition-colors last:border-b-0 hover:bg-ink-50/40"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-ink-900">{ent.nom}</p>
                          <p className="text-[11px] text-ink-400">{ent.email || "—"}</p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-ink-400">IFU {ent.ifu || "—"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="lg-badge-neutral">{SECTEUR_LABELS[ent.secteur] || ent.secteur || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {ent.slug ? (
                          <a
                            href={`/boutique/${ent.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                            /boutique/{ent.slug}
                          </a>
                        ) : (
                          <span className="text-[12px] text-ink-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-ink-700">
                          <UsersIcon className="h-4 w-4 text-ink-400" />
                          <span className="tabular">
                            {ent.nb_utilisateurs_actifs || 0}/{ent.nb_utilisateurs || 0}
                          </span>
                          <span className="text-[11px] text-ink-400">actif(s)</span>
                        </span>
                        <p className="mt-0.5 text-[11px] text-ink-400">{ent.nb_produits || 0} produit(s)</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex justify-center">
                          <Interrupteur
                            actif={entrepriseActive}
                            enCours={actionEnCours === `entreprise-${ent.id}`}
                            onChange={() => basculerEntreprise(ent)}
                            label={entrepriseActive ? "Désactiver l'entreprise" : "Activer l'entreprise"}
                          />
                        </div>
                        <p className="mt-1 text-[10.5px] font-medium text-ink-400">
                          {entrepriseActive ? "Activée" : "En attente"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex justify-center">
                          <Interrupteur
                            actif={tousComptesActifs}
                            enCours={actionEnCours === `comptes-${ent.id}`}
                            desactive={!entrepriseActive}
                            onChange={() => basculerComptes(ent)}
                            label={tousComptesActifs ? "Bloquer les connexions" : "Autoriser les connexions"}
                          />
                        </div>
                        <p className="mt-1 text-[10.5px] font-medium text-ink-400">
                          {tousComptesActifs ? "Autorisées" : "Bloquées"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {entrepriseActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 ring-1 ring-inset ring-green-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            En attente
                          </span>
                        )}
                        <p className="mt-1 text-[10.5px] text-ink-400">{ent.date_creation || "—"}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ══════════════ MODALE CRÉATION ══════════════ */}
      {modaleCreer && (
        <ModaleCreerEntreprise
          onFermer={() => setModaleCreer(false)}
          surSucces={() => {
            rafraichir();
          }}
        />
      )}
    </div>
  );
}

/* ── Modale de création de compte entreprise ── */
function ModaleCreerEntreprise({ onFermer, surSucces }) {
  const [form, setForm] = useState({
    nom_entreprise: "",
    ifu: "",
    secteur: "supermarche",
    email: "",
    password: "",
    nom: "",
    prenom: "",
    whatsapp: "",
  });
  const [envoi, setEnvoi] = useState(false);

  const set = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/superadmin/creer-entreprise`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Entreprise créée. Approuvez-la pour autoriser la connexion.");
        surSucces();
        onFermer();
      } else {
        toast.error(data.erreur || "Erreur lors de la création.");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-pop-in rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lift">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900">Créer un compte entreprise</h2>
            <p className="mt-0.5 text-[13px] text-ink-500">
              L'entreprise démarre en attente. Approuvez-la ensuite depuis la liste.
            </p>
          </div>
          <button
            onClick={onFermer}
            aria-label="Fermer"
            className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="lg-label">Nom de l'entreprise</label>
            <input className="lg-input" required value={form.nom_entreprise} onChange={set("nom_entreprise")} placeholder="Ex : Supermarché Les Jumelles" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="lg-label">IFU</label>
              <input className="lg-input font-mono" required value={form.ifu} onChange={(e) => setForm((f) => ({ ...f, ifu: e.target.value.toUpperCase() }))} placeholder="3202397904961" />
            </div>
            <div>
              <label className="lg-label">Secteur</label>
              <select className="lg-input" value={form.secteur} onChange={set("secteur")}>
                <option value="supermarche">Supermarché</option>
                <option value="restaurant">Restaurant</option>
                <option value="boutique">Boutique</option>
                <option value="salon">Salon</option>
                <option value="pharmacie">Pharmacie</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="lg-label">Nom du responsable</label>
              <input className="lg-input" required value={form.nom} onChange={set("nom")} placeholder="Kossi" />
            </div>
            <div>
              <label className="lg-label">Prénom</label>
              <input className="lg-input" value={form.prenom} onChange={set("prenom")} placeholder="Adjo" />
            </div>
          </div>
          <div>
            <label className="lg-label">Email</label>
            <input type="email" className="lg-input" required value={form.email} onChange={set("email")} placeholder="gerant@exemple.com" />
          </div>
          <div>
            <label className="lg-label">Mot de passe temporaire</label>
            <input type="password" className="lg-input" required value={form.password} onChange={set("password")} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={envoi} className="lg-btn-primary w-full">
            {envoi ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Création…
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Créer le compte
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SuperAdmin;
