// Composant Produit
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import Modal from "@/widgets/modal/modal";
import Toastadd from "@/widgets/toast/toastadd";
import { Link } from "react-router-dom";
import { useProductStore } from "@/widgets/store/useproductstore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FacturePreview from "@/widgets/facture/facturepreview"; // Composant de prévisualisation
import { format } from "prettier";
import axios from "axios";
import FacturePrevieww from "@/widgets/facture/factureprevieww";
export function Vendre() {
  const setProductsstore = useProductStore((state) => state.setProductsstore); // Récupération de la méthode `setProducts` du store
  const productsstore = useProductStore((state) => state.productsstore); // Récupération des produits du store

  console.log('voila productstore'.productsstore);
  // État pour stocker les produits ajoutés
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fonction pour ajouter un produit
  const handleAddProduct = (product) => {
    // Ajouter seulement si le produit n'est pas déjà dans la liste
    if (!selectedProducts.some((p) => p.code_barre === product.code_barre)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1, unit: "Sachet(s)" }]);
    }
    setProductsstore([]);
  // Appeler fetchStockValue en passant l'ID du produit
  console.log(product.id)
  fetchStockValue(product.id);
  };



const fetchStockValue = async (id) => {
  try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/stock/valeur`,
          { id },
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );

      const { quantite_stock, quantite_vendue, stock_restant } = response.data;

      if (stock_restant < -1) {
        alert("Votre stock est épuisé, veuillez recharger avant de vendre.");
      }
      // Si le stock est positif mais inférieur à 20
      else if (stock_restant > 0 && stock_restant < 20) {
        alert(`Votre stock est presque épuisé. Il vous reste ${stock_restant} en stock.`);
      }
      // Si le stock est suffisant (> 20), pas de message

  } catch (error) {
      console.error("Erreur lors de la récupération des données de stock :", error);
  }
};


  // Fonction pour supprimer un produit de la liste sélectionnée
  const handleRemoveProduct = (codeBarre) => {
    setSelectedProducts(selectedProducts.filter((p) => p.code_barre !== codeBarre));
  };

  // // Fonction pour mettre à jour les quantités ou unités
  // const handleUpdateProduct = (codeBarre, field, value) => {
  //   setSelectedProducts((prev) =>
  //     prev.map((p) =>
  //       p.code_barre === codeBarre ? { ...p, [field]: value } : p
  //     )
  //   );
  // };


  const handleUpdateProduct = (codeBarre, field, value) => {
    setSelectedProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.code_barre === codeBarre) {
          console.log("Produit sélectionné :", product);
          console.log("Supplements disponibles :", product.supplements);
  
          if (field === 'unit') {
            const selectedSupplement = product.supplements.find(supp => supp.unit === value);
            console.log("Supplement sélectionné :", selectedSupplement);
  
            const updatedPrice = selectedSupplement ? selectedSupplement.prix : product.prix;
            return { ...product, unit: value, prix: updatedPrice }; 
          } else {
            return { ...product, [field]: value };
          }
        }
        return product;
      })
    );
  };

  useEffect(() => {
    console.log("Produits mis à jour :", selectedProducts);
  }, [selectedProducts]);
  
  

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewOpen2, setIsPreviewOpen2] = useState(false);
  const [products, setProducts] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  const [toast, setToast] = useState(false);
  const rep = "Enregistrement effectué avec succès";

  const [formData, setFormData] = useState({
    client: "",
    remise: "",
    format: "Ticket",
  });

  const handlePreview = () => {
    setIsPreviewOpen(true); // Ouvrir la prévisualisation
  };

  const handlePreview2 = () => {
    setIsPreviewOpen2(true); // Ouvrir la prévisualisation
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "client") {
      setSelectedclient(null); // Réinitialiser le client sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpen(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filtered = client.filter(
        (client) =>
          client.nom.toLowerCase().includes(value.toLowerCase()) ||
          (client.prenom && client.prenom.toLowerCase().includes(value.toLowerCase()))
      );

      setFilteredclient(filtered);
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Ajouter le token dans l'en-tête Authorization
        },
        body: JSON.stringify(formData), // Données du formulaire à envoyer
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("stock ajouté avec succès !");
        console.log("Response data:", data);
        // Réinitialise les champs du formulaire après la soumission
        setFormData({
          client: "",
          remise: ""
        });

      } else {
        toast.error("Échec de l'ajout du stock.");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
      console.error("Error:", error);
    }
  };



  // Gestion des menus actifs
  const handleClick = (id) => {
    setMenuActif(menuActif === id ? null : id);
  };

  const handletoast = () => {
    setToast(true);
  };

  const handletabs = (id) => {
    <Tabs idproduit={id} />
  }

  const [client, setclient] = useState([]);
  const [filteredclient, setFilteredclient] = useState([]);
  const [selectedclient, setSelectedclient] = useState(null); // Stocke le client sélectionné
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Contrôle l'ouverture de la liste déroulante
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement

  const handleclientSelect = (client) => {
    setSelectedclient(client); // Enregistrer le client sélectionné
    setFormData((prev) => ({ ...prev, client: client.id })); // Enregistrer l'ID du client
    setIsDropdownOpen(false); // Fermer la liste déroulante
  };

  // Fetch all client on mount
  useEffect(() => {
    const fetchclients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/client/listall`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setclient(data);
          setFilteredclient(data); // Initialize filteredProducts
        } else {
          console.error("Erreur lors de la récupération des produits:", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };

    fetchclients();
  }, []);


  // Fonction pour récupérer les produits
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
        console.log(productrecherche);
      } else {
        console.error("Erreur lors de la récupération des produits:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  };

  // Fonction pour récupérer les clients
  const fetchclient = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/client/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setclient(data);
      } else {
        console.error("Erreur lors de la récupération des produits:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  // Fonction pour supprimer un produit de la liste
  const removeProduct = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  // Appel de fetchProducts lors du chargement du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  // Appel de fetchclients lors du chargement du composant
  useEffect(() => {
    fetchclient();
  }, []);

  const displayproducts = productsstore.length > 0 ? productsstore : products;


  return (
    <div className="mt-12 mb-8 sm:flex justify-between ">
        <ToastContainer position="top-right" autoClose={5000} />
      <div className="w-full  bg-blue-gray-50 rounded-xl sm:w-7/12">
        <Card className="h-[800px] m-4">
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <div className="flex justify-between items-center">
              <span className="font-bold">Produit</span>
              <span><Modal handletoast={handletoast} /></span>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto  overflow-y-auto px-0 pt-0 pb-2">
            {/* Tableau des produits disponibles */}
             {/* Affichage de l'animation si les données sont en cours de chargement */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <img src=" /image/loading.png" alt="Chargement..." className="w-24 h-24 animate-spin" />
              
            </div>
          ) : (
            <table className="w-full min-w-[500px] table-auto mb-8">
              <thead>
                <tr>
                  {["Nom", "Prix", "Code Barre", "Ajouter"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-black">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayproducts.map((product, key) => {
                  const className = `py-3 px-5 ${key === displayproducts.length - 1 ? "" : "border-b  border-blue-gray-50"
                    }`;
                  return (
                    <tr key={product.code_barre}>
                      <td className={className}>
                        <Link to={`/detailproduit?id=${product.id}`}>
                          <Typography variant="small" color="blue-gray">
                            {product.nom}
                          </Typography>
                        </Link>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray">{product.prix}</Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray">{product.code_barre}</Typography>
                      </td>
                      <td className={className}>
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          className="w-[30px] h-[30px] bg-blue-700 text-white rounded-md flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="4"
                            stroke="currentColor"
                            className="size-3 fo"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </CardBody>
        </Card>
      </div>
      <div className="w-full p-3 mt-10 sm:w-5/12">
        <Card className="max-h-[600px]">
          <div>
            <form className="w-full p-8 " onSubmit={handleSubmit}>
              <ToastContainer position="top-right" autoClose={5000} />


              <div className="mt-6 grid grid-cols-2 gap-6">

                <div>
                  <label htmlFor="client" className="block text-sm font-semibold text-gray-700">
                    Client
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={selectedclient ? selectedclient.nom : formData.client}
                    onChange={handleInputChange}
                    onFocus={() => setIsDropdownOpen(true)} // Ouvrir la liste déroulante
                    placeholder="Rechercher un client"
                    className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
                  />
                  {isDropdownOpen && (
                    <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white">
                      {filteredclient.map((client) => (
                        <li
                          key={client.id}
                          onClick={() => handleclientSelect(client)}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                        >
                          {client.nom}
                        </li>
                      ))}
                      {filteredclient.length === 0 && (
                        <li className="p-2 text-gray-500">Aucun client trouvé</li>
                      )}
                    </ul>
                  )}
                </div>

                <div>
                  <label htmlFor="remise" className="block text-sm font-semibold text-gray-700">
                    Remise
                  </label>
                  <input
                    type="text"
                    name="remise"
                    required
                    id="remise"
                    value={formData.remise}
                    onChange={handleInputChange}
                    className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
                    placeholder="0.00"
                  />
                </div>


                <div>
                  <label htmlFor="format" className="block text-sm font-semibold text-gray-700">
                    Format
                  </label>
                  <select
                    id="format"
                    name="format"
                    required
                    value={formData.format}
                    onChange={handleInputChange}
                    className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
                  >
                    <option>Ticket</option>
                    <option>A4</option>
                    <option>A3</option>
                  </select>
                </div>
              </div>

            </form>
          </div>
          <CardBody className="overflow-x-auto  overflow-y-auto px-0 pt-0 pb-2">
            {/* Tableau des produits ajoutés */}
            <table className="w-full min-w-[500px] table-auto">
              <thead>
                <tr>
                  {["", "Nom", "Prix", "Quantité", "Unités", ""].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((product, key) => {
                  const className = `py-3 px-5 ${key === selectedProducts.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;
                  return (
                    <tr key={product.code_barre}>
                      <td className={className}>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.code_barre)}
                          className="w-4 text-blue-600 rounded-full flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931ZM16.862 4.487 19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-bold">{product.nom}</Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-bold">{product.prix}</Typography>
                      </td>
                      <td className={className}>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) =>
                            handleUpdateProduct(product.code_barre, "quantity", e.target.value)
                          }
                          className="mt-1 text-center p-2 block h-8 w-14 rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
                          placeholder="1"
                        />
                      </td>
                      <td className={className}>
                        <select
                          value={product.unit}
                          onChange={(e) =>
                            handleUpdateProduct(product.code_barre, "unit", e.target.value)
                          }
                          className="mt-1 w-15 p-2 block rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 w-min-[100px]"
                        >
                          <option value="">Par defaut</option>
                          {product.supplements.map((supplement) => (
                            <option key={supplement.id} value={supplement.unit}>
                              {supplement.unit}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className={className}>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.code_barre)} // Suppression basée sur le code_barre
                          className="w-4 text-red-600 rounded-full flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="text-sm"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
          <div className="flex justify-between items-center">
            {/* Bouton gauche */}
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center space-x-2 m-2 p-2 bg-blue-600 text-white font-bold rounded-md"
            >
              <span>Details Facture</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handlePreview2}
              className="flex items-center space-x-2 m-2 p-2 bg-orange-600 text-white font-bold rounded-md"
            >
              <span>Details Facture simple</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
            </button>

            {/* Prévisualisation de la facture */}
            {isPreviewOpen && (
              <FacturePreview
                formData={formData}
                selectedProducts={selectedProducts}
                onClose={() => setIsPreviewOpen(false)}
              />
            )}
            {isPreviewOpen2 && (
              <FacturePrevieww
                formData={formData}
                selectedProducts={selectedProducts}
                onClose={() => setIsPreviewOpen2(false)}
              />
            )}

            {/* Bouton droit */}
            <button
              type="button"
              onClick={() => { window.location.reload() }}
              className="flex items-center space-x-2 m-2 p-2 bg-red-600 text-white font-bold rounded-md"
            >
              <span>Rafraichir</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
            </button>
          </div>


        </Card>
      </div>
      {toast && <Toastadd reponse={rep} />}
    </div>
  );
}

export default Vendre;
