import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




export function Ajoutuser({handleformclick,handletoast}) {
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse:"",
    ifu:"",
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
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify(formData), // Données du formulaire à envoyer
      });
  
      if (response.ok) {
        const data = await response.json();
        toast.success("user ajouté avec succès !",{ autoClose: 600 });
        console.log("Response data:", data);
        // Réinitialise les champs du formulaire après la soumission
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse:"",
      ifu:"",
    });
   
      } else {
        toast.error("Échec de l'ajout du user.");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Error:", error);
    }
  };



  return (
    <div className=" w-full  mx-auto rounded-lg p-6  ">
      <div className=" flex justify-end">
        <button onClick={handleformclick} className="text-xl   rounded-full text-black w-6 h-6 bg-white-700 border-3 border-gray-900 "> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
 </button>
      </div>
      <form className="w-full " onSubmit={handleSubmit}>
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ajouter un user</h2>
        <p className="mt-2 text-sm text-gray-500">Remplissez les détails du user à ajouter.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="nom" className="block text-sm font-semibold text-gray-700">
           Nom
          </label>
          <input
          required
            type="text"
            name="nom"
            id="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder=""
          />
        </div>

        <div>
          <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700">
            Prenom
          </label>
          <input
            type="text"
            name="prenom"
            required
            id="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            placeholder=""
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
            placeholder="usermail@gmail.com"
          />
        </div>

       
          <div>
            <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700">
              telephone
            </label>
            <input
              type="number"
              name="telephone"
              
              id="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="0190130000"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
             
              id="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="Ville,Quartier"
            />
          </div>

          <div>
            <label htmlFor="ifu" className="block text-sm font-semibold text-gray-700">
              Ifu
            </label>
            <input
              type="text"
              name="ifu"
              
              id="ifu"
              value={formData.ifu}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="0190130000"
            />
          </div>

      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
        >
          Ajouter le user
        </button>
      </div>
    </form>

      
    </div>
  );
}

export default Ajoutuser;
