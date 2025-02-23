// Composant Client
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import Toastadd from "@/widgets/toast/toastadd";
import Modaladdclient from "@/widgets/modal/modaladdclient";
import Modaleditclient from "@/widgets/modal/modaleditclient";
import Swal from 'sweetalert2'

export function Client() {
  const [clients, setclients] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  const [toast, setToast] = useState(false);
  const rep = "Enregistrement effectué avec succès";
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement
  // Gestion des menus actifs
  const handleClick = (id) => {
    setMenuActif(menuActif === id ? null : id);
  };

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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/client/delete`, {
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
            removeclient(id);
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

  const handletoast = () => {
    setToast(true);
  };

  const handletabs=(id)=>{
<Tabs idClient={id}/>
  }

  // Fonction pour récupérer les Clients
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
        setclients(data);
      } else {
        console.error("Erreur lors de la récupération des Clients:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  }; 

  // Fonction pour supprimer un Client de la liste
  const removeclient = (id) => {
    setclients((prevclients) => prevclients.filter((client) => client.id !== id));
  };

  // Appel de fetchclients lors du chargement du composant
  useEffect(() => {
    fetchclients();
  }, []);


  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <span className="font-bold">Client</span>
            <span><Modaladdclient handletoast={handletoast} /></span>
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
                {["Nom", "Prenom", "Email", "Telephone","Adresse","Ifu","Date de création", "Option"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, key) => {
                const className = `py-3 px-5 ${key === clients.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                return (
                  <tr key={client.id}>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.nom}</Typography></td>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.prenom}</Typography></td>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.email}</Typography></td>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.telephone}</Typography></td>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.adresse}</Typography></td>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.ifu}</Typography></td>
                    <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{client.date}</Typography></td>
                    <td className={className}>
                    <div class="flex gap-2">

<Modaleditclient ClientId={client.id} handletoast={handletoast} />


<button
  type="button"
  onClick={() => handleAlert(client.id)}
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

</div>
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

export default Client;
