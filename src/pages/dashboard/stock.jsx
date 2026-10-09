// Composant Clients
import { Tabs } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
  ArchiveBoxIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Toastadd from "@/widgets/toast/toastadd";
import ModaleditStock from "@/widgets/modal/modaleditstock";
import Swal from 'sweetalert2'
import Modaladdstock from "@/widgets/modal/modaladdstock";


export function Stock() {

  const handleAlert = (id) => {
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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });
  
          if (response.ok) {
            swalWithTailwindButtons.fire({
              title: "Supprimé !",
              text: "La suppression a été effectuée avec succès.",
              icon: "success",
            });
            // Appelle removeStock pour mettre à jour la liste localement
            removeStock(id);
          } else {
            swalWithTailwindButtons.fire({
              title: "Erreur",
              text: "La suppression a échoué.",
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
  

  const [stock, setstock] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  const [toast, setToast] = useState(false);
  const rep = "Enregistrement effectué avec succès";
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement

  // Fonction pour supprimer un produit de la liste
  const removeStock = (id) => {
    setstock((prevStocks) => prevStocks.filter((stock) => stock.id !== id));
  };

  // Gestion des menus actifs
  const handleClick = (id) => {
    setMenuActif(menuActif === id ? null : id);
  };

  const handletoast = () => {
    setToast(true);
  };

  const handletabs = (id) => {
    <Tabs idstock={id} />
  }

  // Fonction pour récupérer les stocks
  const fetchstocks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stock/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setstock(data);
      } else {
        console.error("Erreur lors de la récupération des stocks:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  };

  // Fonction pour supprimer un stock de la liste
  const removestock = (id) => {
    setstock((prevStocks) => prevStocks.filter((stock) => stock.id !== id));
  };

  // Appel de fetchstocks lors du chargement du composant
  useEffect(() => {
    fetchstocks();
  }, []);

  const total = stock.length;
  const enAlerte = stock.filter(
    (s) =>
      s.quantite_stock != null &&
      Number(s.quantite_stock) - Number(s.vendu || 0) <= 0,
  ).length;

  const boutonAjout = <Modaladdstock handletoast={handletoast} />;

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="lg-page-title">Stock</h1>
          <p className="lg-page-sub">
            Suivez les quantités initiales et disponibles de chaque produit.
          </p>
        </div>
        {boutonAjout}
      </header>

      {/* ══════════════ LISTE DES STOCKS ══════════════ */}
      <section className="lg-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="lg-icon-chip h-9 w-9 bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
            <ArchiveBoxIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink-900">État des stocks</p>
            <p className="text-[13px] text-ink-500">Quantités en stock et déjà vendues</p>
          </div>
          <span className="lg-badge-neutral tabular">
            {total} ligne{total > 1 ? "s" : ""} de stock
          </span>
          {enAlerte > 0 && (
            <span className="lg-badge-warn">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" />
              {enAlerte} épuisé{enAlerte > 1 ? "s" : ""}
            </span>
          )}
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
            <p className="mt-3 text-sm font-semibold text-ink-700">Aucune ligne de stock</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
              Enregistrez un stock pour suivre les quantités disponibles de vos produits.
            </p>
            <div className="mt-4 flex justify-center">{boutonAjout}</div>
          </div>
        ) : (
          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[1000px]">
              <thead>
                <tr>
                  <th>Nom du produit</th>
                  <th>Catégorie</th>
                  <th className="!text-right">Quantité initiale</th>
                  <th className="!text-right">Quantité disponible</th>
                  <th>Date d&apos;ajout</th>
                  <th className="!text-right">Option</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((stock, i) => (
                  <tr key={stock.id ?? stock.code_barre ?? i}>
                    <td className="lg-td font-semibold text-ink-800">
                      {stock.nom_produit || "—"}
                    </td>
                    <td className="lg-td">
                      <span className="lg-badge-neutral">{stock.categorie || "Non classé"}</span>
                    </td>
                    <td className="lg-td text-right font-semibold tabular text-ink-800">
                      {stock.quantite_stock ?? "—"}
                    </td>
                    <td className="lg-td text-right font-semibold tabular text-ink-800">
                      {stock.quantite_stock && stock.vendu
                        ? stock.quantite_stock - stock.vendu
                        : "_"}
                    </td>
                    <td className="lg-td text-[13px] text-ink-500">
                      {stock.date_creation || "—"}
                    </td>
                    <td className="lg-td">
                      <div className="flex items-center justify-end gap-1">
                        <ModaleditStock StockId={stock.id} handletoast={handletoast} />
                        <button
                          type="button"
                          onClick={() => handleAlert(stock.id)}
                          title="Supprimer"
                          aria-label="Supprimer"
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="h-[18px] w-[18px]" />
                        </button>
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

export default Stock;
