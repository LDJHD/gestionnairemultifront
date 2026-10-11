import { Tabs } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";
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
  // ⚡ Suppression OPTIMISTE : la ligne disparaît
  //    IMMÉDIATEMENT quand l'utilisateur confirme.
  //    L'API de l'hébergeur met parfois 3 s+ à
  //    répondre — attendre sa réponse laissait le
  //    produit affiché, ce qui donnait l'impression
  //    qu'il fallait recharger la page.
  const removeProduct = (id) => {
    const filtrer = (liste) =>
      Array.isArray(liste) ? liste.filter((p) => p.id !== id) : liste;
    setProducts((prev) => filtrer(prev));
    if (productsstore.length > 0) setProductsstore(filtrer(productsstore));
    setMenuActif(null);
  };

  // En cas d'échec de la suppression serveur :
  // restaurer la liste depuis la base.
  const rechargerProduits = () => fetchProducts();

  // Appel de fetchProducts lors du chargement du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  const displayproducts = productsstore.length > 0 ? productsstore : products;

  const total = displayproducts.length;

  const boutonAjout = <Modal handletoast={handletoast} />;

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      <ProductReminder products={products} />

      {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="lg-page-title">Produits</h1>
          <p className="lg-page-sub">
            Gérez votre catalogue : tarifs, taxation, codes-barres et dates d&apos;expiration.
          </p>
        </div>
        {boutonAjout}
      </header>

      {/* ══════════════ CATALOGUE ══════════════ */}
      <section className="lg-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
            <CubeIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink-900">Catalogue produits</p>
            <p className="text-[13px] text-ink-500">Prix de vente, prix d&apos;achat et informations fiscales</p>
          </div>
          <span className="lg-badge-neutral tabular">
            {total} produit{total > 1 ? "s" : ""}
          </span>
        </div>

        {/* Squelettes de chargement */}
        {loading ? (
          <div className="flex flex-col gap-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="lg-skeleton h-12 w-full" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
              <CubeIcon className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-700">Aucun produit dans le catalogue</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
              Ajoutez votre premier article pour pouvoir le vendre et suivre son stock.
            </p>
            <div className="mt-4 flex justify-center">{boutonAjout}</div>
          </div>
        ) : (
          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[1200px]">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th className="!text-right">Prix</th>
                  <th className="!text-right">Prix d&apos;achat</th>
                  <th>Taxation</th>
                  <th>Date expiration</th>
                  <th>Code-barres</th>
                  <th>Date de création</th>
                  <th className="!text-right">Option</th>
                </tr>
              </thead>
              <tbody>
                {displayproducts.map((product, key) => (
                  <tr key={product.id ?? product.code_barre ?? key}>
                    <td className="lg-td">
                      <Link
                        to={`/detailproduit?id=${product.id}`}
                        className="flex items-center gap-3 font-semibold text-ink-800 transition-colors hover:text-brand-700"
                      >
                        {product.image ? (
                          <img
                            src={product.image.startsWith("http") ? product.image : `${import.meta.env.VITE_API_URL}/${product.image}`}
                            alt={product.nom}
                            className="h-10 w-10 flex-none rounded-lg object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-ink-100 text-[10px] text-ink-400">
                            📷
                          </span>
                        )}
                        {product.nom || "—"}
                      </Link>
                    </td>
                    <td className="lg-td text-[13px] text-ink-600">
                      <span className="lg-clamp-2 inline-block max-w-[220px] align-middle">
                        {product.description || "—"}
                      </span>
                    </td>
                    <td className="lg-td">
                      <span className="lg-badge-neutral">{product.nom_categorie || "Non classé"}</span>
                    </td>
                    <td className="lg-td text-right font-semibold tabular text-ink-900">
                      {product.prix ?? "—"}
                    </td>
                    <td className="lg-td text-right tabular text-ink-700">
                      {product.prix_achat ?? "—"}
                    </td>
                    <td className="lg-td text-[13px] text-ink-600">{product.taxation || "—"}</td>
                    <td className="lg-td text-[13px] tabular text-ink-500">
                      {product.date_expi || "—"}
                    </td>
                    <td className="lg-td font-mono text-[13px] text-ink-500">
                      {product.code_barre || "—"}
                    </td>
                    <td className="lg-td text-[13px] text-ink-500">{product.date || "—"}</td>
                    <td className="lg-td">
                      <div className="flex items-center justify-end">
                        <Droplist
                          isOpen={menuActif === key}
                          handleClick={handleClick}
                          id={key}
                          idp={product.id}
                          onDelete={() => removeProduct(product.id)}
                          onError={rechargerProduits}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {toast && <Toastadd reponse={rep} />}
    </div>
  );
}

export default Produit;
