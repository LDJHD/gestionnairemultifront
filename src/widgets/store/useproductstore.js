import { create } from "zustand";

export const useProductStore = create((set) => ({
  productsstore: [],
  setProductsstore: (productrecherche) =>
    set(() => ({
      productsstore: productrecherche, // Remplacement direct
    })),
  addProduct: (newProduct) =>
    set((state) => ({
      productsstore: [...state.productsstore, newProduct], // Ajout au tableau existant
    })),
}));
