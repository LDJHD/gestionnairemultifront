import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

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
    image: "",
    entree_stock: "",
  });

  const [supplements, setSupplements] = useState([]);
  const [categorie, setcategorie] = useState([]);
  const [fields, setFields] = useState([]); // Initialement, pas de champ dynamique

  const [unit, setunit] = useState([]);
  const [stockActuel, setStockActuel] = useState(null); // Stock total reçu (lecture seule)

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
        },
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
        image: product.produit.image || "",
      });

      setSupplements(product.supplements || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };

  useEffect(() => {
    if (ProductId) {
      fetchProductDetails(ProductId);
      fetchStockActuel(ProductId);
    }
  }, [ProductId]);

  // Stock total reçu du produit (affiché à titre indicatif)
  const fetchStockActuel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/valeur`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        const data = await response.json();
        setStockActuel(Number(data.quantite_stock) || 0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du stock :", error);
    }
  };

  // Téléversement de la photo produit vers l'API, puis stocke le chemin relatif
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

  // const handleInputChange = (index, field, value) => {
  // setSupplements((prevSupplements) =>
  // prevSupplements.map((supplement, i) =>
  // i === index ? { ...supplement, [field]: value } : supplement
  // )
  // );
  // };

  const handleInputChange = (index, field, value) => {
    setSupplements((prevSupplements) =>
      prevSupplements.map((supplement, i) =>
        i === index ? { ...supplement, [field]: value, unit_id: value } : supplement,
      ),
    );
  };

  const handleRemoveSupplement = (index, id) => {
    setSupplements((prevSupplements) => prevSupplements.filter((_, i) => i !== index));

    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-green-800 hover:bg-green-400 text-white font-bold py-2 mx-2 px-4 rounded",
        cancelButton: "bg-red-800 hover:bg-red-200 text-white font-bold py-2 mx-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Êtes-vous sûr ?",
        text: "Vous ne pourrez pas annuler cette action !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimez !",
        cancelButtonText: "Non, annulez !",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/supplement/delete`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id }),
              },
            );

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
    await Promise.all(
      supplements.map(async (supplement) => {
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
            },
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
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/updateProduit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          id: ProductId,
        }),
      });

      if (response.ok) {
        await updateSupplements();
        // Enregistrement de stock : ajout au stock existant
        const entree = Number(formData.entree_stock) || 0;
        if (entree > 0) {
          try {
            const resStock = await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/stock/create`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  produit_id: ProductId,
                  quantite_stock: (stockActuel || 0) + entree,
                }),
              }
            );
            if (resStock.ok) {
              toast.success(`Stock augmenté de ${entree}.`, { autoClose: 600 });
              setStockActuel((stockActuel || 0) + entree);
            } else {
              toast.error("Échec de l'enregistrement du stock.");
            }
          } catch {
            toast.error("Erreur lors de l'enregistrement du stock.");
          }
        }
        toast.success("Produit mis à jour avec succès !", { autoClose: 600 });
      } else {
        toast.error("Échec de la mise à jour du produit.");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="w-full">
      {/* <form className="w-full" onSubmit={handleSubmit}>
 <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">Modifier un Produit</h2>
 <div className="grid grid-cols-1 gap-4">
 <div>
 <label htmlFor="categorie_id" className="lg-label">
 Code barre
 </label>
 <input
 type="text"
 name="code_barre"
 value={formData.code_barre}
 onChange={(e) => setFormData({ ...formData, code_barre: e.target.value })}
 placeholder="Code barre"
 className="lg-input"
 />
 </div>
 <div>
 <label htmlFor="categorie_id" className="lg-label">
 Nom
 </label>
 <input
 type="text"
 name="nom"
 value={formData.nom}
 onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
 placeholder="Nom"
 className="lg-input"
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
 onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
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
 <label htmlFor="categorie_id" className="lg-label">
 Prix
 </label>
 <input
 type="number"
 name="prix"
 value={formData.prix}
 onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
 placeholder="Prix"
 className="lg-input"
 />
 </div>
 <div>
 <label htmlFor="categorie_id" className="lg-label">
 Prix d'achat
 </label>
 <input
 type="number"
 name="prix_achat"
 required
 value={formData.prix_achat}
 onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
 placeholder="Prix Achat"
 className="lg-input"
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
 <label htmlFor="categorie_id" className="lg-label">
 Date d'expiration
 </label>
 <input
 type="date"
 name="dateexpi"
 value={formData.dateexpi}
 onChange={(e) => setFormData({ ...formData, dateexpi: e.target.value })}
 placeholder=""
 className="lg-input"
 />
 </div>
 <div>
 <label htmlFor="categorie_id" className="lg-label">
 Description
 </label>
 <textarea
 name="description"
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="Description"
 className="lg-input"
 />
 </div>
 </div>

 <h3 className="text-lg font-bold mt-4">Suppléments</h3>
 {supplements.map((supplement, index) => (
 <div key={index} className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
 <select
 name="unit"
 value={supplement.unit}
 onChange={(e) => handleInputChange(index, "unit", e.target.value)}
 className="lg-input"
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
 className="lg-input"
 placeholder="Prix"
 />

 <button type="button"
 onClick={() => handleRemoveSupplement(index, supplement.id)}
 className="lg-btn-danger">
 <TrashIcon className="h-6 w-6" />
 </button>
 </div>
 ))}
 <button
 type="button"
 onClick={handleAddField}
 className="lg-btn-primary mt-4"
 >
 Ajouter un champ
 </button>

 <button
 type="submit"
 className="lg-btn-primary mt-4 w-full"
 >
 Mettre à jour le produit
 </button>
 </form> */}

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-100 pb-5">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
            Modifier un Produit
          </h2>
          <button
            type="button"
            onClick={handleformclick}
            aria-label="Fermer"
            className="grid h-8 w-8 flex-none place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Code barre */}
          <div>
            <label className="lg-label">Code barre</label>
            <input
              type="text"
              name="code_barre"
              value={formData.code_barre}
              onChange={(e) => setFormData({ ...formData, code_barre: e.target.value })}
              placeholder="Code barre"
              className="lg-input"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="lg-label">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom"
              className="lg-input"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="lg-label">Catégorie</label>
            <select
              name="categorie_id"
              required
              value={formData.categorie_id}
              onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
              className="lg-input"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categorie.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="lg-label">Prix de l'unité</label>
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              placeholder="Prix"
              className="lg-input"
            />
          </div>

          {/* Prix d'achat */}
          <div>
            <label className="lg-label">Prix d'achat</label>
            <input
              type="number"
              name="prix_achat"
              required
              value={formData.prix_achat}
              onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
              placeholder="Prix Achat"
              className="lg-input"
            />
          </div>

          {/* Taxation */}
          <div>
            <label className="lg-label">Taxation</label>
            <select
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

          {/* Date d'expiration */}
          <div>
            <label className="lg-label">Date d'expiration</label>
            <input
              type="date"
              name="dateexpi"
              value={formData.dateexpi}
              onChange={(e) => setFormData({ ...formData, dateexpi: e.target.value })}
              className="lg-input"
            />
          </div>

          {/* Description (col-span-2 pour occuper toute la largeur) */}
          <div className="col-span-2">
            <label className="lg-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              className="lg-input"
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
              <input
                type="file"
                accept="image/*"
                onChange={uploaderImage}
                className="lg-input"
              />
            </div>
          </div>

          {/* Enregistrement de stock */}
          <div className="col-span-2">
            <label className="lg-label">Enregistrement de stock</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  name="entree_stock"
                  value={formData.entree_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, entree_stock: e.target.value })
                  }
                  placeholder="Quantité à ajouter"
                  className="lg-input"
                />
              </div>
              <p className="text-[12px] text-ink-500">
                Stock actuel :{" "}
                <span className="font-bold text-ink-800 tabular">
                  {stockActuel == null ? "—" : stockActuel}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Suppléments */}
        <h3 className="text-lg font-bold mt-6">Suppléments</h3>
        {supplements.map((supplement, index) => (
          <div key={index} className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              name="unit"
              value={supplement.unit_id}
              onChange={(e) => handleInputChange(index, "unit", e.target.value)}
              className="lg-input"
            >
              <option>Sélectionner</option>
              {unit.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nom}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="prix"
              value={supplement.prix}
              onChange={(e) => handleInputChange(index, "prix", e.target.value)}
              className="lg-input"
              placeholder="Prix"
            />

            <button
              type="button"
              onClick={() => handleRemoveSupplement(index, supplement.id)}
              className="lg-btn-danger"
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddField} className="lg-btn-primary mt-4">
          Ajouter un champ
        </button>

        {/* Bouton de soumission */}
        <button type="submit" className="lg-btn-primary mt-4 w-full">
          Mettre à jour le produit
        </button>
      </form>
    </div>
  );
}

export default ModifieProduit;
