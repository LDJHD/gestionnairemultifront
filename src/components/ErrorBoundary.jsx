import { Component } from "react";

/* ===========================================================================
   « LE GESTIONNAIRE » — GARDE-FOU D'ERREURS (ErrorBoundary)
   ---------------------------------------------------------------------------
   ⚠️ SANS CE COMPOSANT, la moindre exception React (mauvais `undefined`,
   crash d'un composant) démonte TOUTE l'application et affiche une PAGE
   BLANCHE sans aucune explication. C'était le symptôme « je tombe
   aléatoirement sur une page blanche ».

   Ici, on intercepte l'erreur, on affiche un écran lisible avec un bouton
   « Réessayer » et le détail technique, puis on propose :
     - « Retour au tableau de bord » (rechargement propre) ;
     - « Vider le cache PWA » si un ancien service worker sert du périmé.
   =========================================================================== */

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erreur: null, infos: "" };
  }

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  componentDidCatch(erreur, infos) {
    // Journalise dans la console pour le diagnostic navigateur.
    console.error("⛔ Erreur React capturée :", erreur, infos);
    this.setState({ infos: String(erreur?.stack || infos?.componentStack || "") });
  }

  /** Vide les caches du service worker puis recharge la page. */
  viderCache = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (window.caches) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
    } catch {
      /* navigateur restrictif : on recharge quand même */
    } finally {
      window.location.href = "/dashboard/home";
    }
  };

  render() {
    if (!this.state.erreur) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-ink-200 bg-white p-8 shadow-lift">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                />
              </svg>
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold text-ink-900">
                Une erreur est survenue
              </h1>
              <p className="text-[13px] text-ink-500">
                L'application a été interrompue pour éviter un blocage.
              </p>
            </div>
          </div>

          <pre className="mb-5 max-h-48 overflow-auto rounded-xl border border-ink-200 bg-ink-50 p-4 text-[11.5px] leading-relaxed text-ink-700">
            {String(this.state.erreur?.message || this.state.erreur) || "Erreur inconnue"}
            {this.state.infos ? `\n${this.state.infos}` : ""}
          </pre>

          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={this.viderCache} className="lg-btn-primary">
              Retour au tableau de bord
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="lg-btn-neutral"
            >
              Recharger la page
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/auth/sign-in")}
              className="lg-btn-soft"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
