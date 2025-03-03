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
import Droplist from "@/widgets/button/droplist";
import { Link } from "react-router-dom";
import { useProductStore } from "@/widgets/store/useproductstore";
import ProductReminder from "@/widgets/modal/productreminder";

export function Produit() {
    const setProductsstore = useProductStore((state) => state.setProductsstore); // Récupération de la méthode `setProducts` du store
    const productsstore = useProductStore((state) => state.productsstore); // Récupération des produits du store

  const [products, setProducts] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement
  const rep = "Enregistrement effectué avec succès";

  // Gestion des menus actifs
  const handleClick = (id) => {
    console.log(id);
    setMenuActif(menuActif === id ? null : id);
  };

  const handletoast = () => {
    setToast(true);
  };

  const handletabs=(id)=>{
    <Tabs idproduit={id}/>
  }

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
      } else {
        console.error("Erreur lors de la récupération des produits:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  }; 

  // Fonction pour supprimer un produit de la liste
  const removeProduct = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    setProductsstore([]);
    setMenuActif(null);
  };

  // Appel de fetchProducts lors du chargement du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  const displayproducts = productsstore.length > 0 ? productsstore : products;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <ProductReminder products={products} />
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <span className="font-bold">Produit</span>
            <span><Modal handletoast={handletoast} /></span>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Affichage de l'animation si les données sont en cours de chargement */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <img src=" /image/loading.png" alt="Chargement..." className="w-24 h-24 animate-spin" />
              
            </div>
          ) : (
            <table className="w-full min-w-[1000px] table-auto">
              <thead>
                <tr>
                  {["Nom", "Description", "Catégorie", "Prix","Prix Achat","taxation","Date expiration","Code Barre", "Date de création", "Option"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="mb-10">
                {displayproducts.map((product, key) => {
                  const className = `py-3 px-5 ${key === displayproducts.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                  return (
                    <tr key={product.code_barre}>
                      <td className={className}> 
                        <Link to={`/detailproduit?id=${product.id}`}>
                          <Typography variant="small" color="blue-gray" className="font-bold">{product.nom}</Typography>
                        </Link>
                      </td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.description}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.nom_categorie}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.prix}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.prix_achat}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.taxation}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.date_expi}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.code_barre}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.date}</Typography></td>
                      <td className={className}>
                        <Droplist
                          isOpen={menuActif === key}
                          handleClick={handleClick}
                          id={key}
                          idp={product.id} 
                          onDelete={() => removeProduct(product.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
      {toast && <Toastadd reponse={rep} />}
    </div>
  );
}

export default Produit;
