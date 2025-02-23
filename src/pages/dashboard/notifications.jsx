import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import Swal from "sweetalert2";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notification/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        localStorage.setItem("notificationsCount", data.nombreNonLu.toString());
      }
       else {
        console.error("Erreur lors de la récupération des notifications:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notification/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, lu: 1 } : notif
        )
      );
      // setNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la notification:", error);
    }
  };

  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    if (notif.lu === 0) {
      markAsRead(notif.id);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAlert = (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton: 'bg-green-800 hover:bg-green-400 text-white font-bold py-2 mx-2 px-4 rounded',
        cancelButton: 'bg-red-800 hover:bg-red-200 text-white font-bold py-2 mx-2 px-4 rounded',
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
              `${import.meta.env.VITE_API_URL}/api/v1/notification/delete`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id }),
              }
            );

            if (response.ok) {
              swalWithTailwindButtons.fire({
                title: "Supprimé !",
                text: "La suppression a été effectuée avec succès.",
                icon: "success",
              });
              removeNotification(id); // Mettre à jour la liste
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
            text: "Votre notification est toujours en sécurité.",
            icon: "error",
          });
        }
      });
  };

  // Fonction pour mettre à jour la liste des notifications après suppression
  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== id)
    );
  };

  const unreadCount = notifications.filter((notif) => notif.lu === 0).length;

  return (
    <div className="mx-auto my-20 flex flex-col gap-12 w-full">
      <Card className="shadow-lg rounded-xl border border-gray-200 w-full">
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4 border-b border-gray-300"
        >
          <div className="flex justify-between items-center">
            <Typography variant="h5" color="blue-gray" className="font-semibold w-10">
              Alerts
            </Typography>
            <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
              {unreadCount} non lues
            </span>
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-4 p-4">
          {loading ? (
            <p className="text-center text-gray-500">Chargement des notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500">Aucune notification disponible.</p>
          ) : (
            <ul className="w-full space-y-3">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`w-full p-4 ${notif.lu === 0 ? "bg-white text-black border-red-500" : "bg-gray-100 text-gray-700 border-green-500"} font-medium rounded-lg shadow-md border-l-4 flex items-start cursor-pointer`}
                  onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                >
                  <span className={`flex-shrink-0 text-lg ${notif.lu === 0 ? "text-red-500" : "text-green-500"}`}>
                    {notif.lu === 0 ? "🔔" : "✅"}
                  </span>
                  <span className="ml-3 flex-1 line-clamp-2">
                    <span className="font-bold">{notif.lu === 0 ? "Nouvelle notification :" : "Notification lue :"}</span>
                    {` ${notif.message.slice(0, 100)}...`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la propagation du clic vers l'élément parent
                      handleAlert(notif.id);
                    }}
                    className="ml-4 text-gray-500 hover:text-red-600"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {selectedNotification && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-6/12 h-6/12 ">
            <h2 className="text-lg font-bold mb-2">Détail de la notification</h2>
            <p className="mb-4">{selectedNotification.message}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setSelectedNotification(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
