import { useState, useEffect } from "react";
import { BanknotesIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Portefeuille() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ recettes: 0, depenses: 0, solde: 0 });
  const [form, setForm] = useState({ type: "depense", categorie: "", montant: "", description: "", date_operation: "" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const [l, s] = await Promise.all([
        axios.get(`${API}/api/v1/portefeuille/list`, { headers }),
        axios.get(`${API}/api/v1/portefeuille/stats`, { headers }),
      ]);
      setItems(l.data || []);
      setStats(s.data || { recettes: 0, depenses: 0, solde: 0 });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.montant) return;
    setLoading(true);
    try {
      await axios.post(`${API}/api/v1/portefeuille/create`, form, { headers });
      setForm({ type: "depense", categorie: "", montant: "", description: "", date_operation: "" });
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette opération ?")) return;
    try {
      await axios.post(`${API}/api/v1/portefeuille/delete`, { id }, { headers });
      await load();
    } catch (e) { console.error(e); }
  };

  const fmt = (n) => Number(n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 });

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h1 className="lg-page-title">Portefeuille & dépenses</h1>
        <p className="lg-page-sub">Traçabilité des recettes et dépenses de votre activité.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="lg-card p-5">
          <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider">Recettes</p>
          <p className="mt-2 font-display text-2xl font-bold text-accent-600">{fmt(stats.recettes)} F</p>
        </div>
        <div className="lg-card p-5">
          <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider">Dépenses</p>
          <p className="mt-2 font-display text-2xl font-bold text-red-600">{fmt(stats.depenses)} F</p>
        </div>
        <div className="lg-card p-5">
          <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider">Solde</p>
          <p className={`mt-2 font-display text-2xl font-bold ${stats.solde >= 0 ? "text-brand-600" : "text-red-600"}`}>{fmt(stats.solde)} F</p>
        </div>
      </div>

      {/* Form */}
      <div className="lg-card p-6">
        <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Nouvelle opération</h2>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="lg-label">Type</label>
            <select className="lg-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="depense">Dépense</option>
              <option value="recette">Recette</option>
            </select>
          </div>
          <div>
            <label className="lg-label">Catégorie</label>
            <input className="lg-input" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} placeholder="Ex: Loyer, Achat stock…" />
          </div>
          <div>
            <label className="lg-label">Montant</label>
            <input className="lg-input" type="number" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} placeholder="0" required />
          </div>
          <div className="sm:col-span-2">
            <label className="lg-label">Description</label>
            <input className="lg-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détail de l'opération" />
          </div>
          <div>
            <label className="lg-label">Date</label>
            <input className="lg-input" type="datetime-local" value={form.date_operation} onChange={(e) => setForm({ ...form, date_operation: e.target.value })} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button type="submit" disabled={loading} className="lg-btn-primary">
              <PlusIcon className="h-4 w-4" /> {loading ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>

      {/* Liste */}
      <div className="lg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <h2 className="font-display text-lg font-bold text-ink-900">Historique</h2>
        </div>
        <div className="lg-table-wrap">
          <table className="lg-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th className="!text-right">Montant</th>
                <th className="!text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} className="lg-td text-center text-ink-400">Aucune opération enregistrée.</td></tr>
              )}
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="lg-td text-[13px] text-ink-500">{it.date_operation}</td>
                  <td className="lg-td">
                    <span className={it.type === "recette" ? "lg-badge-accent" : "lg-badge-danger"}>
                      {it.type === "recette" ? "Recette" : "Dépense"}
                    </span>
                  </td>
                  <td className="lg-td text-[13px]">{it.categorie || "—"}</td>
                  <td className="lg-td text-[13px] text-ink-600">{it.description || "—"}</td>
                  <td className={`lg-td text-right font-semibold tabular ${it.type === "recette" ? "text-accent-600" : "text-red-600"}`}>
                    {it.type === "recette" ? "+" : "-"}{fmt(it.montant)} F
                  </td>
                  <td className="lg-td text-right">
                    <button onClick={() => remove(it.id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600">
                      <TrashIcon className="h-[18px] w-[18px]" />
                    </button>
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
