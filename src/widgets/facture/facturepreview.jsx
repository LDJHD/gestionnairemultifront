import axios from "axios";
import { useEffect, useState } from "react";


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
        }
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
      0
    );

    // Convertir la remise en un facteur (par exemple, 10% devient 0.1)
    const remisePourcentage = formData.remise / 100;

    // Calculer la valeur de la remise
    const remiseValeur = totalHT * remisePourcentage;

    // Total HT après remise
    // Total HT après remise (arrondi à l'entier le plus proche)
    const totalApresRemise = Math.round(totalHT - remiseValeur);


    return totalApresRemise;  // Total après remise
  };

  // Calcul TVA
  const calculateTVA = () => {
    return calculateTotalHT() * 0; // Exemple avec TVA à 18%
  };

  // Calcul du total TTC
  const calculateTotalTTC = () => {
    return calculateTotalHT() + calculateTVA();
  };

  // Calcul du montant payé (exemple basé sur une saisie utilisateur)
  const calculatePaidAmount = (paidAmount) => parseFloat(paidAmount) || 0;

  // Calcul du montant restant
  const calculateRemainingAmount = (paidAmount) => calculateTotalTTC() - calculatePaidAmount(paidAmount);


  const handleInvoiceSubmit = async () => {

    setLoading(true);

    const token = localStorage.getItem("token"); // Assurez-vous que le token est récupéré correctement

    // Données de la facture
    const invoiceData = {
      format: formData.format,
      ifu: "3202397904961", // Remplacez par l'IFU du client
      type: "FV", // Type de facture
      operator: {
        name: utilisateurs.nom, // Remplacez par le nom de l'opérateur
      },
      items: selectedProducts.map((product) => ({
        reference: product.code_barre,
        name: product.nom, // Nom de l'article
        price: product.prix, // Prix unitaire
        quantity: product.quantity, // Quantité
        unit: product.unit,
        taxGroup: product.taxGroup || "A", // Groupe fiscal (par défaut "A")
      })),
      client: {
        contact: clientDetails.telephone,
        ifu: clientDetails.ifu,
        name: clientDetails.nom,
        address: clientDetails.adresse,
      },
      payment: {
        total: calculateTotalWithRemise(),
        method: selectedPaymentMethod
      }
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
        }
      );

      const { uid } = invoiceResponse.data; // Récupérer l'UID de la facture générée
      const { datee } = invoiceResponse.data;

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
        montant_total: calculateTotalHT(), // Total HT
        tva: calculateTVA(), // TVA
        montant_total_ttc: calculateTotalTTC(), // Total TTC
        client_id: formData.client, // ID du client sélectionné
        items: selectedProducts.map((product) => ({
          produit_id: product.id, // ID du produit
          prix_unitaire: product.prix, // Prix unitaire
          quantite: product.quantity, // Quantité
        })),
        facture: {
          montant_total: calculateTotalHT(),
          tva: calculateTVA(), // TVA
          remise: formData.remise,
          montant_paye: calculatePaidAmount(paidAmountInput), // Montant payé (input utilisateur)
          montant_restant: calculateRemainingAmount(paidAmountInput), // Montant restant
          mode_paiement: selectedPaymentMethod, // Méthode de paiement
          client_id: formData.client,
        },
        pdf: filesavePath, // Lien du PDF généré
        pdf2: filesavePathsimple
      };

      // Appeler l'API backend pour enregistrer la vente
      const venteResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/vente/transaction`, venteData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // alert("Vente enregistrée avec succès !");
      console.log("Réponse serveur :", venteResponse.data);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la vente ou de la création de la facture :", error.response?.data || error.message);
      alert("Erreur lors de l'enregistrement de la vente ou de la création de la facture.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientDetails) {
    return <p className="font-bold text-red-900 text-center">Veuillez sélectionné le client...</p>;
  }

  return (
    <div className="fixed top-0 z-50 left-0 w-full h-screen bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          {/* Logo */}
          <div className="w-24 h-24 flex-shrink-0">
            <img src="/image/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {/* Company Information */}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">ATON HELIOSTORE</h1>
            <p>Fidjrossè centre</p>
            <p>Tél: 229 97737399 - Email: superelim@gmail.com</p>
            <p>IFU: 3202397094961</p>
            <p>RCCM: RB/COT/23 B 34278</p>
          </div>
          <div className="w-24 h-24 flex-2">
            <img src="/image/qr.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mt-4 border-t border-b py-2">
          <p>
            <strong>FACTURE N°:</strong> {formData.invoiceNumber || "FV0005875"}
          </p>
          <p>
            <strong>Client:</strong> {clientDetails.nom} {clientDetails.prenom}
          </p>
          <p>
            <strong>IFU:</strong> {clientDetails.ifu}
          </p>
          <p>
            <strong>Tél:</strong> {clientDetails.telephone}
          </p>
        </div>

        {/* Product Table */}
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full  mt-4 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Référence</th>
                <th className="border px-2 py-1">Libellé</th>
                <th className="border px-2 py-1">Quantité</th>
                <th className="border px-2 py-1">PU</th>
                <th className="border px-2 py-1">Montant</th>
              </tr>
            </thead>
            <tbody className="max-h-[300px] overflow-y-auto">
              {selectedProducts.map((product) => (
                <tr key={product.code_barre}>
                  <td className="border px-2 py-1">{product.code_barre}</td>
                  <td className="border px-2 py-1">{product.nom}</td>
                  <td className="border px-2 py-1">
                    {product.quantity} {product.unit}
                  </td>
                  <td className="border px-2 py-1">{product.prix} Fcfa</td>
                  <td className="border px-2 py-1">{product.prix * product.quantity} Fcfa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-4">
          <p>
            <strong>Total HT:</strong> {calculateTotalHT()} Fcfa
          </p>
          <p>
            <strong>Total TVA (0%):</strong> {calculateTVA()} Fcfa
          </p>
          <p>
            <strong>Total TTC:</strong> {calculateTotalTTC()} Fcfa
          </p>
          <p>
            <strong>Remise :</strong> {formData.remise} %
          </p>
          <p>
            <strong>Montant à payé :</strong> {calculateTotalWithRemise()} Fcfa
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="montant" className="block text-sm font-semibold text-gray-700">
              Montant Payé
            </label>
            <input
              type="number"
              required
              value={paidAmountInput}
              onChange={(e) => setPaidAmountInput(e.target.value)}
              placeholder="Montant payé"
              className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            />
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-semibold text-gray-700">
              Methode Payement
            </label>

            <select
              value={selectedPaymentMethod}
              required
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
            >
              <option value="Especes">Espèces</option>
              <option value="Transaction">Transaction Réseaux</option>
              <option value="Carte">Carte</option>
              <option value="Cheque">Chèque</option>
            </select>
          </div>
        </div>


        <div className="flex justify-between items-center">
          {/* Close Button */}
          <div className="text-left mt-4">
            <button
              type="button"
              onClick={handleInvoiceSubmit}
              disabled={loading}
              className="flex items-center space-x-2 m-2 p-2 bg-red-900 text-white font-bold rounded-md"
            >
              <span> {loading ? "Traitement..." : "Facturer"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
            </button>
          </div>
          {/* Affichage du PDF */}
          {pdfPath && (
            <div className="mt-4">
              <h3>Facture normalisée générée :</h3>
              <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="text-white font-bold p-1 bg-blue-600 rounded-lg underline">
                Voir la facture
              </a>
            </div>
          )}

          {pdfPathsimple && (
            <div className="mt-4">
              <h3>Facture générée :</h3>
              <a href={pdfPathsimple} target="_blank" rel="noopener noreferrer" className="text-white font-bold p-1 bg-blue-600 rounded-lg underline">
                Voir la facture
              </a>
            </div>
          )}
          <div className="text-right mt-4">
            <button onClick={onClose} className="p-2 bg-blue-600 text-white rounded">
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div >

  );
};

export default FacturePreview;
