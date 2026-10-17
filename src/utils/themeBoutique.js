/* ===========================================================================
   « LE GESTIONNAIRE » — THÈME COULEUR PERSONNALISABLE
   ---------------------------------------------------------------------------
   Les couleurs de la vitrine (`boutique-*` / `forest-*`) sont des classes
   Tailwind compilées en dur. Pour permettre au gestionnaire de choisir SA
   propre couleur, on injecte dynamiquement une feuille de style qui surcharge
   ces classes avec la variable CSS `--boutique-accent`.

   La feuille est :
     - appliquée sur TOUTE l'application (donc visible sur la boutique ET sur
       le back-office) ;
     - réinjectée à chaque changement de couleur ;
     - persistée dans le localStorage (clé `lg-couleur-boutique`) ;
     - restaurée au chargement de chaque page (via `appliquerThemeBoutique()`).

   Sans la persistance, la couleur reviendrait à la valeur par défaut au
   rechargement : c'est exactement le bug « mon thème est ignoré ».
   =========================================================================== */

const CLE = "lg-couleur-boutique";
const ID_STYLE = "lg-theme-boutique";
export const COULEUR_DEFAUT = "#0f766e";

/** Lit la couleur enregistrée (ou la valeur par défaut). */
export function lireCouleurBoutique() {
  try {
    return localStorage.getItem(CLE) || COULEUR_DEFAUT;
  } catch {
    return COULEUR_DEFAUT;
  }
}

/** Convertit "#0f766e" en [r, g, b]. */
function hexVersRgb(hex) {
  const m = String(hex || "").replace("#", "");
  const complet = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(complet, 16);
  if (Number.isNaN(n)) return [15, 118, 110];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Assombrit (k < 1) ou éclaircit (k > 1) une couleur. */
function nuance(hex, k) {
  const [r, g, b] = hexVersRgb(hex);
  const mix = (c) =>
    Math.max(0, Math.min(255, Math.round(k <= 1 ? c * k : c + (255 - c) * (k - 1))));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Couleur de texte lisible sur le fond (blanc ou noir). */
export function texteLisible(hex) {
  const [r, g, b] = hexVersRgb(hex);
  // Luminance relative (formule WCAG simplifiée)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#101010" : "#ffffff";
}

/* Feuille de style injectée : surcharge les classes Tailwind de la vitrine. */
function feuilleDeStyle(couleur) {
  const accent = couleur;
  const accentFonce = nuance(accent, 0.78);
  const accentTresFonce = nuance(accent, 0.55);
  const accentClair = nuance(accent, 1.25);
  const accentTresClair = nuance(accent, 1.6);
  const accentVoile = `rgba(${hexVersRgb(accent).join(", ")}, 0.14)`;
  const surAccent = texteLisible(accent);

  return `
/* ── Thème vitrine personnalisé par le gestionnaire ────────────────────── */
:root { --boutique-accent: ${accent}; }

/* Fonds */
.bg-boutique-900 { background-color: ${accent} !important; }
.bg-boutique-800 { background-color: ${accentFonce} !important; }
.bg-boutique-600 { background-color: ${accent} !important; }
.bg-boutique-500 { background-color: ${accentClair} !important; }
.bg-boutique-100 { background-color: ${accentTresClair} !important; }
.bg-boutique-deep {
  background-image: linear-gradient(150deg, ${accentTresFonce} 0%, ${accentFonce} 45%, ${accent} 100%) !important;
}

/* Textes */
.text-boutique-900 { color: ${accentTresFonce} !important; }
.text-boutique-800 { color: ${accentFonce} !important; }
.text-boutique-700 { color: ${accentFonce} !important; }
.text-boutique-600 { color: ${accent} !important; }
.text-boutique-500 { color: ${accent} !important; }
.text-boutique-400 { color: ${accent} !important; opacity: 0.75; }
.text-boutique-300 { color: ${accentClair} !important; }
.text-boutique-200 { color: ${accentTresClair} !important; }
.text-boutique-100 { color: ${accentTresClair} !important; }
.text-boutique-50  { color: ${accentTresClair} !important; }

/* Bordures / pastilles */
.border-boutique-200 { border-color: ${accentVoile} !important; }
.border-boutique-300 { border-color: ${accentClair} !important; }
.ring-boutique-100 { --tw-ring-color: ${accentVoile} !important; }
.from-boutique-100 { --tw-gradient-from: ${accentTresClair} !important; }
.to-boutique-300   { --tw-gradient-to: ${accentClair} !important; }

/* Contrastes sur accent (boutons pleins) : le texte doit rester lisible,
   quelle que soit la couleur choisie par l'utilisateur. */
.bg-boutique-900 *,
.bg-boutique-800 * { }

/* Ombre colorée cohérente avec l'accent */
.shadow-glow { box-shadow: 0 10px 30px -8px ${accentVoile} !important; }
`;
}

/**
 * Applique (ou réinitialise) le thème couleur.
 * @param {string|null} couleur  couleur hex, ou null/vide pour revenir au défaut
 * @param {boolean} persister    true = enregistrer dans le localStorage
 */
export function appliquerThemeBoutique(couleur, persister = true) {
  const valeur = String(couleur || "").trim() || COULEUR_DEFAUT;

  if (persister) {
    try {
      localStorage.setItem(CLE, valeur);
    } catch {
      /* mode privé : on ignore */
    }
  }

  try {
    document.documentElement.style.setProperty("--boutique-accent", valeur);
  } catch {
    /* SSR : on ignore */
  }

  let style = document.getElementById(ID_STYLE);
  if (!style) {
    style = document.createElement("style");
    style.id = ID_STYLE;
    document.head.appendChild(style);
  }
  style.textContent = feuilleDeStyle(valeur);
}

/** Restaure le thème au chargement d'une page. */
export function initThemeBoutique() {
  if (typeof document === "undefined") return;
  appliquerThemeBoutique(lireCouleurBoutique(), false);
}

export default appliquerThemeBoutique;
