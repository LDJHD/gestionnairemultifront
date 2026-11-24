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
  const boutiqueNom = contenu.boutique_nom || data.titre || "Boutique";
  const imgUrl = (img) => (img ? (img.startsWith("http") ? img : `${API}/${img}`) : null);

  // ── AFFICHE (poster vibrant) ──
  if (isAffiche) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-rose-600 to-orange-500 px-10 py-14 text-center text-white">
              <p className="text-[11px] font-bold tracking-[0.4em] text-white/80 uppercase">{boutiqueNom}</p>
              <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{data.titre || "Affiche"}</h1>
              <p className="mt-3 text-[13px] font-semibold tracking-[0.3em] text-white/80 uppercase">Offre spéciale</p>
            </div>
            <div className="space-y-0">
              {champs.length === 0 && <p className="py-10 text-center text-ink-400">Aucun contenu.</p>}
              {champs.map((c, i) => (
                <div key={i} className={`flex items-center gap-5 px-10 py-6 ${i % 2 === 0 ? "bg-white" : "bg-rose-50/50"}`}>
                  {c.image && (
                    <img src={imgUrl(c.image)} alt="" className="h-24 w-24 flex-none rounded-2xl object-cover shadow-lg" />
                  )}
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-ink-600">{c.label}</p>
                    <p className="font-display text-[26px] font-extrabold text-rose-600">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-ink-900 px-10 py-5 text-center">
              <p className="text-[10px] tracking-widest text-white/60 uppercase">Le Gestionnaire</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-rose-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
              Télécharger / Imprimer l'affiche
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESTAURANT ──
  if (isRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-stone-50 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-amber-100 ring-4 ring-amber-200/50 shadow-lg">
              <QrCodeIcon className="h-10 w-10 text-amber-600" />
            </div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-amber-600 uppercase">{boutiqueNom}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-amber-900">{data.titre || "Menu"}</h1>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.25em] text-amber-600 uppercase">Restaurant</p>
            <div className="mx-auto mt-5 h-px w-32 bg-amber-300" />
          </div>
          <div className="space-y-4">
            {champs.length === 0 && <p className="text-center text-ink-400">Aucun plat.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center gap-5 rounded-2xl border border-amber-200/60 bg-white px-6 py-5 shadow-sm transition-all hover:shadow-md hover:border-amber-300">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-20 w-20 flex-none rounded-xl object-cover shadow-sm" />
                )}
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-ink-800">{c.label}</p>
                </div>
                <p className="font-display text-[20px] font-bold text-amber-700">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-amber-600 px-8 py-3.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-amber-700 hover:shadow-lift">
              Télécharger / Imprimer le menu
            </button>
          </div>
          <div className="mt-8 text-center">
            <p className="text-[10px] text-ink-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉLÉGANT (luxe sombre) ──
  // ── GOURMET (or & noir) ──
  if (template === "gourmet") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 h-px w-16 bg-amber-400" />
            <p className="text-[10px] font-bold tracking-[0.4em] text-amber-400/70 uppercase">{boutiqueNom}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-amber-50 sm:text-5xl">{data.titre || "Menu"}</h1>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.3em] text-amber-400/60 uppercase">{data.type}</p>
            <div className="mx-auto mt-5 h-px w-24 bg-amber-400/40" />
          </div>
          <div className="space-y-0">
            {champs.length === 0 && <p className="text-center text-stone-500">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center gap-5 border-b border-amber-900/30 py-5">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-16 w-16 flex-none rounded-lg border border-amber-400/20 object-cover" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[14px] font-medium text-amber-100/80">{c.label}</span>
                  <span className="font-display text-[18px] font-bold text-amber-400">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => window.print()} className="rounded-full border border-amber-400/40 bg-amber-400/10 px-8 py-3 text-sm font-bold text-amber-300 transition-all hover:bg-amber-400/20">
              Télécharger / Imprimer
            </button>
            <p className="mt-6 text-[9px] tracking-widest text-amber-400/30 uppercase">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ── DIGITAL (sombre moderne) ──
  if (template === "digital") {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
                <QrCodeIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-400/60 uppercase">{boutiqueNom}</p>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-cyan-50">{data.titre || "Widget"}</h1>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-400/50 uppercase">{data.type}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {champs.length === 0 && <p className="text-center text-slate-500">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-cyan-500/10 bg-slate-900/60 px-5 py-4 transition-all hover:border-cyan-500/30 hover:bg-slate-900/80">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-14 w-14 flex-none rounded-lg border border-cyan-500/20 object-cover" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-cyan-200/70">{c.label}</span>
                  <span className="font-display text-[16px] font-bold text-cyan-100">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => window.print()} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-2.5 text-[12px] font-bold text-cyan-300 transition-all hover:bg-cyan-500/20">
              Télécharger / Imprimer
            </button>
            <p className="mt-4 text-[9px] tracking-widest text-cyan-400/30 uppercase">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ── BISTRO (chaleureux) ──
  if (template === "bistro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/60 to-amber-50/30 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-8 text-white shadow-lg">
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/70 uppercase">{boutiqueNom}</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{data.titre || "Menu"}</h1>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">{data.type}</p>
          </div>
          <div className="space-y-3">
            {champs.length === 0 && <p className="text-center text-ink-400">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-orange-200/60 bg-white px-5 py-4 shadow-xs transition-all hover:shadow-soft hover:border-orange-300">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-16 w-16 flex-none rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-ink-800">{c.label}</p>
                </div>
                <p className="font-display text-[16px] font-bold text-orange-600">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-orange-600 hover:shadow-lift">
              Télécharger / Imprimer
            </button>
            <p className="mt-6 text-[10px] text-ink-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ── PROMO (affiche promotionnelle) ──
  if (template === "promo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-pink-200/60">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-12 text-center text-white">
              <p className="text-[11px] font-bold tracking-[0.3em] text-white/80 uppercase">{boutiqueNom}</p>
              <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{data.titre || "Promo"}</h1>
              <p className="mt-3 text-[13px] font-semibold tracking-[0.3em] text-white/80 uppercase">Offre spéciale</p>
            </div>
            <div className="space-y-4 px-10 py-8">
              {champs.length === 0 && <p className="text-center text-ink-400">Aucun contenu.</p>}
              {champs.map((c, i) => (
                <div key={i} className="flex items-center gap-5 rounded-2xl bg-pink-50/50 p-5 transition-all hover:bg-pink-50">
                  {c.image && (
                    <img src={imgUrl(c.image)} alt="" className="h-24 w-24 flex-none rounded-2xl object-cover shadow-md" />
                  )}
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-ink-600">{c.label}</p>
                    <p className="font-display text-[24px] font-extrabold text-pink-600">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-ink-900 px-10 py-5 text-center">
              <p className="text-[10px] tracking-widest text-white/60 uppercase">Le Gestionnaire</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-pink-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-pink-600 hover:shadow-xl">
              Télécharger / Imprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUPERMARCHÉ ──
  if (template === "supermarche") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-6 text-white shadow-lg">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-white/70 uppercase">{boutiqueNom}</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{data.titre || "Promotions"}</h1>
            </div>
            <QrCodeIcon className="h-10 w-10 text-white/80" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {champs.length === 0 && <p className="col-span-full text-center text-ink-400">Aucun produit.</p>}
            {champs.map((c, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-48 w-full object-cover" />
                )}
                <div className="p-4">
                  <p className="text-[14px] font-semibold text-ink-800">{c.label}</p>
                  <p className="mt-1 font-display text-[20px] font-bold text-blue-600">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => window.print()} className="rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-blue-700 hover:shadow-lift">
              Télécharger / Imprimer
            </button>
            <p className="mt-4 text-[10px] text-ink-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ── AFFICHE LUXE ──
  if (template === "affiche_luxe") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-purple-300/20 bg-slate-800/60 shadow-2xl backdrop-blur">
            <div className="border-b border-purple-300/20 px-10 py-12 text-center">
              <p className="text-[10px] font-bold tracking-[0.4em] text-purple-300/60 uppercase">{boutiqueNom}</p>
              <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-purple-100 sm:text-6xl">{data.titre || "Affiche"}</h1>
              <p className="mt-3 text-[12px] font-semibold tracking-[0.3em] text-purple-300/70 uppercase">Collection exclusive</p>
              <div className="mx-auto mt-5 h-px w-24 bg-purple-400/40" />
            </div>
            <div className="space-y-4 px-10 py-8">
              {champs.length === 0 && <p className="text-center text-slate-400">Aucun contenu.</p>}
              {champs.map((c, i) => (
                <div key={i} className="flex items-center gap-5 rounded-2xl border border-purple-400/10 bg-purple-900/20 p-5 transition-all hover:bg-purple-900/30">
                  {c.image && (
                    <img src={imgUrl(c.image)} alt="" className="h-24 w-24 flex-none rounded-2xl object-cover shadow-lg ring-1 ring-purple-400/20" />
                  )}
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-purple-200/80">{c.label}</p>
                    <p className="font-display text-[22px] font-bold text-purple-100">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-purple-300/10 px-10 py-5 text-center">
              <button onClick={() => window.print()} className="mb-3 rounded-full border border-purple-400/40 bg-purple-400/10 px-6 py-2.5 text-[12px] font-bold text-purple-300 transition-all hover:bg-purple-400/20">
                Télécharger / Imprimer
              </button>
              <p className="text-[9px] tracking-widest text-purple-400/30 uppercase">Le Gestionnaire</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "elegant") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-amber-400/20 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-amber-400/20 px-10 py-12 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border-2 border-amber-400/40 bg-amber-400/10">
                <QrCodeIcon className="h-7 w-7 text-amber-400" />
              </div>
              <p className="text-[10px] font-bold tracking-[0.4em] text-amber-400/60 uppercase">{boutiqueNom}</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-amber-50">{data.titre || "Widget"}</h1>
              <p className="mt-2 text-[11px] font-semibold tracking-[0.3em] text-amber-400/60 uppercase">{data.type}</p>
              <div className="mx-auto mt-5 h-px w-20 bg-amber-400/40" />
            </div>
            <div className="divide-y divide-amber-400/10 px-10 py-6">
              {champs.length === 0 && <p className="text-center text-slate-500">Aucun champ.</p>}
              {champs.map((c, i) => (
                <div key={i} className="flex items-center gap-5 py-5">
                  {c.image && (
                    <img src={imgUrl(c.image)} alt="" className="h-16 w-16 flex-none rounded-lg border border-amber-400/20 object-cover" />
                  )}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-[14px] font-medium text-amber-200/70">{c.label}</span>
                    <span className="font-display text-[18px] font-bold text-amber-100">{c.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-amber-400/10 px-10 py-5 text-center">
              <button onClick={() => window.print()} className="mb-3 rounded-full border border-amber-400/40 bg-amber-400/10 px-6 py-2.5 text-[12px] font-bold text-amber-300 transition-all hover:bg-amber-400/20">
                Télécharger / Imprimer
              </button>
              <p className="text-[9px] tracking-widest text-amber-400/30 uppercase">Le Gestionnaire</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MINIMAL (ultra-épuré) ──
  if (template === "minimal") {
    return (
      <div className="min-h-screen bg-white px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-lg">
          <p className="text-[10px] font-bold tracking-[0.3em] text-ink-400 uppercase">{boutiqueNom}</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-900">{data.titre || "Widget"}</h1>
          <div className="mt-1 h-px w-12 bg-ink-900" />
          <div className="mt-8 space-y-5">
            {champs.length === 0 && <p className="text-ink-400">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center gap-4">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-10 w-10 flex-none rounded object-cover" />
                )}
                <div className="flex-1 flex items-baseline justify-between gap-4 border-b border-ink-100 pb-3">
                  <span className="text-[13px] text-ink-500">{c.label}</span>
                  <span className="text-[15px] font-semibold text-ink-900">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <button onClick={() => window.print()} className="text-[12px] font-semibold text-ink-500 underline underline-offset-4 hover:text-ink-900">
              Télécharger / Imprimer
            </button>
            <p className="mt-2 text-[9px] text-ink-300">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ── MODERNE (défaut) ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-8 py-10 text-white">
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/70 uppercase">{boutiqueNom}</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
                <QrCodeIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{data.titre || "Widget"}</h1>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">{data.type}</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100 px-8 py-6">
            {champs.length === 0 && <p className="text-center text-ink-400">Aucun champ.</p>}
            {champs.map((c, i) => (
              <div key={i} className="flex items-center gap-5 py-5 transition-colors hover:bg-slate-50/50">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-20 w-20 flex-none rounded-2xl object-cover shadow-md ring-1 ring-indigo-100" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-slate-600">{c.label}</span>
                  <span className="font-display text-[18px] font-bold text-slate-900">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-5 text-center">
            <button onClick={() => window.print()} className="mb-2 rounded-full bg-indigo-600 px-6 py-2.5 text-[12px] font-bold text-white shadow-soft transition-all hover:bg-indigo-700 hover:shadow-lift">
              Télécharger / Imprimer
            </button>
            <p className="text-[10px] font-medium text-slate-400">Généré avec Le Gestionnaire</p>
          </div>
        </div>
      </div>
    </div>
  );
}
