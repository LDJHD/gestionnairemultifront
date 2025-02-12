import { create } from "zustand";
// Stockage dans Zustand
export const useventeStore = create((set) => ({
  ventesstore: [],
  setventesstore: (ventesearch) => set({ ventesstore: ventesearch }),
}));

