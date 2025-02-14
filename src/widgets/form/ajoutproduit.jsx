import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PriceUnitForm from "./priceunitform";




export function AjoutProduit({ handleformclick, handletoast }) {
  const [priceUnitFields, setPriceUnitFields] = useState([]);
  const [charge, setcharge] = useState(false);
  const [formData, setFormData] = useState({
    code_barre: "",
    nom: "",
    categorie_id: "",
    prix: "",
    dateexpi:"",
    quantite_stock:"",
    description: "",
  });
  const [categorie, setcategorie] = useState([]);


  // Fonction pour récupérer les categories
  const fetchcategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/categorie/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setcategorie(data);
      } else {
        console.error("Erreur lors de la récupération des categories:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };



  // Appel de fetchcategories lors du chargement du composant
  useEffect(() => {
    fetchcategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");

      // Étape 1: Enregistrement du produit
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify(formData), // Données du formulaire à envoyer
      });

      

      if (response.ok) {
        const data = await response.json();
        const produitId = data.id; // Supposons que l'ID du produit est retourné

        toast.success("Produit ajouté avec succès !", { autoClose: 600 });
        console.log("Produit ajouté:", data);

        // Étape 2: Envoi des données PriceUnitForm vers la table `supplement`
        if (priceUnitFields.length > 0) {
          const supplementData = priceUnitFields.map((item) => ({
            produit_id: produitId, // Associer le produit
            prix: item.prix,
            unit: item.unit,
          }));
          console.log(supplementData);
          const supplementResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/supplement/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ supplements: supplementData }),
          });

          if (supplementResponse.ok) {
            toast.success("Supplements enregistrés avec succès !", { autoClose: 600 });
            console.log("Supplements enregistrés avec succès !");
          } else {
            toast.error("Erreur lors de l'enregistrement des supplements.");
            console.error("Erreur lors de l'enregistrement des supplements");
          }

          
      if (formData.quantite_stock) { // Vérifie si quantite_stock est renseigné
        const stockData = {
          produit_id: data.id, // Associer le produit
          quantite_stock: formData.quantite_stock, // Ajouter la quantité de stock
        };
      
        console.log(stockData);
      
        // Envoi des données au backend
        const stockResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(stockData), // Envoie de l'objet stockData
        });
      
        if (stockResponse.ok) {
          toast.success("Stock enregistré avec succès !", { autoClose: 600 });
          console.log("Stock enregistré avec succès !");
        } else {
          toast.error("Erreur lors de l'enregistrement du stock.");
          console.error("Erreur lors de l'enregistrement du stock");
        }
      } else {
        toast.warning("Veuillez renseigner la quantité en stock.");
        console.log("Quantité en stock non renseignée.");
      }
        }

        // Réinitialiser le formulaire
        setFormData({
          code_barre: "",
          nom: "",
          categorie_id: "",
          prix: "",
          dateexpi:"",
          quantite_stock:"",
          description: "",
        });
        setPriceUnitFields([]); // Réinitialiser les champs du formulaire PriceUnitForm
        setcharge(true)


        

      } else {
        toast.error("Échec de l'ajout du produit.Ce produit pourrait etre déja enregistré");
        console.error("Erreur:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Erreur:", error);
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
          <h2 className="text-2xl font-bold text-gray-800">Ajouter un Produit</h2>
          <p className="mt-2 text-sm text-gray-500">Remplissez les détails du produit à ajouter.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="code_barre" className="block text-sm font-semibold text-gray-700">
              Code barre
            </label>
            <input
              required
              type="text"
              name="code_barre"
              id="code_barre"
              value={formData.code_barre}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="Ex: 123456789"
            />
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm font-semibold text-gray-700">
              Nom du Produit
            </label>
            <input
              type="text"
              name="nom"
              required
              id="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="Ex: Jus d'orange"
            />
          </div>

          <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Catégorie
            </label>
            <select
              id="categorie_id"
              name="categorie_id"
              required
              value={formData.categorie_id}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categorie.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.nom}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
              Prix
            </label>
            <input
              type="number"
              name="prix"
              required
              id="prix"
              value={formData.prix}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
              Quantité Stock
            </label>
            <input
              type="number"
              name="quantite_stock"
              required
              id="quantite_stock"
              value={formData.quantite_stock}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="100"
            />
          </div>

          <div>
            <label className="text-black" htmlFor="">Date Expiration</label>
            <input
              type="date"
              id="dateexpi"
              name="dateexpi"
              value={formData.dateexpi || ""}
              onChange={handleInputChange}
              placeholder="Date expiration"
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            />
          </div>
          <PriceUnitForm onChange={setPriceUnitFields} charge={charge} />
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows="2"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 p-1 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              placeholder="Description"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
          >
            Ajouter le Produit
          </button>
        </div>
      </form>


    </div>
  );
}

export default AjoutProduit;
