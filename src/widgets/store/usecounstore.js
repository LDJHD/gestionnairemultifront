import { create } from "zustand";

// Stockage dans Zustand
export const useCountStore = create((set) => ({
  notificationsCount: 0,  // pour stocker le nombre de notifications non lues
  setNotificationsCount: (count) => set({ notificationsCount: count }),  // pour mettre à jour les notifications
}));
