import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardBody, Avatar } from "@material-tailwind/react";
import {
  UserCircleIcon,
  BuildingStorefrontIcon,
  LinkIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

/** Décode le payload d'un JWT (sans vérification de signature) pour lire les infos utilisateur. */
function decodageJwt(token) {
  try {
    const partie = token.split(".")[1];
    if (!partie) return null;
    const base64 = partie.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

/** Champ d'information du profil. */
function ChampInfo({ label, valeur, Icone }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100">
        <Icone className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-ink-800 truncate">{valeur || "—"}</p>
      </div>
    </div>
  );
}

export function Profile() {
  const [user, setUser] = useState(null);
  const [lienBoutique, setLienBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setChargement(false);
          return;
        }
        const decoded = decodageJwt(token);
        if (decoded) {
          setUser({
            id: decoded.id,
            nom: decoded.nom || decoded.email?.split("@")[0] || "Utilisateur",
            prenom: decoded.prenom || "",
            email: decoded.email || "",
            role: decoded.role || decoded.status || "gestionnaire",
            entreprise_id: decoded.entreprise_id || null,
            entreprise_nom: decoded.entreprise_nom || null,
            entreprise_ifu: decoded.entreprise_ifu || null,
            entreprise_slug: decoded.entreprise_slug || null,
            super_admin: decoded.super_admin || false,
          });
        }

        // Lien dédié de la boutique de l'entreprise connectée (source de vérité, isolé par entreprise)
        const eid = decoded?.entreprise_id;
        if (decoded && !decoded.super_admin && eid) {
          try {
            const res = await fetch(`${API}/api/v1/activite/mon-lien`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const json = await res.json();
              setLienBoutique(json.lien || null);
            }
          } catch (e) {
            /* non bloquant : le lien sera construit depuis le slug du JWT */
          }
        }

        // Fallback : construire le lien depuis le slug stocké dans le JWT
        if (!lienBoutique && decoded?.entreprise_slug) {
          setLienBoutique(`${window.location.origin}/boutique/${decoded.entreprise_slug}`);
        }
      } catch (e) {
        console.error("Erreur chargement profil:", e);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  if (chargement) {
    return (
      <div className="mx-auto mt-10 max-w-2xl animate-fade-in">
        <div className="lg-card p-16 text-center">
          <div className="lg-skeleton h-8 w-24 mx-auto mb-4" />
          <div className="lg-skeleton h-4 w-48 mx-auto mb-6" />
          <div className="space-y-3">
            <div className="lg-skeleton h-12 w-3/4 mx-auto" />
            <div className="lg-skeleton h-10 w-full" />
            <div className="lg-skeleton h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto mt-10 max-w-xl animate-fade-in">
        <div className="lg-card p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <UserCircleIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-xl font-extrabold text-ink-900">Profil introuvable</h1>
          <p className="mt-2 text-[14px] text-ink-500">Impossible de charger votre profil. Veuillez vous reconnecter.</p>
          <Link to="/dashboard" className="lg-btn-primary mt-6 inline-block">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const afficherNom = `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email;
  const roleLabel = user.super_admin
    ? "Super Administrateur"
    : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      {/* ══════════════ BANDEAU ══════════════ */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-[url('/img/background-image.png')] bg-cover bg-center shadow-card">
        <div className="absolute inset-0 h-full w-full bg-ink-900/70" />
        <div className="absolute inset-0 h-full w-full bg-brand-900/40" />
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <Avatar src="/img/bruce-mars.jpeg" alt={afficherNom} size="xl" variant="rounded" className="rounded-2xl ring-4 ring-white shadow-lift" />
          <div>
            <p className="font-display text-base font-extrabold text-white">{afficherNom}</p>
            <p className="text-[13px] text-brand-200">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* ══════════════ MON PROFIL ══════════════ */}
      <Card className="lg-card overflow-hidden">
        <CardBody className="p-6">
          <h2 className="font-display text-lg font-extrabold text-ink-900 mb-6">Mes informations</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ChampInfo label="Nom complet" valeur={afficherNom} Icone={UserCircleIcon} />
            <ChampInfo label="Email" valeur={user.email} Icone={EnvelopeIcon} />
            <ChampInfo label="Rôle" valeur={roleLabel} Icone={DocumentTextIcon} />
            <ChampInfo label="ID utilisateur" valeur={String(user.id || "—")} Icone={DocumentTextIcon} />
          </div>

          {/* Entreprise & lien boutique (spécifique à cette entreprise) */}
          {user.entreprise_nom || user.entreprise_id ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
              <CardBody className="p-6">
                <h2 className="font-display text-lg font-extrabold text-ink-900 mb-5">Mon entreprise</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ChampInfo label="Entreprise" valeur={user.entreprise_nom || "—"} Icone={BuildingStorefrontIcon} />
                  {user.entreprise_ifu && (
                    <ChampInfo label="IFU" valeur={user.entreprise_ifu} Icone={DocumentTextIcon} />
                  )}
                </div>

                {lienBoutique && (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      readOnly
                      value={lienBoutique}
                      onFocus={(e) => e.target.select()}
                      className="lg-input flex-1"
                      placeholder="Lien de votre boutique…"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(lienBoutique);
                          window.alert("Lien de la boutique copié !");
                        } catch {
                          window.alert(lienBoutique);
                        }
                      }}
                      className="lg-btn-primary flex-none"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Copier le lien
                    </button>
                    <a
                      href={lienBoutique}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2.5 text-[12.5px] font-bold text-brand-700 shadow-soft transition-all hover:bg-brand-100 hover:border-brand-300"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 13l5-5-5-5M15 5l5 5-5 5" />
                      </svg>
                      Ouvrir ma boutique
                    </a>
                  </div>
                )}
                {!lienBoutique && (
                  <p className="mt-4 text-[13px] text-ink-500">
                    Aucun lien de boutique configuré pour cette entreprise.
                  </p>
                )}
              </CardBody>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
              <CardBody className="p-6 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400 mx-auto mb-3">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </span>
                <h2 className="font-display text-base font-extrabold text-ink-900">Aucune entreprise associée</h2>
                <p className="mt-2 text-[13px] text-ink-500">
                  Votre compte n'est lié à aucune entreprise. Contactez le super administrateur.
                </p>
              </CardBody>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Navigation rapide */}
      <div className="mt-8 flex gap-3">
        <Link to="/dashboard" className="lg-btn-neutral flex-1">
          Tableau de bord
        </Link>
        {lienBoutique && (
          <Link to="/dashboard/parametres" className="lg-btn-primary flex-1">
            Paramètres de la boutique
          </Link>
        )}
      </div>
    </div>
  );
}

export default Profile;
