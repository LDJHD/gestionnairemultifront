// Composant Clients
import {
  Card,
  CardBody,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Tabs,
  CardHeader,
  Button,
  Typography
} from "@material-tailwind/react";
import { useEffect, useRef } from "react";
import axios from 'axios';
import { useState } from "react";


// Component for detailed view of vente tab
function VenteTabContent({ ventesnombre, totalMontant, totalProduit }) {
  const [toast, setToast] = useState(false);
  const handletoast = () => {
    setToast(true);
  };


  return (
    <div className="w-full p-4">
      <div className="w-full max-w-screen ">
        <div className="w-full overflow-x-auto md:overflow-x-visible px-0 pt-0 pb-2">
          <table className="w-full min-w-[600px] table-auto">
            <thead>
              <tr>
                {["Numerotation", "Nombre de vente", "Total produit", "TOTAL DES VENTES"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              <tr>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    #
                  </Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {ventesnombre}
                  </Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {totalProduit}
                  </Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {totalMontant}
                  </Typography>
                </td>
              </tr>

            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 px-5 text-right font-bold text-blue-gray-600">
                  Total :
                </td>
                <td colSpan={3} className="py-3 px-5 text-left font-bold text-blue-gray-800">
                  {totalMontant}
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
    <div className="w-full p-4">
      <Card>
        <CardBody className="p-10">
          <div className="grid grid-cols-2 gap-4">
            {/* Tableau 1: Statistiques par type de facture */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Statistiques par type de facture</h3>
              <table className="w-full border border-gray-900 text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-black font-bold">#</th>
                    <th className="border p-2 text-black font-bold">Catégorie</th>
                    <th className="border p-2 text-black font-bold">FV</th>
                    <th className="border p-2 text-black font-bold">FA</th>
                    <th className="border p-2 text-black font-bold">EV</th>
                    <th className="border p-2 text-black font-bold">EA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">1</td>
                    <td className="border p-2 text-black font-bold">Nombre des factures</td>
                    <td className="border p-2 text-black font-bold">{totalEnregistrementDefaut}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">0</td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">2</td>
                    <td className="border p-2 text-black font-bold">Exonérés</td>
                    <td className="border p-2 text-black font-bold">{totalMontantDefaut}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">0</td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">8</td>
                    <td className="border p-2 text-black font-bold">Total</td>
                    <td className="border p-2 text-black font-bold">{totalMontantDefaut}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tableau 2: Montants */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Montants</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-black font-bold">Catégorie</th>
                    <th className="border p-2 text-black font-bold">Montant à l'intérieur</th>
                    <th className="border p-2 text-black font-bold">Montant à l'exportation</th>
                    <th className="border p-2 text-black font-bold">Montant Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">Exonérés</td>
                    <td className="border text-black font-bold p-2">{totalMontantDefaut}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">{totalMontantDefaut}</td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">Aujourd'hui</td>
                    <td className="border p-2 text-black font-bold">{ceJour}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">{ceJour}</td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">7 derniers jours</td>
                    <td className="border p-2 text-black font-bold">{septJour}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">{septJour}</td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">30 derniers jours</td>
                    <td className="border p-2 text-black font-bold">{trenteDerniersJours}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">{trenteDerniersJours}</td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2 text-black font-bold">Sous total</td>
                    <td className="border p-2 text-black font-bold">{totalMontantDefaut}</td>
                    <td className="border p-2 text-black font-bold">0</td>
                    <td className="border p-2 text-black font-bold">{totalMontantDefaut}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>
        <div className="flex justify-end p-2">
          <button
            className="p-4 font-bold rounded-md text-white bg-blue-800 mt-4"
            onClick={handleGeneratePDF}
          >
            Télécharger le PDF
          </button>
        </div>
      </Card>
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
    fetchventeselectvente(formData.client_id, formData.dateDebut, formData.dateFin, formData.produit_id);
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
      setIsDropdownOpen(true); // Ouvrir la liste déroulante

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
    <div className=" mb-8 flex flex-col gap-12">


      <Card className="mt-10">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 h-[300px]">

          <div className="flex items-center space-x-4 m-2">
            {/* Input pour recherche de vente */}
            <div className="relative w-full">
              <label className="text-white text-lg" htmlFor="">Nom/Ifu</label>
              <input
                type="text"
                id="client_id"
                name="client_id"
                value={selectedclient ? selectedclient.nom : formData.client_id}
                onChange={handleInputChangeclient}
                onFocus={() => setIsDropdownOpenclient(true)} // Ouvrir la liste déroulante
                placeholder="Rechercher le vente"
                className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
              />
              {isDropdownOpenclient && (
                <ul className="absolute left-0 right-0 mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white z-70">
                  {filteredclient.map((client) => (
                    <li
                      key={client.id}
                      onClick={() => handleclientSelect(client)}
                      className="p-2 cursor-pointer hover:bg-gray-100 text-black"
                    >
                      {client.nom} {client.prenom}
                    </li>
                  ))}
                  {filteredclient.length === 0 && (
                    <li className="p-2 text-gray-500">Aucun client trouvée</li>
                  )}
                </ul>
              )}
            </div>

            {/* Input pour la date de début */}
            <div className="relative w-full">
              <label className="text-white text-lg" htmlFor="">Debut</label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut || ""}
                onChange={handleInputChangeclient}
                placeholder="Date de début"
                className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
              />
            </div>

            {/* Input pour la date de fin */}
            <div className="relative w-full">
              <label className="text-white text-lg" htmlFor="">Fin</label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin || ""}
                onChange={handleInputChangeclient}
                placeholder="Date de fin"
                className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
              />
            </div>
            <div className="relative w-full">
              <label className="text-white text-lg" htmlFor="">Produit</label>
              <input
                type="text"
                id="produit_id"
                name="produit_id"
                value={selectedProduct ? selectedProduct.nom : formData.produit_id}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownOpen(true)} // Ouvrir la liste déroulante
                placeholder="Rechercher le produit"
                className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
              />
              {isDropdownOpen && (
                <ul className="absolute left-0 right-0 mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white z-70">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-2 cursor-pointer hover:bg-gray-100 text-black"
                    >
                      {product.nom}
                    </li>
                  ))}
                  {filteredProducts.length === 0 && (
                    <li className="p-2 text-gray-500">Aucun produit trouvé</li>
                  )}
                </ul>
              )}
            </div>
          </div>

        </CardHeader>
        <CardBody className="flex w-full  h-full justify-center  px-0 pt-0 pb-2">
          <Tabs className="w-full" value={activeTab} onChange={(value) => setActiveTab(value)}>
            <TabsHeader >
              {data.map(({ label, value }) => (
                <Tab key={value} value={value}>
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody className="w-full mt-7">

              <TabPanel value="vente">
                <VenteTabContent ventesnombre={ventesnombre} totalMontant={totalMontant} totalProduit={totalProduit} />
              </TabPanel>
              <TabPanel value="produit">
                <FactureTabContent ceJour={ceJour} septJour={septJour} trenteDerniersJours={trenteDerniersJours} totalEnregistrementDefaut={totalEnregistrementDefaut} totalMontantDefaut={totalMontantDefaut} />
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>

    </div>
  );
}

export default Statistique;
