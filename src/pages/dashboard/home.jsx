import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from 'axios';
import Droplist from "@/widgets/button/droplist";
import { Link } from "react-router-dom";
export function Home() {

  const [clientCount, setClientCount] = useState(0); // État pour stocker le nombre de clients
  const [ventesCount, setVentesCount] = useState(0); // État pour stocker le nombre de clients
  const [ventesmontantCount, setVentesMontantCount] = useState(0); // État pour stocker le nombre de clients
  const [fournisseursCount, setFournisseursCount] = useState(0); // État pour stocker le nombre de clients
  const [products, setProducts] = useState([]);
  const [menuActif, setMenuActif] = useState(null);
  const nombre = 5;
  const page=1;

      // Gestion des menus actifs
      const handleClick = (id) => {
        setMenuActif(menuActif === id ? null : id);
      };
    
      const handletoast = () => {
        setToast(true);
      };

  // Fonction pour récupérer le nombre de clients depuis l'API
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/client/count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClientCount(data.total); // Mettre à jour l'état avec le nombre de clients
        console.log(data.total); // Log the data for debugging
      } else {
        console.error("Erreur lors de la récupération des clients:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };


  const fetchFournisseurs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/fournisseur/count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFournisseursCount(data.total); // Mettre à jour l'état avec le nombre de clients
        console.log(data.total); // Log the data for debugging
      } else {
        console.error("Erreur lors de la récupération des clients:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  const fetchVentes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/vente/day`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVentesCount(data.total); // Mettre à jour l'état avec le nombre de clients
        console.log(data.total); // Log the data for debugging
      } else {
        console.error("Erreur lors de la récupération des clients:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  const fetchMVentes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/vente/montantday`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVentesMontantCount(data.total); // Mettre à jour l'état avec le nombre de clients
        console.log(data.total); // Log the data for debugging
      } else {
        console.error("Erreur lors de la récupération des clients:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

// Fonction pour récupérer les détails du produit
const fetchProducts = async (nombre, page = 1) => {
  try {
      const token = localStorage.getItem("token"); // Récupérer le token depuis le stockage local

      const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/produit/listall/paginate`,
          { nombre, page }, // Envoyer les paramètres 'nombre' et 'page'
          {
              headers: {
                  Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
              },
          }
      );

      const produit = response.data; // Les données retournées par le backend
      setProducts(produit); // Mettre à jour l'état avec les produits reçus
  } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
  }
};


  // Appel de fetchClients au chargement du composant
  useEffect(() => {
    fetchClients();
    fetchFournisseurs();
    fetchMVentes();
    fetchVentes();
    fetchProducts(nombre,page);

  }, []);


  const statisticsCardsDatass = [
    {
      color: "gray",
      icon: BanknotesIcon,
      title: "Vente en ce jour ",
      value: ventesCount,
      footer: {
        color: "text-green-500",
        value: "",
        label: "Aujourd'hui",
      },
    },
    {
      color: "gray",
      icon: UsersIcon,
      title: "Total vente actuelle en ce jour",
      value: ventesmontantCount,
      footer: {
        color: "text-green-500",
        value: "",
        label: "total vente en ce jour",
      },
    },
    {
      color: "gray",
      icon: UserPlusIcon,
      title: "Clients",
      value: clientCount, // Use the state value here
      footer: {
        color: "text-red-500",
        value: "",
        label: "Clients enregistrés",
      },
    },
    {
      color: "gray",
      icon: ChartBarIcon,
      title: "Fournisseur",
      value: fournisseursCount,
      footer: {
        color: "text-green-500",
        value: "",
        label: "Fournisseurs enregistré",
      },
    },
  ];

    // Fonction pour supprimer un produit de la liste
    const removeProduct = (id) => {
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    };

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsDatass.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Produits
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>5 derniers </strong> produits ajouté
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Nom", "Description", "Catégorie", "Prix", "Code Barre", "Date de création", "Option"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, key) => {
                  const className = `py-3 px-5 ${key === products.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                  return (
                    <tr key={product.code_barre}>
                      <td className={className}> <Link to={`/detailproduit?id=${product.id}`}>
                        <span><Typography variant="small" color="blue-gray" className="font-bold">{product.nom}</Typography></span></Link></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.description}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.nom_categorie}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.prix}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.code_barre}</Typography></td>
                      <td className={className}><Typography variant="small" color="blue-gray" className="font-bold">{product.date}</Typography></td>
                      <td className={className}>
                        <Droplist
                          isOpen={menuActif === key}
                          handleClick={handleClick}
                          id={key}
                          idp={product.id} // Utilise l'ID du produit
                          onDelete={() => removeProduct(product.id)} // Passe la fonction de suppression
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Orders Overview
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>24%</strong> this month
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(
              ({ icon, color, title, description }, key) => (
                <div key={title} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${key === ordersOverviewData.length - 1
                        ? "after:h-0"
                        : "after:h-4/6"
                      }`}
                  >
                    {React.createElement(icon, {
                      className: `!w-5 !h-5 ${color}`,
                    })}
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      {title}
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {description}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
