import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  BellAlertIcon,
  ChartBarSquareIcon,
  CubeIcon,
  TruckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

/* ===========================================================================
   « LE GESTIONNAIRE » — CONNEXION
   Écran scindé : vitrine de marque à gauche, formulaire épuré à droite.
   =========================================================================== */

const PILIERS = [
  { icon: ShoppingBagIcon, titre: "Boutique en ligne", texte: "Vitrine, panier et commandes 24/24" },
  { icon: CreditCardIcon, titre: "Paiements FedaPay", texte: "Mobile Money & cartes, sécurisé" },
  { icon: TruckIcon, titre: "Livraison", texte: "Zones, frais et suivi des colis" },
  { icon: BellAlertIcon, titre: "Notifications", texte: "In-app, email et WhatsApp" },
];

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [seSouvenir, setSeSouvenir] = useState(true);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setDisabled(true);
        toast.success("Authentification réussie !");
        setTimeout(() => {
          navigate("/dashboard/home");
        }, 700);
      } else {
        toast.error(data.erreur || "Une erreur s'est produite.");
      }
    } catch (error) {
      toast.error("Une erreur réseau est survenue.");
    }
  };

  return (
    <section className="flex min-h-screen bg-white">
      <ToastContainer position="top-right" autoClose={600} />

      {/* ══════════════ Panneau de marque ══════════════ */}
      <div className="relative hidden w-[46%] shrink-0 flex-col justify-between overflow-hidden bg-brand-deep p-10 text-white lg:flex xl:p-14">
        {/* Halos décoratifs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-28 -right-24 h-[26rem] w-[26rem] rounded-full bg-brand-400/25 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-[24rem] w-[24rem] rounded-full bg-accent-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.07)_1px,transparent_0)] bg-[size:28px_28px]" />
        </div>

        {/* Marque */}
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

        {/* Accroche */}
        <div className="relative max-w-lg">
          <span className="lg-badge bg-white/10 text-white/90 ring-1 ring-inset ring-white/20">
            <SparklesIcon className="h-3.5 w-3.5" />
            Tout votre commerce, au même endroit
          </span>
          <h1 className="mt-5 font-display text-[40px] leading-[1.1] font-extrabold tracking-tight xl:text-[46px]">
            Pilotez votre activité
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-white to-accent-300">
              sans effort.
            </span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">
            Caisse, stocks, facturation, commandes en ligne, livraison et paiements — une
            solution pensée pour les commerces, restaurants, salons et cliniques.
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
        <div className="w-full max-w-[420px] animate-slide-up">
          {/* Marque mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <ChartBarSquareIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-[15px] leading-tight font-extrabold text-ink-900">
                Le Gestionnaire
              </p>
              <p className="text-[11px] font-medium text-ink-400">Gestion &amp; boutique en ligne</p>
            </div>
          </div>

          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Bon retour
          </h2>
          <p className="mt-2 text-[15px] text-ink-500">
            Connectez-vous pour accéder à votre espace de gestion.
          </p>

          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            <div>
              <label className="lg-label" htmlFor="email">
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="lg-input py-3 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="lg-label" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="lg-input py-3 pr-11 pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-2.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeIcon className="h-[18px] w-[18px]" /> : <EyeSlashIcon className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <input
                type="checkbox"
                checked={seSouvenir}
                onChange={(e) => setSeSouvenir(e.target.checked)}
                className="lg-checkbox"
              />
              <span className="text-[13px] font-medium text-ink-600">Se souvenir de moi</span>
            </label>

            <button type="submit" disabled={disabled} className="lg-btn-primary lg-btn-lg w-full">
              {disabled ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>

            <p className="text-center text-sm text-ink-500">
              Pas encore de compte ?{" "}
              <Link
                to="/auth/sign-up"
                className="font-bold text-brand-600 transition-colors hover:text-brand-800"
              >
                Créer un compte
              </Link>
            </p>
          </form>

          {/* Réassurance */}
          <div className="mt-10 flex items-center justify-center gap-5 border-t border-ink-100 pt-6 text-[11.5px] text-ink-400">
            <span className="flex items-center gap-1.5">
              <CubeIcon className="h-4 w-4 text-ink-300" />
              Données chiffrées
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCardIcon className="h-4 w-4 text-ink-300" />
              FedaPay sécurisé
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
