import { useState } from "react";
import PropTypes from "prop-types";
import { TEToast } from "tw-elements-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/* ===========================================================================
   NOTIFICATION LÉGACY (« Toast »)
   Composant historique : les pages l'utilisent encore via `{toast && <Toastadd
   reponse={rep} />}`. Le retour utilisateur passe désormais par SweetAlert2
   (voir `swalWithTailwindButtons`) et par le `ToastContainer` global de
   `main.jsx` ; ce composant est conservé pour compatibilité.

   ⚠️ Correction appliquée : le bouton de fermeture appelait `setOpen(false)`
   alors que `setOpen` n'existait pas dans la portée → ReferenceError au clic.
   =========================================================================== */
export function Toastadd({ affiche, reponse }) {
  const [ouvert, setOuvert] = useState(!!affiche);

  return (
    <TEToast open={ouvert} autohide delay={3200} setOpen={setOuvert}>
      <div className="flex items-center justify-between rounded-t-2xl border-b border-ink-100 bg-white px-4 py-2.5">
        <p className="text-[13px] font-bold text-ink-800">Notification</p>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          aria-label="Fermer la notification"
          className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="break-words rounded-b-2xl bg-white px-4 py-3.5 text-[13px] leading-relaxed text-ink-600">
        {reponse}
      </div>
    </TEToast>
  );
}

Toastadd.propTypes = {
  affiche: PropTypes.bool,
  reponse: PropTypes.node,
};

export default Toastadd;
