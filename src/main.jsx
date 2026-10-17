/**
=========================================================
* Material Tailwind Dashboard React - v2.1.0
=========================================================
* Product Page: https://www.creative-tim.com/product/material-tailwind-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-tailwind-dashboard-react/blob/main/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "@/context";
import "../public/css/tailwind.css";
import { ToastContainer, Bounce, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { initThemeBoutique } from "@/utils/themeBoutique";

// Restaure la couleur personnalisée de la vitrine AVANT le premier rendu,
// sinon le flash de la couleur par défaut trahit un thème « ignoré ».
initThemeBoutique();

/* ===========================================================================
   SERVICE WORKER (PWA)
   ⚠️ Ne JAMAIS enregistrer /service-worker.js à la main.
   En développement, Vite ne génère pas ce fichier → l'enregistrement échouait.
   Pire : un SW issu d'un ancien `npm run build` restait actif dans le
   navigateur et interceptait TOUTES les requêtes en servant un cache périmé
   → PAGE BLANCHE au chargement de http://localhost:5173.
   virtual:pwa-register gère le cycle de vie correctement et, en dev, le
   plugin VitePWA installe un SW « no-op » qui laisse passer le HMR.
   =========================================================================== */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          // Non bloquant : un `window.confirm` interrompait la saisie en cours.
          // On propose le rechargement dans une notification persistante.
          toast("Une nouvelle version de l'application est disponible.", {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            pauseOnHover: true,
            button: {
              label: "Recharger",
              onClick: () => updateSW(true),
            },
          });
        },
      });
    })
    .catch(() => {
      /* PWA indisponible : l'application fonctionne quand même */
    });
} else if ("serviceWorker" in navigator) {
  // Développement : on neutralise tout SW hérité d'une session de production.
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
  if (window.caches) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {});
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
        <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce} // Correction de la syntaxe
          />
          <App />
          
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
