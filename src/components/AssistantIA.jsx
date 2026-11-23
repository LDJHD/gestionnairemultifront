import { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

/* ===========================================================================
   ASSISTANT IA — « LE GESTIONNAIRE »
   Aide contextuelle réservée aux fonctionnalités côté UTILISATEUR.
   Ne divulgue aucune information d'administration (super admin, gestion des
   entreprises, rôles, etc.).
   =========================================================================== */

const BASE_CONNAISSANCES = [
  {
    mots: ["ajouter produit", "nouveau produit", "créer produit", "enregistrer produit"],
    reponse:
      "Pour ajouter un produit : menu Produit → « Ajouter un produit ». Renseignez le nom, la catégorie, le prix de vente, le prix d'achat, l'unité, le stock initial et la photo. Validez avec « Enregistrer ».",
  },
  {
    mots: ["modifier produit", "éditer produit", "changer prix"],
    reponse:
      "Pour modifier un produit : menu Produit → cliquez sur les trois points (⋯) de la ligne → « Modifier le produit ». Ajustez les champs puis « Enregistrer ».",
  },
  {
    mots: ["supprimer produit", "effacer produit", "retirer produit"],
    reponse:
      "Pour supprimer un produit : menu Produit → ⋯ → « Supprimer ». Une confirmation vous est demandée ; l'action est irréversible.",
  },
  {
    mots: ["stock", "quantité disponible", "réapprovisionner", "inventaire"],
    reponse:
      "Le module Stock affiche la quantité en stock et la quantité disponible (stock − vendu). Vous pouvez ajouter, modifier ou supprimer une ligne de stock. Les alertes apparaissent quand un article est faible.",
  },
  {
    mots: ["catégorie", "categories", "famille"],
    reponse:
      "Les catégories se gèrent dans le menu Catégorie : ajoutez un nom, modifiez ou supprimez. Chaque produit doit être rattaché à une catégorie.",
  },
  {
    mots: ["unité", "unite", "kg", "litre", "pièce"],
    reponse:
      "Les unités (kg, L, pièce…) se créent dans le menu Unité. Elles servent à l'affichage des produits et à la vente.",
  },
  {
    mots: ["client", "clients"],
    reponse:
      "Le menu Client permet d'ajouter, modifier ou supprimer une fiche client (nom, prénom, email, téléphone, adresse, IFU). Les ventes sont rattachées au client choisi.",
  },
  {
    mots: ["fournisseur", "fournisseurs"],
    reponse:
      "Le menu Fournisseur centralise vos partenaires. Vous pouvez ajouter, modifier ou supprimer une fiche fournisseur.",
  },
  {
    mots: ["vente", "vendre", "encaisser", "caisse"],
    reponse:
      "Pour vendre : « Opération de Vente » → sélectionnez les produits, les quantités, le client, appliquez une remise et/ou l'AIB, puis « Valider la vente ». Le reçu s'imprime automatiquement.",
  },
  {
    mots: ["remise", "rabais", "réduction"],
    reponse:
      "Lors d'une vente, vous pouvez appliquer une remise en pourcentage ou en montant fixe avant la validation.",
  },
  {
    mots: ["aib", "taxe", "tva"],
    reponse:
      "L'AIB (taxe) se configure dans les paramètres de la boutique et s'applique automatiquement lors de la vente. Le total TTC est calculé en temps réel.",
  },
  {
    mots: ["boutique en ligne", "boutique", "site", "vitrine", "lien"],
    reponse:
      "Votre boutique en ligne est accessible via un lien unique (menu Paramètres boutique). Vous pouvez personnaliser les couleurs et laisser vos clients commander depuis un ordinateur ou un mobile.",
  },
  {
    mots: ["commande", "commandes en ligne", "suivi commande"],
    reponse:
      "Les commandes passées sur la boutique apparaissent dans « Commandes en ligne ». Vous pouvez les valider, préparer et suivre jusqu'à la livraison.",
  },
  {
    mots: ["livraison", "livrer", "expédition"],
    reponse:
      "Le module Livraisons permet de suivre chaque commande jusqu'à la remise au client, avec mise à jour du statut.",
  },
  {
    mots: ["paiement", "fedapay", "mobile money", "espèces"],
    reponse:
      "Les paiements se font via FedaPay (mobile money / carte) ou à la livraison. Le statut de paiement est visible dans « Paiements ».",
  },
  {
    mots: ["statistique", "comptabilité", "chiffre d'affaires", "rapport", "bilan"],
    reponse:
      "Le module Statistique/Comptabilité affiche le chiffre d'affaires, les ventes par période, les produits les plus vendus et les marges.",
  },
  {
    mots: ["profil", "mon profil", "mot de passe", "photo"],
    reponse:
      "Votre profil se gère dans « Mon profil » : nom, prénom, email, téléphone, adresse, photo et mot de passe.",
  },
  {
    mots: ["notification", "notifications", "alerte"],
    reponse:
      "Les notifications (nouvelles commandes, alertes stock…) s'affichent dans le menu Notifications. Vous pouvez les marquer comme lues.",
  },
  {
    mots: ["mobile", "téléphone", "application", "pwa", "installer"],
    reponse:
      "L'application est responsive et installable sur mobile (PWA). Ouvrez-la dans le navigateur puis « Ajouter à l'écran d'accueil ».",
  },
  {
    mots: ["paramètres boutique", "configurer boutique", "couleur", "logo boutique", "gps", "position"],
    reponse:
      "Dans « Paramètres boutique » vous configurez le nom, le logo, les couleurs, le lien de la boutique et votre position GPS exacte (pour les livraisons).",
  },
];

const MOTS_ADMIN = [
  "super admin", "superadmin", "gérer les entreprises", "gerer les entreprises",
  "entreprise", "tenant", "rôle", "role", "utilisateur admin", "compte admin",
  "base de données", "database", "sql", "serveur", "déploiement", "deploy",
];

function repondre(question) {
  const q = question.toLowerCase().trim();
  if (MOTS_ADMIN.some((m) => q.includes(m))) {
    return "Cette question concerne l'administration de la plateforme, réservée aux super administrateurs. Je ne peux pas vous aider sur ce point. Pour toute demande d'administration, contactez votre responsable ou le support.";
  }
  for (const item of BASE_CONNAISSANCES) {
    if (item.mots.some((m) => q.includes(m))) {
      return item.reponse;
    }
  }
  return "Je n'ai pas trouvé de réponse précise. Essayez avec des mots comme : produit, stock, client, vente, boutique, commande, paiement, statistique, profil, notification, mobile. Pour une aide personnalisée, contactez le support.";
}

export default function AssistantIA() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Je suis l'assistant du Gestionnaire. Posez-moi une question sur l'utilisation de l'application (produits, ventes, stock, boutique…)." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;

  const envoyer = (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const r = repondre(q);
      setMessages((m) => [...m, { from: "bot", text: r }]);
      setTyping(false);
    }, 450);
  };

  const suggestions = ["Comment ajouter un produit ?", "Comment faire une vente ?", "Gérer le stock", "Boutique en ligne"];

  return (
    <>
      {/* Bouton flottant */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-white shadow-glow transition-all duration-300 hover:scale-110 hover:shadow-lift"
          aria-label="Ouvrir l'assistant"
        >
          <ChatBubbleLeftRightIcon className="h-7 w-7" />
        </button>
      )}

      {/* Panneau de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] flex h-[520px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift">
          <div className="flex items-center justify-between bg-brand-gradient px-5 py-4 text-white">
            <div>
              <p className="font-display text-base font-bold">Assistant Le Gestionnaire</p>
              <p className="text-[11px] text-white/70">Aide à l'utilisation</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/15">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50/40 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                    m.from === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-white text-ink-700 ring-1 ring-inset ring-ink-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-2.5 text-[13px] text-ink-400 ring-1 ring-inset ring-ink-200">
                  …
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 border-t border-ink-100 bg-white px-4 py-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); }}
                  className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={envoyer} className="flex items-center gap-2 border-t border-ink-100 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question…"
              className="lg-input flex-1 py-2 text-[13px]"
            />
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700">
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
