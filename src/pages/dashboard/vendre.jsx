// Composant Produit
import { Tabs } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import Modal from "@/widgets/modal/modal";
import Toastadd from "@/widgets/toast/toastadd";
import { Link } from "react-router-dom";
import { useProductStore } from "@/widgets/store/useproductstore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FacturePreview from "@/widgets/facture/facturepreview"; // Composant de prévisualisation
import axios from "axios";
import FacturePrevieww from "@/widgets/facture/factureprevieww";
import {
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CubeIcon,
  DocumentTextIcon,
  MinusIcon,
  PlusIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

/** Montant formaté « 1 234 567 F » */
function fcfa(v) {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString("fr-FR").replace(/[\u202f\u00a0,]/g, " ")
    : v ?? "—";
}

export function Vendre() {
  const setProductsstore = useProductStore((state) => state.setProductsstore); // Récupération de la méthode `setProducts` du store
  const productsstore = useProductStore((state) => state.productsstore); // Récupération des produits du store

  console.log('voila productstore'.productsstore);
  // État pour stocker les produits ajoutés
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fonction pour ajouter un produit
  const handleAddProduct = (product) => {
    const dejaAuTicket = selectedProducts.some(
      (p) => p.code_barre === product.code_barre
    );
    if (dejaAuTicket) {
      // Déjà au ticket : on augmente la quantité plutôt que d'ajouter un doublon
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.code_barre === product.code_barre
            ? { ...p, quantity: (Number(p.quantity) || 0) + 1 }
            : p
        )
      );
      toast.info(`« ${product.nom} » est déjà au ticket — quantité augmentée.`);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, quantity: 1, unit: "Unité(s)" },
      ]);
    }
    setProductsstore([]);
    // Appeler fetchStockValue en passant l'ID du produit
    fetchStockValue(product.id);
  };



const fetchStockValue = async (id) => {
  try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/stock/valeur`,
          { id },
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );

      const { quantite_stock, quantite_vendue, stock_restant } = response.data;

      if (stock_restant < -1) {
        toast.error("Stock épuisé — rechargez ce produit avant de poursuivre la vente.");
      }
      // Si le stock est positif mais inférieur à 6
      else if (stock_restant > 0 && stock_restant < 6) {
        toast.warning(`Stock faible — il vous reste ${stock_restant} en stock.`);
      }
      // Si le stock est suffisant (> 6), pas de message

  } catch (error) {
      console.error("Erreur lors de la récupération des données de stock :", error);
  }
};


  // Fonction pour supprimer un produit de la liste sélectionnée
  const handleRemoveProduct = (codeBarre) => {
    setSelectedProducts(selectedProducts.filter((p) => p.code_barre !== codeBarre));
  };

  // // Fonction pour mettre à jour les quantités ou unités
  // const handleUpdateProduct = (codeBarre, field, value) => {
  //   setSelectedProducts((prev) =>
  //     prev.map((p) =>
  //       p.code_barre === codeBarre ? { ...p, [field]: value } : p
  //     )
  //   );
  // };


  const handleUpdateProduct = (codeBarre, field, value) => {
    setSelectedProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.code_barre === codeBarre) {
          console.log("Produit sélectionné :", product);
          console.log("Supplements disponibles :", product.supplements);
   
          if (field === 'unit') {
            const selectedSupplement = product.supplements.find(supp => supp.unit === value);
            console.log("Supplement sélectionné :", selectedSupplement);
   
            const updatedPrice = selectedSupplement ? selectedSupplement.prix : product.prix;
            return { ...product, unit: value, prix: updatedPrice }; 
          } else {
            return { ...product, [field]: value };
          }
        }
        return product;
      })
    );
  };

  useEffect(() => {
    console.log("Produits mis à jour :", selectedProducts);
  }, [selectedProducts]);
   

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewOpen2, setIsPreviewOpen2] = useState(false);
  const [products, setProducts] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  // ⚠️ Ne pas renommer en `toast` : ce nom est réservé à l'API `toast` de
  // react-toastify importée plus haut (les deux cohabitaient, ce qui faisait
  // échouer tous les `toast.success()` / `toast.error()` de cette page).
  const [toastOuvert, setToastOuvert] = useState(false);
  const [encaissement, setEncaissement] = useState(false);
  const rep = "Enregistrement effectué avec succès";

  const [formData, setFormData] = useState({
    client: "",
    remise: "",
    format: "Ticket",
    aib:"N/A"
  });

  const handlePreview = () => {
    setIsPreviewOpen(true); // Ouvrir la prévisualisation
  };

  const handlePreview2 = () => {
    setIsPreviewOpen2(true); // Ouvrir la prévisualisation
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "client") {
      setSelectedclient(null); // Réinitialiser le client sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpen(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filtered = client.filter(
        (client) =>
          client.nom.toLowerCase().includes(value.toLowerCase()) ||
          (client.prenom && client.prenom.toLowerCase().includes(value.toLowerCase()))
      );

      setFilteredclient(filtered);
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validations ──
    if (!formData.client) {
      toast.warning("Sélectionnez un client avant d'encaisser la vente.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.warning("Ajoutez au moins un produit au ticket.");
      return;
    }

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");

      // ── Totaux (mêmes règles que l'aperçu de facture) ──
      const prixNb = (p) => Number(p.prix || 0);
      const quantiteNb = (p) => Number(p.quantity || 0);
      const tauxTVA = (p) =>
        p.taxation === "B" || p.taxation === "D"
          ? 0.18
          : p.taxation === "AIBA"
          ? 0.01
          : p.taxation === "AIBB"
          ? 0.05
          : 0;
      const totalHT = selectedProducts.reduce((acc, p) => acc + prixNb(p) * quantiteNb(p), 0);
      const tva = selectedProducts.reduce(
        (acc, p) => acc + prixNb(p) * quantiteNb(p) * tauxTVA(p),
        0
      );
      const aib = selectedProducts.reduce((acc, p) => {
        if (!["B", "D"].includes(p.taxation) && formData.aib !== "N/A") {
          const tauxAib = formData.aib === "A" ? 0.01 : formData.aib === "B" ? 0.05 : 0;
          return acc + prixNb(p) * quantiteNb(p) * tauxAib;
        }
        return acc;
      }, 0);
      const totalTTC = totalHT + tva + aib;
      const totalApresRemise = Math.round(
        totalTTC - totalTTC * (Number(formData.remise || 0) / 100)
      );

      // ── Étape 1 : créer la facture (format ticket = facture simple) ──
      const invoiceData = {
        cAIB: aib,
        cHT: totalHT,
        cTTC: totalApresRemise,
        cTVA: tva,
        format: formData.format,
        ifu: selectedclient?.ifu || "",
        aib: formData.aib,
        type: "FV",
        client: {
          contact: selectedclient?.telephone || "",
          ifu: selectedclient?.ifu || "",
          name: selectedclient?.nom || "",
          address: selectedclient?.adresse || "",
        },
        items: selectedProducts.map((p) => ({
          reference: p.code_barre,
          name: p.nom,
          price: p.prix,
          quantity: p.quantity,
          unit: p.unit,
          taxGroup: p.taxation || "A",
        })),
        operator: { name: "" },
        payment: { total: totalApresRemise, method: "Espèces" },
      };

      const invoiceResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/invoice/createsimple`,
        invoiceData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { datee } = invoiceResponse.data;
      const filesavePathsimple = `/invoices/invoice_${datee}.pdf`;

      // ── Étape 2 : enregistrer la vente avec la facture ──
      const venteData = {
        montant_total: totalApresRemise,
        tva,
        montant_total_ttc: totalTTC,
        client_id: formData.client,
        items: selectedProducts.map((p) => ({
          produit_id: p.id,
          prix_unitaire: p.prix,
          quantite: p.quantity,
        })),
        facture: {
          montant_total: totalApresRemise,
          tva,
          remise: formData.remise,
          montant_paye: totalApresRemise,
          montant_restant: 0,
          mode_paiement: "Espèces",
          client_id: formData.client,
        },
        pdf: "ras.pdf",
        pdf2: filesavePathsimple,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/transaction`,
        venteData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ── Succès : vider le ticket ──
      toast.success(`Vente encaissée — ${fcfa(totalApresRemise)}`);
      setSelectedProducts([]);
      setSelectedclient(null);
      setFormData({ client: "", remise: "", format: "Ticket", aib: "N/A" });
      setToastOuvert(true);
    } catch (error) {
      console.error("Erreur d'encaissement :", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Erreur lors de l'encaissement de la vente."
      );
    } finally {
      setEncaissement(false);
    }
  };



  // Gestion des menus actifs
  const handleClick = (id) => {
    setMenuActif(menuActif === id ? null : id);
  };

  const handletoast = () => {
    setToastOuvert(true);
  };

  const handletabs = (id) => {
    <Tabs idproduit={id} />
  }

  const [client, setclient] = useState([]);
  const [filteredclient, setFilteredclient] = useState([]);
  const [selectedclient, setSelectedclient] = useState(null); // Stocke le client sélectionné
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Contrôle l'ouverture de la liste déroulante
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement

  const handleclientSelect = (client) => {
    setSelectedclient(client); // Enregistrer le client sélectionné
    setFormData((prev) => ({ ...prev, client: client.id })); // Enregistrer l'ID du client
    setIsDropdownOpen(false); // Fermer la liste déroulante
  };

  // Fetch all client on mount
  useEffect(() => {
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
          setclient(data);
          setFilteredclient(data); // Initialize filteredProducts
        } else {
          console.error("Erreur lors de la récupération des produits:", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };

    fetchclients();
  }, []);


  // Fonction pour récupérer les produits
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Erreur lors de la récupération des produits:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  };

  // Fonction pour récupérer les clients
  const fetchclient = async () => {
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
        setclient(data);
      } else {
        console.error("Erreur lors de la récupération des produits:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  // Fonction pour supprimer un produit de la liste
  const removeProduct = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  // Appel de fetchProducts lors du chargement du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  // Appel de fetchclients lors du chargement du composant
  useEffect(() => {
    fetchclient();
  }, []);

  const displayproducts = productsstore.length > 0 ? productsstore : products;

  /* Total du ticket courant (simple sommation pour le panneau récapitulatif) */
  const totalTicket = selectedProducts.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.prix) || 0),
    0
  );
  const nbArticles = selectedProducts.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0),
    0
  );

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* ══════════════════ EN-TÊTE DE PAGE ══════════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">Caisse</p>
          <h1 className="lg-page-title">Opération de vente</h1>
          <p className="lg-page-sub">
            Composez le ticket, vérifiez le récapitulatif puis encaissez.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={handlePreview} className="lg-btn-neutral">
            <DocumentTextIcon className="h-[18px] w-[18px]" />
            Détails de la facture
          </button>
          <button type="button" onClick={handlePreview2} className="lg-btn-soft">
            <DocumentTextIcon className="h-[18px] w-[18px]" />
            Facture simple
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="lg-btn-primary"
          >
            <ArrowPathIcon className="h-[18px] w-[18px]" />
            Nouvelle vente
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* ══════════════ COLONNE GAUCHE : PRODUITS + TICKET ══════════════ */}
        <div className="flex flex-col gap-6 xl:col-span-7 2xl:col-span-8">
          {/* ── Catalogue ── */}
          <section className="lg-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <CubeIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-ink-900">
                    Catalogue produits
                  </p>
                  <p className="text-[13px] text-ink-500">
                    Ajoutez une ligne au ticket avec le bouton « + ».
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="lg-badge-brand tabular">
                  {displayproducts.length} produit(s)
                </span>
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 py-1.5 pl-3 pr-1.5 ring-1 ring-inset ring-brand-100">
                  <span className="text-[13px] font-semibold text-brand-700">
                    Ajouter
                  </span>
                  <Modal handletoast={handletoast} />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="lg-skeleton h-[52px] w-full" />
                ))}
              </div>
            ) : displayproducts.length ? (
              <div className="lg-table-wrap max-h-[420px] overflow-y-auto">
                <table className="lg-table w-full min-w-[560px]">
                  <thead>
                    <tr>
                      {["Produit", "Prix", "Code-barres", ""].map((el) => (
                        <th key={el} className={el === "Prix" ? "text-right" : ""}>
                          {el}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayproducts.map((product, i) => {
                      const ligneTicket = selectedProducts.find(
                        (p) => p.code_barre === product.code_barre
                      );
                      return (
                      <tr key={product.id ?? product.code_barre ?? i}>
                        <td className="lg-td">
                          <Link
                            to={`/detailproduit?id=${product.id}`}
                            className="font-semibold text-ink-800 transition-colors hover:text-brand-700"
                          >
                            {product.nom}
                          </Link>
                          {ligneTicket && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-bold text-forest-700 ring-1 ring-inset ring-forest-200">
                              <CheckCircleIcon className="h-3 w-3" />
                              Au ticket ×{ligneTicket.quantity}
                            </span>
                          )}
                        </td>
                        <td className="lg-td text-right font-semibold text-ink-900 tabular">
                          {fcfa(product.prix)} F
                        </td>
                        <td className="lg-td font-mono text-[13px] text-ink-500">
                          {product.code_barre}
                        </td>
                        <td className="lg-td text-right">
                          <button
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            title={
                              ligneTicket
                                ? "Déjà au ticket — cliquer pour augmenter la quantité"
                                : "Ajouter au ticket"
                            }
                            aria-label={`Ajouter ${product.nom} au ticket`}
                            className={`lg-icon-chip h-8 w-8 ring-1 ring-inset transition-all duration-200 ${
                              ligneTicket
                                ? "bg-forest-50 text-forest-700 ring-forest-200 hover:bg-forest-100"
                                : "bg-brand-50 text-brand-700 ring-brand-100 hover:bg-brand-100 hover:text-brand-800"
                            }`}
                          >
                            {ligneTicket ? (
                              <span className="text-[11px] font-extrabold">
                                +{ligneTicket.quantity}
                              </span>
                            ) : (
                              <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                            )}
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                  <CubeIcon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-700">
                  Aucun produit disponible
                </p>
                <p className="mt-1 text-[13px] text-ink-500">
                  Ajoutez un article au catalogue pour pouvoir encaisser.
                </p>
              </div>
            )}
          </section>

          {/* ── Ticket de vente ── */}
          <section className="lg-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
                  <ShoppingCartIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-ink-900">
                    Ticket de vente
                  </p>
                  <p className="text-[13px] text-ink-500">
                    {selectedProducts.length} ligne(s) · {nbArticles} article(s)
                  </p>
                </div>
              </div>
              <span className="lg-badge-accent tabular">{fcfa(totalTicket)} F</span>
            </div>

            {selectedProducts.length ? (
              <ul>
                {selectedProducts.map((product, i) => (
                  <li
                    key={`${product.id ?? product.produit_id ?? "p"}-${i}`}
                    className="flex flex-wrap items-center gap-4 border-b border-ink-100 px-5 py-4 last:border-b-0"
                  >
                    <div className="min-w-[180px] flex-1">
                      <p className="text-sm font-semibold text-ink-900 lg-clamp-1">
                        {product.nom}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-500 tabular">
                        {fcfa(product.prix)} F / {product.unit}
                      </p>
                    </div>

                    {/* Quantité : pastille avec boutons − / + */}
                    <div className="flex items-center gap-1 rounded-xl bg-ink-100 p-1">
                      <button
                        type="button"
                        aria-label="Diminuer la quantité"
                        onClick={() =>
                          handleUpdateProduct(
                            product.code_barre,
                            "quantity",
                            Math.max(1, (Number(product.quantity) || 1) - 1)
                          )
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg bg-white text-ink-600 shadow-xs transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <MinusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleUpdateProduct(product.code_barre, "quantity", e.target.value)
                        }
                        aria-label={`Quantité pour ${product.nom}`}
                        className="h-7 w-12 rounded-lg bg-transparent text-center text-sm font-semibold text-ink-800 tabular outline-none focus:bg-white"
                        placeholder="1"
                      />
                      <button
                        type="button"
                        aria-label="Augmenter la quantité"
                        onClick={() =>
                          handleUpdateProduct(
                            product.code_barre,
                            "quantity",
                            (Number(product.quantity) || 0) + 1
                          )
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg bg-white text-ink-600 shadow-xs transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Unité / conditionnement */}
                    <div className="w-[150px] shrink-0">
                      <select
                        value={product.unit}
                        onChange={(e) =>
                          handleUpdateProduct(product.code_barre, "unit", e.target.value)
                        }
                        aria-label={`Conditionnement pour ${product.nom}`}
                        className="lg-select h-9 py-0 text-[13px]"
                      >
                        <option value="">Unité(s)</option>
                        {product.supplements.map((supplement) => (
                          <option key={supplement.id} value={supplement.unit}>
                            {supplement.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ligne */}
                    <p className="min-w-[110px] text-right text-sm font-bold text-ink-900 tabular">
                      {fcfa((Number(product.quantity) || 0) * (Number(product.prix) || 0))} F
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.code_barre)}
                      title="Retirer la ligne"
                      aria-label={`Retirer ${product.nom} du ticket`}
                      className="lg-icon-chip h-8 w-8 bg-red-50 text-red-600 ring-1 ring-inset ring-red-100 transition-all duration-200 hover:bg-red-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                  <ShoppingCartIcon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-700">Ticket vide</p>
                <p className="mt-1 text-[13px] text-ink-500">
                  Sélectionnez un produit dans le catalogue pour démarrer la vente.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ══════════════ COLONNE DROITE : RÉCAPITULATIF ══════════════ */}
        <div className="xl:col-span-5 2xl:col-span-4">
          <form onSubmit={handleSubmit} className="sticky top-24 flex flex-col gap-5">
            <div className="lg-card p-5">
              <ToastContainer position="top-right" autoClose={5000} />

              <div className="flex items-center gap-2.5">
                <span className="lg-icon-chip h-9 w-9 bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
                  <UserIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-ink-900">
                    Informations
                  </p>
                  <p className="text-[13px] text-ink-500">Client, remise et format</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {/* Client */}
                <div className="relative">
                  <label htmlFor="client" className="lg-label">
                    Client
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={selectedclient ? selectedclient.nom : formData.client}
                    onChange={handleInputChange}
                    onFocus={() => setIsDropdownOpen(true)} // Ouvrir la liste déroulante
                    placeholder="Rechercher un client"
                    autoComplete="off"
                    className="lg-input"
                  />
                  {isDropdownOpen && (
                    <ul className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 overflow-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift animate-slide-down">
                      {filteredclient.map((client) => (
                        <li
                          key={client.id}
                          onClick={() => handleclientSelect(client)}
                          className="cursor-pointer rounded-lg px-3 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                        >
                          {client.nom}
                        </li>
                      ))}
                      {filteredclient.length === 0 && (
                        <li className="px-3 py-2 text-[13px] text-ink-500">
                          Aucun client trouvé
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="remise" className="lg-label">
                      Remise
                    </label>
                    <input
                      type="text"
                      name="remise"
                      id="remise"
                      value={formData.remise}
                      onChange={handleInputChange}
                      className="lg-input tabular"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="format" className="lg-label">
                      Format
                    </label>
                    <select
                      id="format"
                      name="format"
                      required
                      value={formData.format}
                      onChange={handleInputChange}
                      className="lg-select"
                    >
                      <option>Ticket</option>
                      <option>A4</option>
                      <option>A3</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="aib" className="lg-label">
                      AIB
                    </label>
                    <select
                      id="aib"
                      name="aib"
                      required
                      value={formData.aib}
                      onChange={handleInputChange}
                      className="lg-select"
                    >
                      <option value=" ">N/A</option>
                      <option value="A">1%</option>
                      <option value="B">5%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Récapitulatif */}
            <section className="lg-card overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-ink-100 px-5 py-4">
                <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <ReceiptPercentIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-ink-900">
                    Récapitulatif
                  </p>
                  <p className="text-[13px] text-ink-500">Montants du ticket courant</p>
                </div>
              </div>

              <div className="space-y-3 px-5 py-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-500">Lignes</span>
                  <span className="font-semibold text-ink-800 tabular">
                    {selectedProducts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-500">Articles</span>
                  <span className="font-semibold text-ink-800 tabular">{nbArticles}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-500">Remise</span>
                  <span className="font-semibold text-ink-800 tabular">
                    {formData.remise || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-500">Format</span>
                  <span className="lg-badge-neutral">{formData.format}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/70 px-5 py-4">
                <span className="text-sm font-semibold text-ink-600">Total à payer</span>
                <span className="font-display text-2xl font-extrabold text-ink-900 tabular">
                  {fcfa(totalTicket)} <span className="text-base font-bold">F</span>
                </span>
              </div>

              <div className="flex flex-col gap-2.5 p-4">
                <button type="submit" disabled={encaissement} className="lg-btn-accent w-full lg-btn-lg">
                  {encaissement ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <BanknotesIcon className="h-5 w-5" />
                  )}
                  {encaissement ? "Encaissement…" : "Encaisser la vente"}
                </button>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="lg-btn-neutral w-full"
                  >
                    <DocumentTextIcon className="h-[18px] w-[18px]" />
                    Détails facture
                  </button>
                  <button
                    type="button"
                    onClick={handlePreview2}
                    className="lg-btn-soft w-full"
                  >
                    <DocumentTextIcon className="h-[18px] w-[18px]" />
                    Facture simple
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="lg-btn-ghost w-full"
                  >
                    <ArrowPathIcon className="h-[18px] w-[18px]" />
                    Rafraîchir
                  </button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>

      {/* Prévisualisation de la facture */}
      {isPreviewOpen && (
        <FacturePreview
          formData={formData}
          selectedProducts={selectedProducts}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
      {isPreviewOpen2 && (
        <FacturePrevieww
          formData={formData}
          selectedProducts={selectedProducts}
          onClose={() => setIsPreviewOpen2(false)}
        />
      )}

      {toastOuvert && <Toastadd reponse={rep} />}
    </div>
  );
}

export default Vendre;
