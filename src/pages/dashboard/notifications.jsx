import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import { useCountStore } from "@/widgets/store/usecounstore";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [nocount, setnoCount] = useState();
  const [loading, setLoading] = useState(true);
  const setNotificationsCount = useCountStore((state) => state.setNotificationsCount);


// Fonction pour récupérer les notifications
const fetchNotifications = async () => {
  setLoading(true); // On démarre le chargement des notifications
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
      // En supposant que tu reçois { notifications, nombreTotal, nombreLu, nombreNonLu }
      setNotifications(data.notifications || []);
      setNotificationsCount(data.nombreNonLu); // Mise à jour du nombre de notifications non lues
    } else {
      console.error("Erreur lors de la récupération des notifications:", response.status);
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
  } finally {
    setLoading(false); // Arrêt du chargement après récupération des données
  }
};


  // Fonction pour supprimer une notification de la liste
  const removeNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notif) => notif.id !== id));
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  
  }, []);

  // Compter les notifications non lues
  const unreadCount = notifications.filter((notif) => notif.lu === 0).length;

  return (
    <div className="mx-auto my-20 flex flex-col gap-12 w-full">
    <Card className="shadow-lg rounded-xl border border-gray-200 w-full">
      {/* Header avec titre et badge des notifications non lues */}
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
  
      {/* Contenu des notifications */}
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
                className={`w-full p-4 ${
                  notif.lu === 0 ? "bg-white text-black border-red-500" : "bg-gray-100 text-gray-700 border-green-500"
                } font-medium rounded-lg shadow-md border-l-4 flex items-start`}
              >
                <span className={`flex-shrink-0 text-lg ${notif.lu === 0 ? "text-red-500" : "text-green-500"}`}>
                  {notif.lu === 0 ? "🔔" : "✅"}
                </span>
                <span className="ml-3 flex-1 line-clamp-2">
                  <span className="font-bold">{notif.lu === 0 ? "Nouvelle notification :" : "Notification lue :"}</span>
                  {` ${notif.messsage.slice(0, 100)}...`}
                </span>
                <button
                  onClick={() => removeNotification(notif.id)}
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
  </div>
  
  );
};

export default Notifications;
