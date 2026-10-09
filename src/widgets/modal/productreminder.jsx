import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"; // Import d'une icône

const EXPIRATION_DAYS = 7; // 7 jours

const ProductReminder = ({ products }) => {
  const [showModal, setShowModal] = useState(false);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [ignoredProducts, setIgnoredProducts] = useState(() => {
    const storedData = JSON.parse(localStorage.getItem("ignoredExpirations")) || [];
    const now = new Date().getTime();
    const validData = storedData.filter(
      (item) => now - item.timestamp < EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    ); // Vérifier si la donnée est toujours valide (moins de 7 jours)
    localStorage.setItem("ignoredExpirations", JSON.stringify(validData)); // Met à jour le stockage avec les données filtrées
    return validData.map((item) => item.nom);
  });

  useEffect(() => {
    const today = new Date();

    const soonExpiring = products.filter((product) => {
      if (!product.dateexpi || ignoredProducts.includes(product.nom)) return false;

      const expirationDate = new Date(product.dateexpi);
      const twoMonthsBefore = new Date(expirationDate);
      twoMonthsBefore.setMonth(expirationDate.getMonth() - 2);

      const oneMonthBefore = new Date(expirationDate);
      oneMonthBefore.setMonth(expirationDate.getMonth() - 1);

      const twoWeeksBefore = new Date(expirationDate);
      twoWeeksBefore.setDate(expirationDate.getDate() - 14);

      return today >= twoMonthsBefore || today >= oneMonthBefore || today >= twoWeeksBefore;
    });

    if (soonExpiring.length > 0) {
      setExpiringProducts(soonExpiring);
      setShowModal(true);
      playAlertSound();
    }
  }, [products, ignoredProducts]);

  const playAlertSound = () => {
    const audio = new Audio("/sounds/alert.mp3");
    audio.play();
  };

  const ignoreProducts = () => {
    const ignored = expiringProducts.map((product) => ({
      nom: product.nom,
      timestamp: new Date().getTime(), // Enregistrer le timestamp actuel
    }));

    const updatedIgnoredList = [
      ...JSON.parse(localStorage.getItem("ignoredExpirations") || "[]"),
      ...ignored,
    ];
    localStorage.setItem("ignoredExpirations", JSON.stringify(updatedIgnoredList)); // Sauvegarder dans le localStorage
    setIgnoredProducts(updatedIgnoredList.map((item) => item.nom)); // Mettre à jour la liste des produits ignorés
    setShowModal(false);
  };

  return (
    <>
      {/* Alerte produits bientôt expirés */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        className="fixed inset-0 z-[70] grid place-items-center bg-ink-900/50 p-4 backdrop-blur-sm"
      >
        <div className="w-full max-w-lg animate-pop-in overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-lift">
          {/* Bandeau d'alerte */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-6 text-white">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
            </div>
            <div className="relative flex items-center gap-3.5">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold tracking-tight">
                  Produits bientôt expirés
                </h2>
                <p className="mt-0.5 text-[13px] text-white/75">
                  {expiringProducts.length} produit(s) à surveiller de près
                </p>
              </div>
            </div>
          </div>

          {/* Liste */}
          <ul className="max-h-64 divide-y divide-ink-100 overflow-y-auto">
            {expiringProducts.map((product, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-ink-50"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-800">
                  {product.nom}
                </span>
                <span className="shrink-0 text-[12px] font-bold text-amber-700 tabular">
                  {new Date(product.dateexpi).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-ink-50/60 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="lg-btn-neutral"
            >
              OK, compris
            </button>
            <button type="button" onClick={ignoreProducts} className="lg-btn-primary">
              Rappel dans 7 jours
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ProductReminder;
