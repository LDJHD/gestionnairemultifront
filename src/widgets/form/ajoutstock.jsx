import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function AjoutStock({ handleformclick }) {
  const [formData, setFormData] = useState({
    produit_id: "",
    quantite_stock: "",
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Stocke le produit sélectionné
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Contrôle l'ouverture de la liste déroulante

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/listall`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data); // Initialize filteredProducts
        } else {
          console.error("Erreur lors de la récupération des produits:", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "produit_id") {
      setSelectedProduct(null); // Réinitialiser le produit sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpen(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filtered = products.filter(
        (product) =>
          product.nom.toLowerCase().includes(value.toLowerCase()) ||
          (product.code_barre && product.code_barre.toLowerCase().includes(value.toLowerCase())),
      );

      setFilteredProducts(filtered);
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product); // Enregistrer le produit sélectionné
    setFormData((prev) => ({ ...prev, produit_id: product.id })); // Enregistrer l'ID du produit
    setIsDropdownOpen(false); // Fermer la liste déroulante
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Stock ajouté avec succès !", { autoClose: 600 });
        console.log("Response data:", data);

        // Reset form fields after submission
        setFormData({
          produit_id: "",
          quantite_stock: "",
        });
        setSelectedProduct(null); // Réinitialiser le produit sélectionné
      } else {
        toast.error("Échec de l'ajout du stock.");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full mx-auto rounded-lg p-6">
      <div className="flex justify-end">
        <button
          onClick={handleformclick}
          className="text-xl rounded-full text-ink-800 h-6 w-6 bg-white border border-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="border-b border-ink-100 pb-5">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
            Ajouter un stock
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-500">
            Remplissez les détails du stock à ajouter.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="produit_id" className="lg-label">
              Produit
            </label>
            <input
              type="text"
              id="produit_id"
              name="produit_id"
              value={selectedProduct ? selectedProduct.nom : formData.produit_id}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpen(true)} // Ouvrir la liste déroulante
              placeholder="Rechercher un produit"
              className="lg-input"
            />
            {isDropdownOpen && (
              <ul className="mt-2 max-h-40 overflow-auto rounded-xl border border-ink-200 bg-white p-2">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="lg-btn-neutral cursor-pointer"
                  >
                    {product.nom}
                  </li>
                ))}
                {filteredProducts.length === 0 && (
                  <li className="text-[13px] text-ink-500">Aucun produit trouvé</li>
                )}
              </ul>
            )}
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
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="lg-btn-primary lg-btn-lg w-full">
            Ajouter le stock
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjoutStock;
