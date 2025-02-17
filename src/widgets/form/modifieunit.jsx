import { useState,useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';




export function ModifieUnit({unitId,handleformclick}) {
  
  const [formData, setFormData] = useState({
    nom:""
   
  });



    // Fonction pour récupérer les détails du produit
    const fetchunitDetails = async (id) => {
      try {
          const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien unité
  
          const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/v1/unit/detailById`,
              { id },
              {
                  headers: {
                      Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
                  },
              }
          );
          
          const unit = response.data;
          console.log(unit);
  
          setFormData({
              nom: unit.nom || ""
          });
      } catch (error) {
          console.error("Erreur lors de la récupération des détails du produit :", error);
      }
  };
  
    
      useEffect(() => {
        if (unitId) {
          fetchunitDetails(unitId); // Charger les détails si l'ID du produit est fourni
          console.log(unitId);
        }else {
          console.log('loose');
        }
      }, [unitId]);




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire
  
    try {
        // Récupérer le token depuis le localStorage
        const token = localStorage.getItem("token");
  
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/unit/update`, {
            method: "POST", // Utilisez la méthode POST pour la mise à jour
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
            },
            body: JSON.stringify({
                ...formData,
                id: unitId, // Inclure l'ID du produit dans les données envoyées
            }),
        });
  
        if (response.ok) {
            const data = await response.json();
            toast.success("unit mis à jour avec succès !",{ autoClose: 600 });
            console.log("Response data:", data);
            
        } else {
            toast.error("Échec de la mise à jour du produit.");
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

      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-2xl font-bold text-gray-800">Modifier unit</h2>
        <p className="mt-1 text-sm text-gray-500">Mettez à jour le unit.</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6">

        <div>
          <label htmlFor="nom" className="block text-sm font-semibold text-gray-700">
            unit
          </label>
          <input
            type="text"
            name="nom"

            id="nom"
            required
            value={formData.nom}
            onChange={handleInputChange}
            className="mt-1 p-3 block w-full h-12 text-xl rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder="150"
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

export default ModifieUnit;
