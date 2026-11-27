import { QrCodeIcon } from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_URL;

const F = {
  script: "'Great Vibes', 'Segoe Script', cursive",
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  poster: "'Bebas Neue', 'Oswald', 'Arial Narrow', sans-serif",
  sans: "'Montserrat', 'Inter', system-ui, sans-serif",
};

const imgUrl = (img) => (img ? (img.startsWith("http") ? img : `${API}/${img}`) : null);

// Regroupe les champs par section (les sections vides restent groupées).
function groupItems(items) {
  const groups = [];
  for (const it of items) {
    const s = String(it.section || "").trim();
    if (!groups.length || groups[groups.length - 1].section !== s) {
      groups.push({ section: s, items: [] });
    }
    groups[groups.length - 1].items.push(it);
  }
  return groups;
}

function HeroImage({ src, emoji = "🍽️", className = "", style }) {
  if (src) {
    return <img src={imgUrl(src)} alt="" className={`object-cover ${className}`} style={style} />;
  }
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: "radial-gradient(circle at 30% 20%, #5a4218, #241708 55%, #0d0803)", ...style }}
    >
      <span className="absolute -left-6 -top-6 h-20 w-20 rounded-full" style={{ backgroundColor: "rgba(255,193,7,0.12)" }} />
      <span className="absolute -bottom-8 -right-6 h-24 w-24 rounded-full" style={{ backgroundColor: "rgba(255,193,7,0.10)" }} />
      <span style={{ fontSize: 64, lineHeight: 1, filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))" }}>{emoji}</span>
    </div>
  );
}

function PrintBtn({ onPrint, style, label = "Télécharger / Imprimer" }) {
  if (!onPrint) return null;
  return (
    <button
      type="button"
      onClick={onPrint}
      className="print:hidden rounded-full px-7 py-3 text-[13px] font-extrabold uppercase tracking-wide shadow-lg transition hover:brightness-110"
      style={style}
    >
      {label}
    </button>
  );
}

/** Icône de substitution cohérente avec le type d'article (mode). */
function iconeMode(section = "", label = "") {
  const s = `${section} ${label}`.toLowerCase();
  if (/(robe|dress|jupe|skirt|ensemble)/.test(s)) return "👗";
  if (/(sac|bag|pochette|purse|valise)/.test(s)) return "👜";
  if (/(chauss|shoe|escarpin|sandale|basket|sneaker|botte)/.test(s)) return "👠";
  if (/(collier|necklace|bijou|bague|boucle|bracelet|montre)/.test(s)) return "💍";
  if (/(parfum|perfume)/.test(s)) return "🧴";
  return "🛍️";
}

function Dotted({ color = "rgba(0,0,0,0.35)" }) {
  return (
    <span
      className="mx-2 hidden flex-1 sm:block"
      style={{ borderBottom: `2px dotted ${color}`, opacity: 0.8 }}
    />
  );
}

/**
 * Rendu unique partagé par la page publique /widget/:id et par l'aperçu.
 * Chaque modèle reprend l'univers visuel des affiches de référence.
 */
export default function WidgetRender({
  titre,
  type = "menu",
  template,
  secteur,
  champs = [],
  boutiqueNom = "Boutique",
  slogan,
  imagePrincipale,
  telephone,
  adresse,
  pied,
  qrCode,
  onPrint,
}) {
  const items = (champs || []).filter((c) => c && String(c.label || "").trim());
  const groups = groupItems(items);

  const ALIAS = {
    elegant: "royal",
    bistro: "delice",
    restaurant: "delice",
    promo: "annonce",
    affiche: "annonce",
    affiche_luxe: "maboutique",
  };
  const t =
    ALIAS[template] ||
    template ||
    (type === "affiche" ? "annonce" : secteur === "restaurant" ? "delice" : "moderne");

  const qrSrc = imgUrl(qrCode);
  const printBase = { WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" };

  // ═══════════════════════════════════════════════════════════════
  //  MENU GOURMAND — noir & or (Menu gourmand du Délice)
  // ═══════════════════════════════════════════════════════════════
  if (t === "gourmand") {
    const gold = "#f5b301";
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: "#0a0a0a", color: "#ffffff", ...printBase }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 30 }}>👨‍🍳</span>
                <p style={{ fontFamily: F.script, color: gold, fontSize: 27, lineHeight: 1 }}>{boutiqueNom}</p>
              </div>
              <h1 style={{ fontFamily: F.serif, color: "#ffffff", fontSize: 44, fontWeight: 800, lineHeight: 1.05, marginTop: 8 }}>
                {titre || "Notre Menu"}
              </h1>
              <p style={{ fontFamily: F.script, color: "#ffd54a", fontSize: 22, marginTop: 4 }}>
                {slogan || "Bon goût, bonne ambiance !"}
              </p>
            </div>
            <HeroImage
              src={imagePrincipale}
              emoji="🍗"
              className="h-40 w-full flex-none rounded-2xl sm:w-56"
              style={{ border: `2px solid ${gold}` }}
            />
          </div>

          {items.length === 0 && (
            <p className="mt-8 text-center" style={{ color: "#d4d4d4" }}>Ajoutez des plats pour les afficher ici.</p>
          )}

          {groups.map((g, gi) => (
            <div key={gi} className="mt-7">
              {g.section && (
                <div className="inline-block rounded-full px-5 py-1.5" style={{ backgroundColor: gold, color: "#111111" }}>
                  <span style={{ fontFamily: F.poster, fontSize: 20, letterSpacing: "0.08em" }}>{g.section}</span>
                </div>
              )}
              <div className="mt-3 space-y-2.5">
                {g.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {it.image && (
                      <img src={imgUrl(it.image)} alt="" className="h-11 w-11 flex-none rounded-full object-cover" style={{ border: `2px solid ${gold}` }} />
                    )}
                    <span className="flex-none text-[15px] font-semibold" style={{ color: "#ffffff" }}>{it.label}</span>
                    <Dotted color="rgba(245,179,1,0.7)" />
                    <span className="flex-none rounded-md px-2.5 py-1 text-[14px] font-extrabold" style={{ backgroundColor: gold, color: "#111111" }}>
                      {it.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-4 py-1.5 text-[12px] font-extrabold uppercase" style={{ backgroundColor: "#c1121f", color: "#ffffff" }}>
              Commandez dès maintenant !
            </span>
            <span className="rounded-full px-4 py-1.5 text-[12px] font-extrabold uppercase" style={{ backgroundColor: gold, color: "#111111" }}>
              Livraison possible
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl px-5 py-3" style={{ backgroundColor: gold, color: "#111111" }}>
            <span className="text-[14px] font-extrabold">☎ {telephone || "+229 01 97 00 00 00"}</span>
            <span className="text-[14px] font-extrabold">📍 {adresse || "Cotonou, Bénin"}</span>
          </div>

          <p className="mt-4 text-center" style={{ fontFamily: F.script, color: "#ffffff", fontSize: 27 }}>{pied || "Bon appétit !"}</p>
          <div className="mt-4 text-center">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: gold, color: "#111111" }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MENU DIGITAL — noir, or, QR code (Menu digital du Délice)
  // ═══════════════════════════════════════════════════════════════
  if (t === "digital") {
    const gold = "#ffc107";
    const visuels = items.slice(0, 3);
    const titreHaut = String(titre || "Notre Menu");
    const motDigital = /digital/i.test(titreHaut);
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: "#0c0c0c", color: "#ffffff", ...printBase }}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p style={{ fontFamily: F.script, color: gold, fontSize: 28 }}>{boutiqueNom}</p>
            <h1 style={{ fontFamily: F.poster, color: "#ffffff", fontSize: 54, lineHeight: 0.95, letterSpacing: "0.02em", marginTop: 4 }}>
              {titreHaut.toUpperCase()}
              {!motDigital && (
                <span style={{ fontFamily: F.script, color: gold, fontSize: 48, textTransform: "none" }}> Digital</span>
              )}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[13px] font-semibold" style={{ color: "#e8e8e8" }}>
              {slogan || "Scannez le QR Code pour découvrir tous nos plats !"}
            </p>
          </div>

          <div className="mt-6 grid items-start gap-5 md:grid-cols-[1fr_auto]">
            <div>
              {groups.map((g, gi) => (
                <div key={gi} className="mt-4 first:mt-0">
                  {g.section && (
                    <p style={{ fontFamily: F.poster, color: gold, fontSize: 22, letterSpacing: "0.08em" }}>{g.section}</p>
                  )}
                  <div className="mt-1.5 space-y-2">
                    {g.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex-none text-[14px] font-semibold" style={{ color: "#ffffff" }}>{it.label}</span>
                        <Dotted color="rgba(255,193,7,0.65)" />
                        <span className="flex-none rounded px-2 py-0.5 text-[13px] font-extrabold" style={{ backgroundColor: gold, color: "#111111" }}>{it.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto rounded-3xl p-3" style={{ backgroundColor: gold }}>
              <div className="rounded-2xl bg-white p-3">
                {qrSrc ? (
                  <img src={qrSrc} alt="QR code" className="h-44 w-44 object-contain" />
                ) : (
                  <div className="grid h-44 w-44 place-items-center">
                    <QrCodeIcon className="h-24 w-24 text-black" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-center text-[13px] font-extrabold" style={{ color: "#111111" }}>Scannez ici</p>
            </div>
          </div>

          {visuels.length > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-3">
              {visuels.map((it, i) => (
                <div key={i} className="text-center">
                  <div className="aspect-square w-full overflow-hidden rounded-full" style={{ border: `4px solid ${gold}`, backgroundColor: "#1c1c1c" }}>
                    {it.image ? (
                      <img src={imgUrl(it.image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center" style={{ fontSize: 30 }}>🍛</div>
                    )}
                  </div>
                  <span className="mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ backgroundColor: gold, color: "#111111" }}>
                    {it.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            {[["🍽️", "Carte complète"], ["⚡", "Commande facile"], ["😊", "Service rapide"]].map(([e, l], i) => (
              <div key={i} className="rounded-xl px-2 py-3" style={{ backgroundColor: "#171717" }}>
                <div style={{ fontSize: 22 }}>{e}</div>
                <p className="mt-1 text-[11px] font-bold" style={{ color: "#ffffff" }}>{l}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-t-[36px] px-5 py-4 text-center" style={{ backgroundColor: gold }}>
            <p style={{ fontFamily: F.script, color: "#111111", fontSize: 26 }}>{pied || "Merci pour votre confiance !"}</p>
          </div>
          <div className="pb-2 text-center">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: "#ffffff", color: "#111111", marginTop: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  LE DÉLICE — bordeaux, or, panneau crème (Saveurs & convivialité)
  // ═══════════════════════════════════════════════════════════════
  if (t === "delice") {
    const gold = "#f0b429";
    const cream = "#fdf3d7";
    const maroon = "#4a0d0d";
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: "#1c0606", color: "#ffffff", ...printBase }}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p style={{ fontFamily: F.script, color: gold, fontSize: 27 }}>{boutiqueNom}</p>
            <h1 style={{ fontFamily: F.serif, color: "#ffffff", fontSize: 46, fontWeight: 800, lineHeight: 1.05 }}>{titre || "Notre Menu"}</h1>
            <p style={{ fontFamily: F.script, color: gold, fontSize: 22 }}>{slogan || "Bon goût, bonne ambiance !"}</p>
            <div className="mx-auto mt-2 h-[3px] w-28 rounded-full" style={{ backgroundColor: gold }} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl p-4" style={{ backgroundColor: cream, border: `2px solid ${gold}` }}>
              <div className="rounded-full px-4 py-1.5 text-center" style={{ backgroundColor: maroon }}>
                <span style={{ fontFamily: F.serif, fontStyle: "italic", color: gold, fontSize: 20, fontWeight: 700 }}>Notre Menu</span>
              </div>
              <div className="mt-3">
                {groups.map((g, gi) => (
                  <div key={gi} className="mb-3">
                    {g.section && (
                      <p className="mb-1" style={{ fontFamily: F.serif, fontStyle: "italic", color: maroon, fontSize: 17, fontWeight: 700 }}>
                        {g.section}
                      </p>
                    )}
                    {g.items.map((it, i) => (
                      <div key={i} className="flex items-center py-1">
                        <span className="flex-none text-[13.5px] font-semibold" style={{ color: maroon }}>{it.label}</span>
                        <Dotted color="rgba(74,13,13,0.4)" />
                        <span className="flex-none text-[13.5px] font-extrabold" style={{ color: maroon }}>{it.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <HeroImage
                src={imagePrincipale}
                emoji="🍛"
                className="h-64 w-full rounded-2xl md:h-full"
                style={{ border: `2px solid ${gold}` }}
              />
              <span className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase" style={{ backgroundColor: "#b31217", color: "#ffffff" }}>
                Livraison disponible
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl px-3 py-3 text-center sm:grid-cols-4" style={{ backgroundColor: "rgba(0,0,0,0.35)", border: "1px solid rgba(240,180,41,0.35)" }}>
            {[["🍽️", "Cuisine savoureuse"], ["👨‍👩‍👧", "Cadre convivial"], ["⚡", "Service rapide"], ["✔️", "Qualité garantie"]].map(([e, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 20 }}>{e}</div>
                <p className="mt-0.5 text-[11px] font-bold" style={{ color: gold }}>{l}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-full px-5 py-3" style={{ backgroundColor: gold, color: "#111111" }}>
            <span className="text-[13px] font-extrabold">☎ {telephone || "+229 01 97 00 00 00"}</span>
            <span className="text-[13px] font-extrabold">📍 {adresse || "Cotonou, Bénin"}</span>
          </div>

          <p className="mt-3 text-center" style={{ fontFamily: F.script, color: cream, fontSize: 26 }}>{pied || "Le plaisir de bien manger… chez nous !"}</p>
          <div className="mt-3 text-center">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: gold, color: "#111111" }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  BELLA VITA — crème, rouge bordeaux (collage)
  // ═══════════════════════════════════════════════════════════════
  if (t === "bella") {
    const cream = "#fdf6e8";
    const maroon = "#7a0f0f";
    const red = "#a4161a";
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: cream, color: "#2b1a12", ...printBase }}>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" style={{ border: "1px solid rgba(122,15,15,0.25)" }}>
          <div className="px-5 pt-6 text-center">
            <div style={{ fontSize: 34 }}>👨‍🍳</div>
            <p style={{ fontFamily: F.serif, color: maroon, fontSize: 15, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Restaurant
            </p>
            <h1 style={{ fontFamily: F.script, color: red, fontSize: 52, lineHeight: 1 }}>{titre || boutiqueNom}</h1>
            <p style={{ fontFamily: F.serif, fontStyle: "italic", color: maroon, fontSize: 15 }}>
              {slogan || "Manger bien, vivre mieux !"}
            </p>
            <div className="mx-auto mt-2 h-[2px] w-24" style={{ backgroundColor: red }} />
          </div>

          <div className="mt-4 text-center">
            <span className="inline-block px-8 py-1.5" style={{ backgroundColor: maroon }}>
              <span style={{ fontFamily: F.serif, fontStyle: "italic", color: "#ffffff", fontSize: 22 }}>Menu</span>
            </span>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              {groups.map((g, gi) => (
                <div key={gi} className="mb-3">
                  <span className="inline-block rounded px-3 py-1" style={{ backgroundColor: red }}>
                    <span style={{ fontFamily: F.serif, color: "#ffffff", fontSize: 14, fontWeight: 700 }}>{g.section || "Nos Plats"}</span>
                  </span>
                  <div className="mt-1.5">
                    {g.items.map((it, i) => (
                      <div key={i} className="flex items-center py-1">
                        <span className="flex-none text-[13.5px] font-semibold" style={{ color: maroon }}>{it.label}</span>
                        <Dotted color="rgba(122,15,15,0.35)" />
                        <span className="flex-none text-[13.5px] font-extrabold" style={{ color: maroon }}>{it.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <HeroImage
              src={imagePrincipale}
              emoji="🍝"
              className="h-56 w-full rounded-2xl md:h-full"
              style={{ border: "2px solid rgba(122,15,15,0.25)" }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3" style={{ backgroundColor: maroon, color: "#ffffff" }}>
            <span className="text-[13px] font-bold">☎ {telephone || "+229 01 95 55 55 55"}</span>
            <span className="text-[13px] font-bold">📍 {adresse || "Cotonou, Bénin"}</span>
          </div>
          <div className="px-5 py-4 text-center">
            <p style={{ fontFamily: F.serif, fontStyle: "italic", color: maroon, fontSize: 15 }}>{pied || "Une cuisine délicieuse pour tous !"}</p>
            <div className="mt-3">
              <PrintBtn onPrint={onPrint} style={{ backgroundColor: red, color: "#ffffff" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  CHEZ ROYAL — noir, or, couronne (collage)
  // ═══════════════════════════════════════════════════════════════
  if (t === "royal") {
    const gold = "#e8b923";
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: "#070707", color: "#ffffff", ...printBase }}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div style={{ fontSize: 40 }}>👑</div>
            <p style={{ fontFamily: F.script, color: gold, fontSize: 24 }}>Restaurant</p>
            <h1 style={{ fontFamily: F.script, color: "#ffffff", fontSize: 54, lineHeight: 0.95 }}>{titre || "Chez Royal"}</h1>
            <p style={{ fontFamily: F.script, color: gold, fontSize: 24 }}>{slogan || "Savourez l'excellence !"}</p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="space-y-2">
                {[["🍽️", "Plats variés et savoureux"], ["⭐", "Service rapide et professionnel"], ["😊", "Ambiance conviviale"]].map(([e, l], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full" style={{ border: `2px solid ${gold}`, fontSize: 17 }}>{e}</span>
                    <span className="text-[13px] font-semibold" style={{ color: "#ffffff" }}>{l}</span>
                  </div>
                ))}
              </div>

              {groups.map((g, gi) => (
                <div key={gi} className="mt-5">
                  {g.section && (
                    <p style={{ fontFamily: F.poster, color: gold, fontSize: 20, letterSpacing: "0.08em" }}>{g.section}</p>
                  )}
                  {g.items.map((it, i) => (
                    <div key={i} className="flex items-center py-1.5">
                      <span className="flex-none text-[13.5px] font-semibold" style={{ color: "#ffffff" }}>{it.label}</span>
                      <Dotted color="rgba(232,185,35,0.6)" />
                      <span className="flex-none rounded px-2 py-0.5 text-[13px] font-extrabold" style={{ backgroundColor: gold, color: "#111111" }}>{it.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <HeroImage
              src={imagePrincipale}
              emoji="🍗"
              className="h-64 w-full rounded-2xl md:h-full"
              style={{ border: `2px solid ${gold}` }}
            />
          </div>

          <div className="mt-6 text-center">
            <span className="inline-block rounded-full px-6 py-3 text-[13px] font-extrabold" style={{ backgroundColor: gold, color: "#111111" }}>
              Venez découvrir notre menu ! →
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "rgba(232,185,35,0.35)" }}>
            <span className="text-[13px] font-bold" style={{ color: "#ffffff" }}>☎ {telephone || "+229 01 92 22 22 22"}</span>
            <span className="text-[13px] font-bold" style={{ color: "#ffffff" }}>📍 {adresse || "Cotonou, Bénin"}</span>
          </div>
          <div className="mt-3 text-center">
            <p style={{ fontFamily: F.script, color: gold, fontSize: 25 }}>{pied || "Bon appétit !"}</p>
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: gold, color: "#111111", marginTop: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  SUPERMARCHÉ — bleu, jaune, rouge (affiche promotionnelle)
  // ═══════════════════════════════════════════════════════════════
  if (t === "supermarche") {
    const blue = "#0b3d91";
    const yellow = "#ffc107";
    const red = "#d7263d";
    return (
      <div className="min-h-screen bg-white px-4 py-6 sm:px-6" style={{ color: "#10203a", ...printBase }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: "linear-gradient(90deg,#fff8dc,#ffffff)" }}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ backgroundColor: blue, fontSize: 24 }}>🛒</span>
              <div>
                <h1 style={{ fontFamily: F.poster, color: blue, fontSize: 40, lineHeight: 0.95 }}>{boutiqueNom.toUpperCase()}</h1>
                <p className="text-[11px] font-bold" style={{ color: blue }}>{slogan || "Qualité • Choix • Prix malins"}</p>
              </div>
            </div>
            <span className="hidden rounded-full px-3 py-1.5 text-[10px] font-extrabold text-white sm:block" style={{ backgroundColor: blue }}>
              Votre boutique de proximité !
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <HeroImage src={imagePrincipale} emoji="🧺" className="h-56 w-full rounded-2xl" style={{ border: `3px solid ${yellow}` }} />
            <div>
              <h2 style={{ fontFamily: F.poster, color: blue, fontSize: 30, lineHeight: 1 }}>Tout ce dont vous avez besoin,</h2>
              <span className="mt-1 inline-block rounded-xl px-3 py-1.5 text-[15px] font-extrabold text-white" style={{ backgroundColor: red }}>
                au même endroit !
              </span>
              <div className="mt-3 space-y-1.5">
                {items.length === 0 && <p className="text-[13px]" style={{ color: "#475569" }}>Ajoutez des produits.</p>}
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] text-white" style={{ backgroundColor: blue }}>✓</span>
                    <span className="flex-1 text-[13px] font-semibold" style={{ color: "#10203a" }}>{it.label}</span>
                    {it.value && (
                      <span className="flex-none rounded px-2 py-0.5 text-[12px] font-extrabold" style={{ backgroundColor: yellow, color: "#10203a" }}>{it.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {items.some((it) => it.image) && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.filter((it) => it.image).map((it, i) => (
                <div key={i} className="overflow-hidden rounded-xl border" style={{ borderColor: "rgba(11,61,145,0.15)" }}>
                  <img src={imgUrl(it.image)} alt="" className="h-28 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="truncate text-[12px] font-bold" style={{ color: "#10203a" }}>{it.label}</span>
                    <span className="flex-none rounded px-1.5 py-0.5 text-[11px] font-extrabold text-white" style={{ backgroundColor: red }}>{it.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl px-3 py-3 text-center text-white" style={{ backgroundColor: blue }}>
            {[["🛒", "Courses faciles"], ["🏷️", "Prix compétitifs"], ["🎧", "Service client"]].map(([e, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 20 }}>{e}</div>
                <p className="mt-0.5 text-[10.5px] font-bold">{l}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-block rounded-full px-4 py-2.5 text-[12px] font-extrabold" style={{ backgroundColor: yellow, color: "#10203a" }}>
              📍 Visitez-nous dès aujourd'hui !
            </span>
            <span className="text-[12px] font-bold" style={{ color: blue }}>
              ☎ {telephone || "+229 01 23 45 67"} · 📍 {adresse || "Cotonou, Bénin"}
            </span>
          </div>
          <div className="mt-3 text-center">
            <p style={{ fontFamily: F.script, color: blue, fontSize: 26 }}>{pied || "Votre satisfaction, notre priorité !"}</p>
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: blue, color: "#ffffff", marginTop: 10 }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MABOUTIQUE — orange, bleu marine (affiche boutique)
  // ═══════════════════════════════════════════════════════════════
  if (t === "maboutique") {
    const navy = "#0b2a5b";
    const orange = "#f57c00";
    const red = "#d7263d";
    return (
      <div className="min-h-screen bg-white px-4 py-6 sm:px-6" style={{ color: "#10203a", ...printBase }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ backgroundColor: orange, fontSize: 26 }}>🛍️</span>
              <div>
                <h1 style={{ fontFamily: F.sans, color: orange, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                  {boutiqueNom}
                </h1>
                <p className="text-[11px] font-bold" style={{ color: navy }}>{slogan || "Achetez mieux, vivez mieux !"}</p>
              </div>
            </div>
            <span className="hidden rounded-full px-3 py-1.5 text-[10px] font-extrabold text-white sm:block" style={{ backgroundColor: navy }}>
              Qualité 100 %
            </span>
          </div>

          <div className="mt-4 rounded-2xl px-5 py-4 text-white" style={{ backgroundColor: navy }}>
            <p style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
              Une boutique en ligne moderne
              <span style={{ color: "#ffc107" }}> à votre service !</span>
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div className="grid grid-cols-2 gap-3">
              {items.length === 0 && <p className="col-span-2 text-[13px]" style={{ color: "#475569" }}>Ajoutez des produits.</p>}
              {items.map((it, i) => (
                <div key={i} className="overflow-hidden rounded-xl border" style={{ borderColor: "rgba(11,42,91,0.15)" }}>
                  {it.image ? (
                    <img src={imgUrl(it.image)} alt="" className="h-28 w-full object-cover" />
                  ) : (
                    <div className="grid h-28 w-full place-items-center" style={{ backgroundColor: "#fff3e0", fontSize: 30 }}>🛍️</div>
                  )}
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="truncate text-[12px] font-bold" style={{ color: navy }}>{it.label}</span>
                    <span className="flex-none rounded px-1.5 py-0.5 text-[11px] font-extrabold text-white" style={{ backgroundColor: orange }}>{it.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <HeroImage src={imagePrincipale} emoji="🛒" className="h-48 w-full rounded-2xl" style={{ border: `3px solid ${orange}` }} />
              <div className="mt-3 space-y-2">
                {[["🛒", "Large choix de produits"], ["🔒", "Paiement sécurisé"], ["🚚", "Livraison rapide"], ["🎧", "Assistance à tout moment"]].map(([e, l], i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full text-white" style={{ backgroundColor: orange, fontSize: 15 }}>{e}</span>
                    <span className="text-[12px] font-semibold" style={{ color: "#10203a" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-block rounded-full px-5 py-2.5 text-[13px] font-extrabold text-white" style={{ backgroundColor: red }}>
              🛒 Commandez maintenant ! →
            </span>
            <span className="text-[12px] font-bold" style={{ color: navy }}>
              ☎ {telephone || "+229 01 69 28 49 96"} · 📍 {adresse || "Cotonou, Bénin"}
            </span>
          </div>

          <div className="mt-4 rounded-xl px-4 py-2.5 text-center text-white" style={{ backgroundColor: navy }}>
            <p style={{ fontFamily: F.script, fontSize: 24 }}>{pied || "Shopping simple, rapide et sécurisé !"}</p>
          </div>
          <div className="mt-3 text-center">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: orange, color: "#ffffff" }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  ANNONCE IMPORTANTE — blanc, bleu, jaune (affiche)
  // ═══════════════════════════════════════════════════════════════
  if (t === "annonce") {
    const blue = "#0b3d91";
    const yellow = "#ffc107";
    const red = "#d7263d";
    const circles = [
      { bg: "#1668e3", e: "🛒", l: "Achats faciles" },
      { bg: "#f57c00", e: "🏷️", l: "Offres spéciales" },
      { bg: "#2e9e44", e: "🛡️", l: "Qualité garantie" },
      { bg: "#7b2ff2", e: "🎧", l: "Service client" },
    ];
    return (
      <div className="min-h-screen bg-white px-4 py-6 sm:px-6" style={{ color: "#10203a", ...printBase }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ backgroundColor: blue, fontSize: 24 }}>🛍️</span>
              <div>
                <h1 style={{ fontFamily: F.sans, color: blue, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{boutiqueNom}</h1>
                <p className="text-[11px] font-semibold" style={{ color: "#64748b" }}>{slogan || "Ici votre slogan"}</p>
              </div>
            </div>
            <p className="hidden text-right sm:block" style={{ fontFamily: F.script, color: blue, fontSize: 24 }}>
              Toujours à vos côtés !
            </p>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div style={{ fontSize: 64, lineHeight: 1 }}>📣</div>
            <div className="flex-1">
              <div className="inline-block -rotate-1 rounded-xl px-4 py-1" style={{ backgroundColor: yellow }}>
                <span style={{ fontFamily: F.poster, color: blue, fontSize: 42, letterSpacing: "0.04em" }}>ANNONCE</span>
              </div>
              <div className="mt-1 inline-block rotate-1 rounded-xl px-4 py-1" style={{ backgroundColor: blue }}>
                <span style={{ fontFamily: F.poster, color: "#ffffff", fontSize: 42, letterSpacing: "0.04em" }}>IMPORTANTE</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl px-5 py-6 text-center" style={{ border: `3px dashed ${blue}`, backgroundColor: "#ffffff" }}>
            <h2 style={{ fontFamily: F.sans, color: blue, fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>{titre || "Votre message ici…"}</h2>
            <p className="mt-2 text-[14px] font-semibold" style={{ color: "#334155" }}>
              {slogan || "Profitez de cette opportunité dès maintenant !"}
            </p>
          </div>

          {items.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] text-white" style={{ backgroundColor: blue }}>✓</span>
                  <span className="flex-1 text-[13px] font-semibold" style={{ color: "#10203a" }}>{it.label}</span>
                  {it.value && (
                    <span className="flex-none rounded px-2 py-0.5 text-[12px] font-extrabold" style={{ backgroundColor: yellow, color: "#10203a" }}>{it.value}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-4 gap-2 text-center">
            {circles.map((c, i) => (
              <div key={i}>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundColor: c.bg, fontSize: 20 }}>{c.e}</div>
                <p className="mt-1 text-[10.5px] font-extrabold leading-tight" style={{ color: "#10203a" }}>{c.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-block rounded-full px-5 py-2.5 text-[13px] font-extrabold" style={{ backgroundColor: yellow, color: "#10203a" }}>
              → Ne manquez pas !
            </span>
            <span className="text-[12px] font-bold" style={{ color: blue }}>
              ☎ {telephone || "+229 01 23 45 67"} · 📍 {adresse || "Votre adresse ici"}
            </span>
          </div>

          <div className="mt-4 rounded-xl px-4 py-2.5 text-center text-white" style={{ backgroundColor: blue }}>
            <p style={{ fontFamily: F.script, fontSize: 24 }}>{pied || "Merci pour votre confiance !"}</p>
          </div>
          <div className="mt-3 text-center">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: red, color: "#ffffff" }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  BELLE & CHIC — noir & or, cosmétique (Beauté naturelle, élégance dorée)
  // ═══════════════════════════════════════════════════════════════
  if (t === "bellechic") {
    const black = "#0a0a0a";
    const gold = "#d4af37";
    const goldLight = "#f2d98a";
    const goldDeep = "#a67c00";
    const cream = "#fdf8ee";
    const avantages = [
      { e: "🌿", l: "Produits de qualité" },
      { e: "💁🏽‍♀️", l: "Soins adaptés à tous types de peau" },
      { e: "🏷️", l: "Prix abordables" },
      { e: "🎧", l: "Conseils personnalisés" },
      { e: "🚚", l: "Livraison rapide partout" },
    ];
    return (
      <div
        className="min-h-screen px-3 py-5 sm:px-5"
        style={{
          background: "linear-gradient(160deg,#0a0a0a 0%,#181104 52%,#0a0a0a 100%)",
          color: "#ffffff",
          ...printBase,
        }}
      >
        <div
          className="mx-auto max-w-4xl overflow-hidden rounded-[28px]"
          style={{ background: "linear-gradient(180deg,#0d0d0d,#070707)", border: `1px solid rgba(212,175,55,0.5)` }}
        >
          {/* En-tête */}
          <div className="px-5 pt-6 text-center">
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-full"
              style={{ border: `2px solid ${gold}`, background: "radial-gradient(circle at 32% 25%,#3a2c0d,#0d0d0d)", fontSize: 30 }}
            >
              👑
            </div>
            <h1
              style={{
                fontFamily: F.serif,
                color: "#ffffff",
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1.05,
                marginTop: 8,
                wordBreak: "break-word",
              }}
            >
              {boutiqueNom}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="h-px w-10" style={{ backgroundColor: gold }} />
              <p style={{ fontFamily: F.sans, color: goldLight, fontSize: 10, fontWeight: 800, letterSpacing: "0.36em", textTransform: "uppercase" }}>
                Cosmétiques
              </p>
              <span className="h-px w-10" style={{ backgroundColor: gold }} />
            </div>
            <p className="mt-2" style={{ fontFamily: F.script, color: cream, fontSize: 26, lineHeight: 1.15 }}>
              {slogan || "Prenez soin de vous, rayonnez en beauté !"}
            </p>
          </div>

          {/* Ruban doré */}
          <div
            className="mx-4 mt-4 rounded-xl px-4 py-3 text-center"
            style={{ background: `linear-gradient(90deg,${goldDeep},${goldLight} 45%,${goldDeep})`, color: "#1a1200" }}
          >
            <p style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 900, lineHeight: 1.2 }}>
              {titre || "Une beauté naturelle, une confiance absolue !"}
            </p>
          </div>

          {/* Photo + bienfaits */}
          <div className="mt-4 grid gap-4 px-4 md:grid-cols-2">
            <div className="relative">
              <HeroImage
                src={imagePrincipale}
                emoji="💄"
                className="h-72 w-full rounded-2xl md:h-full"
                style={{ border: `2px solid ${gold}` }}
              />
              <div
                className="absolute inset-x-3 bottom-3 rounded-xl px-3 py-2 text-center"
                style={{ backgroundColor: "rgba(0,0,0,0.66)", border: `1px solid rgba(212,175,55,0.55)` }}
              >
                <p style={{ fontFamily: F.script, color: goldLight, fontSize: 23, lineHeight: 1.1 }}>Éclat & douceur naturels</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2">
              {avantages.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-full px-3 py-2.5"
                  style={{ backgroundColor: cream, border: `1px solid ${gold}` }}
                >
                  <span
                    className="grid h-9 w-9 flex-none place-items-center rounded-full text-white"
                    style={{ background: `radial-gradient(circle at 30% 25%,${goldLight},${goldDeep})`, fontSize: 16 }}
                  >
                    {a.e}
                  </span>
                  <span style={{ fontFamily: F.sans, color: "#2a1f0b", fontSize: 12.5, fontWeight: 800, lineHeight: 1.2 }}>{a.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Produits */}
          {items.length > 0 && (
            <div className="mt-5 px-4">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1" style={{ backgroundColor: "rgba(212,175,55,0.45)" }} />
                <p style={{ fontFamily: F.script, color: goldLight, fontSize: 24 }}>Nos produits</p>
                <span className="h-px flex-1" style={{ backgroundColor: "rgba(212,175,55,0.45)" }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl"
                    style={{ backgroundColor: "#121212", border: `1px solid rgba(212,175,55,0.4)` }}
                  >
                    {it.image ? (
                      <img src={imgUrl(it.image)} alt="" className="h-28 w-full object-cover" />
                    ) : (
                      <div
                        className="grid h-28 w-full place-items-center"
                        style={{ background: "linear-gradient(135deg,#241a07,#0e0b04)", fontSize: 30 }}
                      >
                        {["🧴", "💧", "💄", "🌸", "✨", "🧼"][i % 6]}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 px-2 py-2">
                      <span className="min-w-0 flex-1 truncate" style={{ color: "#ffffff", fontSize: 11.5, fontWeight: 700 }}>
                        {it.label}
                      </span>
                      {it.value && (
                        <span
                          className="flex-none rounded px-1.5 py-0.5"
                          style={{ backgroundColor: gold, color: "#1a1200", fontSize: 10.5, fontWeight: 900 }}
                        >
                          {it.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bandeau noir & or */}
          <div className="mt-5" style={{ backgroundColor: black, borderTop: `2px solid ${gold}` }}>
            <div className="px-5 py-5 text-center">
              <p style={{ fontFamily: F.script, color: goldLight, fontSize: 30, lineHeight: 1.1 }}>Votre beauté, notre priorité !</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[[ "💎", "Qualité garantie" ], [ "🛡️", "Sécurité d'achat" ], [ "🛒", "Achat en ligne (disponible)" ]].map(([e, l], i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-full"
                      style={{ border: `2px solid ${gold}`, background: "radial-gradient(circle at 30% 25%,#33260a,#0a0a0a)", fontSize: 18 }}
                    >
                      {e}
                    </span>
                    <p style={{ color: cream, fontSize: 10.5, fontWeight: 700, lineHeight: 1.2 }}>{l}</p>
                  </div>
                ))}
              </div>

              <div
                className="mx-auto mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-full px-6 py-3"
                style={{ background: `linear-gradient(90deg,${goldDeep},${goldLight} 50%,${goldDeep})`, color: "#1a1200" }}
              >
                <span style={{ fontSize: 17 }}>🛒</span>
                <span style={{ fontFamily: F.sans, fontSize: 13.5, fontWeight: 900 }}>Commandez dès maintenant !</span>
                <span style={{ fontSize: 16 }}>›</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span style={{ color: goldLight, fontSize: 12, fontWeight: 700 }}>☎ {telephone || "+229 01 97 00 00 00"}</span>
                <span style={{ color: goldLight, fontSize: 12, fontWeight: 700 }}>📍 {adresse || "Cotonou, Bénin"}</span>
              </div>
              <p className="mt-2" style={{ fontFamily: F.script, color: cream, fontSize: 22 }}>{pied || "Parce que vous méritez le meilleur…"}</p>
              <div className="mt-3">
                <PrintBtn onPrint={onPrint} style={{ backgroundColor: gold, color: "#1a1200" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  JOBEAT'S CLOSET — bordeaux & crème, mode (affiche)
  // ═══════════════════════════════════════════════════════════════
  if (t === "jobeats") {
    const red = "#a3122b";
    const dark = "#6d0a18";
    const cream = "#fff6f2";
    const ink = "#2a0a10";
    const rayures = `repeating-linear-gradient(90deg,${red} 0 14px,#ffffff 14px 22px)`;
    return (
      <div className="min-h-screen px-3 py-5 sm:px-5" style={{ background: "linear-gradient(180deg,#fffdfc,#fff1ec)", color: ink, ...printBase }}>
        <div
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{ border: `3px solid ${red}` }}
        >
          <div className="h-2 w-full" style={{ background: rayures }} />

          {/* En-tête */}
          <div className="px-5 pt-5 text-center">
            <p style={{ color: red, fontSize: 9.5, fontWeight: 900, letterSpacing: "0.32em", textTransform: "uppercase" }}>
              Boutique en ligne
            </p>
            <h1
              style={{
                fontFamily: F.poster,
                color: red,
                fontSize: 46,
                lineHeight: 0.98,
                letterSpacing: "0.02em",
                textShadow: "2px 2px 0 #ffffff, 4px 4px 0 rgba(109,10,24,0.18)",
                marginTop: 2,
                wordBreak: "break-word",
              }}
            >
              {String(boutiqueNom || "Jobeat's Closet").toUpperCase()}
            </h1>
            <p style={{ fontFamily: F.script, color: dark, fontSize: 40, lineHeight: 1 }}>{titre || "Closet"}</p>
            <span
              className="mt-1 inline-block rounded-full px-4 py-1.5"
              style={{ backgroundColor: red, color: "#ffffff", fontSize: 11, fontWeight: 800 }}
            >
              {slogan || "Anything ladies and quality"}
            </span>
          </div>

          {/* Corps : liste + collage */}
          <div className="mt-4 grid gap-4 px-4 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="inline-block rounded-md px-4 py-1.5" style={{ backgroundColor: red }}>
                <span style={{ fontFamily: F.sans, color: "#ffffff", fontSize: 12.5, fontWeight: 900, letterSpacing: "0.12em" }}>
                  DEALS IN :
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {items.length === 0 && (
                  <p style={{ color: "#7a5560", fontSize: 12, fontStyle: "italic" }}>Ajoutez vos articles pour les afficher ici.</p>
                )}
                {groups.map((g, gi) => (
                  <div key={gi}>
                    {g.section && (
                      <p style={{ color: dark, fontSize: 11.5, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {g.section}
                      </p>
                    )}
                    <ul className="mt-1 space-y-1">
                      {g.items.map((it, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: red }} />
                          <span className="min-w-0 flex-1 truncate" style={{ color: ink, fontSize: 13, fontWeight: 700 }}>
                            {it.label}
                          </span>
                          {it.value && (
                            <span
                              className="flex-none rounded px-1.5 py-0.5"
                              style={{ backgroundColor: "#ffe3ea", color: dark, fontSize: 11, fontWeight: 900 }}
                            >
                              {it.value}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ border: `1.5px solid ${red}`, color: dark, fontSize: 11, fontWeight: 800 }}
                >
                  🚚 Livraison disponible
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "#ffe3ea", color: dark, fontSize: 11, fontWeight: 800 }}
                >
                  ✅ Qualité garantie
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <HeroImage
                src={imagePrincipale}
                emoji="👗"
                className="col-span-2 h-40 w-full rounded-xl"
                style={{ border: `3px solid ${red}`, background: "linear-gradient(135deg,#ffe3ea,#ffd0da)" }}
              />
              {items.slice(0, 4).map((it, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl"
                  style={{ border: `2px solid ${red}`, backgroundColor: cream }}
                >
                  {it.image ? (
                    <img src={imgUrl(it.image)} alt="" className="h-24 w-full object-cover" />
                  ) : (
                    <div
                      className="grid h-24 w-full place-items-center"
                      style={{ background: "linear-gradient(135deg,#ffe3ea,#ffd0da)", fontSize: 28 }}
                    >
                      {iconeMode(it.section, it.label)}
                    </div>
                  )}
                  <p className="truncate px-1.5 py-1" style={{ color: ink, fontSize: 10.5, fontWeight: 800 }}>
                    {it.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA + contact */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-4">
            <span
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-white"
              style={{ backgroundColor: red, fontSize: 13, fontWeight: 900 }}
            >
              🛒 Commandez maintenant !
            </span>
            <span style={{ color: dark, fontSize: 12, fontWeight: 800 }}>
              ☎ {telephone || "0540580582"} · 📍 {adresse || "Cotonou, Bénin"}
            </span>
          </div>

          <div className="mt-4 px-4 py-3 text-center" style={{ backgroundColor: dark }}>
            <p style={{ fontFamily: F.script, color: "#ffffff", fontSize: 24 }}>
              {pied || "Merci pour votre confiance !"}
            </p>
          </div>

          <div className="pb-4 text-center">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: red, color: "#ffffff", marginTop: 12 }} />
          </div>
          <div className="h-2 w-full" style={{ background: rayures }} />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MODERNE — clair, lisible (repli)
  // ═══════════════════════════════════════════════════════════════
  if (t === "minimal") {
    return (
      <div className="min-h-screen bg-white px-6 py-14" style={{ color: "#0f172a", ...printBase }}>
        <div className="mx-auto max-w-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: "#64748b" }}>{boutiqueNom}</p>
          <h1 style={{ fontFamily: F.serif, color: "#0f172a", fontSize: 38, fontWeight: 800, marginTop: 6 }}>{titre || "Notre sélection"}</h1>
          <div className="mt-2 h-[2px] w-14" style={{ backgroundColor: "#0f172a" }} />
          <div className="mt-8">
            {groups.map((g, gi) => (
              <div key={gi} className="mb-4">
                {g.section && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "#94a3b8" }}>{g.section}</p>}
                {g.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {it.image && <img src={imgUrl(it.image)} alt="" className="h-10 w-10 flex-none rounded object-cover" />}
                    <span className="flex-1 text-[13px] font-medium" style={{ color: "#475569" }}>{it.label}</span>
                    <span className="text-[14px] font-bold" style={{ color: "#0f172a" }}>{it.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <PrintBtn onPrint={onPrint} style={{ backgroundColor: "#0f172a", color: "#ffffff" }} />
          </div>
        </div>
      </div>
    );
  }

  // MODERNE
  const brand = "#4f46e5";
  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "#f5f7ff", color: "#0f172a", ...printBase }}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="px-7 py-8 text-white" style={{ background: `linear-gradient(120deg, ${brand}, #059669)` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.9)" }}>{boutiqueNom}</p>
          <h1 style={{ fontFamily: F.sans, color: "#ffffff", fontSize: 30, fontWeight: 900, marginTop: 8 }}>{titre || "Notre menu"}</h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.9)" }}>
            {slogan || (type === "affiche" ? "Affiche" : "Menu")}
          </p>
        </div>
        <div className="px-6 py-2">
          {items.length === 0 && <p className="py-8 text-center" style={{ color: "#64748b" }}>Aucun élément.</p>}
          {groups.map((g, gi) => (
            <div key={gi} className="mb-2">
              {g.section && <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider" style={{ color: brand }}>{g.section}</p>}
              {g.items.map((it, i) => (
                <div key={i} className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid #eef2ff" }}>
                  {it.image && <img src={imgUrl(it.image)} alt="" className="h-16 w-16 flex-none rounded-xl object-cover" />}
                  <span className="flex-1 text-[15px] font-semibold" style={{ color: "#334155" }}>{it.label}</span>
                  <span className="flex-none rounded-full px-3 py-1 text-[15px] font-extrabold" style={{ backgroundColor: "#eef2ff", color: brand }}>{it.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="px-6 py-5 text-center" style={{ borderTop: "1px solid #eef2ff" }}>
          <PrintBtn onPrint={onPrint} style={{ backgroundColor: brand, color: "#ffffff" }} />
        </div>
      </div>
    </div>
  );
}
