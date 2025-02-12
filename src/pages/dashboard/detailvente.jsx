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
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
} from "@/widgets/layout";
import routes from "@/routes";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';


import { useState } from "react";
import Modaleditproduit from "@/widgets/modal/modaleditproduit";

// Component for detailed view of vente tab
function VenteTabContent({ vente }) {
  const [toast, setToast] = useState(false);
  const handletoast = () => {
    setToast(true);
  };

  if (!vente) {
    return <div>Chargement des données du produit...</div>; // Display a loading state while vente is null/undefined
  }

  return (
    <div className="w-full p-4">
      <div className="w-full max-w-screen ">
        <div className="w-full overflow-x-auto md:overflow-x-visible px-0 pt-0 pb-2">
          <table className="w-full min-w-[600px] table-auto">
            <thead>
              <tr>
                {["Numerotation", "Nom du produit", "Quantité", "Prix Unitaire"].map((el) => (
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
              {vente.map((venteItem, key) => {
                const className = `py-3 px-5 ${key === vente.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;
                return (
                  <tr key={venteItem.id}>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        {venteItem.id}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        {venteItem.nom_produit}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        {venteItem.quantite}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        {venteItem.prix_unitaire}
                      </Typography>
                    </td>
                  </tr>


                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 px-5 text-right font-bold text-blue-gray-600">
                  Total :
                </td>
                <td colSpan={3} className="py-3 px-5 text-left font-bold text-blue-gray-800">
                  {vente.reduce((sum, venteItem) => sum + venteItem.prix_unitaire, 0)}
                </td>
              </tr>
            </tfoot>
          </table>

        </div>

      </div>
    </div>
  );
}


// Composant pour les données "En Stock"
function FactureTabContent({ facture }) {

  const handleDownload = (pdfPath) => {
    if (!pdfPath) {
      alert("Aucun fichier PDF disponible pour téléchargement.");
      return;
    }
  
    // Construire l'URL complète en ajoutant l'URL de base (backend)
    const fullUrl = `${import.meta.env.VITE_API_URL}${pdfPath}`;
  
    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement("a");
    link.href = fullUrl; // URL complète du fichier PDF
    link.download = pdfPath.split('/').pop(); // Nom du fichier
    link.target = "_blank"; // Ouvrir dans un nouvel onglet
    link.click(); // Simuler un clic
  };
  

  if (!facture) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div className="w-full p-4">
      <Card>
        <CardHeader className="flex justify-between items-center p-4">
          <h2 className="text-xl font-bold">Facture</h2>
        </CardHeader>
        <CardBody className="gap col-span-6">
          <div className="flex  p-8">
           
            <span className="ml-5"> <span className="font-bold text-3xl mr-2">{facture.clientnom}</span>     {facture.clientprenom}</span>
          </div>

          <div className="flex  p-8">
            <span className="font-bold">Ifu : </span>
            <span className="font-bold ml-5">{facture.clientifu}</span>
          </div>

          <div className="flex  p-8">
            <span className="font-bold">Telecharger ici : </span>
            <span className="font-bold ml-5"><button
              type="button"
              onClick={() => handleDownload(facture.pdf)}
              className="w-6 text-white bg-blue-600 rounded-md flex items-center justify-center"
            >
             
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>
            </span>
          </div>


        </CardBody>
      </Card>
    </div>
  );
}





export function Detailvente() {
  const [searchParams] = useSearchParams(); // Permet d'accéder aux paramètres de l'URL
  const [facture, setfacture] = useState([]);
  // Récupération de l'ID
  const id = searchParams.get('id');
  const [activeTab, setActiveTab] = useState("vente");
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const [vente, setvente] = useState([]);

  const data = [
    { label: "Vente", value: "vente" },
    { label: "Facture", value: "facture" }
  ];





  // Fonction pour récupérer les détails du produit
  const fetchventeDetails = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/detailById`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        }
      );

      const vente = response.data;
      setvente(vente);

    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };


  // Fonction pour récupérer les détails du produit
  const fetchfactureDetails = async (vente_id) => {
    try {
      const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/facture/detailById`,
        { vente_id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
          },
        }
      );

      const facture = response.data;
      setfacture(facture);
      console.log(facture);

    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };


  useEffect(() => {
    if (id) {
      console.log(id);
      fetchventeDetails(id); // Charger les détails si l'ID du produit est fourni
      fetchfactureDetails(id); // Charger les détails si l'ID du produit est fourni

    } else {
      console.log('loose');
    }
  }, [id]);


  return (
    <div className=" mb-8 flex flex-col gap-12">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
        <Card className=" mt-10">
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <div className="flex justify-center items-center">
              <span className="font-bold text-xl">Detail vente</span>

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
                  <VenteTabContent vente={vente} />
                </TabPanel>
                <TabPanel value="facture">
                  <FactureTabContent facture={facture} />
                </TabPanel>
              </TabsBody>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Detailvente;
