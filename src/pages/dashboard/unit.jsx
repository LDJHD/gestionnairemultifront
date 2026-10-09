// Composant Clients
import { Tabs } from "@material-tailwind/react";
  import { useEffect, useState } from "react";
  import {
    ScaleIcon,
    TagIcon,
    TrashIcon,
  } from "@heroicons/react/24/outline";
  import Toastadd from "@/widgets/toast/toastadd";
  import Modaleditunit from "@/widgets/modal/modaleditunit";
  import Swal from 'sweetalert2'
  import Modaladdunit from "@/widgets/modal/modaladdunit";
  
  
  export function Unit() {
  
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/unit/delete`, {
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
              // Appelle removeunit pour mettre à jour la liste localement
              removeunit(id);
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
    
  
    const [unit, setunit] = useState([]);
    const [menuActif, setMenuActif] = useState(null);
    const [toast, setToast] = useState(false);
    const rep = "Enregistrement effectué avec succès";
    const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement
  
    
    // Gestion des menus actifs
    const handleClick = (id) => {
      setMenuActif(menuActif === id ? null : id);
    };
  
    const handletoast = () => {
      setToast(true);
    };
  
    const handletabs = (id) => {
      <Tabs idunit={id} />
    }
  
    // Fonction pour récupérer les units
    const fetchunits = async () => {
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
          console.error("Erreur lors de la récupération des units:", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      } finally {
        setLoading(false); // Arrêt du chargement après récupération des données
      }
    };
  
    // Fonction pour supprimer un unit de la liste
    const removeunit = (id) => {
      setunit((prevunits) => prevunits.filter((unit) => unit.id !== id));
    };
  
    // Appel de fetchunits lors du chargement du composant
    useEffect(() => {
      fetchunits();
    }, []);
  
    const total = unit.length;

    const boutonAjout = <Modaladdunit handletoast={handletoast} />;

    return (
      <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
        {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="lg-page-title">Unités</h1>
            <p className="lg-page-sub">
              Les unités de mesure disponibles pour vos produits et vos ventes.
            </p>
          </div>
          {boutonAjout}
        </header>

        {/* ══════════════ LISTE DES UNITÉS ══════════════ */}
        <section className="lg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-5 py-4">
            <span className="lg-icon-chip h-9 w-9 bg-light-blue-50 text-light-blue-600 ring-1 ring-inset ring-light-blue-100">
              <ScaleIcon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-900">Unités de mesure</p>
              <p className="text-[13px] text-ink-500">Pièce, kilogramme, litre, mètre…</p>
            </div>
            <span className="lg-badge-neutral tabular">
              {total} unité{total > 1 ? "s" : ""}
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
                <TagIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-700">Aucune unité enregistrée</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
                Ajoutez une unité de mesure pour préciser vos produits et vos ventes.
              </p>
              <div className="mt-4 flex justify-center">{boutonAjout}</div>
            </div>
          ) : (
            <div className="lg-table-wrap">
              <table className="lg-table w-full min-w-[520px]">
                <thead>
                  <tr>
                    <th>Unité</th>
                    <th>Date d&apos;ajout</th>
                    <th className="!text-right">Option</th>
                  </tr>
                </thead>
                <tbody>
                  {unit.map((unit) => (
                    <tr key={unit.nom}>
                      <td className="lg-td font-semibold text-ink-800">{unit.nom || "—"}</td>
                      <td className="lg-td text-[13px] text-ink-500">
                        {unit.date_creation || "—"}
                      </td>
                      <td className="lg-td">
                        <div className="flex items-center justify-end gap-1">
                          <Modaleditunit unitId={unit.id} handletoast={handletoast} />
                          <button
                            type="button"
                            onClick={() => handleAlert(unit.id)}
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
  
  export default Unit;
  