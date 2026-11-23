import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TuileVisuel, fmt } from "./ui";

const API = import.meta.env.VITE_API_URL;

export default function BoutiqueInterne() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [categorieFiltre, setCategorieFiltre] = useState("Tous");
  const [tri, setTri] = useState("defaut");
  const [sujet, setSujet] = useState("");
  const [panier, setPanier] = useState([]);
  const [clientNom, setClientNom] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [imageApercu, setImageApercu] = useState(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const res = await fetch(`${API}/api/v1/boutique/${slug}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.erreur || "Boutique indisponible");
        setData(json);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, [slug]);

  const produits = data?.produits || [];

  const categories = useMemo(() => {
    const set = new Set();
    for (const p of produits) if (p.categorie) set.add(p.categorie);
    return ["Tous", ...Array.from(set).sort()];
  }, [produits]);

  const produitsFiltres = useMemo(() => {
    let liste = produits.filter((p) => String(p.nom || "").trim());
    if (categorieFiltre !== "Tous") liste = liste.filter((p) => p.categorie === categorieFiltre);
    const q = recherche.trim().toLowerCase();
    if (q) {
      liste = liste.filter(
        (p) =>
          String(p.nom || "").toLowerCase().includes(q) ||
          String(p.description || "").toLowerCase().includes(q) ||
          String(p.categorie || "").toLowerCase().includes(q)
      );
    }
    if (tri === "prix_asc") liste.sort((a, b) => Number(a.prix) - Number(b.prix));
    else if (tri === "prix_desc") liste.sort((a, b) => Number(b.prix) - Number(a.prix));
    else if (tri === "nom") liste.sort((a, b) => String(a.nom).localeCompare(String(b.nom)));
    else if (tri === "stock") liste.sort((a, b) => Number(b.stock_disponible) - Number(a.stock_disponible));
    return liste;
  }, [produits, recherche, tri]);

  const ajouter = (produit, quantite) => {
    const q = Math.max(1, Number(quantite) || 1);
    if (q > (produit.stock_disponible || 0)) {
      toast.warning(`Stock insuffisant : ${produit.stock_disponible} disponible(s).`);
      return;
    }
    setPanier((prev) => {
      const idx = prev.findIndex((p) => p.id === produit.id);
      if (idx >= 0) {
        const next = [...prev];
        const nouvelle = next[idx].quantite + q;
        if (nouvelle > (produit.stock_disponible || 0)) {
          toast.warning("Stock insuffisant.");
          return prev;
        }
        next[idx] = { ...next[idx], quantite: nouvelle };
        return next;
      }
      return [...prev, { id: produit.id, nom: produit.nom, prix: Number(produit.prix), quantite: q }];
    });
  };

  const retirer = (id) => setPanier((prev) => prev.filter((p) => p.id !== id));
  const vider = () => setPanier([]);

  const total = panier.reduce((t, p) => t + p.prix * p.quantite, 0);

  const passerCommande = async () => {
    if (panier.length === 0) {
      toast.warning("Panier vide.");
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch(`${API}/api/v1/commande-interne/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entreprise_id: data?.activite?.entreprise_id,
          client_nom: sujet || clientNom || "Client interne",
          client_contact: clientContact || null,
          lignes: panier.map((p) => ({
            produit_id: p.id,
            nom_produit: p.nom,
            quantite: p.quantite,
            prix_unitaire: p.prix,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur || "Erreur commande");
      setConfirmation(json);
      vider();
      toast.success("Commande envoyée !");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-500">Chargement…</p>
      </div>
    );
  }
  if (erreur) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{erreur}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="lg-page-title">Commande interne — {data?.activite?.nom}</h1>
          <p className="lg-page-sub">Recherchez un produit, choisissez la quantité, puis validez votre commande.</p>
        </header>

        {/* Filtres */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit…"
              className="lg-input pl-9"
            />
          </div>
          <select className="lg-select sm:w-40" value={categorieFiltre} onChange={(e) => setCategorieFiltre(e.target.value)}>
            {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <select className="lg-select sm:w-48" value={tri} onChange={(e) => setTri(e.target.value)}>
            <option value="defaut">Tri par défaut</option>
            <option value="nom">Nom (A → Z)</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="stock">Disponibilité</option>
          </select>
        </div>

        {/* Tableau produits */}
        <div className="lg-card overflow-hidden">
          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[720px]">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th className="!text-right">Prix</th>
                  <th className="!text-right">Stock</th>
                  <th className="!text-center">Qté</th>
                  <th className="!text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {produitsFiltres.length === 0 && (
                  <tr><td colSpan={6} className="lg-td text-center text-ink-400">Aucun produit trouvé.</td></tr>
                )}
                {produitsFiltres.map((p) => (
                  <LigneProduit key={p.id} produit={p} onAjouter={ajouter} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panier */}
        {panier.length > 0 && (
          <div className="lg-card mt-6 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-ink-900">Panier ({panier.length})</h2>
              <button onClick={vider} className="text-[12px] text-ink-400 hover:text-red-600">Vider</button>
            </div>
            <ul className="space-y-2 mb-4">
              {panier.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">{p.nom} × {p.quantite}</span>
                  <span className="font-semibold tabular text-ink-900">{fmt(p.prix * p.quantite)} F</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-t border-ink-100 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="lg-input" placeholder="Sujet / Prénom du demandeur" value={sujet} onChange={(e) => setSujet(e.target.value)} />
                <input className="lg-input" placeholder="Nom du client" value={clientNom} onChange={(e) => setClientNom(e.target.value)} />
                <input className="lg-input" placeholder="Contact" value={clientContact} onChange={(e) => setClientContact(e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-xl font-bold text-brand-600 tabular">Total : {fmt(total)} F</span>
                <button onClick={passerCommande} disabled={envoi} className="lg-btn-primary">
                  {envoi ? "Envoi…" : "Valider la commande"}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmation && (
          <div className="lg-card mt-6 p-5 border-accent-200 bg-accent-50">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-6 w-6 text-accent-600" />
              <div>
                <p className="font-display font-bold text-ink-900">Commande #{confirmation.reference} enregistrée</p>
                <p className="text-[13px] text-ink-600">Le personnel va la traiter.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    const w = window.open("", "_blank", "width=600,height=700");
                    if (!w) return;
                    w.document.write(`<html><head><title>Ticket ${confirmation.reference}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}h1{font-size:20px}.total{font-weight:bold;margin-top:12px}</style></head><body><h1>Ticket de commande</h1><p><strong>Référence :</strong> ${confirmation.reference}</p><p><strong>Sujet :</strong> ${sujet || "—"} </p><p class="total">Merci de votre commande.</p><script>window.print();</script></body></html>`);
                    w.document.close();
                  }}
                  className="lg-btn-neutral lg-btn-sm"
                  title="Imprimer le ticket"
                >
                  Imprimer le ticket
                </button>
                <button onClick={() => setConfirmation(null)} className="text-ink-400 hover:text-ink-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox image produit */}
        {imageApercu && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setImageApercu(null)}
          >
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-lift">
              <button
                type="button"
                onClick={() => setImageApercu(null)}
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-ink-700 shadow-soft hover:bg-white"
              >
                ✕
              </button>
              <div className="h-[70vh] w-[70vw] max-w-[700px]">
                <TuileVisuel produit={imageApercu} api="" className="h-full w-full" taille="grande" />
              </div>
              <div className="border-t border-ink-100 px-5 py-3">
                <p className="font-display font-bold text-ink-900">{imageApercu.nom}</p>
                <p className="text-[12px] text-ink-500 lg-clamp-2">{imageApercu.description || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton retour en haut */}
        {showTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-glow transition-all hover:scale-110"
            aria-label="Retour en haut"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}

function LigneProduit({ produit, onAjouter }) {
  const [qte, setQte] = useState(1);
  const dispo = !produit.en_rupture && Number(produit.stock_disponible) > 0;
  return (
    <tr>
      <td className="lg-td">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setImageApercu(produit)}
            className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-ink-100 transition-transform hover:scale-105"
            aria-label={`Agrandir l'image de ${produit.nom}`}
          >
            <TuileVisuel produit={produit} api="" className="h-full w-full" taille="petite" />
          </button>
          <div>
            <p className="font-semibold text-ink-800 text-[13px]">{produit.nom}</p>
            <p className="text-[11px] text-ink-500 lg-clamp-1 max-w-[220px]">{produit.description || "—"}</p>
          </div>
        </div>
      </td>
      <td className="lg-td text-[13px]">{produit.categorie || "—"}</td>
      <td className="lg-td text-right font-semibold tabular text-ink-900">{Number(produit.prix || 0).toLocaleString("fr-FR")} F</td>
      <td className="lg-td text-right tabular text-ink-600">{produit.stock_disponible}</td>
      <td className="lg-td text-center">
        <input
          type="number"
          min={1}
          max={produit.stock_disponible}
          value={qte}
          onChange={(e) => setQte(e.target.value)}
          className="lg-input w-16 text-center py-1.5 text-[13px]"
          disabled={!dispo}
        />
      </td>
      <td className="lg-td text-center">
        <button
          type="button"
          disabled={!dispo}
          onClick={() => onAjouter(produit, qte)}
          className={`lg-btn-sm ${dispo ? "lg-btn-primary" : "lg-btn-neutral cursor-not-allowed opacity-50"}`}
        >
          Commander
        </button>
      </td>
    </tr>
  );
}
