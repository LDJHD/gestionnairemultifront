/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./public/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      /* ── Palette principale : indigo « premium » (brand) ────────────── */
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        /* ── Accent : émeraude (boutique en ligne / validation) ─────────── */
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        /* ── Neutres doux (fonds, bordures, texte) ────────────────────── */
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },

        /* ─────────────────────────────────────────────────────────────────
         * ATTENTION — `withMT` REMPLACE `theme.colors` par la seule palette
         * Material (blue-gray, gray, brown, deep-orange, orange, amber,
         * yellow, lime, light-green, green, teal, cyan, light-blue, blue,
         * indigo, deep-purple, purple, pink, red). Les teintes Tailwind
         * standard (sky, violet, rose, emerald, slate…) n'existaient donc
         * PAS, et toutes les classes `bg-sky-50` / `text-violet-600` /
         * `bg-rose-50` / `from-emerald-500` étaient silencieusement ignorées
         * (aucune règle CSS générée → aucun style).
         * On les réintroduit ici pour que tout le design system v2
         * s'applique réellement.
         * ─────────────────────────────────────────────────────────────── */
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        /* ─────────────────────────────────────────────────────────────────
         * VITRINE (boutique en ligne) — palette « premium » CHAUDE.
         * Volontairement distincte du back-office : la vitrine est une
         * marque grand public (crème + espresso + vert profond), pas un
         * outil de gestion (indigo froid).
         * ─────────────────────────────────────────────────────────────── */
        boutique: {
          50: "#fbf8f3",
          100: "#f5efe5",
          200: "#e9dfcd",
          300: "#d8c8ad",
          400: "#bda887",
          500: "#9c8969",
          600: "#7f6e53",
          700: "#675943",
          800: "#514637",
          900: "#3c342a",
          950: "#241f19",
        },
        forest: {
          50: "#f0f6f3",
          100: "#dcebe4",
          200: "#bbd7cb",
          300: "#8fbcae",
          400: "#5e9c8c",
          500: "#3f7f70",
          600: "#2f6659",
          700: "#275248",
          800: "#20423b",
          900: "#1b3631",
          950: "#0d1f1c",
        },
      },

      /* ── Ombres douces, multi-couches (aspect « verre / elevated ») ──── */
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.05)",
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 8px 24px -8px rgb(15 23 42 / 0.10)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.05), 0 10px 30px -12px rgb(15 23 42 / 0.12)",
        lift: "0 2px 4px -1px rgb(15 23 42 / 0.06), 0 18px 40px -16px rgb(15 23 42 / 0.20)",
        glow: "0 0 0 1px rgb(99 102 241 / 0.16), 0 14px 36px -10px rgb(79 70 229 / 0.42)",
        "glow-accent": "0 0 0 1px rgb(16 185 129 / 0.18), 0 14px 36px -10px rgb(5 150 105 / 0.38)",
        inner: "inset 0 1px 0 0 rgb(255 255 255 / 0.06)",
      },

      /* ── Rayons ──────────────────────────────────────────────────────── */
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      /* ── Dégradés signés (utilisables via bg-gradient-to-br) ──────────── */
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #818cf8 100%)",
        "brand-deep": "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
        "accent-gradient": "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
        "sunset-gradient": "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)",
        /* Dégradés de la vitrine */
        "boutique-deep": "linear-gradient(150deg, #241f19 0%, #3c342a 42%, #514637 100%)",
        "forest-gradient": "linear-gradient(135deg, #275248 0%, #3f7f70 55%, #5e9c8c 100%)",
        "mesh": "radial-gradient(at 0% 0%, rgb(99 102 241/.16) 0px, transparent 55%), radial-gradient(at 100% 0%, rgb(16 185 129/.12) 0px, transparent 50%), radial-gradient(at 50% 100%, rgb(129 140 248/.14) 0px, transparent 60%)",
      },

      /* ── Transitions / animations ────────────────────────────────────── */
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      /* ── Transitions / animations ──────────────────────────────────────
       * REMplissage « backwards » (et non « both ») : l'état initial
       * ne s'applique que pendant le délai, et AUCUNE propriété
       * (opacity / transform) ne persiste après la fin de l'animation.
       * Avec « both », opacity:0 / transform:scale() restaient appliqués
       * en permanence → le conteneur créait un contexte d'empilement
       * qui piégeait les modales « fixed » sous le menu latéral (z-50)
       * et la barre supérieure (z-40).
       * ───────────────────────────────────────────────────────────────── */
      animation: {
        "fade-in": "fadeIn .4s cubic-bezier(.22,1,.36,1) backwards",
        "slide-up": "slideUp .5s cubic-bezier(.22,1,.36,1) backwards",
        "slide-down": "slideDown .35s cubic-bezier(.22,1,.36,1) backwards",
        "pop-in": "popIn .35s cubic-bezier(.34,1.56,.64,1) backwards",
        "scale-in": "scaleIn .3s cubic-bezier(.22,1,.36,1) backwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 7s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.4s cubic-bezier(.4,0,.6,1) infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(18px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: 0, transform: "translateY(-12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        popIn: {
          from: { opacity: 0, transform: "scale(.94)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        scaleIn: {
          from: { opacity: 0, transform: "scale(.97)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition: "800px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgb(79 70 229 / .45)" },
          "70%": { boxShadow: "0 0 0 12px rgb(79 70 229 / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(79 70 229 / 0)" },
        },
      },

      /* ── Mise en page ────────────────────────────────────────────────── */
      maxWidth: { "8xl": "88rem" },
      spacing: { 4.5: "1.125rem", 18: "4.5rem", 22: "5.5rem" },
    },
  },
  plugins: [],
});