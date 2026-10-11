import axios from "axios";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
const FacturePreview = ({ formData, selectedProducts, onClose }) => {
  const [clientDetails, setClientDetails] = useState(null);
  const [utilisateurs, setutilisateurs] = useState(null);
  const [paidAmountInput, setPaidAmountInput] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Espèces");
  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState(null); // Chemin du PDF généré
  const [pdfPathsimple, setPdfPathsimple] = useState(null); // Chemin du PDF généré
  const [pdfsavePath, setPdfsavePath] = useState(null);
  // Fonction pour récupérer les utilistateurs
  const fetchutilisateurs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(utilisateurs);
        setutilisateurs(data);
      } else {
        console.error("Erreur lors de la récupération des utilisateur:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };
  // Appel de fetutilisateurs lors du chargement du composant
  useEffect(() => {
    fetchutilisateurs();
  }, []);
  // Fonction pour récupérer les détails du client
  const fetchClientDetails = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/client/detailById`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        },
      );
      setClientDetails(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du client :", error);
    }
  };
  useEffect(() => {
    if (formData.client) {
      fetchClientDetails(formData.client);
    }
  }, [formData.client]);
  // Calcul du total HT
  const calculateTotalHT = () => {
    return selectedProducts.reduce((acc, product) => acc + product.prix * product.quantity, 0);
  };
  const calculateTotalWithRemise = () => {
    const totalHT = selectedProducts.reduce(
      (acc, product) => acc + product.prix * product.quantity,
      0,
    );
    const tva = calculateTVA(); // Calcul de la TVA
    const aib = calculateAIB(); // Calcul de l'AIB
    const totalTTC = totalHT + tva + aib; // Total TTC avant remise
    // Convertir la remise en un facteur (ex: 10% devient 0.1)
    const remisePourcentage = formData.remise / 100;
    // Calculer la valeur de la remise sur le TTC
    const remiseValeur = totalTTC * remisePourcentage;
    // Total TTC après remise (arrondi à l'entier le plus proche)
    const totalApresRemise = Math.round(totalTTC - remiseValeur);
    return totalApresRemise;
  };
  // Calcul TVA
  const calculateTVA = () => {
    return selectedProducts.reduce((totalTVA, product) => {
      const tauxTVA =
        product.taxation === "B"
          ? 0.18
          : product.taxation === "D"
          ? 0.18
          : product.taxation === "AIBA"
          ? 0.01
          : product.taxation === "AIBB"
          ? 0.05
          : 0; // Par défaut, pas de TVA (0) pour "A" ou autres valeurs inconnues
      return totalTVA + product.prix * product.quantity * tauxTVA;
    }, 0);
  };
  const calculateAIB = () => {
    return selectedProducts.reduce((totalAIB, product) => {
      // Vérifier si l'AIB doit être appliqué (taxation ≠ "B" et "D" + formData.aib ≠ "N/A")
      if (!["B", "D"].includes(product.taxation) && formData.aib !== "N/A") {
        const tauxAIB = formData.aib === "A" ? 0.01 : formData.aib === "B" ? 0.05 : 0;
        return totalAIB + product.prix * product.quantity * tauxAIB;
      }
      return totalAIB; // Sinon, pas d'AIB
    }, 0);
  };
  // Calcul du total TTC
  const calculateTotalTTC = () => {
    return calculateTotalHT() + calculateTVA() + calculateAIB();
  };
  // Calcul du montant payé (exemple basé sur une saisie utilisateur)
  const calculatePaidAmount = (paidAmount) => parseFloat(paidAmount) || 0;
  // Calcul du montant restant
  const calculateRemainingAmount = (paidAmount) =>
    calculateTotalTTC() - calculatePaidAmount(paidAmount);
  const handleInvoiceSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token"); // Assurez-vous que le token est récupéré correctement
    // Données de la facture
    const invoiceData = {
      cAIB: calculateAIB(),
      cHT: calculateTotalHT(),
      cTTC: calculateTotalTTC(),
      cTVA: calculateTVA(),
      format: formData.format,
      ifu: "3202397904961", // Remplacez par l'IFU du client
      aib: formData.aib,
      type: "FV", // Type de facture
      operator: {
        name: utilisateurs?.nom || "", // Remplacez par le nom de l'opérateur
      },
      items: selectedProducts.map((product) => ({
        reference: product.code_barre,
        name: product.nom, // Nom de l'article
        price: product.prix, // Prix unitaire
        quantity: product.quantity, // Quantité
        unit: product.unit,
        taxGroup: product.taxation || "A", // Groupe fiscal (par défaut "A")
      })),
      client: {
        contact: clientDetails.telephone,
        ifu: clientDetails.ifu,
        name: clientDetails.nom,
        address: clientDetails.adresse,
      },
      payment: {
        total: calculateTotalWithRemise(),
        method: selectedPaymentMethod,
      },
    };
    try {
      // Étape 1: Créer la facture via l'API
      const invoiceResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/invoice/create`,
        invoiceData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const { uid } = invoiceResponse.data; // Récupérer l'UID de la facture générée
      const { datee } = invoiceResponse.data;
      const { invoiceId } = invoiceResponse.data;
      // Construire l'URL du fichier PDF
      const filePath = `${import.meta.env.VITE_API_URL}/factures/facture_${uid}.pdf`;
      const filesavePath = `/factures/facture_${uid}.pdf`;
      const filesavePathsimple = `/invoices/invoice_${datee}.pdf`;
      const filePathsimple = `${import.meta.env.VITE_API_URL}/invoices/invoice_${datee}.pdf`;
      setPdfsavePath(filesavePath);
      setPdfPath(filePath); // Enregistrez le chemin complet
      setPdfPathsimple(filePathsimple);
      // alert("Facture générée avec succès !");
      console.log(`PDF disponible à : ${filePath}`);
      // Ouvrir ou télécharger le PDF
      // window.open(filePath, "_blank");
      // Étape 2: Enregistrer la vente avec la facture
      const venteData = {
        montant_total: calculateTotalWithRemise(), // Total HT
        tva: calculateTVA(), // TVA
        montant_total_ttc: calculateTotalTTC(), // Total TTC
        client_id: formData.client, // ID du client sélectionné
        items: selectedProducts.map((product) => ({
          produit_id: product.id, // ID du produit
          prix_unitaire: product.prix, // Prix unitaire
          quantite: product.quantity, // Quantité
        })),
        facture: {
          montant_total: calculateTotalWithRemise(),
          tva: calculateTVA(), // TVA
          remise: formData.remise,
          montant_paye: calculatePaidAmount(paidAmountInput), // Montant payé (input utilisateur)
          montant_restant: calculateRemainingAmount(paidAmountInput), // Montant restant
          mode_paiement: selectedPaymentMethod, // Méthode de paiement
          client_id: formData.client,
        },
        pdf: filesavePath, // Lien du PDF généré
        pdf2: filesavePathsimple,
        invoice_id: invoiceId,
      };
      // Appeler l'API backend pour enregistrer la vente
      const venteResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/transaction`,
        venteData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // alert("Vente enregistrée avec succès !");
      console.log("Réponse serveur :", venteResponse.data);
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de la vente ou de la création de la facture :",
        error.response?.data || error.message,
      );
      toast.error("Erreur lors de l'enregistrement de la vente ou de la création de la facture.");
    } finally {
      setLoading(false);
    }
  };
  const fcfa = (n) => `${Number(n || 0).toLocaleString("fr-FR")} F`;
  if (!clientDetails) {
    return createPortal(
      <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-900/50 p-6 backdrop-blur-sm">
        <div className="w-full max-w-md animate-pop-in overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-8 text-center shadow-lift">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </span>
          <h2 className="font-display text-lg font-extrabold text-ink-900">
            Sélectionnez d'abord un client
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
            La facture ne peut pas être établie sans l'identité du client (nom, IFU, téléphone).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="lg-btn-neutral lg-btn-sm mt-5"
          >
            <XMarkIcon className="h-4 w-4" />
            Fermer
          </button>
        </div>
      </div>,
      document.body
    );
  }
  const reste = calculateRemainingAmount(paidAmountInput);
  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-ink-900/50 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center">
        <div className="w-full max-w-4xl overflow-hidden bg-white shadow-lift sm:my-6 sm:rounded-3xl animate-pop-in">
          {/* ══════════════ EN-TÊTRE ENTREPRISE ══════════════ */}
          <div className="relative overflow-hidden bg-brand-deep px-6 py-6 text-white sm:px-8">
            {/* Croix de fermeture */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la facture"
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
            </button>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/[0.10] blur-3xl" />
              <div className="absolute -bottom-28 -left-10 h-56 w-56 rounded-full bg-accent-400/[0.20] blur-3xl" />
            </div>
            <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
              <div className="h-20 w-20 flex-none rounded-2xl bg-white/[0.95] p-1.5 shadow-soft ring-1 ring-white/25">
                <img
                  src="/image/logo.png"
                  alt="Logo Aton Héliostore"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-[0.18em] text-white/60 uppercase">
                  Facture de vente
                </p>
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  ATON HELIOSTORE
                </h1>
                <p className="mt-1 text-[13px] text-white/70">Fidjrossè centre</p>
                <p className="text-[13px] text-white/70">
                  Tél : 229 97737399 · Email : superelim@gmail.com
                </p>
                <p className="mt-0.5 text-[12px] text-white/55 tabular">
                  IFU : 3202397094961 · RCCM : RB/COT/23 B 34278
                </p>
              </div>
              <div className="h-20 w-20 flex-none rounded-2xl bg-white/[0.95] p-1.5 shadow-soft ring-1 ring-white/25">
                <img
                  src="/image/qr.png"
                  alt="QR code de paiement"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
          {/* ══════════════ RÉFÉRENCES ══════════════ */}
          <div className="grid gap-4 border-b border-ink-100 px-6 py-5 sm:grid-cols-2 sm:px-8">
            <div className="rounded-2xl bg-ink-50 p-4 ring-1 ring-inset ring-ink-200/70">
              <p className="lg-label mb-2">Facture</p>
              <p className="font-display text-lg font-extrabold text-ink-900 tabular">
                N° {formData.invoiceNumber || "FV0005875"}
              </p>
              <p className="mt-1 text-[12.5px] text-ink-500">
                {selectedProducts.length} ligne(s) · {formData.format || "Normalisée"}
              </p>
            </div>
            <div className="rounded-2xl bg-ink-50 p-4 ring-1 ring-inset ring-ink-200/70">
              <p className="lg-label mb-2">Client</p>
              <p className="font-display text-lg font-extrabold text-ink-900">
                {clientDetails.nom} {clientDetails.prenom}
              </p>
              <dl className="mt-1 space-y-0.5 text-[12.5px] text-ink-500 tabular">
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-ink-600">IFU</dt>
                  <dd>{clientDetails.ifu}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-ink-600">Tél</dt>
                  <dd>{clientDetails.telephone}</dd>
                </div>
              </dl>
            </div>
          </div>
          {/* ══════════════ LIGNES ══════════════ */}
          <div className="px-6 py-5 sm:px-8">
            <div className="lg-table-wrap">
              <table className="lg-table">
                <thead>
                  <tr>
                    <th className="lg-th">Référence</th>
                    <th className="lg-th">Libellé</th>
                    <th className="lg-th !text-right">Qté</th>
                    <th className="lg-th !text-right">P.U.</th>
                    <th className="lg-th !text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product, i) => (
                    <tr key={product.code_barre || i}>
                      <td className="lg-td text-[12.5px] text-ink-500 tabular">
                        {product.code_barre}
                      </td>
                      <td className="lg-td font-semibold text-ink-800">{product.nom}</td>
                      <td className="lg-td !text-right tabular">
                        {product.quantity} {product.unit}
                      </td>
                      <td className="lg-td !text-right tabular">{fcfa(product.prix)}</td>
                      <td className="lg-td !text-right font-semibold text-ink-900 tabular">
                        {fcfa(product.prix * product.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* ══════════════ TOTAUX ══════════════ */}
            <div className="mt-5 flex justify-end">
              <dl className="w-full max-w-sm space-y-1.5 rounded-2xl bg-ink-50 p-4 ring-1 ring-inset ring-ink-200/70 tabular">
                <LigneTotal libelle="Total HT" valeur={fcfa(calculateTotalHT())} />
                <LigneTotal
                  libelle={`AIB (${
                    formData.aib === "A" ? "1 %" : formData.aib === "B" ? "5 %" : "N/A"
                  })`}
                  valeur={fcfa(calculateAIB())}
                />
                <LigneTotal libelle="Total TVA" valeur={fcfa(calculateTVA())} />
                <LigneTotal libelle="Total TTC" valeur={fcfa(calculateTotalTTC())} fort />
                <LigneTotal libelle="Remise" valeur={`${formData.remise || 0} %`} />
                <div className="flex items-baseline justify-between gap-4 border-t border-ink-200 pt-2.5">
                  <dt className="text-[13px] font-bold text-ink-900">Montant à payer</dt>
                  <dd className="font-display text-xl font-extrabold text-brand-700 tabular">
                    {fcfa(calculateTotalWithRemise())}
                  </dd>
                </div>
              </dl>
            </div>
            {/* ══════════════ ENCAISSEMENT ══════════════ */}
            <div className="mt-5 grid gap-4 rounded-2xl border border-ink-200/80 p-4 sm:grid-cols-2">
              <div>
                <label htmlFor="montant" className="lg-label">
                  Montant payé (F)
                </label>
                <input
                  id="montant"
                  type="number"
                  min="0"
                  required
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  placeholder="0"
                  className="lg-input tabular"
                />
                {Number(paidAmountInput) > 0 && reste !== 0 && (
                  <p
                    className={`mt-1.5 text-[12.5px] font-semibold tabular ${
                      reste < 0 ? "text-red-600" : "text-amber-700"
                    }`}
                  >
                    {reste < 0 ? "Trop payé de " : "Reste à payer : "}
                    {fcfa(Math.abs(reste))}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="format" className="lg-label">
                  Méthode de paiement
                </label>
                <select
                  id="format"
                  value={selectedPaymentMethod}
                  required
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="lg-select"
                >
                  <option value="Especes">Espèces</option>
                  <option value="Transaction">Transaction Réseaux</option>
                  <option value="Carte">Carte</option>
                  <option value="Cheque">Chèque</option>
                </select>
              </div>
            </div>
            {/* ══════════════ PDF GÉNÉRÉS ══════════════ */}
            {(pdfPath || pdfPathsimple) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {pdfPath && (
                  <a
                    href={pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lg-btn-soft lg-btn-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Facture normalisée
                  </a>
                )}
                {pdfPathsimple && (
                  <a
                    href={pdfPathsimple}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lg-btn-soft lg-btn-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Facture générée
                  </a>
                )}
              </div>
            )}
          </div>
          {/* ══════════════ ACTIONS ══════════════ */}
          <div className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-ink-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-[12.5px] text-ink-500">
              Opérateur :{" "}
              <span className="font-semibold text-ink-700">{utilisateurs?.nom || "—"}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="lg-btn-neutral lg-btn-sm">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleInvoiceSubmit}
                disabled={loading}
                className="lg-btn-primary lg-btn-sm"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Traitement…
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4" />
                    Valider &amp; facturer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
/** Ligne du récapitulatif des totaux de facture. */
function LigneTotal({ libelle, valeur, fort = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={`text-[13px] ${fort ? "font-bold text-ink-900" : "text-ink-500"}`}>
        {libelle}
      </dt>
      <dd className={`font-semibold ${fort ? "text-ink-900" : "text-ink-700"}`}>{valeur}</dd>
    </div>
  );
}
export default FacturePreview;
