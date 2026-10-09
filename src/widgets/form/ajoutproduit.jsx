import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
    prix_achat: "",
    taxation: "",
    dateexpi: "",
    quantite_stock: "",
    description: "",
    acceptdoublons: 0,
    image: "",
  });

  const [produitsExistants, setProduitsExistants] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [categorie, setcategorie] = useState([]);

  const [unit, setunit] = useState([]);

  // pour categorie

  const [filteredCategorie, setFilteredCategorie] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState(null); // Stocke la categorie sélectionné
  const [isDropdownOpenCategorie, setIsDropdownOpenCategorie] = useState(false); // Contrôle l'ouverture de la liste déroulante

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

  // Appel de fetchcategories lors du chargement du composant
  useEffect(() => {
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
          setFilteredCategorie(data);
        } else {
          console.error("Erreur lors de la récupération des categories:", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };
    fetchcategories();
  }, []);

  // filtrred categorie

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "categorie_id") {
      setSelectedCategorie(null); // Réinitialiser le produit sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpenCategorie(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filtered = categorie.filter(
        (categories) =>
          categories.nom.toLowerCase().includes(value.toLowerCase()) ||
          (categories.code_barre &&
            categories.code_barre.toLowerCase().includes(value.toLowerCase())),
      );

      setFilteredCategorie(filtered);
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleCategorieSelect = (categorie) => {
    setSelectedCategorie(categorie); // Enregistrer le produit sélectionné
    setFormData((prev) => ({ ...prev, categorie_id: categorie.id })); // Enregistrer l'ID du produit
    setIsDropdownOpenCategorie(false); // Fermer la liste déroulante
  };

  // const handleInputChange = (e) => {
  // const { name, value } = e.target;
  // setFormData((prevData) => ({ ...prevData, [name]: value }));
  // };

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
          Authorization: `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify(formData), // Données du formulaire à envoyer
      });

      if (response.ok) {
        const data = await response.json();
        if (data.existe === 1) {
          // Si le produit existe déjà, stocker les produits existants et afficher le modal
          setProduitsExistants(data.produits);
          setShowModal(true);
          return;
        }
        const produitId = data.id; // Supposons que l'ID du produit est retourné

        toast.success("Produit ajouté avec succès !", { autoClose: 600 });
        console.log("Produit ajouté:", data);

        if (formData.quantite_stock) {
          // Vérifie si quantite_stock est renseigné
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
              Authorization: `Bearer ${token}`,
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

        // Étape 2: Envoi des données PriceUnitForm vers la table `supplement`
        if (priceUnitFields.length > 0) {
          const supplementData = priceUnitFields.map((item) => ({
            produit_id: produitId, // Associer le produit
            prix: item.prix,
            unit: item.unit,
          }));
          console.log(supplementData);
          const supplementResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/supplement/create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ supplements: supplementData }),
            },
          );

          if (supplementResponse.ok) {
            toast.success("Supplements enregistrés avec succès !", { autoClose: 600 });
            console.log("Supplements enregistrés avec succès !");
          } else {
            toast.error("Erreur lors de l'enregistrement des supplements.");
            console.error("Erreur lors de l'enregistrement des supplements");
          }
        }

        // Réinitialiser le formulaire
        setFormData({
          code_barre: "",
          nom: "",
          categorie_id: "",
          prix: "",
          prix_achat: "",
          taxation: "",
          dateexpi: "",
          quantite_stock: "",
          description: "",
          acceptdoublons: "",
          image: "",
        });
        setSelectedCategorie(null);
        setFilteredCategorie(categorie);
        setPriceUnitFields([]); // Réinitialiser les champs du formulaire PriceUnitForm
        setcharge(true);
      } else {
        toast.error("Échec de l'ajout du produit.Ce produit pourrait etre déja enregistré");
        console.error("Erreur:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Erreur:", error);
    }
  };

  const genererCodeUnique = () => {
    const timestamp = Date.now(); // Nombre de millisecondes depuis 1970
    const codeUnique = `AH${timestamp.toString().slice(-8)}`; // On prend les 8 derniers chiffres
    setFormData({ ...formData, code_barre: codeUnique });
  };

  //confirmer ajout

  const confirmerAjout = async () => {
    setShowModal(false);
    setFormData({ ...formData, acceptdoublons: 1 });

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");

      // Étape 1: Enregistrement du produit
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, acceptdoublons: 1 }),
      });

      if (response.ok) {
        const data = await response.json();
        const produitId = data.id; // Supposons que l'ID du produit est retourné

        toast.success("Produit ajouté avec succès !", { autoClose: 600 });
        console.log("Produit ajouté:", data);

        // Étape 2: Vérifier et enregistrer la quantité de stock
        if (formData.quantite_stock) {
          const stockData = {
            produit_id: produitId,
            quantite_stock: formData.quantite_stock,
          };

          const stockResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(stockData),
          });

          if (stockResponse.ok) {
            toast.success("Stock enregistré avec succès !", { autoClose: 600 });
            console.log("Stock enregistré !");
          } else {
            toast.error("Erreur lors de l'enregistrement du stock.");
            console.error("Erreur stock:", stockResponse.statusText);
          }
        } else {
          toast.warning("Veuillez renseigner la quantité en stock.");
        }

        // Étape 3: Enregistrement des supplements (PriceUnitForm)
        if (priceUnitFields.length > 0) {
          const supplementData = priceUnitFields.map((item) => ({
            produit_id: produitId,
            prix: item.prix,
            unit: item.unit,
          }));

          const supplementResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/supplement/create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ supplements: supplementData }),
            },
          );

          if (supplementResponse.ok) {
            toast.success("Supplements enregistrés avec succès !", { autoClose: 600 });
            console.log("Supplements enregistrés !");
          } else {
            toast.error("Erreur lors de l'enregistrement des supplements.");
            console.error("Erreur supplements:", supplementResponse.statusText);
          }
        }

        // Réinitialiser le formulaire
        setFormData({
          code_barre: "",
          nom: "",
          categorie_id: "",
          prix: "",
          prix_achat: "",
          taxation: "",
          dateexpi: "",
          quantite_stock: "",
          description: "",
          acceptdoublons: "",
          image: "",
        });
        setSelectedCategorie(null);
        setFilteredCategorie(categorie);
        setPriceUnitFields([]);
        setcharge(true);
      } else {
        toast.error("Échec de l'ajout du produit. Ce produit pourrait être déjà enregistré.");
        console.error("Erreur produit:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Erreur:", error);
    }
  };

  const uploaderImage = async (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("image", fichier);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erreur || "Échec de l'upload");
      setFormData((prev) => ({ ...prev, image: data.image }));
      toast.success("Image téléversée !");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className=" w-full ">
      {/* <form className="w-full " onSubmit={handleSubmit}>

 <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-100 pb-5"><div className="min-w-0">
<h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">Ajouter un Produit</h2>
 <p className="mt-1.5 text-[13px] text-ink-500">Remplissez les détails du produit à ajouter.</p>
</div><button
 type="button"
 onClick={handleformclick}
 aria-label="Fermer"
 className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
 </svg>
 </button></div>

 <div className="mt-5 grid grid-cols-1 gap-4">
 <div>
 <label htmlFor="code_barre" className="lg-label">
 Code barre
 </label>
 <input
 required
 type="text"
 name="code_barre"
 id="code_barre"
 value={formData.code_barre}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="Ex: 123456789"
 />
 </div>

 <div>
 <label htmlFor="nom" className="lg-label">
 Nom du Produit
 </label>
 <input
 type="text"
 name="nom"
 required
 id="nom"
 value={formData.nom}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="Ex: Jus d'orange"
 />
 </div>

 <div>
 <label htmlFor="categorie_id" className="lg-label">
 Catégorie
 </label>
 <select
 id="categorie_id"
 name="categorie_id"
 required
 value={formData.categorie_id}
 onChange={handleInputChange}
 className="lg-input"
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
 <label htmlFor="price" className="lg-label">
 Prix
 </label>
 <input
 type="number"
 name="prix"
 required
 id="prix"
 value={formData.prix}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="0.00"
 />
 </div>

 <div>
 <label htmlFor="price" className="lg-label">
 Prix Achat
 </label>
 <input
 type="number"
 name="prix_achat"
 required
 id="prix_achat"
 value={formData.prix_achat}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="0.00"
 />
 </div>

 <div>
 <label htmlFor="categorie_id" className="lg-label">
 Taxation
 </label>
 <select
 id="taxation"
 name="taxation"
 required
 value={formData.taxation}
 onChange={(e) => setFormData({ ...formData, taxation: e.target.value })}
 className="lg-input"
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
 <label htmlFor="price" className="lg-label">
 Quantité Stock
 </label>
 <input
 type="number"
 name="quantite_stock"
 required
 id="quantite_stock"
 value={formData.quantite_stock}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="100"
 />
 </div>

 <div>
 <label className="text-ink-800" htmlFor="">Date Expiration</label>
 <input
 type="date"
 id="dateexpi"
 name="dateexpi"
 value={formData.dateexpi || ""}
 onChange={handleInputChange}
 placeholder="Date expiration"
 className="lg-input"
 />
 </div>
 <PriceUnitForm onChange={setPriceUnitFields} charge={charge} />
 <div>
 <label htmlFor="description" className="lg-label">
 Description
 </label>
 <textarea
 name="description"
 id="description"
 required
 rows="2"
 value={formData.description}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="Description"
 />
 </div>
 </div>

 <div className="mt-6">
 <button
 type="submit"
 className="lg-btn-primary lg-btn-lg w-full"
 >
 Ajouter le Produit
 </button>
 </div>
 </form> */}
      <form className="w-full max-w-6xl mx-auto" onSubmit={handleSubmit}>
        <div className="border-b border-ink-100 pb-5">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
            Ajouter un Produit
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-500">
            Remplissez les détails du produit à ajouter.
          </p>
        </div>

        {/* Grid pour afficher 2 champs par ligne */}
        <div className="mt-5 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {/* <div>
 <label htmlFor="code_barre" className="lg-label">
 Code barre
 </label>
 <input
 required
 type="text"
 name="code_barre"
 id="code_barre"
 value={formData.code_barre}
 onChange={handleInputChange}
 className="lg-input"
 placeholder="Ex: 123456789"
 />
 </div> */}

          <div className="flex items-center gap-2">
            <div className="w-full">
              <label htmlFor="code_barre" className="lg-label">
                Code barre
              </label>
              <input
                required
                type="text"
                name="code_barre"
                id="code_barre"
                value={formData.code_barre}
                onChange={handleInputChange}
                className="lg-input"
                placeholder="Ex: 123456789"
              />
            </div>

            {/* Bouton pour générer le code */}
            <button
              type="button"
              onClick={genererCodeUnique}
              className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
            >
              Générer
            </button>
          </div>

          <div>
            <label htmlFor="nom" className="lg-label">
              Nom du Produit
            </label>
            <input
              type="text"
              name="nom"
              required
              id="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="Ex: Jus d'orange"
            />
          </div>

          {/* <div>
 <label htmlFor="categorie_id" className="lg-label">
 Catégorie
 </label>
 <select
 id="categorie_id"
 name="categorie_id"
 required
 value={formData.categorie_id}
 onChange={handleInputChange}
 className="lg-input"
 >
 <option value="">Sélectionnez une catégorie</option>
 {categorie.map((categorie) => (
 <option key={categorie.id} value={categorie.id}>
 {categorie.nom}
 </option>
 ))}
 </select>
 </div> */}
          <div>
            <label htmlFor="produit_id" className="lg-label">
              Categorie
            </label>
            <input
              type="text"
              id="categorie_id"
              name="categorie_id"
              value={selectedCategorie ? selectedCategorie.nom : formData.categorie_id}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpenCategorie(true)} // Ouvrir la liste déroulante
              placeholder="Rechercher votre categorie"
              className="lg-input"
            />
            {isDropdownOpenCategorie && (
              <ul className="mt-2 max-h-40 overflow-auto rounded-xl border border-ink-200 bg-white p-2">
                {filteredCategorie.map((categorie) => (
                  <li
                    key={categorie.id}
                    onClick={() => handleCategorieSelect(categorie)}
                    className="lg-btn-neutral cursor-pointer"
                  >
                    {categorie.nom}
                  </li>
                ))}
                {filteredCategorie.length === 0 && (
                  <li className="text-[13px] text-ink-500">Aucune categorie trouvé</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="prix" className="lg-label">
              Prix de l'unité
            </label>
            <input
              type="number"
              name="prix"
              required
              id="prix"
              value={formData.prix}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="0.00"
            />
          </div>

          <PriceUnitForm onChange={setPriceUnitFields} charge={charge} />

          <div>
            <label htmlFor="prix_achat" className="lg-label">
              Prix Achat
            </label>
            <input
              type="number"
              name="prix_achat"
              required
              id="prix_achat"
              value={formData.prix_achat}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="taxation" className="lg-label">
              Taxation
            </label>
            <select
              id="taxation"
              name="taxation"
              required
              value={formData.taxation}
              onChange={(e) => setFormData({ ...formData, taxation: e.target.value })}
              className="lg-input"
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

          <div>
            <label htmlFor="quantite_stock" className="lg-label">
              Quantité Stock
            </label>
            <input
              type="number"
              name="quantite_stock"
              required
              id="quantite_stock"
              value={formData.quantite_stock}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="100"
            />
          </div>

          <div>
            <label className="text-ink-800" htmlFor="dateexpi">
              Date Expiration
            </label>
            <input
              type="date"
              id="dateexpi"
              name="dateexpi"
              value={formData.dateexpi || ""}
              onChange={handleInputChange}
              placeholder="Date expiration"
              className="lg-input"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="description" className="lg-label">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows="2"
              value={formData.description}
              onChange={handleInputChange}
              className="lg-input"
              placeholder="Description"
            />
          </div>

          {/* Photo du produit */}
          <div className="col-span-2">
            <label className="lg-label">Photo du produit</label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <img
                  src={`${import.meta.env.VITE_API_URL}/${formData.image}`}
                  alt="Photo"
                  className="mb-2 h-24 w-24 rounded-xl object-cover"
                />
              )}
              <input type="file" accept="image/*" onChange={uploaderImage} className="lg-input" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="lg-btn-primary lg-btn-lg w-full">
            Ajouter le Produit
          </button>
        </div>
      </form>

      {/* Modal affiche */}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg">
            <h2 className="text-xl font-bold text-ink-800 mb-4">Produits existants</h2>

            <table className="w-full border-collapse border border-ink-200">
              <thead>
                <tr className="bg-ink-100">
                  <th className="rounded-xl border border-ink-200 p-2">Nom</th>
                  <th className="rounded-xl border border-ink-200 p-2">Prix</th>
                  <th className="rounded-xl border border-ink-200 p-2">Code Barre</th>
                </tr>
              </thead>
              <tbody>
                {produitsExistants.map((produit) => (
                  <tr key={produit.id}>
                    <td className="rounded-xl border border-ink-200 p-2">{produit.nom}</td>
                    <td className="rounded-xl border border-ink-200 p-2">{produit.prix} FCFA</td>
                    <td className="rounded-xl border border-ink-200 p-2">{produit.code_barre}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <button onClick={() => setShowModal(false)} className="lg-btn-neutral mr-4">
                Annuler
              </button>
              <button
                onClick={confirmerAjout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Confirmer l'ajout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AjoutProduit;
