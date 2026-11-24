import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QrCodeIcon } from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;

export default function WidgetView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/v1/widget/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.erreur || "Widget introuvable");
        setData(json);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, [id]);

  if (chargement) return <div className="min-h-screen flex items-center justify-center"><p className="text-ink-500">Chargement…</p></div>;
  if (erreur) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{erreur}</p></div>;

  const contenu = typeof data.contenu === "string" ? JSON.parse(data.contenu) : (data.contenu || {});
  const champs = contenu.champs || [];
  const template = contenu.template || "moderne";
  const secteur = contenu.secteur || "supermarche";
  const isRestaurant = secteur === "restaurant";
  const isAffiche = data.type === "affiche";

  if (isAffiche) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-ink-200/60">
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 px-10 py-12 text-center text-white">
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{data.titre || "Affiche"}</h1>
              <p className="mt-3 text-[12px] font-semibold tracking-[0.3em] text-white/80 uppercase">Offre spéciale</p>
            </div>
            <div className="space-y-4 px-10 py-8">
              {champs.length === 0 && <p className="text-center text-ink-400">Aucun contenu.</p>}
              {champs.map((c, i) => (
                <div key={i} className="flex items-center justify-between border-b border-ink-100 pb-3">
                  <span className="text-[15px] font-medium text-ink-600">{c.label}</span>
                  <span className="font-display text-[18px] font-bold text-ink-900">{c.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-ink-900 px-10 py-4 text-center">
              <p className="text-[10px] tracking-widest text-white/60 uppercase">Le Gestionnaire</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white shadow-soft hover:bg-ink-800">
              Télécharger / Imprimer l'affiche
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 to-white px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-amber-100 ring-4 ring-amber-200/50">
              <QrCodeIcon className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900">{data.titre || "Menu"}</h1>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.25em] text-amber-600 uppercase">Restaurant</p>
            <div className="mx-auto mt-4 h-px w-24 bg-amber-300" />
          </div>
          <div className="space-y-3">
            {champs.length === 0 && <p className="text-center text-ink-400">Aucun plat.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-white px-5 py-4 shadow-xs transition-all hover:shadow-soft">
                <span className="text-[14px] font-medium text-ink-800">{c.label}</span>
                <span className="font-display text-[16px] font-bold text-amber-700">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-soft hover:bg-amber-700">
              Télécharger / Imprimer le menu
            </button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-[10px] text-ink-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "elegant") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-800/60 shadow-2xl backdrop-blur">
            <div className="border-b border-amber-300/20 px-8 py-10 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-amber-300/40 bg-amber-300/10">
                <QrCodeIcon className="h-6 w-6 text-amber-300" />
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-100">{data.titre || "Widget"}</h1>
              <p className="mt-2 text-[11px] font-semibold tracking-[0.25em] text-amber-300/70 uppercase">{data.type}</p>
            </div>
            <div className="divide-y divide-amber-200/10 px-8 py-6">
              {champs.length === 0 && <p className="text-center text-slate-400">Aucun champ.</p>}
              {champs.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <span className="text-[13px] font-medium text-amber-200/80">{c.label}</span>
                  <span className="font-display text-[15px] font-bold text-amber-100">{c.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-amber-200/10 px-8 py-4 text-center">
              <button onClick={() => window.print()} className="mb-2 rounded-full bg-amber-600 px-5 py-2 text-[12px] font-bold text-white shadow-soft hover:bg-amber-700">
                Télécharger / Imprimer
              </button>
              <p className="text-[10px] tracking-widest text-amber-300/40 uppercase">Généré avec Le Gestionnaire</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className="min-h-screen bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="border-b-2 border-ink-900 pb-4">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">{data.titre || "Widget"}</h1>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-ink-400 uppercase">{data.type}</p>
          </div>
          <div className="mt-6 space-y-4">
            {champs.length === 0 && <p className="text-ink-400">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-ink-500">{c.label}</span>
                <span className="text-[15px] font-semibold text-ink-900">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-ink-200 pt-4">
            <button onClick={() => window.print()} className="mb-2 rounded-full bg-ink-900 px-5 py-2 text-[12px] font-bold text-white shadow-soft hover:bg-ink-800">
              Télécharger / Imprimer
            </button>
            <p className="text-[10px] text-ink-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // Moderne (défaut)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-ink-200/60">
          <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 px-8 py-10 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
                <QrCodeIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">{data.titre || "Widget"}</h1>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">{data.type}</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-ink-100 px-8 py-6">
            {champs.length === 0 && <p className="text-center text-ink-400">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <span className="text-[13px] font-semibold text-ink-500">{c.label}</span>
                <span className="font-display text-[16px] font-bold text-ink-900">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-100 bg-ink-50/50 px-8 py-4 text-center">
            <button onClick={() => window.print()} className="mb-2 rounded-full bg-indigo-600 px-5 py-2 text-[12px] font-bold text-white shadow-soft hover:bg-indigo-700">
              Télécharger / Imprimer
            </button>
            <p className="text-[10px] font-medium text-ink-400">Généré avec Le Gestionnaire</p>
          </div>
        </div>
      </div>
    </div>
  );
}
