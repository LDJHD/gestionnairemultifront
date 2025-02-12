import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import { useProductStore } from "@/widgets/store/useproductstore";
import { useventeStore } from "@/widgets/store/useventestore";


export function DashboardNavbar() {

  const [productrecherche, setProductrecherche] = useState([]);
  const setProductsstore = useProductStore((state) => state.setProductsstore); // Récupération de la méthode `setProducts` du store
  const productsstore = useventeStore((state) => state.ventesstore); // Récupération de la méthode `setProducts` du store

  const [formData, setFormData] = useState({
    produit_id: "",
    vente_id: "",
    dateDebut:"",
    dateFin:""
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
    setProductsstore([]);
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
    } else {

      setFormData((prevData) => ({ ...prevData, [name]: value }));
      fetchProductselectDetails(formData.produit_id);
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
      setProductsstore(filteredProducts);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
  };
  useEffect(() => {
    if (formData.produit_id) {
      setProductsstore([]);
      fetchProductselectDetails(formData.produit_id); // Charger les détails si le valeuretre est fourni
      console.log(productsstore)
    } else {
      setIsDropdownOpen(false)
      console.log('loose');
      setProductsstore([]);
    }
  }, [formData.produit_id]);

  // Pour vente le processus complet

  const { ventesstore, setventesstore } = useventeStore();

  const [ventesearch, setventesearch] = useState([]);
  const [venterecherche, setventerecherche] = useState([]);
  const [ventes, setventes] = useState([]);
  const [filteredventes, setFilteredventes] = useState([]);
  const [selectedvente, setSelectedvente] = useState(null); // Stocke le produit sélectionné
  const [isDropdownOpenvente, setIsDropdownOpenvente] = useState(false); // Contrôle l'ouverture de la liste déroulante


  const handleInputChangevente = (e) => {
    setventesstore([]);
    const { name, value } = e.target;

    // Gérer la recherche dynamique pour le produit
    if (name === "vente_id") {
      setSelectedvente(null); // Réinitialiser le produit sélectionné
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setIsDropdownOpenvente(true); // Ouvrir la liste déroulante

      // Filtrer les produits par `nom` ou `code_barre`
      const filteredvente = ventes.filter(
        (vente) =>
          vente.client.toLowerCase().includes(value.toLowerCase()) ||
          vente.prenom.toLowerCase().includes(value.toLowerCase()) ||
          (vente.ifu && vente.ifu.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredventes(filteredvente)
    } else {

      setFormData((prevData) => ({ ...prevData, [name]: value }));
      fetchventeselectvente(formData.vente_id,formData.dateDebut,formData.dateFin);
    }

  };



  const fetchventeselectvente = async (valeur, dateDebut, dateFin) => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/ventesearch`,
        { valeur, dateDebut, dateFin }, // Inclure les dates
        {
          headers: {
            Authorization: `Bearer ${token}`, // Inclure le token dans les en-têtes
          },
        }
      );
  
      // Fonction pour supprimer les doublons
      const removeDuplicates = (array) => {
        const seen = new Set();
        return array.filter((item) => {
          if (seen.has(item.id)) {
            return false;
          }
          seen.add(item.id);
          return true;
        });
      };
  
      // Nettoyer les doublons des données renvoyées
      const uniqueVentes = removeDuplicates(response.data);
  
      // Mettre à jour les différents états
      setventes(uniqueVentes); // Mettez à jour `ventes` avec les données uniques
      setventesearch(uniqueVentes); // Même logique pour `ventesearch`
      setFilteredventes(uniqueVentes); // Initialiser `filteredventes` avec les données uniques
      setventesstore(uniqueVentes); // Mettre à jour le store Zustand avec les données uniques
    } catch (error) {
      console.error("Erreur de récupération des ventes :", error);
    }
  };
  



  useEffect(() => {
    const fetchVentes = async () => {
      const venteId = formData.vente_id?.trim(); // Supprimer les espaces inutiles
  
      // Gestion des dates
      const today = new Date().toISOString().split("T")[0]; // Date du jour
      const defaultStartDate = "2023-01-01"; // Date de début par défaut
  
      const dateDebut = formData.dateDebut || defaultStartDate;
      const dateFin = formData.dateFin || today;
  
      if (venteId ||dateDebut||dateFin) {
        try {
          await fetchventeselectvente(venteId, dateDebut, dateFin);
        } catch (error) {
          console.error("Erreur dans useEffect :", error);
        }
      } else {
        // Réinitialiser si `vente_id` est vide ou contient uniquement des espaces
        setIsDropdownOpenvente(false);
        setventes([]);
        setFilteredventes([]);
        setventesstore([]); // Réinitialiser le store Zustand
      }
    };
  
    fetchVentes();
  }, [formData.vente_id, formData.dateDebut, formData.dateFin]); // Dépend des champs de recherche
  

  // useEffect(() => {
  //   const fetchVentes = async () => {
  //     const venteId = formData.vente_id?.trim(); // Supprimer les espaces inutiles

  //     if (venteId) {
  //       try {
  //         await fetchventeselectvente(venteId);
  //       } catch (error) {
  //         console.error("Erreur dans useEffect :", error);
  //       }
  //     } else {
  //       // Réinitialiser si `vente_id` est vide ou contient uniquement des espaces
  //       setIsDropdownOpenvente(false);
  //       setventes([]);
  //       setFilteredventes([]);
  //       setventesstore([]); // Réinitialiser le store Zustand
  //     }
  //   };

  //   fetchVentes();
  // }, [formData.vente_id]); // Dépend uniquement de `vente_id`


  // useEffect(() => {
  //   const fetchVentes = async () => {
  //     const venteId = formData.vente_id?.trim(); // Supprimer les espaces inutiles
  // const dateDebut =formData.dateDebut;
  // const dateFin =formData.dateFin;
  //     if (venteId) {
  //       try {
  //         await fetchventeselectvente(venteId,dateDebut,dateFin);
  //       } catch (error) {
  //         console.error("Erreur dans useEffect :", error);
  //       }
  //     } else {
  //       // Réinitialiser si `vente_id` est vide ou contient uniquement des espaces
  //       setIsDropdownOpenvente(false);
  //       setventes([]);
  //       setFilteredventes([]);
  //       setventesstore([]); // Réinitialiser le store Zustand
  //     }
  //   };

  //   fetchVentes();
  // }, [formData.vente_id]); // Dépend uniquement de `vente_id`



  // const handleProductSelect = (product) => {
  //   setSelectedProduct(product); // Enregistrer le produit sélectionné
  //   setFormData((prev) => ({ ...prev, produit_id: product.nom })); // Enregistrer l'ID du produit
  //   fetchProductselectDetails(product.nom)
  //   setIsDropdownOpen(false); // Fermer la liste déroulante
  // };

  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const navigate = useNavigate();


  const handleSignout = async (e) => {
    e.preventDefault();

    // Vérifie si le token est présent avant de continuer
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous êtes déjà déconnecté." + token);
      return navigate("/auth/sign-in");
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/deconnexion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Envoie le token avec l'en-tête Authorization
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log(token);
        // Supprime le token et redirige l'utilisateur
        localStorage.removeItem("token");
        toast.success("Deconnexion reussi !");

        navigate("/auth/sign-in"); // Redirection après succès
      } else {
        toast.error("Erreur de deconnesxion.");
        alert(data.erreur || "Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      alert("Une erreur est survenue lors de la déconnexion. Veuillez réessayer.");
    }
  };
  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "px-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""
              }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-206">
            {pathname === "/dashboard/operation" && (
              <div className="flex items-center">
                <div className="relative w-full">
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
                    <ul className="absolute left-0 right-0 mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white z-10">
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
            )}

            {pathname === "/dashboard/produit" && (
              <div className="flex items-center">
                <div className="relative w-full">
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
                    <ul className="absolute left-0 right-0 mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white z-10">
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
            )}


            {pathname === "/dashboard/vente" && (
              <div className="flex items-center space-x-4">
                {/* Input pour recherche de vente */}
                <div className="relative w-full">
                <label className="text-black" htmlFor="">Nom/Ifu</label>
                  <input
                    type="text"
                    id="vente_id"
                    name="vente_id"
                    value={selectedvente ? selectedvente.client : formData.vente_id}
                    onChange={handleInputChangevente}
                    onFocus={() => setIsDropdownOpenvente(true)} // Ouvrir la liste déroulante
                    placeholder="Rechercher la vente en fonction du client"
                    className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
                  />
                  {isDropdownOpenvente && (
                    <ul className="absolute left-0 right-0 mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto bg-white z-10">
                      {filteredventes.map((vente) => (
                        <li
                          key={vente.id}
                          onClick={() => handleventeSelect(vente)}
                          className="p-2 cursor-pointer hover:bg-gray-100 text-black"
                        >
                          {vente.client}
                        </li>
                      ))}
                      {filteredventes.length === 0 && (
                        <li className="p-2 text-gray-500">Aucune vente trouvée</li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Input pour la date de début */}
                <div className="relative w-full">
                  <label className="text-black" htmlFor="">Debut</label>
                  <input
                    type="date"
                    id="dateDebut"
                    name="dateDebut"
                    value={formData.dateDebut || ""}
                    onChange={handleInputChangevente}
                    placeholder="Date de début"
                    className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
                  />
                </div>

                {/* Input pour la date de fin */}
                <div className="relative w-full">
                <label className="text-black " htmlFor="">Fin</label>
                  <input
                    type="date"
                    id="dateFin"
                    name="dateFin"
                    value={formData.dateFin || ""}
                    onChange={handleInputChangevente}
                    placeholder="Date de fin"
                    className="p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300 text-black"
                  />
                </div>
              </div>
            )}


            {pathname !== "/dashboard/operation" && pathname !== "/dashboard/vente" && pathname !== "/dashboard/produit" && (
              <Input label="Search" />
            )}

          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          <Link onClick={handleSignout} >
            <Button
              variant="text"
              color=""
              className="hidden items-center gap-1 px-4 xl:flex normal-case bg-red-900 text-white font-bold"
            >
              <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              Sign Out
            </Button>
            <IconButton
              variant="text"
              color="blue-gray"
              className="grid xl:hidden"
            >
              <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
            </IconButton>
          </Link>
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New message</strong> from Laur
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/small-logos/logo-spotify.svg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New album</strong> by Travis Scott
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 1 day ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    Payment successfully completed
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
