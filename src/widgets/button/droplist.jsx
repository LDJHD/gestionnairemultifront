import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Typography } from "@material-tailwind/react";
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
    <div>
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => handleClick(id)}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <Typography as="a" href="#" className="text-xs font-semibold text-blue-gray-600">
            <EllipsisVerticalIcon strokeWidth={2} className="h-5 w-5 text-inherit" />
          </Typography>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700" onClick={() => handleAlert(idp)}>
                Supprimer
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700">
                <Modaleditproduit ProductId={idp}  onClick={handletoast} setMenuActif={setMenuActif}/>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Droplist;
