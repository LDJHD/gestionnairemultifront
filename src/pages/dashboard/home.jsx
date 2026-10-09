import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Card, CardBody, IconButton, Tooltip } from "@material-tailwind/react";
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarSquareIcon,
  CubeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  BanknotesIcon as BanknotesSolid,
  ClockIcon,
  CubeIcon as CubeSolid,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { StatisticsCard } from "@/widgets/cards";

/* ===========================================================================
   « LE GESTIONNAIRE » — TABLEAU DE BORD
   Données 100 % réelles issues de l'API (plus aucun graphique de démo).
   =========================================================================== */

const API = import.meta.env.VITE_API_URL;

/** Montant formaté « Ghana/Bénin » : 1 234 567 F */
function fcfa(v) {
  const n = Number(v || 0);
  return n.toLocaleString("fr-FR").replace(/ |,/g, " ");
}

function jourSemaine() {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/** Requête GET authentifiée — ne lève jamais (retourne null en cas d'échec). */
async function get(path) {
  try {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j;
  } catch {
    return null;
  }
}

function LigneActivite({ heure, icone: Icone, ton, titre, detail, lien }) {
  const contenu = (
    <div className="group flex items-start gap-3.5 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-ink-50">
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${ton}`}
      >
        <Icone className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800">{titre}</p>
        <p className="truncate text-[13px] text-ink-500">{detail}</p>
      </div>
      <span className="mt-1 shrink-0 text-[11px] font-medium text-ink-400">{heure}</span>
    </div>
  );
  return lien ? (
    <Link to={lien} className="block">
      {contenu}
    </Link>
  ) : (
    contenu
  );
}

export function Home() {
  const [ventes, setVentes] = useState(0);
  const [caJour, setCaJour] = useState(0);
  const [clients, setClients] = useState(0);
  const [fournisseurs, setFournisseurs] = useState(0);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      const [c, f, v, m, p, cmd] = await Promise.all([
        get("/api/v1/client/count"),
        get("/api/v1/fournisseur/count"),
        get("/api/v1/vente/day"),
        get("/api/v1/vente/montantday"),
        fetch(`${API}/api/v1/produit/listall/paginate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ nombre: 5, page: 1 }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        get("/api/v1/commande-admin/listall"),
      ]);
      if (annule) return;
      setClients(c?.total ?? 0);
      setFournisseurs(f?.total ?? 0);
      setVentes(v?.total ?? 0);
      setCaJour(m?.total ?? 0);
      setProduits(Array.isArray(p) ? p : []);
      setCommandes(cmd);
      setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  /* --------- Activités récentes : mélange données réelles + raccourcis ---- */
  const activites = useMemo(() => {
    const liste = [];

    (produits || []).slice(0, 4).forEach((p) => {
      liste.push({
        id: `p-${p.id}`,
        icone: CubeIcon,
        ton: "bg-brand-50 text-brand-600 ring-brand-100",
        titre: p.nom || "Produit sans nom",
        detail: `${p.nom_categorie || "—"} · ${fcfa(p.prix)} F`,
        heure: (p.date || "").slice(0, 10),
        lien: `/dashboard/detailproduit?id=${p.id}`,
      });
    });

    if (commandes?.nouvelles > 0) {
      liste.unshift({
        id: "cmd-nouvelles",
        icone: ShoppingBagIcon,
        ton: "bg-amber-50 text-amber-600 ring-amber-100",
        titre: `${commandes.nouvelles} nouvelle(s) commande(s) en ligne`,
        detail: "À traiter dans le back-office",
        heure: "maintenant",
        lien: "/dashboard/commandes",
      });
    }
    return liste.slice(0, 5);
  }, [produits, commandes]);

  const skeletons = [0, 1, 2, 3];

  return (
    <div className="mt-6 animate-fade-in space-y-7">
      {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-600">
            {jourSemaine()}
          </p>
          <h1 className="lg-page-title">Bonjour</h1>
          <p className="lg-page-sub">Voici l'activité de votre commerce aujourd'hui.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/dashboard/vendre">
            <button type="button" className="lg-btn-primary">
              <BanknotesSolid className="h-[18px] w-[18px]" />
              Nouvelle vente
            </button>
          </Link>
          <Link to="/dashboard/commandes">
            <button type="button" className="lg-btn-neutral">
              <ShoppingBagIcon className="h-[18px] w-[18px]" />
              Commandes en ligne
            </button>
          </Link>
        </div>
      </header>

      {/* ══════════════ BANDEAU COMMANDES EN LIGNE ══════════════ */}
      {commandes?.nouvelles > 0 && (
        <Link
          to="/dashboard/commandes"
          className="group flex items-center gap-4 rounded-2xl bg-brand-deep px-5 py-4 text-white shadow-lift transition-transform duration-200 hover:scale-[1.005]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
            <ShoppingBagIcon className="h-[22px] w-[22px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {commandes.nouvelles} commande{commandes.nouvelles > 1 ? "s" : ""} en attente
            </p>
            <p className="text-[13px] text-white/70">
              Confirmez ou refusez pour ne pas perdre de vente.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}

      {/* ══════════════ KPI ══════════════ */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {chargement ? (
          skeletons.map((i) => (
            <div key={i} className="lg-card h-[142px] p-5">
              <div className="lg-skeleton h-3.5 w-2/3" />
              <div className="lg-skeleton mt-5 h-8 w-1/2" />
              <div className="lg-skeleton mt-4 h-3 w-1/3" />
            </div>
          ))
        ) : (
          <>
            <StatisticsCard
              ton="brand"
              icon={<BanknotesSolid className="h-[22px] w-[22px]" />}
              title="Chiffre d'affaires du jour"
              value={fcfa(caJour)}
              suffixe="F"
              footer="Recettes encaissées aujourd'hui"
            />
            <StatisticsCard
              ton="accent"
              icon={<ArrowTrendingUpIcon className="h-[22px] w-[22px]" />}
              title="Ventes du jour"
              value={ventes}
              footer="Transactions enregistrées"
            />
            <StatisticsCard
              ton="sky"
              icon={<UserGroupIcon className="h-[22px] w-[22px]" />}
              title="Clients"
              value={clients}
              footer="Clients enregistrés"
            />
            <StatisticsCard
              ton="violet"
              icon={<TruckIcon className="h-[22px] w-[22px]" />}
              title="Fournisseurs"
              value={fournisseurs}
              footer="Fournisseurs référencés"
            />
          </>
        )}
      </section>

      {/* ══════════════ ACTIVITÉ + ACCÈS RAPIDES ══════════════ */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Activités récentes */}
        <Card className="lg-card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <ClockIcon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <Typography variant="h6" className="text-base font-bold text-ink-900">
                  Activité récente
                </Typography>
                <Typography variant="small" className="text-ink-500">
                  Derniers mouvements du catalogue
                </Typography>
              </div>
            </div>
            <Link
              to="/dashboard/produit"
              className="flex items-center gap-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800"
            >
              Tout voir
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <CardBody className="p-2.5">
            {chargement ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="lg-skeleton h-[62px] w-full" />
                ))}
              </div>
            ) : activites.length ? (
              activites.map((a) => (
                <LigneActivite key={a.id} {...a} />
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                  <CubeSolid className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-700">Aucun produit pour l'instant</p>
                <p className="mt-1 text-[13px] text-ink-500">
                  Ajoutez votre premier article pour démarrer.
                </p>
                <Link to="/dashboard/produit" className="mt-4 inline-block">
                  <button type="button" className="lg-btn-primary lg-btn-sm">
                    <CubeIcon className="h-4 w-4" />
                    Ajouter un produit
                  </button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Accès rapides */}
        <Card className="lg-card p-5">
          <div className="flex items-center gap-2.5">
            <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
              <Squares2X2Icon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <Typography variant="h6" className="text-base font-bold text-ink-900">
                Accès rapides
              </Typography>
              <Typography variant="small" className="text-ink-500">
                Raccourcis vers les modules
              </Typography>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              { to: "/dashboard/vendre", label: "Caisse", icon: BanknotesSolid, ton: "bg-brand-50 text-brand-600" },
              { to: "/dashboard/produit", label: "Produits", icon: CubeIcon, ton: "bg-accent-50 text-accent-600" },
              { to: "/dashboard/stock", label: "Stock", icon: CubeSolid, ton: "bg-amber-50 text-amber-600" },
              { to: "/dashboard/vente", label: "Ventes", icon: ChartBarSquareIcon, ton: "bg-sky-50 text-sky-600" },
              { to: "/dashboard/livraisons", label: "Livraisons", icon: TruckIcon, ton: "bg-violet-50 text-violet-600" },
              { to: "/dashboard/parametres", label: "Boutique", icon: ShoppingBagIcon, ton: "bg-rose-50 text-rose-600" },
            ].map(({ to, label, icon: I, ton }) => (
              <Link key={to} to={to} className="group">
                <div className="flex flex-col gap-2.5 rounded-xl border border-ink-200/80 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${ton}`}>
                    <I className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-[13px] font-semibold text-ink-700 transition-colors group-hover:text-brand-700">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* ══════════════ PRODUITS RÉCENTS ══════════════ */}
      {!chargement && produits.length > 0 && (
        <Card className="lg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-9 w-9 bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100">
                <CubeIcon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <Typography variant="h6" className="text-base font-bold text-ink-900">
                  Derniers produits ajoutés
                </Typography>
                <Typography variant="small" className="text-ink-500">
                  Les 5 entrées les plus récentes du catalogue
                </Typography>
              </div>
            </div>
            <Link to="/dashboard/produit">
              <button type="button" className="lg-btn-neutral lg-btn-sm">
                Gérer le catalogue
              </button>
            </Link>
          </div>

          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[720px]">
              <thead>
                <tr>
                  {["Produit", "Catégorie", "Prix", "Code-barres", "Ajouté le"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => (
                  <tr key={p.id}>
                    <td className="lg-td">
                      <Link
                        to={`/dashboard/detailproduit?id=${p.id}`}
                        className="font-semibold text-ink-800 transition-colors hover:text-brand-700"
                      >
                        {p.nom || "—"}
                      </Link>
                    </td>
                    <td className="lg-td">
                      <span className="lg-badge-neutral">{p.nom_categorie || "Non classé"}</span>
                    </td>
                    <td className="lg-td font-semibold text-ink-900 tabular">
                      {fcfa(p.prix)} F
                    </td>
                    <td className="lg-td font-mono text-[13px] text-ink-500">
                      {p.code_barre || "—"}
                    </td>
                    <td className="lg-td text-[13px] text-ink-500">{(p.date || "").slice(0, 10) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══════════════ ALERTE STOCK ══════════════ */}
      {!chargement && produits.some((p) => Number(p.quantite) <= Number(p.seuil_stock || 0)) && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Stock faible détecté</p>
            <p className="mt-0.5 text-amber-800/90">
              Certains produits atteignent leur seuil d'alerte.{" "}
              <Link to="/dashboard/stock" className="font-bold underline">
                Vérifier le stock
              </Link>
            </p>
          </div>
          <Tooltip content="Masquer">
            <IconButton size="sm" variant="text" color="amber" ripple={false}>
              <span aria-hidden="true">×</span>
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default Home;