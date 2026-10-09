import { useLocation, Link, useNavigate } from "react-router-dom";
import { IconButton } from "@material-tailwind/react";
import {
  Navbar,
  Typography,
  Breadcrumbs,
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
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import { useProductStore } from "@/widgets/store/useproductstore";
import { useventeStore } from "@/widgets/store/useventestore";

// ===========================================================================
// « LE GESTIONNAIRE » — NAVBAR responsive
// Conserve les recherches du socle (produit / vente) et la déconnexion.
// Ajoute le badge de notifications temps réel + accès rapide commandes.
// ===========================================================================

// Étiquette lisible du premier segment d'URL dans le fil d'Ariane.
// Sans cette table, `/detailproduit?id=2` affichait « DETAILPRODUIT ».
const SECTIONS_BREADCRUMB = {
  dashboard: "Espace gestion",
  detailproduit: "Catalogue",
  detailvente: "Ventes",
  detail: "Détails",
  operation: "Caisse",
  auth: "Espace client",
  boutique: "Boutique",
};

export function DashboardNavbar() {
  const setProductsstore = useProductStore((state) => state.setProductsstore);
  const { setventesstore } = useventeStore();

  const [formData, setFormData] = useState({
    produit_id: "",
    vente_id: "",
    dateDebut: "",
    dateFin: "",
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [ventes, setVentes] = useState([]);
  const [filteredventes, setFilteredventes] = useState([]);
  const [selectedvente, setSelectedvente] = useState(null);
  const [isDropdownOpenvente, setIsDropdownOpenvente] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [commandesNouvelles, setCommandesNouvelles] = useState(0);

  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // -------------------- Recherche produits (socle conservé) --------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/produit/listall`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        /* silencieux */
      }
    };
    if (token) fetchProducts();
  }, [token]);

  const fetchProductselectDetails = async (valeur) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/produit/filtreBycodebarre`,
        { valeur },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductsstore(filteredProducts);
      return response.data;
    } catch (error) {
      return null;
    }
  };

  const handleInputChange = (e) => {
    setProductsstore([]);
    const { name, value } = e.target;
    if (name === "produit_id") {
      setSelectedProduct(null);
      setFormData((prev) => ({ ...prev, [name]: value }));
      setIsDropdownOpen(true);
      const filtered = products.filter(
        (product) =>
          product.nom.toLowerCase().includes(value.toLowerCase()) ||
          (product.code_barre && product.code_barre.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (formData.produit_id) {
      setProductsstore([]);
      fetchProductselectDetails(formData.produit_id);
    } else {
      setIsDropdownOpen(false);
      setProductsstore([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.produit_id]);

  // -------------------- Recherche ventes (socle conservé) --------------------
  const fetchventeselectvente = async (valeur, dateDebut, dateFin) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/vente/ventesearch`,
        { valeur, dateDebut, dateFin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const removeDuplicates = (array) => {
        const seen = new Set();
        return array.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      };
      const uniqueVentes = removeDuplicates(response.data);
      setVentes(uniqueVentes);
      setFilteredventes(uniqueVentes);
      setventesstore(uniqueVentes);
    } catch (error) {
      /* silencieux */
    }
  };

  const handleInputChangevente = (e) => {
    setventesstore([]);
    const { name, value } = e.target;
    if (name === "vente_id") {
      setSelectedvente(null);
      setFormData((prev) => ({ ...prev, [name]: value }));
      setIsDropdownOpenvente(true);
      const filteredvente = ventes.filter(
        (vente) =>
          vente.client?.toLowerCase().includes(value.toLowerCase()) ||
          vente.prenom?.toLowerCase().includes(value.toLowerCase()) ||
          (vente.ifu && vente.ifu.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredventes(filteredvente);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const venteId = formData.vente_id?.trim();
    const today = new Date().toISOString().split("T")[0];
    const dateDebut = formData.dateDebut || "2023-01-01";
    const dateFin = formData.dateFin || today;
    if (venteId || dateDebut || dateFin) {
      fetchventeselectvente(venteId, dateDebut, dateFin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.vente_id, formData.dateDebut, formData.dateFin]);

  // -------------------- Notifications & commandes temps réel --------------------
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notification/listall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications((data.notifications || []).slice(0, 5));
        setNonLues(data.nombreNonLu || 0);
      }
    } catch (error) {
      /* silencieux */
    }
  };

  const fetchCommandes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/commande-admin/listall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCommandesNouvelles(data.nouvelles || 0);
      }
    } catch (error) {
      /* silencieux */
    }
  };

  useEffect(() => {
    if (!token) return undefined;
    fetchNotifications();
    fetchCommandes();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchCommandes();
    }, 45_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSignout = async (e) => {
    e.preventDefault();
    if (!token) {
      return navigate("/");
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/deconnexion`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        localStorage.removeItem("token");
        toast.success("Déconnexion réussie !");
        navigate("/auth/sign-in");
      } else {
        toast.error("Erreur de déconnexion.");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la déconnexion.");
    }
  };

  const rechercheProduit = pathname === "/dashboard/operation" || pathname === "/dashboard/produit";

  // Libellés lisibles à partir du slug d'URL (au lieu du brut « detailproduit »)
  const TITRES = {
    home: "Tableau de bord",
    operation: "Opération de vente",
    produit: "Produits",
    detailproduit: "Détail du produit",
    categorie: "Catégories",
    client: "Clients",
    detailclient: "Fiche client",
    fournisseur: "Fournisseurs",
    stock: "Stock",
    unite: "Unités",
    vente: "Ventes",
    detailvente: "Détail de la vente",
    facture: "Factures",
    detailfacture: "Détail de la facture",
    statistique: "Statistiques & comptabilité",
    commandes: "Commandes en ligne",
    livraisons: "Livraisons",
    paiements: "Paiements",
    parametres: "Paramètres de la boutique",
    notifications: "Notifications",
    users: "Utilisateurs",
    profile: "Mon profil",
  };
  const titrePage = TITRES[page] || TITRES[layout] || page || "Tableau de bord";

  return (
    <Navbar
      fullWidth
      className="sticky top-0 z-40 rounded-none border-b border-ink-200/70 bg-white/85 px-0 py-0 shadow-soft backdrop-blur-xl"
    >
      {/* ══════════════ Rangée 1 : titre + actions ══════════════ */}
      <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 sm:px-6">
        <IconButton
          variant="text"
          ripple={false}
          aria-label="Ouvrir le menu"
          className="grid shrink-0 rounded-xl xl:hidden"
          onClick={() => setOpenSidenav(dispatch, !openSidenav)}
        >
          <Bars3Icon strokeWidth={2.5} className="h-6 w-6 text-ink-600" />
        </IconButton>

        <div className="min-w-0 flex-1">
          <Breadcrumbs className="bg-transparent p-0">
            <Typography
              variant="small"
              className="text-[11px] font-bold tracking-wider text-ink-400 uppercase"
            >
              {SECTIONS_BREADCRUMB[layout] || layout}
            </Typography>
          </Breadcrumbs>
          <h1 className="truncate text-lg font-extrabold text-ink-900 sm:text-xl">
            {titrePage}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Commandes en ligne */}
          <Link to="/dashboard/commandes" className="relative hidden sm:block">
            <IconButton variant="text" ripple={false} className="rounded-xl">
              <ShoppingBagIcon className="h-[21px] w-[21px] text-ink-500" />
              {commandesNouvelles > 0 && (
                <span className="absolute top-1 right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white tabular ring-2 ring-white">
                  {commandesNouvelles}
                </span>
              )}
            </IconButton>
          </Link>

          {/* Notifications */}
          <Menu placement="bottom-end">
            <MenuHandler>
              <IconButton variant="text" ripple={false} className="relative rounded-xl">
                <BellIcon className="h-[21px] w-[21px] text-ink-500" />
                {nonLues > 0 && (
                  <span className="absolute top-1 right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white tabular ring-2 ring-white">
                    {nonLues}
                  </span>
                )}
              </IconButton>
            </MenuHandler>
            <MenuList className="w-[22rem] max-w-[92vw] rounded-2xl border border-ink-200 p-2 shadow-lift">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-[13px] font-bold text-ink-900">Notifications</p>
                {nonLues > 0 && (
                  <span className="lg-badge-danger">{nonLues} non lue(s)</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-ink-400">
                    Aucune notification
                  </p>
                )}
                {notifications.map((n) => (
                  <MenuItem
                    key={n.id}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <span className="min-w-0">
                      <span className="block text-[13px] leading-snug font-medium text-ink-800">
                        {n.message}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-400">
                        {n.date_creation}
                      </span>
                    </span>
                  </MenuItem>
                ))}
              </div>
              <Link to="/dashboard/notifications">
                <MenuItem className="mt-1 justify-center rounded-xl bg-brand-50 text-center text-[13px] font-semibold text-brand-700">
                  Voir toutes les notifications
                </MenuItem>
              </Link>
            </MenuList>
          </Menu>

          {/* Profil */}
          <Menu placement="bottom-end">
            <MenuHandler>
              <button
                type="button"
                className="ml-1 flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-ink-100"
              >
                <Avatar
                  src="/image/logo.png"
                  alt="utilisateur"
                  size="sm"
                  variant="circular"
                  className="ring-2 ring-brand-100"
                />
                <ChevronDownIcon className="hidden h-4 w-4 text-ink-400 sm:block" />
              </button>
            </MenuHandler>
            <MenuList className="w-60 rounded-2xl border border-ink-200 p-2 shadow-lift">
              <MenuItem
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                onClick={() => navigate("/dashboard/profile")}
              >
                <UserCircleIcon className="h-[18px] w-[18px] text-ink-400" />
                Mon profil
              </MenuItem>
              <MenuItem
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                onClick={() => setOpenConfigurator(dispatch, true)}
              >
                <Cog6ToothIcon className="h-[18px] w-[18px] text-ink-400" />
                Personnalisation
              </MenuItem>
              <div className="my-1 h-px bg-ink-100" />
              <MenuItem
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50"
                onClick={handleSignout}
              >
                <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" />
                Déconnexion
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>

      {/* ══════════════ Rangée 2 : barres de recherche contextuelles ══════════════ */}
      {(rechercheProduit || pathname === "/dashboard/vente") && (
        <div className="px-4 py-3 sm:px-6">
          {/* Recherche produits */}
          {rechercheProduit && (
            <div className="relative w-full max-w-lg">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                id="produit_id"
                name="produit_id"
                value={selectedProduct ? selectedProduct.nom : formData.produit_id}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Rechercher un produit par nom ou code-barres…"
                className="lg-input py-2.5 pl-11"
              />
              {isDropdownOpen && (
                <ul className="absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lift">
                  {filteredProducts.length === 0 && (
                    <li className="px-3 py-2.5 text-sm text-ink-400">
                      Aucun produit trouvé
                    </li>
                  )}
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setFormData((prev) => ({ ...prev, produit_id: product.nom }));
                        setIsDropdownOpen(false);
                      }}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                    >
                      {product.nom}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Recherche ventes */}
          {pathname === "/dashboard/vente" && (
            <div className="flex w-full flex-wrap items-end gap-3">
              <div className="relative min-w-[200px] flex-1">
                <label className="lg-label" htmlFor="vente_id">
                  Nom / IFU
                </label>
                <MagnifyingGlassIcon className="pointer-events-none absolute bottom-3 left-3.5 h-[18px] w-[18px] text-ink-400" />
                <input
                  type="text"
                  id="vente_id"
                  name="vente_id"
                  value={selectedvente ? selectedvente.client : formData.vente_id}
                  onChange={handleInputChangevente}
                  onFocus={() => setIsDropdownOpenvente(true)}
                  placeholder="Rechercher une vente…"
                  className="lg-input py-2.5 pl-11"
                />
                {isDropdownOpenvente && (
                  <ul className="absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lift">
                    {filteredventes.length === 0 && (
                      <li className="px-3 py-2.5 text-sm text-ink-400">
                        Aucune vente trouvée
                      </li>
                    )}
                    {filteredventes.map((vente) => (
                      <li
                        key={vente.id}
                        onClick={() => {
                          setSelectedvente(vente);
                          setFormData((prev) => ({ ...prev, vente_id: vente.client }));
                          setIsDropdownOpenvente(false);
                        }}
                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                      >
                        {vente.client}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="w-full sm:w-44">
                <label className="lg-label" htmlFor="dateDebut">
                  Début
                </label>
                <input
                  type="date"
                  id="dateDebut"
                  name="dateDebut"
                  value={formData.dateDebut || ""}
                  onChange={handleInputChangevente}
                  className="lg-input py-2.5"
                />
              </div>
              <div className="w-full sm:w-44">
                <label className="lg-label" htmlFor="dateFin">
                  Fin
                </label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={formData.dateFin || ""}
                  onChange={handleInputChangevente}
                  className="lg-input py-2.5"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
