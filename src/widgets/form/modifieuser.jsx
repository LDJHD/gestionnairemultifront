import { useState,useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';




export function Modifieuser({userId,handleformclick}) {
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    whatsapp: "",
    pays:""
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
              }
          );
          
          const user = response.data;
          console.log(user);
  
          setFormData({
              nom: user.nom || "",
              prenom: user.prenom || "",
              email: user.email || "",
              whatsapp: user.whatsapp || "",
              pays: user.pays || ""
          });
      } catch (error) {
          console.error("Erreur lors de la récupération des détails du user :", error);
      }
  };
  
    
      useEffect(() => {
        if (userId) {
          fetchuserDetails(userId); // Charger les détails si l'ID du user est fourni
          console.log(userId);
        }else {
          console.log('loose');
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
                "Authorization": `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
            },
            body: JSON.stringify({
                ...formData,
                id: userId, // Inclure l'ID du user dans les données envoyées
            }),
        });
  
        if (response.ok) {
            const data = await response.json();
            toast.success("user mis à jour avec succès !",{ autoClose: 600 });
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
    <div className=" w-full  mx-auto rounded-lg p-6">
      <div className=" flex justify-end">
        <button onClick={handleformclick} className="text-xl   rounded-full text-black w-6 h-6 bg-white-700 border-3 border-gray-900 "> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
 </button>
      </div>
      <form className="w-full" onSubmit={handleSubmit}>
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-800">Modifier un user</h2>
        <p className="mt-2 text-sm text-gray-500">Mettez à jour les informations.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700">
            Nom
          </label>
          <input
            type="text"
            name="nom"
            id="nom"
            required
            value={formData.nom}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder="Ex: 123456789"
          />
        </div>

        <div>
          <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700">
            Prenom 
          </label>
          <input
            type="text"
            name="prenom"
            id="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder="Ex: Jus d'orange"
          />
        </div>

        <div>
          <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700">
            Email 
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder="Ex: Jus d'orange"
          />
        </div>

        <div>
          <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700">
            Whatsapp
          </label>
          <input
            type="text"
            name="whatsapp"
            id="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700">
            Pays
          </label>
          <input
            type="text"
            name="pays"
            id="pays"
            value={formData.pays}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder="Vile,Quartier"
          />
        </div>

      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
        >
          Enregistrer les Modifications
        </button>
      </div>
    </form>

      
    </div>
  );
}

export default Modifieuser;
