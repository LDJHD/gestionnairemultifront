import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export function Modifieuser({ userId, handleformclick }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    whatsapp: "",
    pays: "",
  });

  // Fonction pour récupérer les détails du user
  const fetchuserDetails = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/utilisateur/detailById`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        },
      );

      const user = response.data;
      console.log(user);

      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        whatsapp: user.whatsapp || "",
        pays: user.pays || "",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du user :", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchuserDetails(userId); // Charger les détails si l'ID du user est fourni
      console.log(userId);
    } else {
      console.log("loose");
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/update`, {
        method: "POST", // Utilisez la méthode POST pour la mise à jour
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify({
          ...formData,
          id: userId, // Inclure l'ID du user dans les données envoyées
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("user mis à jour avec succès !", { autoClose: 600 });
        console.log("Response data:", data);
      } else {
        toast.error("Échec de la mise à jour du user.");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Error:", error);
    }
  };

  return (
    <div className=" w-full ">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-100 pb-5">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              Modifier un user
            </h2>
            <p className="mt-1.5 text-[13px] text-ink-500">Mettez à jour les informations.</p>
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
            <label htmlFor="prenom" className="lg-label">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              id="nom"
              required
              value={formData.nom}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="Ex: 123456789"
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
              placeholder="Ex: Jus d'orange"
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
              placeholder="Ex: Jus d'orange"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="lg-label">
              Whatsapp
            </label>
            <input
              type="text"
              name="whatsapp"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="lg-label">
              Pays
            </label>
            <input
              type="text"
              name="pays"
              id="pays"
              value={formData.pays}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="Vile,Quartier"
            />
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="lg-btn-primary lg-btn-lg w-full">
            Enregistrer les Modifications
          </button>
        </div>
      </form>
    </div>
  );
}

export default Modifieuser;
