import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { TrashIcon } from "@heroicons/react/24/solid";
import Swal from 'sweetalert2'

export function ModifieProduit({ ProductId, handleformclick }) {
  const [formData, setFormData] = useState({
    code_barre: "",
    nom: "",
    categorie_id: "",
    prix: "",
    prix_achat: "",
    taxation: "",
    dateexpi: "",
    description: "",
  });

  const [supplements, setSupplements] = useState([]);
  const [categorie, setcategorie] = useState([]);
  const [fields, setFields] = useState([]); // Initialement, pas de champ dynamique

  const [unit, setunit] = useState([]);


  // Fonction pour récupérer les categories
  const fetchunit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/unit/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setunit(data);
      } else {
        console.error("Erreur lors de la récupération des categories:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };



  // Appel de fetchcategories lors du chargement du composant
  useEffect(() => {
    fetchunit();
  }, []);


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

  const fetchProductDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/produit/detailById`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const product = response.data;
      setFormData({
        code_barre: product.produit.code_barre || "",
        nom: product.produit.nom || "",
        categorie_id: product.produit.categorie_id || "",
        prix: product.produit.prix || "",
        prix_achat: product.produit.prix_achat || "",
        taxation: product.produit.taxation || "",
        dateexpi: product.produit.dateexpi ? product.produit.dateexpi.split("T")[0] : "",
        description: product.produit.description || "",
      });

      setSupplements(product.supplements || []);
  
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };

  useEffect(() => {
    if (ProductId) {
      fetchProductDetails(ProductId);
    }
  }, [ProductId]);

  // const handleInputChange = (index, field, value) => {
  //   setSupplements((prevSupplements) =>
  //     prevSupplements.map((supplement, i) =>
  //       i === index ? { ...supplement, [field]: value } : supplement
  //     )
  //   );
  // };

  const handleInputChange = (index, field, value) => {
    setSupplements((prevSupplements) =>
      prevSupplements.map((supplement, i) =>
        i === index ? { ...supplement, [field]: value, unit_id: value } : supplement
      )
    );
  };

  const handleRemoveSupplement = (index, id) => {
    setSupplements((prevSupplements) => prevSupplements.filter((_, i) => i !== index));


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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/supplement/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });

          if (response.ok) {
            console.log("Réponse du serveur :", response);
            swalWithTailwindButtons.fire({
              title: "Supprimé !",
              text: "La suppression a été effectuée avec succès.",
              icon: "success",
            });
          } else {
            // Ce bloc ne devrait jamais être atteint si response.ok est true
            const errorData = await response.json();
            console.error("Erreur lors de la suppression :", errorData);
            swalWithTailwindButtons.fire({
              title: "Erreur",
              text: errorData.erreur || "La suppression a échoué.",
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

  const handleAddField = () => {
    setSupplements((prevSupplements) => [
      ...prevSupplements,
      { unit: "", prix: "" }, // Nouveau champ vide
    ]);
  };

  const updateSupplements = async () => {
    const token = localStorage.getItem("token");

    // Tu passes une nouvelle structure d'objet sans l'ID pour les nouveaux champs
    await Promise.all(supplements.map(async (supplement) => {
      try {
        // Tu vérifies si le supplément a un ID ou non
        const dataToSend = supplement.id
        ? { ...supplement, unit: supplement.unit_id } // Si l'ID existe, unit prend la valeur de unit_id
        : { ...supplement, produit_id: ProductId }; // Sinon, on garde unit tel quel
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/supplement/update`,
          dataToSend,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );



      } catch (error) {
        if (error.response && error.response.data && error.response.data.erreur) {
          // Si le backend renvoie un message d'erreur, on l'affiche dans un toast
          toast.error(error.response.data.erreur); // Utilise la méthode toast pour afficher l'erreur
        } else {
          // Si aucune erreur spécifique n'est fournie, on affiche une erreur générique
          toast.error("Une erreur est survenue lors de la mise à jour");
        }
        console.error("Erreur lors de la mise à jour du supplément :", error);
      }
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/produit/updateProduit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            id: ProductId,
          }),
        }
      );

      if (response.ok) {
        await updateSupplements();
        toast.success("Produit mis à jour avec succès !", { autoClose: 600 });
      } else {
        toast.error("Échec de la mise à jour du produit.");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="w-full z-50 mx-auto rounded-lg p-6">
      <div className="flex justify-end">
        <button onClick={handleformclick} className="text-xl rounded-full text-black w-6 h-6 bg-white border-3 border-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* <form className="w-full" onSubmit={handleSubmit}>
        <ToastContainer position="top-right" autoClose={5000} />
        <h2 className="text-2xl font-bold">Modifier un Produit</h2>
        <div className="grid grid-cols-1 gap-4">
        <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Code barre
            </label>
          <input
            type="text"
            name="code_barre"
            value={formData.code_barre}
            onChange={(e) => setFormData({ ...formData, code_barre: e.target.value })}
            placeholder="Code barre"
            className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
          />
          </div>
          <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Nom
            </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Nom"
            className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
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
              onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
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
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Prix
            </label>
          <input
            type="number"
            name="prix"
            value={formData.prix}
            onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
            placeholder="Prix"
            className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
          />
          </div>
  <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Prix d'achat
            </label>
          <input
            type="number"
            name="prix_achat"
            required
            value={formData.prix_achat}
            onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
            placeholder="Prix Achat"
            className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
          />
          </div>

          <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Taxation
            </label>
            <select
              id="taxation"
              name="taxation"
              required
              value={formData.taxation}
              onChange={(e) => setFormData({ ...formData, taxation: e.target.value })}
              className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            >
              <option value="">Sélectionnez une taxation</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>E</option>
            </select>
          </div>
          <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Date d'expiration
            </label>
          <input
            type="date"
            name="dateexpi"
            value={formData.dateexpi}
            onChange={(e) => setFormData({ ...formData, dateexpi: e.target.value })}
            placeholder=""
            className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
          />
           </div>
           <div>
            <label htmlFor="categorie_id" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
          />
           </div>
        </div>

        <h3 className="text-lg font-bold mt-4">Suppléments</h3>
        {supplements.map((supplement, index) => (
          <div key={index} className="flex w-full space-x-4 mt-2">
            <select
              name="unit"
              value={supplement.unit}
              onChange={(e) => handleInputChange(index, "unit", e.target.value)}
              className="p-2 w-full border rounded"
            >
              <option value="">Sélectionner</option>
              {unit.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="prix"
              value={supplement.prix}
              onChange={(e) => handleInputChange(index, "prix", e.target.value)}
              className="p-2 w-full border rounded"
              placeholder="Prix"
            />

            <button type="button"
              onClick={() => handleRemoveSupplement(index, supplement.id)}
              className="bg-red-500 text-white p-2 rounded-full">
              <TrashIcon className="w-6 h-6" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddField}
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg"
        >
          Ajouter un champ
        </button>

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg w-full"
        >
          Mettre à jour le produit
        </button>
      </form> */}

      <form className="w-full z-50" onSubmit={handleSubmit}>
        <ToastContainer position="top-right" autoClose={5000} />
        <h2 className="text-2xl font-bold mb-4">Modifier un Produit</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Code barre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Code barre</label>
            <input
              type="text"
              name="code_barre"
              value={formData.code_barre}
              onChange={(e) => setFormData({ ...formData, code_barre: e.target.value })}
              placeholder="Code barre"
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom"
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Catégorie</label>
            <select
              name="categorie_id"
              required
              value={formData.categorie_id}
              onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categorie.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nom}</option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Prix de l'unité</label>
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              placeholder="Prix"
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            />
          </div>

          {/* Prix d'achat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Prix d'achat</label>
            <input
              type="number"
              name="prix_achat"
              required
              value={formData.prix_achat}
              onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
              placeholder="Prix Achat"
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            />
          </div>

          {/* Taxation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Taxation</label>
            <select
              name="taxation"
              required
              value={formData.taxation}
              onChange={(e) => setFormData({ ...formData, taxation: e.target.value })}
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            >
              <option value="">Sélectionnez une taxation</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>E</option>
              <option>AIBA</option>
              <option>AIBB</option>
            </select>
          </div>

          {/* Date d'expiration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Date d'expiration</label>
            <input
              type="date"
              name="dateexpi"
              value={formData.dateexpi}
              onChange={(e) => setFormData({ ...formData, dateexpi: e.target.value })}
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            />
          </div>

          {/* Description (col-span-2 pour occuper toute la largeur) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              className="mt-1 p-2 block w-full rounded-md border ring-1 ring-black shadow-sm transition duration-300"
            />
          </div>
        </div>

        {/* Suppléments */}
        <h3 className="text-lg font-bold mt-6">Suppléments</h3>
        {supplements.map((supplement, index) => (
          <div key={index} className="flex w-full space-x-4 mt-2">
            <select
              name="unit"
              value={supplement.unit_id}
              onChange={(e) => handleInputChange(index, "unit", e.target.value)}
              className="p-2 w-full border rounded"
            >
              <option >Sélectionner</option>
              {unit.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.nom}</option>
              ))}
            </select>

            <input
              type="number"
              name="prix"
              value={supplement.prix}
              onChange={(e) => handleInputChange(index, "prix", e.target.value)}
              className="p-2 w-full border rounded"
              placeholder="Prix"
            />

            <button type="button"
              onClick={() => handleRemoveSupplement(index, supplement.id)}
              className="bg-red-500 text-white p-2 rounded-full">
              <TrashIcon className="w-6 h-6" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddField}
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg"
        >
          Ajouter un champ
        </button>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg w-full"
        >
          Mettre à jour le produit
        </button>
      </form>

    </div>
  );
}

export default ModifieProduit;