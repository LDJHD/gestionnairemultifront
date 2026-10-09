import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

/* ===========================================================================
   « LE GESTIONNAIRE » — INSCRIPTION
   Le champ WhatsApp devient le numéro de réception des notifications du
   gestionnaire en chef (RESUME_PROJET §4.8).
   =========================================================================== */

const PILIERS = [
  { icon: ShoppingCartIcon, titre: "Caisse & stock", texte: "Le socle existant, conservé à 100 %" },
  { icon: BuildingStorefrontIcon, titre: "Vitrine en ligne", texte: "Une boutique publique par activité" },
  { icon: ChatBubbleLeftRightIcon, titre: "Notifications", texte: "WhatsApp, email et in-app" },
  { icon: ShieldCheckIcon, titre: "Multi-rôles", texte: "Admin, gestionnaire, caissière" },
];

export function SignUp() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pays, setPays] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmpassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!termsAccepted) {
      toast.error("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    const utilisateur = { nom, prenom, email, password, whatsapp, pays, confirmpassword };

    try {
      setEnvoi(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateurs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(utilisateur),
      });

      if (response.ok) {
        toast.success("Inscription réussie ! Votre compte sera activé par l'administration.", { autoClose: 2000 });
        setTimeout(() => navigate("/auth/sign-in"), 1600);
      } else {
        const errorData = await response.json();
        toast.error(errorData.erreur || "Erreur lors de l'inscription", { autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Erreur Serveur", { autoClose: 2000 });
    } finally {
      setEnvoi(false);
    }
  };

  const oeil = (visible, setVisible) => (
    <button
      type="button"
      onClick={() => setVisible(!visible)}
      className="absolute top-1/2 right-2.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    >
      {visible ? <EyeIcon className="h-[18px] w-[18px]" /> : <EyeSlashIcon className="h-[18px] w-[18px]" />}
    </button>
  );

  return (
    <section className="flex min-h-screen bg-white">
      <ToastContainer position="top-right" autoClose={1200} />

      {/* ══════════════ Panneau de marque ══════════════ */}
      <div className="relative hidden w-[46%] shrink-0 flex-col justify-between overflow-hidden bg-brand-deep p-10 text-white lg:flex xl:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-28 -right-24 h-[26rem] w-[26rem] rounded-full bg-brand-400/25 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-[24rem] w-[24rem] rounded-full bg-accent-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.07)_1px,transparent_0)] bg-[size:28px_28px]" />
        </div>

        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur">
            <img
              src="/image/logo.png"
              alt=""
              className="h-7 w-7 rounded-lg object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </span>
          <div>
            <p className="font-display text-[17px] leading-tight font-extrabold tracking-tight">
              Le Gestionnaire
            </p>
            <p className="text-[11px] font-medium text-white/55">Gestion &amp; boutique en ligne</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <span className="lg-badge bg-white/10 text-white/90 ring-1 ring-inset ring-white/20">
            <SparklesIcon className="h-3.5 w-3.5" />
            Supermarché, restaurant, salon, clinique…
          </span>
          <h1 className="mt-5 font-display text-[40px] leading-[1.1] font-extrabold tracking-tight xl:text-[46px]">
            Créez votre espace
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-white to-accent-300">
              multi-activités.
            </span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">
            Adaptez l'application à votre métier : caisse, stocks, facturation, vitrine en
            ligne, livraison et paiements — desde un seul compte.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {PILIERS.map(({ icon: Icone, titre, texte }) => (
              <li
                key={titre}
                className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-inset ring-white/10 backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.12]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                  <Icone className="h-[18px] w-[18px] text-accent-300" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold">{titre}</span>
                  <span className="block text-[11.5px] leading-snug text-white/55">{texte}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-white/40">
          © {new Date().getFullYear()} Le Gestionnaire — Tous droits réservés
        </p>
      </div>

      {/* ══════════════ Formulaire ══════════════ */}
      <div className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-[54%] xl:px-20">
        <div className="w-full max-w-[460px] animate-slide-up">
          {/* Marque mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-[15px] leading-tight font-extrabold text-ink-900">
                Le Gestionnaire
              </p>
              <p className="text-[11px] font-medium text-ink-400">Gestion &amp; boutique en ligne</p>
            </div>
          </div>

          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Créer un compte
          </h2>
          <p className="mt-2 text-[15px] text-ink-500">
            Rejoignez la plateforme en moins d'une minute.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="lg-label" htmlFor="nom">
                  Nom
                </label>
                <input
                  id="nom"
                  className="lg-input"
                  placeholder="Kossi"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
              <div>
                <label className="lg-label" htmlFor="prenom">
                  Prénom
                </label>
                <input
                  id="prenom"
                  className="lg-input"
                  placeholder="Adjo"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="lg-label" htmlFor="email">
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  className="lg-input py-3 pl-11"
                  placeholder="nom@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* WhatsApp / Pays */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="lg-label" htmlFor="whatsapp">
                  WhatsApp
                </label>
                <div className="relative">
                  <PhoneIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                  <input
                    id="whatsapp"
                    className="lg-input py-3 pl-11"
                    placeholder="+229 90 00 00 00"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="lg-label" htmlFor="pays">
                  Pays
                </label>
                <div className="relative">
                  <GlobeAltIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                  <input
                    id="pays"
                    className="lg-input py-3 pl-11"
                    placeholder="Bénin"
                    required
                    value={pays}
                    onChange={(e) => setPays(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="lg-label" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="lg-input py-3 pr-11 pl-11"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {oeil(showPassword, setShowPassword)}
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label className="lg-label" htmlFor="confirm">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  className="lg-input py-3 pr-11 pl-11"
                  placeholder="••••••••"
                  required
                  value={confirmpassword}
                  onChange={(e) => setConfirmpassword(e.target.value)}
                />
                {oeil(showConfirmPassword, setShowConfirmPassword)}
              </div>
            </div>

            {/* Conditions */}
            <label className="flex cursor-pointer items-start gap-2.5 select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="lg-checkbox mt-0.5"
              />
              <span className="text-[13px] leading-snug text-ink-600">
                J'accepte les{" "}
                <a href="#" className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800">
                  Termes et Conditions
                </a>
              </span>
            </label>

            <button type="submit" disabled={envoi} className="lg-btn-primary lg-btn-lg mt-2 w-full">
              {envoi ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Création du compte…
                </>
              ) : (
                "S'inscrire maintenant"
              )}
            </button>

            <p className="text-center text-sm text-ink-500">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/auth/sign-in"
                className="font-bold text-brand-600 transition-colors hover:text-brand-800"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
