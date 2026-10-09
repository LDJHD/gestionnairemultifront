// Composant Clients
import {
    Sidenav,
    DashboardNavbar,
    Configurator,
} from "@/widgets/layout";
import routes from "@/routes";
import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';


import { useState } from "react";
import Modaleditproduit from "@/widgets/modal/modaleditproduit";
import {
    ArrowLeftIcon,
    ArrowTrendingUpIcon,
    CubeIcon,
    IdentificationIcon,
    PlusCircleIcon,
    TagIcon,
} from "@heroicons/react/24/outline";

/** Squelette de chargement des panneaux. */
function Squelette() {
    return (
        <div className="lg-card p-5">
            <div className="lg-skeleton h-5 w-1/3" />
            <div className="mt-5 space-y-3">
                <div className="lg-skeleton h-11 w-full" />
                <div className="lg-skeleton h-11 w-full" />
                <div className="lg-skeleton h-11 w-full" />
            </div>
        </div>
    );
}

/** Ligne « libellé / valeur » du design system v2. */
function Ligne({ label, children, mono = false }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 py-2.5 last:border-0">
            <dt className="shrink-0 text-[13px] text-ink-500">{label}</dt>
            <dd
                className={`text-right text-[13px] font-semibold text-ink-900 ${
                    mono ? "font-mono tabular" : "tabular"
                }`}
            >
                {children ?? "—"}
            </dd>
        </div>
    );
}

// Component for detailed view of HTML tab
function HtmlTabContent({ product }) {
    const [toast, setToast] = useState(false);
    const handletoast = () => {
        setToast(true);
    };

    if (!product) {
        return <Squelette />; // Display a loading state while product is null/undefined
    }

    const supplements = Array.isArray(product.supplements) ? product.supplements : [];

    return (
        <div className="grid gap-5 lg:grid-cols-3">
            {/* Fiche produit */}
            <div className="lg-card overflow-hidden lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                            <CubeIcon className="h-[18px] w-[18px]" />
                        </span>
                        <div>
                            <p className="font-display text-base font-extrabold text-ink-900">Produit</p>
                            <p className="text-[13px] text-ink-500">Informations générales de l'article</p>
                        </div>
                    </div>
                    <Modaleditproduit ProductId={product.id} handletoast={handletoast} />
                </div>

                <div className="p-5">
                    <dl>
                        <Ligne label="Nom">{product.nom}</Ligne>
                        <Ligne label="Prix">{product.prix}</Ligne>
                        <Ligne label="Catégorie">{product.nom_categorie}</Ligne>
                        <Ligne label="Description">{product.description}</Ligne>
                    </dl>
                </div>
            </div>

            {/* Colonne latérale */}
            <div className="flex flex-col gap-5">
                <div className="lg-card p-5">
                    <div className="flex items-center gap-2.5">
                        <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
                            <IdentificationIcon className="h-[18px] w-[18px]" />
                        </span>
                        <p className="text-[13px] font-semibold text-ink-500">Code-barres</p>
                    </div>
                    <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 tabular">
                        {product.code_barre || "—"}
                    </p>
                </div>

                <div className="lg-card p-5">
                    <div className="flex items-center gap-2.5">
                        <span className="lg-icon-chip h-9 w-9 bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100">
                            <TagIcon className="h-[18px] w-[18px]" />
                        </span>
                        <p className="text-[13px] font-semibold text-ink-500">Identifiant</p>
                    </div>
                    <p className="mt-3 font-mono text-lg font-bold text-ink-800 tabular">
                        #{product.id}
                    </p>
                </div>

                {/* Suppléments */}
                <div className="lg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="lg-icon-chip h-9 w-9 bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
                                <PlusCircleIcon className="h-[18px] w-[18px]" />
                            </span>
                            <p className="text-[13px] font-semibold text-ink-500">Suppléments</p>
                        </div>
                        <span className="lg-badge-warn tabular">{supplements.length}</span>
                    </div>

                    {supplements.length === 0 ? (
                        <p className="mt-4 text-[13px] text-ink-500">
                            Aucun supplément associé à ce produit.
                        </p>
                    ) : (
                        <ul className="mt-4 flex flex-col gap-2">
                            {supplements.map((supplement) => (
                                <li
                                    key={supplement.id}
                                    className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 px-3 py-2.5 ring-1 ring-inset ring-ink-200/70"
                                >
                                    <span className="text-[13px] font-semibold text-ink-700">
                                        {supplement.unit}
                                    </span>
                                    <span className="text-[13px] font-bold text-ink-900 tabular">
                                        {supplement.prix} Fcfa
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}


// Composant pour les données "En Stock"
function StockTabContent({ product }) {
    if (!product) {
        return <Squelette />;
    }

    return (
        <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg-card p-5">
                <div className="flex items-center gap-2.5">
                    <span className="lg-icon-chip h-9 w-9 bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
                        <CubeIcon className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                        <p className="font-display text-base font-extrabold text-ink-900">Stock</p>
                        <p className="text-[13px] text-ink-500">Quantités du produit</p>
                    </div>
                </div>
                <dl className="mt-4">
                    <Ligne label="Initial">{product.stock_quantite}</Ligne>
                    <Ligne label="Disponible">
                        {product.stock_quantite && product.total_ventes
                            ? product.stock_quantite - product.total_ventes
                            : "_"}
                    </Ligne>
                </dl>
            </div>
        </div>
    );
}

// Composant pour les données "Vendu"
function VenduTabContent({ product }) {
    if (!product) {
        return <Squelette />;
    }

    return (
        <div className="lg-card p-5">
            <div className="flex items-center gap-2.5">
                <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
                    <ArrowTrendingUpIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                    <p className="font-display text-base font-extrabold text-ink-900">Produits vendus</p>
                    <p className="text-[13px] text-ink-500">Volume cumulé pour cet article</p>
                </div>
            </div>
            <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-5xl leading-none font-extrabold tracking-tight text-ink-900 tabular">
                    {product.total_ventes ?? 0}
                </span>
                <span className="pb-1 text-sm font-semibold text-ink-400">unité(s)</span>
            </div>
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
        <div className="mb-8 flex flex-col gap-12">
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
                    className="fixed bottom-8 right-8 z-40 rounded-full bg-white text-ink-600 shadow-ink-900/10 ring-1 ring-inset ring-ink-200"
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

                <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
                    {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <Link to="/dashboard/produit" className="mb-2 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800">
                                <ArrowLeftIcon className="h-4 w-4" />
                                Retour aux produits
                            </Link>
                            <h1 className="lg-page-title">Détail du produit</h1>
                            <p className="lg-page-sub">
                                Fiche article, suppléments, stock et performance commerciale.
                            </p>
                        </div>
                        <span className="lg-badge-brand tabular">Réf. #{id || "—"}</span>
                    </header>

                    {/* ══════════════ ONGLETS ══════════════ */}
                    <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-ink-100 p-1">
                        {data.map(({ label, value }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setActiveTab(value)}
                                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                                    activeTab === value
                                        ? "bg-white text-brand-700 shadow-xs"
                                        : "text-ink-500 hover:text-ink-800"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ══════════════ PANNEAU ACTIF ══════════════ */}
                    {activeTab === "html" ? (
                        <HtmlTabContent product={product} />
                    ) : activeTab === "stock" ? (
                        <StockTabContent product={product} />
                    ) : (
                        <VenduTabContent product={product} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Detailproduit;