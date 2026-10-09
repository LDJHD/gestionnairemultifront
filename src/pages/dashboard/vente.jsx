// Composant Clients
import { Tabs } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import Toastadd from "@/widgets/toast/toastadd";
import Swal from 'sweetalert2'
import { Link } from "react-router-dom";
import { useventeStore } from "@/widgets/store/useventestore";
import {
  EyeIcon,
  PlusIcon,
  ReceiptPercentIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export function Vente() {

  const { ventesstore, setventesstore } = useventeStore();


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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/vente/delete`, {
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
            // Appelle removevente pour mettre à jour la liste localement
            removeVente(id);
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


  const [vente, setvente] = useState([]);
  const [totalvente, setTotalvente] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  const [toast, setToast] = useState(false);
  const rep = "Enregistrement effectué avec succès";
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement

  // Fonction pour supprimer un produit de la liste
  const removeVente = (id) => {
    setvente((prevventes) => prevventes.filter((vente) => vente.id !== id));
    setventesstore([])
  };

  // Gestion des menus actifs
  const handleClick = (id) => {
    setMenuActif(menuActif === id ? null : id);
  };

  const handletoast = () => {
    setToast(true);
  };

  const handletabs = (id) => {
    <Tabs idvente={id} />
  }

  // Fonction pour récupérer les ventes
  const fetchventes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/vente/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setvente(data);

      } else {
        console.error("Erreur lors de la récupération des ventes:", response.status);
      };
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  };




  // Appel de fetchventes lors du chargement du composant
  useEffect(() => {
    fetchventes();
  }, []);



  const displayventes = ventesstore.length > 0 ? ventesstore : vente;
  console.log(ventesstore)


  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="lg-page-title">Ventes</h1>
          <p className="lg-page-sub">
            Historique complet des ventes enregistrées dans votre boutique.
          </p>
        </div>
        <Link to="/dashboard/vendre">
          <button type="button" className="lg-btn-primary lg-btn-sm">
            <PlusIcon className="h-[18px] w-[18px]" />
            Nouvelle vente
          </button>
        </Link>
      </header>

      {/* ══════════════ JOURNAL DES VENTES ══════════════ */}
      <div className="lg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <ReceiptPercentIcon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="font-display text-base font-extrabold text-ink-900">
                Journal des ventes
              </p>
              <p className="text-[13px] text-ink-500">
                {loading
                  ? "Chargement des opérations…"
                  : `${displayventes.length} vente(s) au total`}
              </p>
            </div>
          </div>
          <span className="lg-badge-brand tabular">
            {totalvente?.length ?? displayventes.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="lg-skeleton h-14 w-full" />
            ))}
          </div>
        ) : !displayventes || displayventes.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
              <ReceiptPercentIcon className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-700">Aucune vente pour l'instant</p>
            <p className="mt-1 text-[13px] text-ink-500">
              Enregistrez votre première vente depuis la caisse.
            </p>
            <Link to="/dashboard/vendre" className="mt-4 inline-block">
              <button type="button" className="lg-btn-primary lg-btn-sm">
                <PlusIcon className="h-4 w-4" />
                Ouvrir la caisse
              </button>
            </Link>
          </div>
        ) : (
          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-16">N°</th>
                  <th>Client</th>
                  <th className="text-right">Montant</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayventes.map((vente, key) => (
                  <tr key={vente.id ?? key}>
                    <td className="lg-td text-[13px] font-semibold text-ink-400 tabular">
                      {String(key + 1).padStart(2, "0")}
                    </td>
                    <td className="lg-td">
                      <Link
                        to={`/detailvente?id=${vente.id}`}
                        className="font-semibold text-ink-800 transition-colors hover:text-brand-700"
                      >
                        {vente.client}
                      </Link>
                    </td>
                    <td className="lg-td text-right text-sm font-bold text-ink-900 tabular">
                      {vente.montant_total}
                    </td>
                    <td className="lg-td text-[13px] text-ink-500">{vente.date}</td>
                    <td className="lg-td">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/detailvente?id=${vente.id}`}
                          className="lg-btn-neutral lg-btn-sm"
                          title="Voir le détail"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Détail
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAlert(vente.id)}
                          className="lg-btn-danger lg-btn-sm"
                          title="Supprimer la vente"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toastadd reponse={rep} />}
    </div>
  );
}

export default Vente;