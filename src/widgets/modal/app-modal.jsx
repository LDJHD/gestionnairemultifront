import { useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

/* ===========================================================================
   « LE GESTIONNAIRE » — MODALE PARTAGÉE
   Gabarit unique pour les 14 modales d'ajout / d'édition.
   Remplace le « + » de 24 px (qui ressemblait à un caractère parasite) et le
   crayon bleu de 16 px, par un vrai bouton d'action cohérent.

   La modale est PORTALISÉE vers document.body : elle ne peut plus être
   piégée sous le menu latéral (z-50) ni la barre supérieure (z-40),
   même si un ancêtre crée un contexte d'empilement.
   =========================================================================== */

export function AppModal({
  libelle,
  Icone = PlusIcon,
  Forme,
  taille = "md",
  declencheur = true,
  iconeSeul = false,
  propsForme = {},
}) {
  const [open, setOpen] = useState(false);

  const fermer = () => {
    setOpen(false);
    // Recharge la page pour refléter la modification (comportement historique).
    window.location.reload();
  };

  const largeur =
    taille === "xl" ? "sm:max-w-5xl" : taille === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg";

  return (
    <>
      {declencheur &&
        (iconeSeul ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={libelle}
            title={libelle}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <Icone className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="lg-btn-primary">
            <Icone className="h-4 w-4" />
            {libelle}
          </button>
        ))}

      {createPortal(
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-[90]">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm transition-opacity duration-300 data-[closed]:opacity-0"
          />
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-5">
              <DialogPanel
                transition
                className={`relative w-full transform overflow-hidden rounded-t-3xl bg-white text-left shadow-lift transition-all duration-300 data-[closed]:translate-y-8 data-[closed]:opacity-0 sm:my-8 sm:rounded-3xl ${largeur}`}
              >
                {/* Croix de fermeture */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer la fenêtre"
                  className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
                </button>
                <div className="max-h-[92vh] overflow-y-auto p-6">
                  <Forme handleformclick={fermer} {...propsForme} />
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>,
        document.body
      )}
    </>
  );
}

AppModal.propTypes = {
  libelle: PropTypes.string,
  Icone: PropTypes.elementType,
  Forme: PropTypes.elementType.isRequired,
  taille: PropTypes.oneOf(["md", "lg", "xl"]),
  declencheur: PropTypes.bool,
  iconeSeul: PropTypes.bool,
  propsForme: PropTypes.object,
};

export default AppModal;
