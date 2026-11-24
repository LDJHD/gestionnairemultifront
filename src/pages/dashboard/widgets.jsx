import { useState, useEffect } from "react";
import { QrCodeIcon, PlusIcon, TrashIcon, ArrowDownTrayIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import WidgetRender from "../../components/WidgetRender";

const API = import.meta.env.VITE_API_URL;

const MODELES = {
  menu: [
    { value: "gourmand", label: "Menu Gourmand — noir & or", desc: "Logo script, bandeaux de section, pointillés + pastilles de prix, grande photo, bandeau contact." },
    { value: "digital", label: "Menu Digital + QR — noir & or", desc: "Grand QR code encadré, 3 photos rondes, icônes de service, pied ondulé." },
    { value: "delice", label: "Le Délice — bordeaux & or", desc: "Panneau crème encadré d'or, photo, bandeau d'icônes et de contact." },
    { value: "bella", label: "Bella Vita — crème & rouge", desc: "Élégant italien, titre script rouge, sections rouges, photo." },
    { value: "royal", label: "Chez Royal — noir & or", desc: "Couronne, titre script, atouts, photo, bouton doré." },
    { value: "moderne", label: "Moderne — clair", desc: "Dégradé indigo/émeraude, cartes, pastilles de prix." },
    { value: "minimal", label: "Minimal — blanc", desc: "Éditorial épuré, noir sur blanc." },
  ],
  affiche: [
    { value: "supermarche", label: "Supermarché — bleu/jaune/rouge", desc: "Panier, accroche rouge, checklist, grille produits, bandeau bleu." },
    { value: "maboutique", label: "MaBoutique — orange/bleu", desc: "Sac orange, bannière marine, atouts ronds, CTA rouge." },
    { value: "annonce", label: "Annonce importante — bleu/jaune", desc: "Mégaphone, bandeau ANNONCE, encadré pointillé, 4 pastilles." },
  ],
};

const SECTIONS = ["Entrées", "Plats principaux", "Nos Plats", "Boissons", "Nos Boissons", "Desserts", "Nos Desserts", "Promotions", "Menus", "Snacks"];

export default function Widgets() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("menu");
  const [template, setTemplate] = useState("gourmand");
  const [titre, setTitre] = useState("");
  const [slogan, setSlogan] = useState("");
  const [imagePrincipale, setImagePrincipale] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [pied, setPied] = useState("");
  const [champs, setChamps] = useState([{ section: "", label: "", value: "", image: "" }]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/widget/list`, { headers });
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const modeles = MODELES[type] || MODELES.menu;
  const modeleChoisi = modeles.find((m) => m.value === template) || modeles[0];

  const changerType = (v) => {
    setType(v);
    setTemplate(v === "affiche" ? "supermarche" : "gourmand");
  };

  const ajouterChamp = () => setChamps((c) => [...c, { section: "", label: "", value: "", image: "" }]);
  const majChamp = (i, k, v) => setChamps((c) => c.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const supprimerChamp = (i) => setChamps((c) => c.filter((_, idx) => idx !== i));

  const televerser = async (fichier, setter) => {
    if (!fichier) return;
    try {
      const fd = new FormData();
      fd.append("image", fichier);
      const res = await axios.post(`${API}/api/v1/produit/upload-image`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      if (res.data?.image) setter(res.data.image);
    } catch (e) {
      console.error(e);
      alert("Échec de l'upload de l'image");
    }
  };

  const generer = async () => {
    setLoading(true);
    try {
      const contenu = {
        template,
        slogan,
        image_principale: imagePrincipale,
        telephone,
        adresse,
        pied,
        champs: champs.filter((c) => String(c.label || "").trim()),
      };
      const res = await axios.post(`${API}/api/v1/widget/create`, { type, titre, contenu }, { headers });
      if (!res.data?.ok) throw new Error("Erreur");
      await load();
      setTitre("");
      setSlogan("");
      setImagePrincipale("");
      setTelephone("");
      setAdresse("");
      setPied("");
      setChamps([{ section: "", label: "", value: "", image: "" }]);
      setTemplate(type === "affiche" ? "supermarche" : "gourmand");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.erreur || e?.message || "Erreur lors de la génération";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer ce widget ?")) return;
    try {
      await axios.post(`${API}/api/v1/widget/delete`, { id }, { headers });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const telecharger = (url) => {
    const a = document.createElement("a");
    a.href = `${API}/${url}`;
    a.download = url.split("/").pop();
    a.target = "_blank";
    a.click();
  };

  const champsRemplis = champs.filter((c) => String(c.label || "").trim());
  const champsApercu =
    champsRemplis.length > 0
      ? champsRemplis
      : [
          { section: "Nos Plats", label: "Riz sauté spécial", value: "3 000 F", image: "" },
          { section: "Nos Plats", label: "Poulet braisé", value: "3 000 F", image: "" },
          { section: "Nos Boissons", label: "Jus naturel", value: "1 000 F", image: "" },
          { section: "Nos Desserts", label: "Gâteau maison", value: "1 500 F", image: "" },
        ];

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h1 className="lg-page-title">Widgets — Menus & Affiches</h1>
        <p className="lg-page-sub">Des modèles inspirés de tes affiches : menus noir & or, Délice, Bella Vita, Chez Royal, supermarché, MaBoutique, annonce.</p>
      </header>

      {/* Formulaire de création */}
      <div className="lg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ink-900">Nouveau widget</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="lg-label">Type</label>
            <select className="lg-select" value={type} onChange={(e) => changerType(e.target.value)}>
              <option value="menu">Menu</option>
              <option value="affiche">Affiche</option>
            </select>
          </div>
          <div>
            <label className="lg-label">Modèle</label>
            <select className="lg-select" value={template} onChange={(e) => setTemplate(e.target.value)}>
              {modeles.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] leading-snug text-ink-400">{modeleChoisi?.desc}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="lg-label">Titre</label>
            <input className="lg-input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Notre Menu / Annonce importante" />
          </div>
          <div>
            <label className="lg-label">Slogan</label>
            <input className="lg-input" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Ex: Bon goût, bonne ambiance !" />
          </div>
        </div>

        {/* Image principale */}
        <div>
          <label className="lg-label">Image principale (optionnel)</label>
          {imagePrincipale ? (
            <div className="flex items-center gap-3">
              <img src={imagePrincipale.startsWith("http") ? imagePrincipale : `${API}/${imagePrincipale}`} alt="" className="h-24 w-32 rounded-xl border border-ink-200 object-cover" />
              <label className="lg-btn-neutral lg-btn-sm cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => televerser(e.target.files?.[0], setImagePrincipale)} />
                <PhotoIcon className="h-4 w-4" /> Remplacer
              </label>
              <button type="button" onClick={() => setImagePrincipale("")} className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600" title="Retirer">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50/40 py-4 text-[12px] font-semibold text-ink-500 transition hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-600">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => televerser(e.target.files?.[0], setImagePrincipale)} />
              <PhotoIcon className="h-5 w-5" />
              Ajouter la grande photo du menu (optionnel)
            </label>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="lg-label">Téléphone</label>
            <input className="lg-input" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+229 01 97 00 00 00" />
          </div>
          <div>
            <label className="lg-label">Adresse</label>
            <input className="lg-input" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Cotonou, Bénin" />
          </div>
          <div>
            <label className="lg-label">Pied de page</label>
            <input className="lg-input" value={pied} onChange={(e) => setPied(e.target.value)} placeholder="Bon appétit !" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lg-label mb-0">Champs personnalisés</label>
            <button type="button" onClick={ajouterChamp} className="lg-btn-soft lg-btn-sm">
              <PlusIcon className="h-4 w-4" /> Ajouter un champ
            </button>
          </div>
          <datalist id="sections-widget">
            {SECTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
          <div className="space-y-3">
            {champs.map((c, i) => (
              <div key={i} className="rounded-xl border border-ink-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input list="sections-widget" className="lg-input flex-1" placeholder="Section (ex: Nos Plats)" value={c.section || ""} onChange={(e) => majChamp(i, "section", e.target.value)} />
                  <input className="lg-input flex-1" placeholder="Libellé (ex: Poulet braisé)" value={c.label} onChange={(e) => majChamp(i, "label", e.target.value)} />
                  <input className="lg-input flex-1" placeholder="Prix / valeur (ex: 3 000 F)" value={c.value} onChange={(e) => majChamp(i, "value", e.target.value)} />
                  <button type="button" onClick={() => supprimerChamp(i)} className="grid h-10 w-10 flex-none place-items-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {c.image ? (
                  <div className="flex items-center gap-3">
                    <img src={c.image.startsWith("http") ? c.image : `${API}/${c.image}`} alt="" className="h-20 w-20 rounded-lg object-cover border border-ink-200" />
                    <label className="lg-btn-neutral lg-btn-sm cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => televerser(e.target.files?.[0], (url) => majChamp(i, "image", url))} />
                      <PhotoIcon className="h-4 w-4" /> Remplacer
                    </label>
                    <button type="button" onClick={() => majChamp(i, "image", "")} className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600" title="Retirer l'image">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50/40 py-2.5 text-[12px] font-semibold text-ink-500 transition hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-600">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => televerser(e.target.files?.[0], (url) => majChamp(i, "image", url))} />
                    <PhotoIcon className="h-5 w-5" />
                    Ajouter une image (optionnel)
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={generer} disabled={loading} className="lg-btn-primary">
            <QrCodeIcon className="h-4 w-4" /> {loading ? "Génération…" : "Générer le widget + QR code"}
          </button>
        </div>
      </div>

      {/* Aperçu en direct — même moteur de rendu que la page publique */}
      <div className="lg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Aperçu du modèle sélectionné</h2>
          <span className="lg-badge-brand">{modeleChoisi?.label}</span>
        </div>
        <div className="max-h-[620px] overflow-y-auto rounded-2xl border border-ink-200">
          <WidgetRender
            titre={titre || "Titre du widget"}
            type={type}
            template={template}
            champs={champsApercu}
            boutiqueNom="Votre boutique"
            slogan={slogan}
            imagePrincipale={imagePrincipale}
            telephone={telephone}
            adresse={adresse}
            pied={pied}
          />
        </div>
      </div>

      {/* Liste des widgets */}
      <div className="lg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <h2 className="font-display text-lg font-bold text-ink-900">Mes widgets</h2>
        </div>
        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[700px]">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Modèle</th>
                <th>QR Code</th>
                <th className="!text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="lg-td text-center text-ink-400">Aucun widget créé.</td>
                </tr>
              )}
              {items.map((w) => {
                let tpl = "";
                try {
                  const c = typeof w.contenu === "string" ? JSON.parse(w.contenu) : w.contenu;
                  tpl = c?.template || "";
                } catch (e) {
                  tpl = "";
                }
                const libelleModele =
                  [...MODELES.menu, ...MODELES.affiche].find((m) => m.value === tpl)?.label || tpl || "—";
                return (
                  <tr key={w.id}>
                    <td className="lg-td font-semibold text-ink-800">{w.titre || "—"}</td>
                    <td className="lg-td">
                      <span className="lg-badge-brand">{w.type}</span>
                    </td>
                    <td className="lg-td text-ink-500">{libelleModele}</td>
                    <td className="lg-td">
                      {w.qr_code && <img src={`${API}/${w.qr_code}`} alt="QR" className="h-16 w-16 rounded-lg border border-ink-200" />}
                    </td>
                    <td className="lg-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        {w.qr_code && (
                          <button onClick={() => telecharger(w.qr_code)} className="lg-btn-neutral lg-btn-sm" title="Télécharger le QR">
                            <ArrowDownTrayIcon className="h-4 w-4" /> QR
                          </button>
                        )}
                        <a href={`${window.location.origin}/widget/${w.id}`} target="_blank" rel="noreferrer" className="lg-btn-soft lg-btn-sm">
                          Voir
                        </a>
                        <button onClick={() => supprimer(w.id)} className="lg-btn-danger lg-btn-sm" title="Supprimer">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
