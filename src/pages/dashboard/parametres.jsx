import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Cog6ToothIcon,
  CreditCardIcon,
  TruckIcon,
  BellAlertIcon,
  TrashIcon,
  PlusIcon,
  ShoppingBagIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MapPinIcon,
  BanknotesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;

/* ===========================================================================
   « LE GESTIONNAIRE » — PARAMÈTRES BOUTIQUE EN LIGNE (gestionnaire en chef)
   Règles strictes §4.6 :
     ☑ en_ligne seul       → le client est FORCÉ de payer en ligne
     ☑ a_la_livraison seul → le client est FORCÉ de payer à la livraison
     ☑ les deux cochés     → le client choisit librement
     ☐ aucune cochée       → commandes en ligne désactivées
   =========================================================================== */

/** Interrupteur accessible (switch) — même API que la case à cocher d'origine. */
function Interrupteur({ checked, onChange, label, description, Icone, ton = "brand" }) {
  const tons = {
    brand: { on: "bg-brand-gradient", chip: "bg-brand-50 text-brand-600 ring-brand-100", off: "bg-ink-200" },
    accent: { on: "bg-accent-gradient", chip: "bg-accent-50 text-accent-600 ring-accent-100", off: "bg-ink-200" },
  };
  const t = tons[ton] || tons.brand;
  const id = `sw-${label.replace(/\s+/g, "-").toLowerCase().slice(0, 24)}`;

  return (
    <div className="flex items-start gap-3">
      {Icone && (
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl ring-1 ring-inset ${t.chip}`}>
          <Icone className="h-[18px] w-[18px]" />
        </span>
      )}
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer select-none">
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-500">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-none shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/[0.15] ${
          checked ? t.on : t.off
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-300 ease-spring ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/** Titre de section avec pastille d'icône. */
function TitreSection({ icon: Icone, ton, titre, sousTitre }) {
  return (
    <div className="flex items-start gap-3 border-b border-ink-100 px-5 py-4">
      <span className={`lg-icon-chip h-10 w-10 ${ton}`}>
        <Icone className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-base font-extrabold text-ink-900">{titre}</h2>
        {sousTitre && <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">{sousTitre}</p>}
      </div>
    </div>
  );
}

export default function ParametresBoutique() {
  const [params, setParams] = useState(null);
  const [zones, setZones] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [migrationRequise, setMigrationRequise] = useState(false);
  const [boutique, setBoutique] = useState({ slug: null, nom: null });

  // Lien public de la boutique : FRONT/boutique/:slug
  const lienBoutique = boutique.slug
    ? `${window.location.origin}/boutique/${boutique.slug}`
    : null;

  const copierLien = async () => {
    if (!lienBoutique) return;
    try {
      await navigator.clipboard.writeText(lienBoutique);
      toast.success("Lien de la boutique copié !");
    } catch {
      toast.info(lienBoutique);
    }
  };

  /* Partages sociaux. WhatsApp / Facebook / X / LinkedIn ont un
     intent web ; TikTok & Instagram n'autorisent pas le partage
     de liens externes depuis le web → le lien est copié à coller
     dans la publication / story. */
  const partager = (reseau) => {
    if (!lienBoutique) return;
    const texte = `Découvrez la boutique ${boutique.nom || "en ligne"} :`;
    const url = encodeURIComponent(lienBoutique);
    const cibles = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(texte + " " + lienBoutique)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texte)}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    if (cibles[reseau]) {
      window.open(cibles[reseau], "_blank", "noopener,width=640,height=580");
      return;
    }
    // TikTok / Instagram : copie le lien (pas d'intent web)
    navigator.clipboard
      ?.writeText(lienBoutique)
      .then(() =>
        toast.success(
          reseau === "tiktok"
            ? "Lien copié — collez-le dans votre vidéo ou story TikTok."
            : "Lien copié — collez-le dans votre story Instagram."
        )
      )
      .catch(() => toast.info(lienBoutique));
  };

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/v1/parametres/boutique`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.erreur);
        if (json.activite_id == null) setMigrationRequise(true);
        setBoutique({
          slug: json.boutique?.slug || null,
          nom: json.boutique?.nom || null,
        });
        setParams({
          vitrine_active: json.vitrine_active ?? true,
          en_ligne: !!json.en_ligne,
          a_la_livraison: !!json.a_la_livraison,
          livraison_active: !!json.livraison_active,
          frais_livraison_defaut: json.frais_livraison_defaut ?? 0,
          livraison_gratuite_des: json.livraison_gratuite_des ?? "",
          delai_reservation_minutes: json.delai_reservation_minutes ?? 30,
          whatsapp_gestionnaire: json.whatsapp_gestionnaire || "",
          email_gestionnaire: json.email_gestionnaire || "",
        });
        setZones((json.zones || []).map((z) => ({ nom: z.nom, frais: z.frais })));
      } catch (e) {
        toast.error(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  const maj = (champ, valeur) => setParams((p) => ({ ...p, [champ]: valeur }));

  // Règle §4.6 en direct
  const regleLive = params?.en_ligne && params?.a_la_livraison
    ? {
        texte: "Le client choisit librement : « payer maintenant » ou « payer à la livraison ».",
        classe: "bg-sky-50 text-sky-800 ring-sky-100",
        Icone: Squares2X2Icon,
      }
    : params?.en_ligne
      ? {
          texte: "Le client est FORCÉ de payer en ligne (FedaPay) — aucune autre option.",
          classe: "bg-brand-50 text-brand-800 ring-brand-100",
          Icone: CreditCardIcon,
        }
      : params?.a_la_livraison
        ? {
            texte: "Le client est FORCÉ de payer à la livraison — aucune autre option.",
            classe: "bg-amber-50 text-amber-800 ring-amber-200",
            Icone: TruckIcon,
          }
        : {
            texte: "Aucun mode coché → commandes en ligne DÉSACTIVÉES pour cette activité.",
            classe: "bg-red-50 text-red-800 ring-red-100",
            Icone: XCircleIcon,
          };

  const IconeRegle = regleLive.Icone;

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/v1/parametres/boutique`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...params,
          livraison_gratuite_des: params.livraison_gratuite_des === "" ? null : Number(params.livraison_gratuite_des),
          zones,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      toast.success(json.message || "Paramètres enregistrés.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return (
      <div className="mx-auto mt-6 max-w-4xl space-y-6 animate-fade-in">
        <div className="space-y-3">
          <div className="lg-skeleton h-8 w-64" />
          <div className="lg-skeleton h-4 w-96" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="lg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
              <div className="lg-skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="lg-skeleton h-4 w-40" />
                <div className="lg-skeleton h-3 w-64" />
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="lg-skeleton h-12 w-full" />
              <div className="lg-skeleton h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ⚠️ Garde-fou : si l'API a échoué (403/500), `params` reste null.
     Sans cette garde, `params.vitrine_active` levait une TypeError et
     React démontait tout l'écran → PAGE BLANCHE au lieu d'un message. */
  if (!params) {
    return (
      <div className="mx-auto mt-6 mb-10 max-w-xl animate-pop-in">
        <div className="lg-card p-8 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-500">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-xl font-extrabold text-ink-900">
            Impossible de charger les paramètres
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
            Vérifiez que le backend est démarré et que vous êtes bien connecté,
            puis rechargez la page.
          </p>
          <button
            type="button"
            className="lg-btn-primary mt-6"
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 mb-10 max-w-4xl animate-fade-in">
      {/* ══════════════ En-tête ══════════════ */}
      <header className="mb-6">
        <p className="text-[13px] font-semibold text-brand-600">Configuration</p>
        <h1 className="lg-page-title">Paramètres de la boutique en ligne</h1>
        <p className="lg-page-sub">
          Vitrine, modes de paiement, livraison &amp; notifications — réservé au gestionnaire en chef
        </p>
      </header>

      {migrationRequise && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-4 text-[13px] leading-snug font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
          <ExclamationTriangleIcon className="mt-0.5 h-[18px] w-[18px] flex-none text-amber-600" />
          <span>
            Migration requise : exécutez{" "}
            <code className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-[12px]">
              npm run migrate
            </code>{" "}
            côté backend pour activer la boutique en ligne.
          </span>
        </div>
      )}

      {/* ══════════════ LIEN DE LA BOUTIQUE ══════════════ */}
      {lienBoutique && (
        <section className="mb-6 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
          <TitreSection
            icon={ShoppingBagIcon}
            ton="bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100"
            titre="Lien de votre boutique"
            sousTitre={`${boutique.nom || "Boutique"} — adresse publique de votre vitrine`}
          />
          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                readOnly
                value={lienBoutique}
                onFocus={(e) => e.target.select()}
                className="lg-input flex-1"
              />
              <button
                type="button"
                onClick={copierLien}
                className="lg-btn-primary flex-none"
              >
                <LinkIcon className="h-4 w-4" />
                Copier le lien
              </button>
            </div>

            <p className="mt-4 text-[12px] font-semibold text-ink-500">
              Partager sur les réseaux
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => partager("whatsapp")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-[12.5px] font-bold text-white shadow-soft transition-all hover:brightness-95 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => partager("facebook")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-4 py-2 text-[12.5px] font-bold text-white shadow-soft transition-all hover:brightness-95 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
              <button
                type="button"
                onClick={() => partager("x")}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-[12.5px] font-bold text-white shadow-soft transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </button>
              <button
                type="button"
                onClick={() => partager("linkedin")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-4 py-2 text-[12.5px] font-bold text-white shadow-soft transition-all hover:brightness-95 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
                </svg>
                LinkedIn
              </button>
              <button
                type="button"
                onClick={() => partager("tiktok")}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-[12.5px] font-bold text-white shadow-soft transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                TikTok
              </button>
              <button
                type="button"
                onClick={() => partager("instagram")}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#833AB4] via-[#C13584] to-[#E1306C] px-4 py-2 text-[12.5px] font-bold text-white shadow-soft transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                Instagram
              </button>
            </div>
            <p className="mt-3 text-[11.5px] leading-snug text-ink-400">
              TikTok et Instagram n'autorisent pas le partage de liens depuis le
              web : le lien est copié, collez-le dans votre vidéo, story ou
              publication.
            </p>
          </div>
        </section>
      )}

      <form onSubmit={enregistrer} className="space-y-5">
        {/* ══════════════ VITRINE ══════════════ */}
        <section className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
          <TitreSection
            icon={ShoppingBagIcon}
            ton="bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100"
            titre="Vitrine publique"
            sousTitre="Visibilité de la boutique sur internet"
          />
          <div className="p-5">
            <Interrupteur
              label="Boutique visible publiquement"
              description="Active l'URL /boutique/:slug et le référencement du catalogue."
              Icone={ShoppingBagIcon}
              checked={params.vitrine_active}
              onChange={(v) => maj("vitrine_active", v)}
            />
          </div>
        </section>

        {/* ══════════════ MODES DE PAIEMENT ══════════════ */}
        <section className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
          <TitreSection
            icon={CreditCardIcon}
            ton="bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100"
            titre="Modes de paiement"
            sousTitre="Règles strictes §4.6 — le comportement s'applique immédiatement"
          />
          <div className="space-y-2.5 p-5">
            <div
              className={`rounded-xl p-3.5 ring-1 transition-all ${
                params.en_ligne
                  ? "bg-brand-50/70 ring-brand-300"
                  : "bg-ink-50/60 ring-transparent hover:bg-ink-50"
              }`}
            >
              <Interrupteur
                label="Paiement en ligne (FedaPay)"
                description="Mobile Money et cartes bancaires via FedaPay."
                Icone={CreditCardIcon}
                checked={params.en_ligne}
                onChange={(v) => maj("en_ligne", v)}
              />
            </div>
            <div
              className={`rounded-xl p-3.5 ring-1 transition-all ${
                params.a_la_livraison
                  ? "bg-amber-50/70 ring-amber-300"
                  : "bg-ink-50/60 ring-transparent hover:bg-ink-50"
              }`}
            >
              <Interrupteur
                label="Paiement à la livraison"
                description="Encaissement effectué par le livreur à la réception."
                Icone={BanknotesIcon}
                ton="accent"
                checked={params.a_la_livraison}
                onChange={(v) => maj("a_la_livraison", v)}
              />
            </div>

            {/* Règle calculée en direct */}
            <div
              className={`flex items-start gap-2.5 rounded-xl p-3.5 text-[13px] leading-snug font-semibold ring-1 ${regleLive.classe}`}
            >
              <IconeRegle className="mt-0.5 h-[18px] w-[18px] flex-none" />
              <span>{regleLive.texte}</span>
            </div>
          </div>
        </section>

        {/* ══════════════ LIVRAISON ══════════════ */}
        <section className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
          <TitreSection
            icon={TruckIcon}
            ton="bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100"
            titre="Livraison"
            sousTitre="Option par activité — frais, seuil de gratuité et zones"
          />
          <div className="space-y-4 p-5">
            <Interrupteur
              label="Proposer la livraison aux clients"
              description="Sinon, la boutique fonctionne en retrait sur place uniquement."
              Icone={TruckIcon}
              ton="accent"
              checked={params.livraison_active}
              onChange={(v) => maj("livraison_active", v)}
            />

            {params.livraison_active && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="lg-label" htmlFor="frais-defaut">
                      Frais par défaut (F)
                    </label>
                    <input
                      id="frais-defaut"
                      type="number"
                      min="0"
                      className="lg-input tabular"
                      value={params.frais_livraison_defaut}
                      onChange={(e) => maj("frais_livraison_defaut", Number(e.target.value || 0))}
                    />
                  </div>
                  <div>
                    <label className="lg-label" htmlFor="gratuit-des">
                      Gratuite dès (F)
                    </label>
                    <input
                      id="gratuit-des"
                      type="number"
                      min="0"
                      className="lg-input tabular"
                      placeholder="Vide = jamais"
                      value={params.livraison_gratuite_des}
                      onChange={(e) => maj("livraison_gratuite_des", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="lg-label" htmlFor="delai-panier">
                      Réservation panier (min)
                    </label>
                    <input
                      id="delai-panier"
                      type="number"
                      min="5"
                      className="lg-input tabular"
                      value={params.delai_reservation_minutes}
                      onChange={(e) => maj("delai_reservation_minutes", Number(e.target.value || 30))}
                    />
                  </div>
                </div>

                {/* Zones */}
                <div className="rounded-xl bg-ink-50 p-4 ring-1 ring-inset ring-ink-200/70">
                  <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-ink-500 uppercase">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    Zones &amp; frais de livraison
                  </p>

                  {zones.length === 0 ? (
                    <p className="rounded-xl bg-white p-4 text-center text-[13px] text-ink-400 ring-1 ring-inset ring-ink-200">
                      Aucune zone définie — les frais par défaut s'appliqueront.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {zones.map((z, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="hidden h-8 w-8 flex-none place-items-center rounded-lg bg-white text-[11px] font-bold text-ink-400 ring-1 ring-inset ring-ink-200 tabular sm:grid">
                            {i + 1}
                          </span>
                          <input
                            aria-label={`Nom de la zone ${i + 1}`}
                            className="lg-input flex-1"
                            placeholder="Nom de la zone (ex : Cotonou centre)"
                            value={z.nom}
                            onChange={(e) =>
                              setZones(zones.map((zz, j) => (j === i ? { ...zz, nom: e.target.value } : zz)))
                            }
                          />
                          <input
                            aria-label={`Frais de la zone ${i + 1}`}
                            type="number"
                            min="0"
                            className="lg-input w-32 tabular"
                            placeholder="Frais"
                            value={z.frais}
                            onChange={(e) =>
                              setZones(
                                zones.map((zz, j) => (j === i ? { ...zz, frais: Number(e.target.value || 0) } : zz))
                              )
                            }
                          />
                          <button
                            type="button"
                            aria-label={`Supprimer la zone ${i + 1}`}
                            onClick={() => setZones(zones.filter((_, j) => j !== i))}
                            className="grid h-9 w-9 flex-none place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <TrashIcon className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="lg-btn-soft lg-btn-sm mt-3"
                    onClick={() => setZones([...zones, { nom: "", frais: 0 }])}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Ajouter une zone
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ══════════════ NOTIFICATIONS ══════════════ */}
        <section className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card">
          <TitreSection
            icon={BellAlertIcon}
            ton="bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100"
            titre="Notifications gestionnaire"
            sousTitre="Commande, transaction ou alerte → ① in-app ② email ③ WhatsApp"
          />
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <div>
              <label className="lg-label" htmlFor="wa-gest">
                Numéro WhatsApp (réception des alertes)
              </label>
              <input
                id="wa-gest"
                className="lg-input"
                placeholder="+229 90 00 00 00"
                value={params.whatsapp_gestionnaire}
                onChange={(e) => maj("whatsapp_gestionnaire", e.target.value)}
              />
            </div>
            <div>
              <label className="lg-label" htmlFor="mail-gest">
                Email de réception
              </label>
              <input
                id="mail-gest"
                type="email"
                className="lg-input"
                placeholder="gestionnaire@exemple.com"
                value={params.email_gestionnaire}
                onChange={(e) => maj("email_gestionnaire", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ══════════════ Barre d'action ══════════════ */}
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200/80 bg-white/90 p-3.5 shadow-lift backdrop-blur-xl">
          <p className="flex items-center gap-1.5 pl-1 text-[12.5px] font-medium text-ink-500">
            <Cog6ToothIcon className="h-4 w-4 text-ink-400" />
            Les modifications s'appliquent immédiatement à la vitrine.
          </p>
          <button type="submit" className="lg-btn-primary lg-btn-lg" disabled={envoi}>
            {envoi ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Enregistrement…
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-[18px] w-[18px]" />
                Enregistrer les paramètres
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}