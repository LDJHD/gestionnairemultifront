import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modaleditproduit from "../modal/modaleditproduit";
import Swal from 'sweetalert2'

export function Droplist({ isOpen, handleClick, id, idp, onDelete,setMenuActif }) {
  const navigate = useNavigate();
  const [openmodaldrop,setOpenModaldrop]=useState(false);
  const [toast,setToast]=useState(false);

  const handletoast = () => {
    setToast(true);
  };
  

  const handleAlert = (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton: 'bg-green-800 hover:bg-green-400 text-white font-bold py-2 mx-2 px-4 rounded',
        cancelButton: 'bg-red-800 hover:bg-red-200 text-white font-bold py-2 mx-2 px-4 rounded'
      },
      buttonsStyling: false
    });
  
    swalWithTailwindButtons.fire({
      title: "Êtes-vous sûr ?",
      text: "Vous ne pourrez pas annuler cette action !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimez !",
      cancelButtonText: "Non, annulez !",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });
  
          if (response.ok) {
            swalWithTailwindButtons.fire({
              title: "Supprimé !",
              text: "La suppression a été effectuée avec succès.",
              icon: "success",
            });
            // Appelle removeStock pour mettre à jour la liste localement
            onDelete();
          } else {
            swalWithTailwindButtons.fire({
              title: "Erreur",
              text: "La suppression a échoué.",
              icon: "error",
            });
          }
        } catch (error) {
          swalWithTailwindButtons.fire({
            title: "Erreur",
            text: "Une erreur est survenue lors de la connexion au serveur.",
            icon: "error",
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwindButtons.fire({
          title: "Annulé",
          text: "Votre fichier imaginaire est en sécurité :)",
          icon: "error",
        });
      }
    });
  };


  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => handleClick(id)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Actions sur le produit"
        title="Actions"
        className="lg-btn-neutral px-2.5"
      >
        <EllipsisVerticalIcon strokeWidth={2} className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[220px] origin-top-right rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lift animate-slide-down"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAlert(idp)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            <TrashIcon className="h-4 w-4 shrink-0" />
            Supprimer
          </button>
          <div
            role="menuitem"
            className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            <Modaleditproduit ProductId={idp} onClick={handletoast} setMenuActif={setMenuActif} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Droplist;
