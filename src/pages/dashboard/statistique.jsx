// Composant Clients
import { useEffect, useRef } from "react";
import axios from 'axios';
import { useState } from "react";
import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

/** Montant formaté « 1 234 567 » */
function fcfa(v) {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString("fr-FR").replace(/[\u202f\u00a0,]/g, " ")
    : v ?? "—";
}

/** Petite carte KPI réutilisable (rendu uniquement) */
function KpiCard({ icon: Icone, ton, label, value, suffixe, hint }) {
  return (
    <div className="lg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink-500">{label}</p>
          <p className="mt-2 font-display text-[26px] font-extrabold leading-none text-ink-900 tabular">
            {fcfa(value)}
            {suffixe ? (
              <span className="ml-1 text-base font-bold text-ink-500">{suffixe}</span>
            ) : null}
          </p>
          {hint ? <p className="mt-2 text-[13px] text-ink-500">{hint}</p> : null}
        </div>
        <span className={`lg-icon-chip h-11 w-11 ring-1 ring-inset ${ton}`}>
          <Icone className="h-[22px] w-[22px]" />
        </span>
      </div>
    </div>
  );
}

// Component for detailed view of vente tab
function VenteTabContent({ ventesnombre, totalMontant, totalProduit }) {
  const [toast, setToast] = useState(false);
  const handletoast = () => {
    setToast(true);
  };


  return (
    <div className="w-full">
      <div className="w-full">
        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th>Numérotation</th>
                <th className="text-right">Nombre de vente</th>
                <th className="text-right">Total produit</th>
                <th className="text-right">Total des ventes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="lg-td">
                  <span className="lg-badge-neutral">#</span>
                </td>
                <td className="lg-td text-right font-semibold text-ink-800 tabular">
                  {ventesnombre}
                </td>
                <td className="lg-td text-right font-semibold text-ink-800 tabular">
                  {totalProduit}
                </td>
                <td className="lg-td text-right font-bold text-ink-900 tabular">
                  {fcfa(totalMontant)} F
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-ink-200 bg-ink-50/70">
                <td colSpan={3} className="lg-td text-right text-[13px] font-semibold text-ink-600">
                  Total :
                </td>
                <td className="lg-td text-right font-display text-base font-extrabold text-ink-900 tabular">
                  {fcfa(totalMontant)} F
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}



function FactureTabContent({ ceJour, septJour, trenteDerniersJours, totalEnregistrementDefaut, totalMontantDefaut }) {



  const handleGeneratePDF = async () => {
    const data = {
      title: "Statistique Comptabilité",
      totalEnregistrementDefaut,
      totalMontantDefaut,
      ceJour,
      septJour,
      trenteDerniersJours,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/invoice/statistique`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du PDF");
      }

      const jsonResponse = await response.json(); // Récupérer la réponse JSON du backend
      const { datee } = jsonResponse; // Date de création du PDF

      // Télécharge le PDF directement en tant que blob
      const blobResponse = await fetch(`${import.meta.env.VITE_API_URL}/pdf/${datee}_statistiques_comptabilite.pdf`);

      if (!blobResponse.ok) {
        throw new Error("Erreur lors du téléchargement du PDF");
      }

      const blob = await blobResponse.blob(); // Récupérer le PDF sous forme de blob
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${datee}_statistiques_comptabilite.pdf`; // Nom du fichier PDF à télécharger
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };





  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Tableau 1: Statistiques par type de facture */}
        <section className="lg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-base font-extrabold text-ink-900">
              Statistiques par type de facture
            </h3>
            <span className="lg-badge-neutral">4 colonnes</span>
          </div>
          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[560px]">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Catégorie</th>
                  <th className="text-right">FV</th>
                  <th className="text-right">FA</th>
                  <th className="text-right">EV</th>
                  <th className="text-right">EA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="lg-td text-ink-500 tabular">1</td>
                  <td className="lg-td font-semibold text-ink-800">Nombre des factures</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {totalEnregistrementDefaut}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                </tr>
                <tr>
                  <td className="lg-td text-ink-500 tabular">2</td>
                  <td className="lg-td font-semibold text-ink-800">Exonérés</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {fcfa(totalMontantDefaut)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                </tr>
                <tr>
                  <td className="lg-td text-ink-500 tabular">8</td>
                  <td className="lg-td font-semibold text-ink-800">Total</td>
                  <td className="lg-td text-right font-bold text-ink-900 tabular">
                    {fcfa(totalMontantDefaut)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tableau 2: Montants */}
        <section className="lg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-base font-extrabold text-ink-900">Montants</h3>
            <span className="lg-badge-brand">FCFA</span>
          </div>
          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[560px]">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th className="text-right">Montant à l'intérieur</th>
                  <th className="text-right">Montant à l'exportation</th>
                  <th className="text-right">Montant total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="lg-td font-semibold text-ink-800">Exonérés</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {fcfa(totalMontantDefaut)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right font-bold text-ink-900 tabular">
                    {fcfa(totalMontantDefaut)}
                  </td>
                </tr>
                <tr>
                  <td className="lg-td font-semibold text-ink-800">Aujourd'hui</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {fcfa(ceJour)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right font-bold text-ink-900 tabular">
                    {fcfa(ceJour)}
                  </td>
                </tr>
                <tr>
                  <td className="lg-td font-semibold text-ink-800">7 derniers jours</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {fcfa(septJour)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right font-bold text-ink-900 tabular">
                    {fcfa(septJour)}
                  </td>
                </tr>
                <tr>
                  <td className="lg-td font-semibold text-ink-800">30 derniers jours</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {fcfa(trenteDerniersJours)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right font-bold text-ink-900 tabular">
                    {fcfa(trenteDerniersJours)}
                  </td>
                </tr>
                <tr>
                  <td className="lg-td font-semibold text-ink-800">Sous-total</td>
                  <td className="lg-td text-right font-semibold text-ink-900 tabular">
                    {fcfa(totalMontantDefaut)}
                  </td>
                  <td className="lg-td text-right text-ink-500 tabular">0</td>
                  <td className="lg-td text-right font-bold text-ink-900 tabular">
                    {fcfa(totalMontantDefaut)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button type="button" className="lg-btn-primary" onClick={handleGeneratePDF}>
          <ArrowDownTrayIcon className="h-[18px] w-[18px]" />
          Télécharger le PDF
        </button>
      </div>
    </div>
  );
}





export function Statistique() {
  const [facture, setfacture] = useState([]);
  const [activeTab, setActiveTab] = useState("vente");

  const data = [
    { label: "Avancé", value: "vente" },
    { label: "Global", value: "produit" }
  ];





  const [productrecherche, setProductrecherche] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    produit_id: "",
    client_id: "",
    dateDebut: "2023-01-01",
    dateFin: today
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Stocke le produit sélectionné
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Contrôle l'ouverture de la liste déroulante

  // Fetch all products on mount
  useEffect(() => {
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
          setFilteredProducts(data); // Initialize filteredProducts
        } else {
          console.error("Erreur lors de la récupération des produits:", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "produit_id") {
      setSelectedProduct(null); // Réinitialiser le produit sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpen(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filtered = products.filter(
        (product) =>
          product.nom.toLowerCase().includes(value.toLowerCase()) ||
          (product.code_barre && product.code_barre.toLowerCase().includes(value.toLowerCase()))
      );

      setFilteredProducts(filtered);
      fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    } else {

      setFormData((prevData) => ({ ...prevData, [name]: value }));
      fetchProductselectDetails(formData.produit_id);
      fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    }

  };




  // Fonction pour récupérer les détails du produit recherche
  const fetchProductselectDetails = async (valeur) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/produit/filtreBycodebarre`,
        { valeur },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        }
      );

      const product = response.data;
      setProductrecherche(product)
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product); // Enregistrer le produit sélectionné
    setFormData((prev) => ({ ...prev, produit_id: product.id })); // Enregistrer l'ID du produit
    fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    setIsDropdownOpen(false); // Fermer la liste déroulante
  };

  useEffect(() => {
    if (formData.produit_id) {
      fetchProductselectDetails(formData.produit_id); // Charger les détails si le valeuretre est fourni
      fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    } else {
      setIsDropdownOpen(false)
      console.log('loose');
    }
  }, [formData.produit_id]);








  const [ventes, setventes] = useState([]);

  const [ventesnombre, setventesnombre] = useState(0);
  const [totalMontant, setTotalMontant] = useState(0);
  const [totalProduit, setTotalProduit] = useState(0);
  const [ceJour, setceJour] = useState(0);
  const [septJour, setseptJour] = useState(0);
  const [totalMontantDefaut, settotalMontantDefaut] = useState(0);
  const [totalEnregistrementDefaut, settotalEnregistrementDefaut] = useState(0);
  const [trenteDerniersJours, settrenteDerniersJours] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); // Ajout d'un état pour suivre le chargement



  const [client, setclient] = useState([]);
  const [filteredclient, setFilteredclient] = useState([]);
  const [selectedclient, setSelectedclient] = useState(null); // Stocke le client sélectionné
  const [isDropdownOpenclient, setIsDropdownOpenclient] = useState(false); // Contrôle l'ouverture de la liste déroulante


  useEffect(() => {
    if (formData.client_id) {
      fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    } else {
      setIsDropdownOpenclient(false)
      console.log('loose');
    }
  }, [formData.client_id]);




  const handleclientSelect = (client) => {
    setSelectedclient(client); // Enregistrer le client sélectionné
    setFormData((prev) => ({ ...prev, client_id: client.nom })); // Enregistrer l'ID du client
    // fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    setIsDropdownOpenclient(false); // Fermer la liste déroulante
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

  const handleInputChangeclient = (e) => {
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "client_id") {
      setSelectedclient(null); // Réinitialiser le client sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpenclient(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filtered = client.filter(
        (client) =>
          client.nom.toLowerCase().includes(value.toLowerCase()) ||
          (client.ifu && client.prenom.toLowerCase().includes(value.toLowerCase()))
      );

      setFilteredclient(filtered);
      fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
    }
  };




  const fetchventeselectvente = async (valeur, dateDebut, dateFin, produit) => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token

      // Envoyer une requête POST avec axios
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/ventesearch/som`,
        { valeur, dateDebut, dateFin, produit }, // Inclure les données dans le corps de la requête
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ajouter le token dans les en-têtes
          },
        }
      );

      // Récupérer les données de la réponse
      const { result, totalMontant, totalProduit, totalEnregistrement, ceJour, septJour, trenteDerniersJours, totalEnregistrementDefaut, totalMontantDefaut, message } = response.data;
      // Nettoyer les doublons dans les données des ventes (facultatif)
      const ventesUniques = Array.isArray(result)
        ? result.filter(
          (vente, index, self) =>
            index === self.findIndex((v) => v.client_id === vente.client_id)
        )
        : [];
      if (!ventesUniques || ventesUniques.length === 0) {
        setTotalMontant(0);
        setventesnombre(0);
      }



      // Mettre à jour les différents états avec les données
      setventes(ventesUniques); // Met à jour l'état avec les ventes
      setventesnombre(totalEnregistrement);
      setTotalMontant(totalMontant); // Met à jour l'état pour la somme des montants
      setTotalProduit(totalProduit); // Met à jour l'état pour le total produit (si applicable)
      setceJour(ceJour);
      setseptJour(septJour);
      settrenteDerniersJours(trenteDerniersJours);
      settotalMontantDefaut(totalMontantDefaut);
      settotalEnregistrementDefaut(totalEnregistrementDefaut);
      setMessage(message); // Met à jour l'état pour le message

      console.log("Ventes récupérées :", ventesUniques);
      console.log("Montant total :", totalMontant);
      if (totalProduit !== null) console.log("Total produit :", totalProduit);
    } catch (error) {
      console.error("Erreur de récupération des ventes :", error);

      // Gestion des erreurs
      if (error.response && error.response.data) {
        console.error("Erreur du serveur :", error.response.data.erreur || error.response.data.message);
      } else {
        console.error("Erreur inattendue :", error.message);
      }
    } finally {
      setLoading(false); // Arrêt du chargement après récupération des données
    }
  };





  useEffect(() => {
    const fetchVentes = async () => {
      const clientId = formData.client_id?.trim(); // Supprimer les espaces inutiles
      const produit = formData.produit_id?.trim();
      // Gestion des dates
      const today = new Date().toISOString().split("T")[0]; // Date du jour
      const defaultStartDate = "2023-01-01"; // Date de début par défaut

      const dateDebut = formData.dateDebut || defaultStartDate;
      const dateFin = formData.dateFin || today;

      if (clientId || dateDebut || dateFin || produit) {
        try {
          await fetchventeselectvente(clientId, dateDebut, dateFin, produit);
          console.log(ventes)
        } catch (error) {
          console.error("Erreur dans useEffect :", error);
        }
      } else {
        // Réinitialiser si `client_id` est vide ou contient uniquement des espaces
        setIsDropdownOpenclient(false);
      }
    };

    fetchVentes();
  }, [formData.client_id, formData.dateDebut, formData.dateFin]); // Dépend des champs de recherche




  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">

      {/* ══════════════════ EN-TÊTE DE PAGE ══════════════════ */}
      <header>
        <p className="text-[13px] font-semibold text-brand-600">Pilotage</p>
        <h1 className="lg-page-title">Statistiques &amp; comptabilité</h1>
        <p className="lg-page-sub">
          Filtrez par client, produit ou période pour analyser vos performances.
        </p>
      </header>

      {/* ══════════════════ FILTRES ══════════════════ */}
      <section className="lg-card p-5">
        <div className="flex items-center gap-2.5">
          <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
            <MagnifyingGlassIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="font-display text-base font-extrabold text-ink-900">
              Filtres de recherche
            </p>
            <p className="text-[13px] text-ink-500">Les résultats se mettent à jour automatiquement</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Input pour recherche de vente */}
          <div className="relative">
            <label className="lg-label" htmlFor="client_id">
              Nom / IFU
            </label>
            <input
              type="text"
              id="client_id"
              name="client_id"
              value={selectedclient ? selectedclient.nom : formData.client_id}
              onChange={handleInputChangeclient}
              onFocus={() => setIsDropdownOpenclient(true)} // Ouvrir la liste déroulante
              placeholder="Rechercher un client"
              autoComplete="off"
              className="lg-input"
            />
            {isDropdownOpenclient && (
              <ul className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 overflow-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift animate-slide-down">
                {filteredclient.map((client) => (
                  <li
                    key={client.id}
                    onClick={() => handleclientSelect(client)}
                    className="cursor-pointer rounded-lg px-3 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    {client.nom} {client.prenom}
                  </li>
                ))}
                {filteredclient.length === 0 && (
                  <li className="px-3 py-2 text-[13px] text-ink-500">Aucun client trouvée</li>
                )}
              </ul>
            )}
          </div>

          {/* Input pour la date de début */}
          <div>
            <label className="lg-label" htmlFor="dateDebut">
              Début
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={formData.dateDebut || ""}
              onChange={handleInputChangeclient}
              placeholder="Date de début"
              className="lg-input tabular"
            />
          </div>

          {/* Input pour la date de fin */}
          <div>
            <label className="lg-label" htmlFor="dateFin">
              Fin
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={formData.dateFin || ""}
              onChange={handleInputChangeclient}
              placeholder="Date de fin"
              className="lg-input tabular"
            />
          </div>

          {/* Input pour le produit */}
          <div className="relative">
            <label className="lg-label" htmlFor="produit_id">
              Produit
            </label>
            <input
              type="text"
              id="produit_id"
              name="produit_id"
              value={selectedProduct ? selectedProduct.nom : formData.produit_id}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpen(true)} // Ouvrir la liste déroulante
              placeholder="Rechercher le produit"
              autoComplete="off"
              className="lg-input"
            />
            {isDropdownOpen && (
              <ul className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 overflow-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift animate-slide-down">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="cursor-pointer rounded-lg px-3 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    {product.nom}
                  </li>
                ))}
                {filteredProducts.length === 0 && (
                  <li className="px-3 py-2 text-[13px] text-ink-500">Aucun produit trouvé</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════ KPI ══════════════════ */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="lg-card h-[142px] p-5">
              <div className="lg-skeleton h-3.5 w-2/3" />
              <div className="lg-skeleton mt-5 h-8 w-1/2" />
              <div className="lg-skeleton mt-4 h-3 w-1/3" />
            </div>
          ))
        ) : (
          <>
            <KpiCard
              icon={ShoppingCartIcon}
              ton="bg-brand-50 text-brand-600 ring-brand-100"
              label="Nombre de ventes"
              value={ventesnombre}
              hint="Transactions sur la période"
            />
            <KpiCard
              icon={BanknotesIcon}
              ton="bg-accent-50 text-accent-600 ring-accent-100"
              label="Chiffre d'affaires"
              value={totalMontant}
              suffixe="F"
              hint="Montant total encaissé"
            />
            <KpiCard
              icon={CubeIcon}
              ton="bg-sky-50 text-sky-600 ring-sky-100"
              label="Produits vendus"
              value={totalProduit}
              hint="Quantités cumulées"
            />
            <KpiCard
              icon={ChartBarIcon}
              ton="bg-violet-50 text-violet-600 ring-violet-100"
              label="Recette du jour"
              value={ceJour}
              suffixe="F"
              hint={`7 derniers jours : ${fcfa(septJour)} F`}
            />
          </>
        )}
      </section>

      {/* ══════════════════ RÉSULTATS ══════════════════ */}
      <section className="lg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-9 w-9 bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
              <ChartBarIcon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="font-display text-base font-extrabold text-ink-900">
                Résultats détaillés
              </p>
              <p className="text-[13px] text-ink-500">
                Synthèse des ventes par période et par catégorie
              </p>
            </div>
          </div>
          <span className="lg-badge-neutral">
            <CalendarDaysIcon className="h-3.5 w-3.5" />
            {formData.dateDebut} au {formData.dateFin}
          </span>
        </div>

        {/* Onglets */}
        <div
          role="tablist"
          aria-label="Type de statistiques"
          className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50/70 p-2"
        >
          {data.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={activeTab === value}
              onClick={() => setActiveTab(value)}
              className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                activeTab === value
                  ? "bg-white text-brand-700 shadow-soft ring-1 ring-inset ring-brand-100"
                  : "text-ink-500 hover:bg-white/70 hover:text-ink-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="lg-skeleton h-[48px] w-full" />
              ))}
            </div>
          ) : (
            <>
              {activeTab === "vente" && (
                <VenteTabContent
                  ventesnombre={ventesnombre}
                  totalMontant={totalMontant}
                  totalProduit={totalProduit}
                />
              )}
              {activeTab === "produit" && (
                <FactureTabContent
                  ceJour={ceJour}
                  septJour={septJour}
                  trenteDerniersJours={trenteDerniersJours}
                  totalEnregistrementDefaut={totalEnregistrementDefaut}
                  totalMontantDefaut={totalMontantDefaut}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Statistique;
