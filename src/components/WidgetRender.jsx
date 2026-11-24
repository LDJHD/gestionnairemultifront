import { QrCodeIcon } from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;

const imgUrl = (img) => (img ? (img.startsWith("http") ? img : `${API}/${img}`) : null);

function Bouton({ onClick, children, className = "" }) {
  if (!onClick) return null;
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/**
 * Rendu unique partagé par la page publique /widget/:id et par l'aperçu
 * du back-office. Le modèle choisi est la SEULE source de vérité du design.
 */
export default function WidgetRender({
  titre,
  type = "menu",
  template,
  secteur,
  champs = [],
  boutiqueNom = "Boutique",
  onPrint,
}) {
  const items = (champs || []).filter((c) => c && String(c.label || "").trim());

  // Modèle explicite en priorité ; sinon valeur par défaut selon le type/secteur.
  const t =
    template ||
    (type === "affiche" ? "affiche" : secteur === "restaurant" ? "restaurant" : "moderne");

  const labelType = (val) => (val === "affiche" ? "Affiche" : "Menu");

  // ───────────────────────────── MODERNE ─────────────────────────────
  if (t === "moderne") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-indigo-100">
          <header className="relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-8 py-10 text-white">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">{boutiqueNom}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
                <QrCodeIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight">{titre || "Notre menu"}</h1>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">{labelType(type)}</p>
              </div>
            </div>
          </header>
          <div className="divide-y divide-slate-100 px-6 py-2 sm:px-8">
            {items.length === 0 && <p className="py-10 text-center text-ink-400">Aucun élément.</p>}
            {items.map((c, i) => (
              <div key={i} className="flex items-center gap-4 py-5">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-20 w-20 flex-none rounded-2xl object-cover shadow-md ring-1 ring-indigo-100" />
                )}
                <div className="flex flex-1 items-center justify-between gap-4">
                  <span className="text-[15px] font-semibold text-slate-700">{c.label}</span>
                  <span className="flex-none rounded-full bg-indigo-50 px-3 py-1 font-display text-[16px] font-bold text-indigo-700">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          <footer className="border-t border-slate-100 bg-slate-50/60 px-8 py-6 text-center">
            <Bouton onClick={onPrint} className="rounded-full bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">
              Télécharger / Imprimer
            </Bouton>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">Généré avec Le Gestionnaire</p>
          </footer>
        </div>
      </div>
    );
  }

  // ───────────────────────────── ÉLÉGANT ─────────────────────────────
  if (t === "elegant") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-[28px] border border-amber-300/25 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
            <header className="px-10 pb-8 pt-12 text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-amber-300/40 bg-amber-300/10">
                <span className="font-display text-2xl text-amber-300">✦</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-amber-300/60">{boutiqueNom}</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-amber-50">{titre || "La carte"}</h1>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-300/50">{labelType(type)}</p>
              <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-amber-300/50">
                <span className="h-px w-12 bg-amber-300/40" />
                <span className="text-xs">◆</span>
                <span className="h-px w-12 bg-amber-300/40" />
              </div>
            </header>
            <div className="px-10">
              {items.length === 0 && <p className="pb-8 text-center text-slate-500">Aucun élément.</p>}
              {items.map((c, i) => (
                <div key={i} className="flex items-center gap-5 border-t border-amber-300/10 py-5">
                  {c.image && (
                    <img src={imgUrl(c.image)} alt="" className="h-16 w-16 flex-none rounded-lg border border-amber-300/20 object-cover" />
                  )}
                  <span className="flex-1 font-display text-[15px] tracking-wide text-amber-100/85">{c.label}</span>
                  <span className="font-display text-[17px] font-semibold text-amber-300">{c.value}</span>
                </div>
              ))}
            </div>
            <footer className="mt-4 border-t border-amber-300/10 px-10 py-7 text-center">
              <Bouton onClick={onPrint} className="rounded-full border border-amber-300/40 bg-amber-300/10 px-7 py-2.5 text-[12px] font-bold tracking-wide text-amber-300 transition hover:bg-amber-300/20">
                Télécharger / Imprimer
              </Bouton>
              <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-amber-300/25">Le Gestionnaire</p>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── MINIMAL ─────────────────────────────
  if (t === "minimal") {
    return (
      <div className="min-h-screen bg-white px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-lg">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-ink-400">{boutiqueNom}</p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-ink-300">{labelType(type)}</p>
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink-900">{titre || "Notre sélection"}</h1>
          <div className="mt-3 h-px w-16 bg-ink-900" />
          <div className="mt-10 space-y-0">
            {items.length === 0 && <p className="py-4 text-ink-400">Aucun élément.</p>}
            {items.map((c, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-ink-100 py-4">
                {c.image && <img src={imgUrl(c.image)} alt="" className="h-11 w-11 flex-none rounded-full object-cover grayscale" />}
                <span className="flex-1 text-[13px] font-medium uppercase tracking-wider text-ink-500">{c.label}</span>
                <span className="font-display text-[15px] font-semibold text-ink-900">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Bouton onClick={onPrint} className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-500 underline underline-offset-4 transition hover:text-ink-900">
              Télécharger / Imprimer
            </Bouton>
            <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-ink-300">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── GOURMET ─────────────────────────────
  if (t === "gourmet") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <header className="text-center">
            <div className="mx-auto mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-amber-400/60" />
              <span className="font-display text-lg text-amber-400">❖</span>
              <span className="h-px w-14 bg-amber-400/60" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-amber-400/70">{boutiqueNom}</p>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-amber-50">{titre || "Menu"}</h1>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-400/50">{labelType(type)}</p>
          </header>
          <div className="mt-10 space-y-1">
            {items.length === 0 && <p className="py-6 text-center text-stone-500">Aucun élément.</p>}
            {items.map((c, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                {c.image && (
                  <img src={imgUrl(c.image)} alt="" className="h-14 w-14 flex-none rounded-full border border-amber-400/25 object-cover" />
                )}
                <span className="font-display text-[15px] tracking-wide text-amber-100/90">{c.label}</span>
                <span className="mx-2 flex-1 border-b border-dotted border-amber-400/25" />
                <span className="font-display text-[17px] font-semibold text-amber-400">{c.value}</span>
              </div>
            ))}
          </div>
          <footer className="mt-12 text-center">
            <Bouton onClick={onPrint} className="rounded-full border border-amber-400/40 px-8 py-3 text-[12px] font-bold uppercase tracking-widest text-amber-300 transition hover:bg-amber-400/10">
              Télécharger / Imprimer
            </Bouton>
            <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-amber-400/25">Le Gestionnaire</p>
          </footer>
        </div>
      </div>
    );
  }

  // ───────────────────────────── DIGITAL ─────────────────────────────
  if (t === "digital") {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <header className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-7 shadow-2xl">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
                <QrCodeIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/60">{boutiqueNom}</p>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-cyan-50">{titre || "Sélection"}</h1>
              </div>
              <span className="ml-auto rounded-full border border-cyan-500/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-400">{labelType(type)}</span>
            </div>
          </header>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {items.length === 0 && <p className="col-span-full text-center text-slate-500">Aucun élément.</p>}
            {items.map((c, i) => (
              <div key={i} className="group flex items-center gap-3 rounded-xl border border-cyan-500/10 bg-slate-900/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900">
                {c.image && <img src={imgUrl(c.image)} alt="" className="h-14 w-14 flex-none rounded-lg object-cover ring-1 ring-cyan-500/20" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-cyan-100/80">{c.label}</p>
                  <p className="mt-0.5 font-display text-[16px] font-bold text-cyan-400">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Bouton onClick={onPrint} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-7 py-2.5 text-[11px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20">
              Télécharger / Imprimer
            </Bouton>
            <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-cyan-400/25">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── BISTRO ─────────────────────────────
  if (t === "bistro") {
    return (
      <div className="min-h-screen bg-[#fdf6ec] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <header className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-8 text-white shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/75">{boutiqueNom}</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{titre || "Le menu"}</h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest">{labelType(type)}</span>
              <span className="text-[11px] text-white/70">Bon appétit&nbsp;!</span>
            </div>
          </header>
          <div className="mt-5 space-y-2">
            {items.length === 0 && <p className="py-6 text-center text-ink-400">Aucun élément.</p>}
            {items.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border-l-4 border-orange-400 bg-white px-4 py-3 shadow-sm">
                {c.image && <img src={imgUrl(c.image)} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />}
                <span className="flex-1 text-[15px] font-semibold text-stone-700">{c.label}</span>
                <span className="font-display text-[16px] font-bold text-orange-600">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Bouton onClick={onPrint} className="rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600">
              Télécharger / Imprimer
            </Bouton>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-stone-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── RESTAURANT ─────────────────────────────
  if (t === "restaurant") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <header className="mb-9 text-center">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-amber-100 shadow-lg ring-4 ring-amber-200/60">
              <QrCodeIcon className="h-10 w-10 text-amber-600" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-600">{boutiqueNom}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-amber-900">{titre || "Menu"}</h1>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-500">Restaurant</p>
            <div className="mx-auto mt-5 h-px w-28 bg-amber-300" />
          </header>
          <div className="space-y-3">
            {items.length === 0 && <p className="text-center text-ink-400">Aucun plat.</p>}
            {items.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-amber-200/70 bg-white px-5 py-4 shadow-sm transition hover:border-amber-300 hover:shadow-md">
                {c.image && <img src={imgUrl(c.image)} alt="" className="h-20 w-20 flex-none rounded-xl object-cover shadow-sm" />}
                <span className="flex-1 text-[16px] font-semibold text-stone-800">{c.label}</span>
                <span className="font-display text-[19px] font-bold text-amber-700">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Bouton onClick={onPrint} className="rounded-full bg-amber-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-amber-700">
              Télécharger / Imprimer le menu
            </Bouton>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-ink-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── PROMO ─────────────────────────────
  if (t === "promo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="relative bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-10 text-center text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/80">{boutiqueNom}</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{titre || "Promo"}</h1>
              <span className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em]">Offre spéciale</span>
            </header>
            <div className="space-y-3 px-4 py-6 sm:px-8">
              {items.length === 0 && <p className="py-6 text-center text-ink-400">Aucun contenu.</p>}
              {items.map((c, i) => (
                <div key={i} className={`flex items-center gap-4 overflow-hidden rounded-2xl ${i % 2 === 0 ? "bg-pink-50" : "bg-purple-50"}`}>
                  {c.image && <img src={imgUrl(c.image)} alt="" className="h-24 w-24 flex-none object-cover" />}
                  <div className="flex-1 py-3 pr-4">
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
                    <p className="font-display text-3xl font-extrabold text-pink-600">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <footer className="bg-slate-900 px-8 py-5 text-center">
              <Bouton onClick={onPrint} className="rounded-full bg-pink-500 px-7 py-2.5 text-[12px] font-bold text-white transition hover:bg-pink-600">
                Télécharger / Imprimer
              </Bouton>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── SUPERMARCHÉ ─────────────────────────────
  if (t === "supermarche") {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-5 text-white shadow-lg">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/75">{boutiqueNom}</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{titre || "Promotions"}</h1>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
              <QrCodeIcon className="h-6 w-6" />
            </div>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.length === 0 && <p className="col-span-full py-6 text-center text-ink-400">Aucun produit.</p>}
            {items.map((c, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-40 bg-slate-100">
                  {c.image ? (
                    <img src={imgUrl(c.image)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-slate-300">
                      <QrCodeIcon className="h-10 w-10" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 rounded-full bg-blue-600 px-3 py-1 font-display text-[15px] font-bold text-white shadow-md">{c.value}</span>
                </div>
                <div className="p-4 pt-3">
                  <p className="truncate text-[14px] font-semibold text-slate-800">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Bouton onClick={onPrint} className="rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700">
              Télécharger / Imprimer
            </Bouton>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-400">Le Gestionnaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── AFFICHE LUXE ─────────────────────────────
  if (t === "affiche_luxe") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-purple-300/25 bg-slate-900/50 p-2 shadow-2xl">
            <div className="rounded-[22px] border border-purple-300/15 px-6 py-10 sm:px-10">
              <header className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-purple-300/70">{boutiqueNom}</p>
                <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tight text-purple-50 sm:text-5xl">{titre || "Affiche"}</h1>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-purple-300/60">Collection exclusive</p>
              </header>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {items.length === 0 && <p className="col-span-full py-6 text-center text-slate-400">Aucun contenu.</p>}
                {items.map((c, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-purple-300/15 bg-purple-900/20">
                    {c.image && <img src={imgUrl(c.image)} alt="" className="h-36 w-full object-cover" />}
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="text-[13px] font-medium text-purple-100/80">{c.label}</span>
                      <span className="font-display text-[16px] font-bold text-purple-200">{c.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <footer className="mt-8 text-center">
                <Bouton onClick={onPrint} className="rounded-full border border-purple-300/40 bg-purple-300/10 px-7 py-2.5 text-[11px] font-bold uppercase tracking-widest text-purple-200 transition hover:bg-purple-300/20">
                  Télécharger / Imprimer
                </Bouton>
                <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-purple-300/30">Le Gestionnaire</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────── AFFICHE (défaut) ─────────────────────────────
  if (t === "affiche") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <header className="bg-gradient-to-r from-rose-600 to-orange-500 px-8 py-12 text-center text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/80">{boutiqueNom}</p>
            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{titre || "Affiche"}</h1>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.35em] text-white/80">Annonce importante</p>
          </header>
          <div>
            {items.length === 0 && <p className="py-10 text-center text-ink-400">Aucun contenu.</p>}
            {items.map((c, i) => (
              <div key={i} className={`flex items-center gap-5 px-8 py-5 ${i % 2 === 0 ? "bg-white" : "bg-rose-50/60"}`}>
                {c.image && <img src={imgUrl(c.image)} alt="" className="h-24 w-24 flex-none rounded-2xl object-cover shadow-lg" />}
                <div className="flex-1">
                  <p className="text-[14px] font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
                  <p className="font-display text-3xl font-extrabold text-rose-600">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
          <footer className="bg-slate-900 px-8 py-5 text-center">
            <Bouton onClick={onPrint} className="rounded-full bg-white px-7 py-2.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-50">
              Télécharger / Imprimer
            </Bouton>
          </footer>
        </div>
      </div>
    );
  }

  // ───────────────────────────── Repli : moderne ─────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-indigo-100">
        <header className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-8 py-10 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">{boutiqueNom}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">{titre || "Notre menu"}</h1>
        </header>
        <div className="divide-y divide-slate-100 px-8 py-2">
          {items.map((c, i) => (
            <div key={i} className="flex items-center gap-4 py-5">
              {c.image && <img src={imgUrl(c.image)} alt="" className="h-20 w-20 flex-none rounded-2xl object-cover shadow-md" />}
              <span className="flex-1 text-[15px] font-semibold text-slate-700">{c.label}</span>
              <span className="font-display text-[16px] font-bold text-indigo-700">{c.value}</span>
            </div>
          ))}
        </div>
        <footer className="border-t border-slate-100 bg-slate-50/60 px-8 py-6 text-center">
          <Bouton onClick={onPrint} className="rounded-full bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">
            Télécharger / Imprimer
          </Bouton>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-400">Généré avec Le Gestionnaire</p>
        </footer>
      </div>
    </div>
  );
}
