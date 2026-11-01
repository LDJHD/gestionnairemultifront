import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

export function AjoutCategorie({ handleformclick, handletoast }) {
  const [formData, setFormData] = useState({
    nom: "",
  });

  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      confirmButton: "bg-green-800 hover:bg-green-400 text-white font-bold py-2 mx-2 px-4 rounded",
      cancelButton: "bg-red-800 hover:bg-red-200 text-white font-bold py-2 mx-2 px-4 rounded",
    },
    buttonsStyling: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/categorie/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify(formData), // Données du formulaire à envoyer
      });

      if (response.ok) {
        const data = await response.json();
        swalWithTailwindButtons.fire({
          title: "Succès",
          text: "Categorie ajoutée avec succès !",
          icon: "success",
        });
        console.log("Response data:", data);
        // Réinitialise les champs du formulaire après la soumission
        setFormData({
          nom: "",
        });
      } else {
        let message = "Échec de l'ajout de la catégorie.";
        try {
          const data = await response.json();
          if (data?.erreur) message = data.erreur;
        } catch (e) {
          /* corps de réponse indisponible */
        }
        swalWithTailwindButtons.fire({
          title: "Erreur",
          text: message,
          icon: "error",
        });
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      swalWithTailwindButtons.fire({
        title: "Erreur",
        text: "Erreur de connexion au serveur.",
        icon: "error",
      });
      console.error("Error:", error);
    }
  };

  return (
    <div className=" w-full ">
      <form className="w-full " onSubmit={handleSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-100 pb-5">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              Ajouter une categorie
            </h2>
            <p className="mt-1.5 text-[13px] text-ink-500">
              Remplissez les détails du produit à ajouter.
            </p>
          </div>
          <button
            type="button"
            onClick={handleformclick}
            aria-label="Fermer"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="nom" className="lg-label">
              Categorie
            </label>
            <input
              type="text"
              name="nom"
              required
              id="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="lg-input"
              placeholder=""
            />
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="lg-btn-primary lg-btn-lg w-full">
            Ajouter Categorie
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjoutCategorie;
