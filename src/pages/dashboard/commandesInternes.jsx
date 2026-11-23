import { useState, useEffect } from "react";
import { ClipboardDocumentListIcon, CheckCircleIcon, XCircleIcon, PrinterIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function CommandesInternes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtre, setFiltre] = useState("tous");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/v1/commande-interne/list`, { headers });
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); window.__lgRefresh = load; return () => { window.__lgRefresh = null; }; }, []);

  const changerStatut = async (id, statut) => {
    try {
      await axios.post(`${API}/api/v1/commande-interne/update-statut`, { id, statut }, { headers });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

  const libelle = (s) => {
    if (s === "EN_ATTENTE_PAIEMENT") return "En attente";
    if (s === "PAYEE") return "Payée / Servie";
    if (s === "ANNULEE") return "Annulée";
    return s;
  };

  const imprimer = (c) => {
    const w = window.open("", "_blank", "width=600,height=700");
    if (!w) return;
    w.document.write(`
      <html><head><title>Reçu commande ${c.reference}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #cbd5e1;padding:8px;font-size:13px}th{background:#f1f5f9;text-align:left}.total{font-weight:bold;text-align:right;margin-top:12px}</style>
      </head><body>
      <h1>Reçu — Commande interne</h1>
      <p><strong>Référence :</strong> ${c.reference}</p>
      <p><strong>Client :</strong> ${c.client_nom || "—"} ${c.client_contact ? "— " + c.client_contact : ""}</p>
      <p><strong>Statut :</strong> ${libelle(c.statut)}</p>
      <p><strong>Date :</strong> ${c.created_at ? new Date(c.created_at).toLocaleString("fr-FR") : "—"}</p>
      <p class="total">Montant total : ${fmt(c.montant_total)} F</p>
      <script>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h1 className="lg-page-title">Commandes internes</h1>
        <p className="lg-page-sub">Suivi des commandes passées en interne (retrait).</p>
      </header>

      <div className="lg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Liste des commandes</h2>
          <div className="flex items-center gap-2">
            <select className="lg-select sm:w-44" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
              <option value="tous">Tous les statuts</option>
              <option value="EN_ATTENTE_PAIEMENT">En attente</option>
              <option value="PAYEE">Payées / Servies</option>
              <option value="ANNULEE">Annulées</option>
            </select>
            <button onClick={load} className="lg-btn-neutral lg-btn-sm">Actualiser</button>
          </div>
        </div>
        <div className="lg-table-wrap">
          <table className="lg-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Contact</th>
                <th className="!text-right">Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="!text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="lg-td text-center text-ink-400">Chargement…</td></tr>
              )}
              {!loading && items.filter((c) => filtre === "tous" || c.statut === filtre).length === 0 && (
                <tr><td colSpan={7} className="lg-td text-center text-ink-400">Aucune commande pour ce filtre.</td></tr>
              )}
              {items.filter((c) => filtre === "tous" || c.statut === filtre).map((c) => (
                <tr key={c.id}>
                  <td className="lg-td font-mono text-[13px] text-ink-700">{c.reference}</td>
                  <td className="lg-td text-[13px]">{c.client_nom || "—"}</td>
                  <td className="lg-td text-[13px] text-ink-500">{c.client_contact || "—"}</td>
                  <td className="lg-td text-right font-semibold tabular text-ink-900">{fmt(c.montant_total)} F</td>
                  <td className="lg-td">
                    <span className={
                      c.statut === "PAYEE" ? "lg-badge-accent" :
                      c.statut === "ANNULEE" ? "lg-badge-danger" : "lg-badge-warn"
                    }>{libelle(c.statut)}</span>
                  </td>
                  <td className="lg-td text-[13px] text-ink-500">{c.created_at ? new Date(c.created_at).toLocaleString("fr-FR") : "—"}</td>
                  <td className="lg-td text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => imprimer(c)}
                        className="lg-btn-neutral lg-btn-sm"
                        title="Imprimer le reçu"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      {c.statut !== "PAYEE" && c.statut !== "ANNULEE" && (
                        <button
                          onClick={() => changerStatut(c.id, "PAYEE")}
                          className="lg-btn-accent lg-btn-sm"
                          title="Marquer payé / servi"
                        >
                          <CheckCircleIcon className="h-4 w-4" /> Payé & servi
                        </button>
                      )}
                      {c.statut !== "ANNULEE" && c.statut !== "PAYEE" && (
                        <button
                          onClick={() => changerStatut(c.id, "ANNULEE")}
                          className="lg-btn-danger lg-btn-sm"
                          title="Annuler"
                        >
                          <XCircleIcon className="h-4 w-4" /> Annuler
                        </button>
                      )}
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
