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
    Button
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

// Component for detailed view of HTML tab
function HtmlTabContent({ product }) {
    const [toast, setToast] = useState(false);
    const handletoast = () => {
        setToast(true);
    };

    if (!product) {
        return <div>Chargement des données du produit...</div>; // Display a loading state while product is null/undefined
    }

    return (
        <div className="w-full p-4">
            <Card className="w-full max-w-screen ">
                <CardHeader className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-bold">Produit</h2>
                    <Button variant="gradient" color="red">
                        <Modaleditproduit ProductId={product.id} handletoast={handletoast} />
                    </Button>
                </CardHeader>
                <CardBody className="w-full">
                    {/* Affichage des données */}
                    <div className="flex items-center justify-end mb-4">
                        <div className="text-green-500 text-right text-2xl">{product.code_barre}</div>
                    </div>
                    <div className="flex flex-col w-8/12 mx-auto text-center space-y-4">
                        <p className="flex justify-between">
                            <span className="font-bold">Nom</span>
                            <span>{product.nom}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-bold">Prix</span>
                            <span>{product.prix}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-bold">Catégorie</span>
                            <span>{product.nom_categorie}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-bold">Description</span>
                            <span>{product.description}</span>
                        </p>
                        <div className="flex justify-end">
                            
                            <ul>
                                {product.supplements.map((supplement) => (
                                    <li className="font-bold" key={supplement.id}>
                                        {supplement.unit} - {supplement.prix} Fcfa
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </CardBody>
            </Card>
        </div>
    );
}


// Composant pour les données "En Stock"
function StockTabContent({ product }) {
    if (!product) {
        return <div>Chargement des données de stock...</div>;
    }

    return (
        <div className="w-full p-4">
            <Card>
                <CardHeader className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-bold">Stock</h2>
                </CardHeader>
                <CardBody className="gap col-span-6">
                    <div className="flex  p-8">
                        <span className="font-bold">Initial : </span>
                        <span className="font-bold ml-5">{product.stock_quantite}</span>
                    </div>

                    <div className="flex p-8">
                        <span className="font-bold">Disponible : </span>
                        <span className="font-bold ml-5">
                            {product.stock_quantite && product.total_ventes
                                ? product.stock_quantite - product.total_ventes
                                : "_"}
                        </span>
                    </div>

                </CardBody>
            </Card>
        </div>
    );
}

// Composant pour les données "Vendu"
function VenduTabContent({ product }) {
    if (!product) {
        return <div>Chargement des données des produits vendus...</div>;
    }

    return (
        <div className="w-full p-4">
            <Card>
                <CardHeader className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-bold">Produits Vendus</h2>
                </CardHeader>
                <CardBody className="flex justify-center">
                    <span className="font-bold p-8 text-9xl">{product.total_ventes}</span>
                </CardBody>
            </Card>
        </div>
    );
}




export function Detailproduit() {
    const [searchParams] = useSearchParams(); // Permet d'accéder aux paramètres de l'URL
    const [product, setProduct] = useState();
    // Récupération de l'ID
    const id = searchParams.get('id');
    const [activeTab, setActiveTab] = useState("html");
    const [controller, dispatch] = useMaterialTailwindController();
    const { sidenavType } = controller;

    const data = [
        { label: "Voir", value: "html" },
        { label: "En Stock", value: "stock" },
        { label: "Vendu", value: "vendu" },
    ];






    //     // Fonction pour récupérer les détails du produit
    //     const fetchProductDetails = async (id) => {
    //       try {
    //           const token = localStorage.getItem("token"); // Assurez-vous que le jeton est bien stocké

    //           const response = await axios.post(
    //               `${import.meta.env.VITE_API_URL}/api/v1/produit/detailById`,
    //               { id },
    //               {
    //                   headers: {
    //                       Authorization: `Bearer ${token}`, // Transmettre le jeton dans les en-têtes
    //                   },
    //               }
    //           );

    //           const product = response.data;
    //           setProduct(product);
    //           console.log(product);

    //       } catch (error) {
    //           console.error("Erreur lors de la récupération des détails du produit :", error);
    //       }
    //   };


    // Fonction pour récupérer les détails du produit
    const fetchProductDetails = async (id) => {
        try {
            const token = localStorage.getItem("token"); // Récupérer le token d'authentification

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/produit/detailById`,
                { id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Passer le token dans les headers
                    },
                }
            );

            // Récupération des données
            const { produit, supplements } = response.data;

            // Mettre à jour l'état du produit avec les détails et les suppléments
            setProduct({
                ...produit,        // Détails du produit
                supplements,       // Liste des suppléments associés
            });

            console.log("Produit récupéré :", produit);
            console.log("Suppléments récupérés :", supplements);

        } catch (error) {
            console.error("Erreur lors de la récupération des détails du produit :", error);
        }
    };





    useEffect(() => {
        if (id) {
            fetchProductDetails(id); // Charger les détails si l'ID du produit est fourni
            console.log(id);
        } else {
            console.log(id);
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
                            <span className="font-bold text-xl">Detail produit</span>

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

                                <TabPanel value="html">
                                    <HtmlTabContent product={product} />
                                </TabPanel>
                                <TabPanel value="stock">
                                    <StockTabContent product={product} />
                                </TabPanel>
                                <TabPanel value="vendu">
                                    <VenduTabContent product={product} />
                                </TabPanel>

                            </TabsBody>
                        </Tabs>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

export default Detailproduit;
