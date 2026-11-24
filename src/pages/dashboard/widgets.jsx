import { useState, useEffect } from "react";
import { QrCodeIcon, PlusIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Widgets() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("menu");
  const [template, setTemplate] = useState("moderne");
  const [titre, setTitre] = useState("");
  const [champs, setChamps] = useState([{ label: "", value: "", image: "" }]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/widget/list`, { headers });
      setItems(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const ajouterChamp = () => setChamps((c) => [...c, { label: "", value: "" }]);
  const majChamp = (i, k, v) => setChamps((c) => c.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const supprimerChamp = (i) => setChamps((c) => c.filter((_, idx) => idx !== i));

  const uploaderImageChamp = async (i, fichier) => {
    if (!fichier) return;
    try {
      const fd = new FormData();
      fd.append("image", fichier);
      const res = await axios.post(`${API}/api/v1/produit/upload-image`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      if (res.data?.image) {
        majChamp(i, "image", res.data.image);
      }
    } catch (e) {
      console.error(e);
      alert("Échec de l'upload de l'image");
    }
  };

  const generer = async () => {
    setLoading(true);
    try {
      const contenu = { template, champs: champs.filter((c) => c.label.trim()) };
      const res = await axios.post(`${API}/api/v1/widget/create`, { type, titre, contenu }, { headers });
      if (!res.data?.ok) throw new Error("Erreur");
      await load();
      setTitre("");
      setChamps([{ label: "", value: "", image: "" }]);
      setTemplate("moderne");
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
    } catch (e) { console.error(e); }
  };

  const telecharger = (url) => {
    const a = document.createElement("a");
    a.href = `${API}/${url}`;
    a.download = url.split("/").pop();
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h1 className="lg-page-title">Widgets — Menus & Affiches</h1>
        <p className="lg-page-sub">Créez des menus ou affiches avec un QR code téléchargeable.</p>
      </header>

      {/* Formulaire de création */}
      <div className="lg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ink-900">Nouveau widget</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="lg-label">Type</label>
            <select className="lg-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="menu">Menu</option>
              <option value="affiche">Affiche</option>
            </select>
          </div>
          <div>
            <label className="lg-label">Modèle</label>
            <select className="lg-select" value={template} onChange={(e) => setTemplate(e.target.value)}>
              <optgroup label="Menus">
                <option value="moderne">Moderne</option>
                <option value="elegant">Élégant (luxe)</option>
                <option value="minimal">Minimal</option>
                <option value="gourmet">Gourmet (or & noir)</option>
                <option value="digital">Digital (sombre)</option>
                <option value="bistro">Bistro (chaleureux)</option>
              </optgroup>
              <optgroup label="Affiches">
                <option value="promo">Promotionnelle</option>
                <option value="supermarche">Supermarché</option>
                <option value="affiche_luxe">Affiche luxe</option>
                <option value="affiche">Affiche (défaut)</option>
              </optgroup>
            </select>
          </div>
        </div>
        <div>
          <label className="lg-label">Titre</label>
          <input className="lg-input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Menu du jour" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lg-label mb-0">Champs personnalisés</label>
            <button type="button" onClick={ajouterChamp} className="lg-btn-soft lg-btn-sm">
              <PlusIcon className="h-4 w-4" /> Ajouter un champ
            </button>
          </div>
          <div className="space-y-3">
            {champs.map((c, i) => (
              <div key={i} className="rounded-xl border border-ink-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input className="lg-input flex-1" placeholder="Libellé (ex: Plat)" value={c.label} onChange={(e) => majChamp(i, "label", e.target.value)} />
                  <input className="lg-input flex-1" placeholder="Valeur (ex: 1500 F)" value={c.value} onChange={(e) => majChamp(i, "value", e.target.value)} />
                  <button type="button" onClick={() => supprimerChamp(i)} className="grid h-10 w-10 place-items-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input className="lg-input flex-1" placeholder="URL image (optionnel)" value={c.image || ""} onChange={(e) => majChamp(i, "image", e.target.value)} />
                  <label className="lg-btn-neutral lg-btn-sm cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploaderImageChamp(i, e.target.files?.[0])} />
                    📷 Upload
                  </label>
                </div>
                {c.image && (
                  <img src={c.image.startsWith("http") ? c.image : `${API}/${c.image}`} alt="" className="h-20 w-20 rounded-lg object-cover border border-ink-200" />
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

      {/* Aperçu en direct */}
      <div className="lg-card p-6">
        <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Aperçu du modèle sélectionné</h2>
        <div className="rounded-2xl border border-ink-200 overflow-hidden">
          <div className={`p-6 ${
            template === "elegant" ? "bg-slate-900" :
            template === "minimal" ? "bg-white" :
            template === "gourmet" ? "bg-stone-900" :
            template === "digital" ? "bg-slate-950" :
            template === "bistro" ? "bg-orange-50" :
            template === "promo" ? "bg-pink-50" :
            template === "supermarche" ? "bg-slate-50" :
            template === "affiche_luxe" ? "bg-purple-900" :
            template === "affiche" ? "bg-rose-50" :
            "bg-slate-50"
          }`}>
            <p className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-2 ${
              template === "elegant" || template === "gourmet" || template === "digital" || template === "affiche_luxe" ? "text-amber-400/60" : "text-ink-400"
            }`}>Boutique démo</p>
            <h3 className={`font-display text-xl font-extrabold tracking-tight ${
              template === "elegant" ? "text-amber-100" :
              template === "gourmet" ? "text-amber-50" :
              template === "digital" ? "text-cyan-50" :
              template === "affiche_luxe" ? "text-purple-100" :
              "text-ink-900"
            }`}>{titre || "Titre du widget"}</h3>
            <div className="mt-4 space-y-2">
              {champs.filter(c => c.label.trim()).length === 0 && (
                <p className="text-[12px] text-ink-400">Ajoutez des champs pour voir l'aperçu.</p>
              )}
              {champs.filter(c => c.label.trim()).map((c, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  template === "elegant" ? "bg-slate-800/60" :
                  template === "gourmet" ? "border-b border-amber-900/30" :
                  template === "digital" ? "bg-slate-900/60" :
                  template === "minimal" ? "border-b border-ink-100" :
                  template === "bistro" ? "bg-white border border-orange-200/60" :
                  template === "promo" ? "bg-pink-50/50" :
                  template === "supermarche" ? "bg-white shadow-sm" :
                  template === "affiche_luxe" ? "bg-purple-900/20" :
                  "bg-white border border-slate-100"
                }`}>
                  <span className={`text-[12px] ${
                    template === "elegant" ? "text-amber-200/80" :
                    template === "gourmet" ? "text-amber-100/80" :
                    template === "digital" ? "text-cyan-200/70" :
                    template === "affiche_luxe" ? "text-purple-200/80" :
                    "text-ink-600"
                  }`}>{c.label}</span>
                  <span className={`text-[13px] font-bold ${
                    template === "elegant" ? "text-amber-100" :
                    template === "gourmet" ? "text-amber-400" :
                    template === "digital" ? "text-cyan-100" :
                    template === "affiche_luxe" ? "text-purple-100" :
                    "text-ink-900"
                  }`}>{c.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des widgets */}
      <div className="lg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <h2 className="font-display text-lg font-bold text-ink-900">Mes widgets</h2>
        </div>
        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[640px]">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>QR Code</th>
                <th className="!text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={4} className="lg-td text-center text-ink-400">Aucun widget créé.</td></tr>
              )}
              {items.map((w) => (
                <tr key={w.id}>
                  <td className="lg-td font-semibold text-ink-800">{w.titre || "—"}</td>
                  <td className="lg-td">
                    <span className="lg-badge-brand">{w.type}</span>
                  </td>
                  <td className="lg-td">
                    {w.qr_code && (
                      <img src={`${API}/${w.qr_code}`} alt="QR" className="h-16 w-16 rounded-lg border border-ink-200" />
                    )}
                  </td>
                  <td className="lg-td text-right">
                    <div className="flex items-center justify-end gap-2">
                      {w.qr_code && (
                        <button onClick={() => telecharger(w.qr_code)} className="lg-btn-neutral lg-btn-sm" title="Télécharger le QR">
                          <ArrowDownTrayIcon className="h-4 w-4" /> QR
                        </button>
                      )}
                      <a
                        href={`${window.location.origin}/widget/${w.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="lg-btn-soft lg-btn-sm"
                      >
                        Voir
                      </a>
                      <button onClick={() => supprimer(w.id)} className="lg-btn-danger lg-btn-sm" title="Supprimer">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
