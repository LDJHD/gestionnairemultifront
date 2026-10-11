import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { CheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolid, CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

export function Notifications() {
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
    <div className="mt-6 mb-10 flex w-full flex-col gap-6 animate-fade-in">
      {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="lg-page-title">Notifications</h1>
          <p className="lg-page-sub">
            Toutes les alertes reçues par votre boutique, du plus récent au plus ancien.
          </p>
        </div>
        <span className={`lg-badge ${unreadCount > 0 ? "lg-badge-danger" : "lg-badge-accent"}`}>
          {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
        </span>
      </header>

      {/* ══════════════ LISTE DES ALERTES ══════════════ */}
      <div className="lg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <BellSolid className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="font-display text-base font-extrabold text-ink-900">Alertes</p>
              <p className="text-[13px] text-ink-500">
                Cliquez sur une notification pour la lire en détail
              </p>
            </div>
          </div>
          <span className="lg-badge-neutral tabular">{notifications.length} au total</span>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="lg-skeleton h-[74px] w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
              <BellSolid className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-700">Aucune notification disponible</p>
            <p className="mt-1 text-[13px] text-ink-500">
              Vous êtes à jour : aucune alerte en attente.
            </p>
          </div>
        ) : (
          <ul className="w-full">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick(notif);
                }}
                className={`flex w-full cursor-pointer items-start gap-3.5 border-b border-ink-100 px-5 py-4 transition-colors duration-200 last:border-0 hover:bg-brand-50/40 ${
                  notif.lu === 0 ? "bg-white" : "bg-ink-50/50"
                }`}
              >
                <span
                  className={`lg-icon-chip h-9 w-9 ring-1 ring-inset ${
                    notif.lu === 0
                      ? "bg-brand-50 text-brand-600 ring-brand-100"
                      : "bg-accent-50 text-accent-600 ring-accent-100"
                  }`}
                >
                  {notif.lu === 0 ? (
                    <BellSolid className="h-[18px] w-[18px]" />
                  ) : (
                    <CheckCircleSolid className="h-[18px] w-[18px]" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold text-ink-900">
                      {notif.lu === 0 ? "Nouvelle notification :" : "Notification lue :"}
                    </span>
                    {notif.lu === 0 ? (
                      <span className="lg-badge-brand">Nouveau</span>
                    ) : (
                      <span className="lg-badge-accent">Lu</span>
                    )}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-600 lg-clamp-2">
                    {`${notif.message.slice(0, 100)}...`}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  {notif.date ? (
                    <span className="text-[11px] font-medium text-ink-400">{notif.date}</span>
                  ) : null}
                  {notif.lu === 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Empêche la propagation du clic vers l'élément parent
                        markAsRead(notif.id);
                      }}
                      className="lg-btn-soft lg-btn-sm"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Marquer lue
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la propagation du clic vers l'élément parent
                      handleAlert(notif.id);
                    }}
                    className="lg-btn-danger lg-btn-sm"
                    title="Supprimer la notification"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ══════════════ DÉTAIL DE LA NOTIFICATION ══════════════ */}
      {selectedNotification &&
        createPortal(
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
            <div className="lg-card w-full max-w-lg animate-pop-in p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <BellSolid className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h2 className="font-display text-base font-extrabold text-ink-900">
                    Détail de la notification
                  </h2>
                  <p className="text-[13px] text-ink-500">
                    {selectedNotification.lu === 0 ? "Nouvelle notification" : "Notification lue"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSelectedNotification(null)}
                className="lg-btn-ghost lg-btn-sm -mt-1 -mr-1 px-2"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-700 ring-1 ring-inset ring-ink-200/70">
              {selectedNotification.message}
            </p>

            <div className="mt-5 flex justify-end gap-2.5">
              {selectedNotification.lu === 0 && (
                <button
                  type="button"
                  onClick={() => markAsRead(selectedNotification.id)}
                  className="lg-btn-neutral lg-btn-sm"
                >
                  <CheckIcon className="h-4 w-4" />
                  Marquer comme lue
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="lg-btn-primary lg-btn-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Notifications;