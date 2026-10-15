import { useEffect, useState } from "react";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { estSuperAdmin, lireRole } from "@/utils/auth";

/* ===========================================================================
   « LE GESTIONNAIRE » — SUPER ADMINISTRATEUR
   Interface réservée au super admin de plateforme :
   - Statistiques globales
   - Liste des entreprises (activation / désactivation)
   - Création de compte entreprise
   =========================================================================== */

const API = import.meta.env.VITE_API_URL;
const SECTEUR_LABELS = {
  supermarche: "Supermarché",
  restaurant: "Restaurant",
  boutique: "Boutique",
  salon: "Salon",
  pharmacie: "Pharmacie",
  autre: "Autre",
};

export function SuperAdmin() {
  const [statistiques, setStatistiques] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modaleCreer, setModaleCreer] = useState(false);

  // Vérification du rôle
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
      if (res.ok) setEntreprises(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchStatistiques();
    fetchEntreprises();
  }, []);

  const basculerEntreprise = async (id, actifActuel) => {
    const nouvelEtat = actifActuel === 1 ? 0 : 1;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/superadmin/entreprise/activer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, actif: nouvelEtat }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchEntreprises();
        fetchStatistiques();
      } else {
        toast.error(data.erreur || "Erreur lors de la mise à jour.");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur.");
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

  return (
    <div className="mt-6 mb-10 animate-fade-in">
      <ToastContainerVide />

      {/* En-tête */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">Plateforme</p>
          <h1 className="lg-page-title">Super Administrateur</h1>
          <p className="lg-page-sub">
            Gérez les entreprises, activez les comptes et supervisez la plateforme.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={fetchEntreprises} className="lg-btn-neutral">
            <ArrowPathIcon className="h-[18px] w-[18px]" />
            Rafraîchir
          </button>
          <button onClick={() => setModaleCreer(true)} className="lg-btn-primary">
            <PlusIcon className="h-[18px] w-[18px]" />
            Créer une entreprise
          </button>
        </div>
      </header>

      {/* Statistiques */}
      {statistiques && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icone={BuildingStorefrontIcon}
            label="Entreprises"
            valeur={statistiques.total_entreprises}
            couleur="brand"
          />
          <StatCard
            icone={CheckCircleIcon}
            label="Entreprises actives"
            valeur={statistiques.entreprises_actives}
            couleur="green"
          />
          <StatCard
            icone={ExclamationTriangleIcon}
            label="En attente"
            valeur={statistiques.entreprises_en_attente}
            couleur="amber"
          />
          <StatCard
            icone={UsersIcon}
            label="Utilisateurs"
            valeur={statistiques.total_utilisateurs}
            couleur="blue"
          />
        </div>
      )}

      {/* Liste des entreprises */}
      <section className="lg-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-base font-extrabold text-ink-900">Entreprises</h2>
          <span className="lg-badge-neutral">{entreprises.length} total</span>
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
            <table className="w-full min-w-[700px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-[11px] tracking-wide text-ink-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Entreprise</th>
                  <th className="px-5 py-3 font-semibold">IFU</th>
                  <th className="px-5 py-3 font-semibold">Secteur</th>
                  <th className="px-5 py-3 font-semibold">Utilisateurs</th>
                  <th className="px-5 py-3 font-semibold">Produits</th>
                  <th className="px-5 py-3 font-semibold">Créée le</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entreprises.map((ent) => (
                  <tr key={ent.id} className="border-b border-ink-50 transition-colors last:border-b-0 hover:bg-ink-50/40">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-ink-900">{ent.nom}</p>
                        <p className="text-[11px] text-ink-400">{ent.email || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-ink-600">{ent.ifu || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="lg-badge-neutral">{SECTEUR_LABELS[ent.secteur] || ent.secteur}</span>
                    </td>
                    <td className="px-5 py-3.5 tabular text-ink-700">{ent.nb_utilisateurs}</td>
                    <td className="px-5 py-3.5 tabular text-ink-700">{ent.nb_produits}</td>
                    <td className="px-5 py-3.5 text-ink-500">{ent.date_creation || "—"}</td>
                    <td className="px-5 py-3.5">
                      {ent.actif === 1 ? (
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
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => basculerEntreprise(ent.id, ent.actif)}
                        className={`lg-btn-sm ${
                          ent.actif === 1 ? "lg-btn-ghost text-red-600 hover:bg-red-50" : "lg-btn-primary"
                        }`}
                      >
                        {ent.actif === 1 ? (
                          <>
                            <XCircleIcon className="h-4 w-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Activer
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modale création entreprise */}
      {modaleCreer && (
        <ModaleCreerEntreprise
          onFermer={() => setModaleCreer(false)}
          surSucces={() => {
            fetchEntreprises();
            fetchStatistiques();
          }}
        />
      )}
    </div>
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
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${couleurs[couleur]}`}>
        <Icone className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold text-ink-900 tabular">{valeur ?? "—"}</p>
        <p className="text-[12px] font-medium text-ink-500">{label}</p>
      </div>
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
        toast.success(data.message || "Entreprise créée et activée.");
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
              L'entreprise est immédiatement activée.
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
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
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
                Créer et activer l'entreprise
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Container de toast minimal (évite un double container global) ── */
function ToastContainerVide() {
  return null;
}

export default SuperAdmin;
