import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
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
                (product.code_barre && product.code_barre.toLowerCase().includes(value.toLowerCase()))
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
        toast.success("Stock ajouté avec succès !",{ autoClose: 600 });
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
          className="text-xl rounded-full text-black w-6 h-6 bg-white-700 border-3 border-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form className="w-full" onSubmit={handleSubmit}>
        <ToastContainer position="top-right" autoClose={5000} />

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ajouter un stock</h2>
          <p className="mt-2 text-sm text-gray-500">
            Remplissez les détails du stock à ajouter.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="produit_id" className="block text-sm font-semibold text-gray-700">
              Produit
            </label>
            <input
              type="text"
              id="produit_id"
              name="produit_id"
              value={selectedProduct ? selectedProduct.nom : formData.produit_id }
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpen(true)} // Ouvrir la liste déroulante
              placeholder="Rechercher un produit"
              className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            />
            {isDropdownOpen && (
              <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    {product.nom}
                  </li>
                ))}
                {filteredProducts.length === 0 && (
                  <li className="p-2 text-gray-500">Aucun produit trouvé</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="quantite_stock" className="block text-sm font-semibold text-gray-700">
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
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
          >
            Ajouter le stock
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjoutStock;
