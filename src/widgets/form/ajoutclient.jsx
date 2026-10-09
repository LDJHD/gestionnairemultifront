import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function AjoutClient({ handleformclick, handletoast }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ifu: "",
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/client/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify(formData), // Données du formulaire à envoyer
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Client ajouté avec succès !", { autoClose: 600 });
        console.log("Response data:", data);
        // Réinitialise les champs du formulaire après la soumission
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          adresse: "",
          ifu: "",
        });
      } else {
        toast.error("Échec de l'ajout du Client.");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Error:", error);
    }
  };

  return (
    <div className=" w-full ">
      <form className="w-full " onSubmit={handleSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-100 pb-5">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              Ajouter un Client
            </h2>
            <p className="mt-1.5 text-[13px] text-ink-500">
              Remplissez les détails du Client à ajouter.
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
              Nom
            </label>
            <input
              required
              type="text"
              name="nom"
              id="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="lg-input"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="prenom" className="lg-label">
              Prenom
            </label>
            <input
              type="text"
              name="prenom"
              id="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              className="lg-input"
              placeholder=""
            />
          </div>

          <div>
            <label htmlFor="prenom" className="lg-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="clientmail@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="lg-label">
              telephone
            </label>
            <input
              type="number"
              name="telephone"
              id="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="0190130000"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="lg-label">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              id="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="Ville,Quartier"
            />
          </div>

          <div>
            <label htmlFor="ifu" className="lg-label">
              Ifu
            </label>
            <input
              type="text"
              name="ifu"
              id="ifu"
              value={formData.ifu}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="0190130000"
            />
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="lg-btn-primary lg-btn-lg w-full">
            Ajouter le Client
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjoutClient;
