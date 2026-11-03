import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  ShareIcon,
  HashtagIcon,
  CameraIcon,
  BuildingStorefrontIcon,
  LinkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";

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

/** Titre de section avec pastille d'icône. */
function TitreSection({ icone: Icone, titre, sousTitre, ton = "brand" }) {
  const tons = {
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    accent: "bg-accent-50 text-accent-600 ring-accent-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
  };
  return (
    <div className="flex items-center gap-2.5">
      <span className={`lg-icon-chip h-9 w-9 ring-1 ring-inset ${tons[ton] || tons.brand}`}>
        <Icone className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="font-display text-base font-extrabold text-ink-900">{titre}</p>
        <p className="text-[13px] text-ink-500">{sousTitre}</p>
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
            super_admin: decoded.super_admin || false,
          });
        }

        // Récupération du lien dédié de la boutique de l'entreprise connectée
        if (decoded && !decoded.super_admin && decoded.entreprise_id) {
          try {
            const res = await fetch(`${API}/api/v1/activite/mon-lien`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const json = await res.json();
              setLienBoutique(json.lien || null);
            }
          } catch (e) {
            /* non bloquant */
          }
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
      <div className="mx-auto mt-10 max-w-2xl space-y-6 animate-fade-in">
        <div className="lg-card p-12 text-center">
          <div className="lg-skeleton h-8 w-24 mx-auto mb-4" />
          <div className="lg-skeleton h-4 w-48 mx-auto mb-6" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="lg-skeleton h-12 w-full" />
            ))}
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
          <h1 className="mt-5 font-display text-xl font-extrabold text-ink-900">
            Profil introuvable
          </h1>
          <p className="mt-2 text-[14px] text-ink-500">
            Impossible de charger votre profil. Veuillez vous reconnecter.
          </p>
          <Link to="/dashboard" className="lg-btn-primary mt-6 inline-block">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const initials = ((user.prenom || "")[0] || "") + ((user.nom || "")[0] || "");
  const avatarUrl = `/img/bruce-mars.jpeg`;
  const afficherNom = `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email;
  const roleLabel =
    user.super_admin
      ? "Super Administrateur"
      : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      {/* ══════════════ BANDEAU DE COUVERTURE ══════════════ */}
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[url('/img/background-image.png')] bg-cover bg-center shadow-card">
        <div className="absolute inset-0 h-full w-full bg-ink-900/70" />
        <div className="absolute inset-0 h-full w-full bg-brand-900/40" />
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <Avatar src={avatarUrl} alt={afficherNom} size="xl" className="rounded-2xl ring-4 ring-white shadow-lift" />
          <div>
            <p className="font-display text-base font-extrabold text-white">{afficherNom}</p>
            <p className="text-[13px] text-brand-200">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* ══════════════ CARTE DE PROFIL ══════════════ */}
      <Card className="lg-card mx-4 -mt-24 overflow-hidden">
        <CardBody className="p-5">
          {/* Identité + navigation */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar src={avatarUrl} alt={afficherNom} size="xl" variant="rounded" className="rounded-2xl shadow-lift ring-4 ring-white" />
              <div>
                <h1 className="lg-page-title">{afficherNom}</h1>
                <p className="lg-page-sub">{user.email}</p>
                <span className={`lg-badge mt-2 ${user.super_admin ? "lg-badge-danger" : "lg-badge-brand"}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
            <div className="w-full lg:w-96">
              <Tabs value="app">
                <TabsHeader>
                  <Tab value="app">
                    <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    App
                  </Tab>
                  <Tab value="message">
                    <ChatBubbleLeftEllipsisIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                    Message
                  </Tab>
                  <Tab value="settings">
                    <Cog6ToothIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Settings
                  </Tab>
                </TabsHeader>
              </Tabs>
            </div>
          </div>

          {/* ══════════════ MON ENTREPRISE & LIEN BOUTIQUE ══════════════ */}
          {user.entreprise_nom || user.entreprise_id ? (
            <section className="mt-10 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 shrink-0">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-extrabold text-ink-900">
                      {user.entreprise_nom || "Mon entreprise"}
                    </h2>
                    {user.entreprise_ifu && (
                      <p className="mt-0.5 text-[12px] text-ink-500">
                        IFU : {user.entreprise_ifu}
                      </p>
                    )}
                  </div>
                </div>

                {lienBoutique ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                          // toast via sweetalert ou simple info
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
                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-[12.5px] font-bold text-brand-700 shadow-soft transition-all hover:bg-brand-100 hover:border-brand-300"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 13l5-5-5-5M15 5l5 5-5 5" />
                      </svg>
                      Ouvrir ma boutique
                    </a>
                  </div>
                ) : (
                  <p className="text-[13px] text-ink-500">
                    Aucun lien de boutique configuré pour votre entreprise. Contactez l'administration.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section className="mt-10 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
              <div className="p-5 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400 mx-auto mb-3">
                  <UserCircleIcon className="h-6 w-6" />
                </span>
                <h2 className="font-display text-base font-extrabold text-ink-900">Aucune entreprise associée</h2>
                <p className="mt-2 text-[13px] text-ink-500">
                  Votre compte n'est lié à aucune entreprise. Contactez le super administrateur.
                </p>
              </div>
            </section>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* ── Réglages de la plateforme ── */}
            <div className="lg-card p-5">
              <TitreSection
                icone={Cog6ToothIcon}
                titre="Réglages plateforme"
                sousTitre="Préférences de la plateforme"
              />
              <div className="mt-5 flex flex-col gap-6">
                {platformSettingsData.map(({ title, options }) => (
                  <div key={title}>
                    <p className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      {title}
                    </p>
                    <div className="flex flex-col gap-4">
                      {options.map(({ checked, label }) => (
                        <Switch
                          key={label}
                          id={label}
                          label={label}
                          defaultChecked={checked}
                          labelProps={{
                            className: "text-[13px] font-normal text-ink-600",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Informations du profil ── */}
            <ProfileInfoCard
              title="Mes informations"
              description="Votre profil utilisateur sur Le Gestionnaire."
              details={{
                "Nom": afficherNom,
                "Email": user.email,
                "Rôle": roleLabel,
                "Entreprise": user.entreprise_nom || "—",
                "ID utilisateur": user.id || "—",
              }}
              action={
                <Tooltip content="Modifier le profil">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-ink-400" />
                </Tooltip>
              }
            />

            {/* ── Messages ── */}
            <div>
              <TitreSection
                icone={ChatBubbleLeftEllipsisIcon}
                titre="Messages"
                sousTitre="Conversations récentes"
                ton="accent"
              />
              <ul className="mt-4 flex flex-col gap-4">
                {conversationsData.map((props) => (
                  <MessageCard
                    key={props.name}
                    {...props}
                    action={
                      <button type="button" className="lg-btn-soft lg-btn-sm">
                        reply
                      </button>
                    }
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* ── Projets ── */}
          <div className="mt-10 border-t border-ink-100 pt-6">
            <TitreSection
              icone={HomeIcon}
              titre="Projets"
              sousTitre="Vos projets en cours"
              ton="violet"
            />
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {projectsData.map(({ img, title, description, tag, route, members }) => (
                <Card key={title} className="lg-card-hover overflow-hidden">
                  <div className="h-44 w-full overflow-hidden bg-ink-100 xl:h-36">
                    <img
                      src={img}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardBody className="p-4">
                    <span className="lg-badge-brand">{tag}</span>
                    <h3 className="mt-2 font-display text-base font-extrabold text-ink-900">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] text-ink-500 lg-clamp-2">{description}</p>
                  </CardBody>
                  <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
                    <Link to={route} className="lg-btn-neutral lg-btn-sm">
                      view project
                    </Link>
                    <div className="flex items-center">
                      {members.map(({ img, name }, key) => (
                        <Tooltip key={name} content={name}>
                          <Avatar
                            src={img}
                            alt={name}
                            size="xs"
                            variant="circular"
                            className={`cursor-pointer border-2 border-white ${
                              key === 0 ? "" : "-ml-2.5"
                            }`}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
