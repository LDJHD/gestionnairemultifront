/* ===========================================================================
   « LE GESTIONNAIRE » — THÈME COULEUR PERSONNALISABLE DE LA BOUTIQUE
   ---------------------------------------------------------------------------
   Le gestionnaire choisit UNE couleur d'accent. On en déduit une palette
   complète (50 → 950) : fonds, textes, bordures, anneaux, dégradés, états
   hover / focus / placeholder.

   Pourquoi un moteur et pas une simple surcharge ?
   - Les classes `boutique-*` sont compilées en dur par Tailwind ; changer
     seulement `bg-boutique-900` laissait les fonds `boutique-50/100` crème,
     les bordures beiges et les survols « bruns » → le thème paraissait cassé.
   - Une palette calculée garantit surtout la LISIBILITÉ : `text-700` reste
     toujours assez sombre et `text-50` toujours assez clair, quelle que soit
     la couleur choisie (y compris blanc, noir, jaune très clair…).

   La feuille est :
     - injectée à la fin de <head> (donc prioritaire sur Tailwind) ;
     - réinjectée à chaque changement de couleur ;
     - persistée dans localStorage (`lg-couleur-boutique`) ;
     - restaurée au chargement via `initThemeBoutique()`.
   =========================================================================== */

const CLE = "lg-couleur-boutique";
const ID_STYLE = "lg-theme-boutique";
export const COULEUR_DEFAUT = "#0f766e";

/* Rampe tonale : chaque palier vise une LUMINANCE relative précise (et non
   une simple luminosité HSL). C'est ce qui garantit le même contraste pour
   un bleu, un vert, un jaune ou un gris : `text-600` reste toujours lisible
   sur `bg-100`, et un bouton `bg-600` supporte toujours un texte clair. */
const PALIERS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const CIBLES_LUM = {
  50: 0.957,
  100: 0.9,
  200: 0.82,
  300: 0.62,
  400: 0.4,
  500: 0.25,
  600: 0.135,
  700: 0.105,
  800: 0.08,
  900: 0.055,
  950: 0.028,
};
/* Saturation relative par palier (plus clair = moins saturé → aspect premium). */
const CIBLES_SAT = {
  50: 0.5,
  100: 0.58,
  200: 0.68,
  300: 0.8,
  400: 0.9,
  500: 1,
  600: 1,
  700: 0.95,
  800: 0.88,
  900: 0.82,
  950: 0.74,
};

/* Fractions d'opacité réellement utilisées dans la vitrine (bg-…/85,
   border-…/70, ring-…/50…). On les régénère pour que les voiles suivent
   eux aussi la couleur choisie. */
const FRACTIONS = [15, 25, 40, 50, 60, 70, 80, 85];

/** Lit la couleur enregistrée (ou la valeur par défaut). */
export function lireCouleurBoutique() {
  try {
    return localStorage.getItem(CLE) || COULEUR_DEFAUT;
  } catch {
    return COULEUR_DEFAUT;
  }
}

/** Normalise #abc / #aabbcc ; retombe sur la couleur par défaut si invalide. */
function normaliserHex(couleur) {
  const s = String(couleur || "").trim();
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    return `#${s
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  return COULEUR_DEFAUT;
}

/** Convertit "#0f766e" en [r, g, b] (0-255). */
function hexVersRgb(hex) {
  const m = normaliserHex(hex).replace("#", "");
  const n = parseInt(m, 16);
  if (Number.isNaN(n)) return [15, 118, 110];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbVersHex(r, g, b) {
  const octet = (v) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${octet(r)}${octet(g)}${octet(b)}`;
}

/** "#0f766e" → { h: 176, s: 0.77, l: 0.26 } */
function hexVersHsl(hex) {
  const [r0, g0, b0] = hexVersRgb(hex);
  const r = r0 / 255;
  const g = g0 / 255;
  const b = b0 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s, l };
}

/** { h, s, l } → "#rrggbb" */
function hslVersHex(h, s, l) {
  const teinte = (((h % 360) + 360) % 360) / 360;
  const sat = Math.max(0, Math.min(1, s));
  const lum = Math.max(0, Math.min(1, l));

  if (sat === 0) {
    const v = lum * 255;
    return rgbVersHex(v, v, v);
  }

  const q = lum < 0.5 ? lum * (1 + sat) : lum + sat - lum * sat;
  const p = 2 * lum - q;
  const canal = (t0) => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return rgbVersHex(
    canal(teinte + 1 / 3) * 255,
    canal(teinte) * 255,
    canal(teinte - 1 / 3) * 255
  );
}

/** Mélange deux couleurs (t = 0 → a, t = 1 → b). */
function melange(a, b, t) {
  const [r1, g1, b1] = hexVersRgb(a);
  const [r2, g2, b2] = hexVersRgb(b);
  const p = Math.max(0, Math.min(1, t));
  return rgbVersHex(r1 + (r2 - r1) * p, g1 + (g2 - g1) * p, b1 + (b2 - b1) * p);
}

/** rgba() à partir d'un hex + opacité. */
function voile(hex, alpha) {
  const [r, g, b] = hexVersRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Luminance relative WCAG d'une couleur. */
function luminance(hex) {
  const [r, g, b] = hexVersRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Trouve la luminosité HSL qui atteint exactement une luminance cible. */
function teintePourLuminance(h, s, cible) {
  let bas = 0;
  let haut = 1;
  for (let i = 0; i < 22; i += 1) {
    const mid = (bas + haut) / 2;
    if (luminance(hslVersHex(h, s, mid)) < cible) bas = mid;
    else haut = mid;
  }
  return hslVersHex(h, s, (bas + haut) / 2);
}

/** Couleur de texte lisible sur un fond donné (blanc ou encre). */
export function texteLisible(hex) {
  const [r, g, b] = hexVersRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#101010" : "#ffffff";
}

/**
 * Construit la palette 50 → 950 à partir de la couleur choisie.
 * La couleur EXACTE choisie est réinjectée sur un palier SÛR :
 *  - claire → palier de fond (200/300) ;
 *  - moyenne → 500, utilisé uniquement en décor (voiles, dégradés) ;
 *  - sombre → un palier 600+, qui supporte le texte clair.
 * Elle n'est jamais placée sur un palier de texte clair, ce qui aurait cassé
 * la lisibilité (« texte gris clair sur blanc »).
 */
function construirePalette(couleur) {
  const hex = normaliserHex(couleur);
  const { h, s, l } = hexVersHsl(hex);
  const lum = luminance(hex);
  const palette = {};

  for (const p of PALIERS) {
    palette[p] = teintePourLuminance(h, s * CIBLES_SAT[p], CIBLES_LUM[p]);
  }

  let cible;
  if (lum >= 0.8) cible = 200;
  else if (lum >= 0.5) cible = 300;
  else if (lum >= 0.14) cible = 500;
  else {
    // couleur sombre : palier le plus proche parmi les fonds foncés
    const sombres = [600, 700, 800, 900, 950];
    cible = sombres.reduce(
      (meilleur, p) =>
        Math.abs(luminance(palette[p]) - lum) < Math.abs(luminance(palette[meilleur]) - lum)
          ? p
          : meilleur,
      sombres[0]
    );
  }
  palette[cible] = hex;

  return { hex, palette, l };
}

/* ===========================================================================
   FEUILLE DE STYLE
   =========================================================================== */
function feuilleDeStyle(couleur) {
  const { hex, palette } = construirePalette(couleur);
  const accent = hex;
  const surAccent = texteLisible(accent);
  const fond = palette[50];
  const fondClair = melange(palette[50], "#ffffff", 0.55);
  const barre = palette[100];
  const bordure = palette[200];

  const regles = [];

  /* ── Jetons globaux : réutilisés par index.css (.boutique-page, etc.) ── */
  regles.push(`
:root {
  --boutique-accent: ${accent};
  --boutique-sur-accent: ${surAccent};
  --boutique-fond: ${fond};
  --boutique-fond-clair: ${fondClair};
  --boutique-barre: ${barre};
  --boutique-bordure: ${bordure};
  --boutique-voile: ${voile(accent, 0.09)};
  --boutique-texte: ${palette[800]};
  --boutique-texte-fort: ${palette[900]};
  --boutique-texte-doux: ${palette[700]};
}`);

  /* ── Base : fonds, textes, bordures, anneaux, séparateurs, dégradés ── */
  for (const p of PALIERS) {
    const c = palette[p];
    /* `bg-boutique-900` est la surface d'action (bouton principal, pastille
       active, panier). On utilise le ton 700 — plus riche et encore assez
       sombre pour un texte clair — plutôt que le 900 quasi noir, afin que la
       couleur choisie reste bien visible. `text-boutique-900` garde le ton
       le plus sombre pour les titres. */
    regles.push(
      `.bg-boutique-${p} { background-color: ${p === 900 ? palette[700] : c} !important; }`
    );
    regles.push(`.text-boutique-${p} { color: ${c} !important; }`);
    regles.push(`.border-boutique-${p} { border-color: ${c} !important; }`);
    regles.push(`.ring-boutique-${p} { --tw-ring-color: ${c} !important; }`);
    regles.push(
      `.divide-boutique-${p} > :not([hidden]) ~ :not([hidden]) { border-color: ${c} !important; }`
    );
    regles.push(`.from-boutique-${p} { --tw-gradient-from: ${c} !important; }`);
    regles.push(`.to-boutique-${p} { --tw-gradient-to: ${c} !important; }`);
    regles.push(`.placeholder\\:text-boutique-${p}::placeholder { color: ${c} !important; }`);
    regles.push(`.hover\\:bg-boutique-${p}:hover { background-color: ${c} !important; }`);
    regles.push(`.hover\\:text-boutique-${p}:hover { color: ${c} !important; }`);
    regles.push(`.hover\\:border-boutique-${p}:hover { border-color: ${c} !important; }`);
    regles.push(`.focus\\:border-boutique-${p}:focus { border-color: ${c} !important; }`);
    regles.push(`.focus\\:ring-boutique-${p}:focus { --tw-ring-color: ${c} !important; }`);
    regles.push(`.group:hover .group-hover\\:text-boutique-${p} { color: ${c} !important; }`);
    regles.push(`.group:hover .group-hover\\:bg-boutique-${p} { background-color: ${c} !important; }`);
    regles.push(`.group:hover .group-hover\\:border-boutique-${p} { border-color: ${c} !important; }`);
  }

  /* ── Voiles (bg-…/85, border-…/70, ring-…/50, from-…/85) ── */
  for (const p of PALIERS) {
    const c = palette[p];
    for (const f of FRACTIONS) {
      const a = f / 100;
      regles.push(`.bg-boutique-${p}\\/${f} { background-color: ${voile(c, a)} !important; }`);
      regles.push(`.text-boutique-${p}\\/${f} { color: ${voile(c, a)} !important; }`);
      regles.push(`.border-boutique-${p}\\/${f} { border-color: ${voile(c, a)} !important; }`);
      regles.push(`.ring-boutique-${p}\\/${f} { --tw-ring-color: ${voile(c, a)} !important; }`);
      regles.push(`.from-boutique-${p}\\/${f} { --tw-gradient-from: ${voile(c, a)} !important; }`);
      regles.push(`.to-boutique-${p}\\/${f} { --tw-gradient-to: ${voile(c, a)} !important; }`);
    }
  }

  /* ── Dégradé signature (héros, confirmation) ── */
  regles.push(`.bg-boutique-deep {
    background-image: linear-gradient(150deg, ${palette[950]} 0%, ${palette[900]} 42%, ${palette[700]} 100%) !important;
  }`);
  regles.push(`.bg-forest-gradient { background-image: linear-gradient(135deg, #1b3631 0%, #2f6659 55%, #3f7f70 100%); }`);

  /* ── Ombre colorée cohérente ── */
  regles.push(`.shadow-glow {
    box-shadow: 0 0 0 1px ${voile(accent, 0.18)}, 0 16px 38px -12px ${voile(accent, 0.45)} !important;
  }`);

  /* ── Sélection & focus clavier aux couleurs de la marque ── */
  regles.push(`::selection { background: ${voile(accent, 0.26)}; color: ${palette[950]}; }`);
  regles.push(`.boutique-page :focus-visible {
    outline-color: ${palette[600]};
  }`);

  return `/* ── Thème vitrine personnalisé ────────────────────────────────────── */
${regles.join("\n")}
`;
}

/* ===========================================================================
   APPLICATION
   =========================================================================== */

/**
 * Applique (ou réinitialise) le thème couleur.
 * @param {string|null} couleur  couleur hex, ou null/vide pour revenir au défaut
 * @param {boolean} persister    true = enregistrer dans le localStorage
 */
export function appliquerThemeBoutique(couleur, persister = true) {
  const valeur = normaliserHex(couleur);

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

  /* Certains navigateurs ne recalculent pas les `!important` injectés après
     coup : forcer un reflow garantit la mise à jour immédiate. */
  try {
    // eslint-disable-next-line no-unused-expressions
    document.body?.offsetHeight;
  } catch {
    /* ignore */
  }
}

/** Restaure le thème au chargement d'une page. */
export function initThemeBoutique() {
  if (typeof document === "undefined") return;
  appliquerThemeBoutique(lireCouleurBoutique(), false);
}

export default appliquerThemeBoutique;
