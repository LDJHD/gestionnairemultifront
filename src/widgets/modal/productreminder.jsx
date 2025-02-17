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
    const validData = storedData.filter(item => now - item.timestamp < EXPIRATION_DAYS * 24 * 60 * 60 * 1000); // Vérifier si la donnée est toujours valide (moins de 7 jours)
    localStorage.setItem("ignoredExpirations", JSON.stringify(validData)); // Met à jour le stockage avec les données filtrées
    return validData.map(item => item.nom);
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

      return (
        today >= twoMonthsBefore ||
        today >= oneMonthBefore ||
        today >= twoWeeksBefore
      );
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

    const updatedIgnoredList = [...JSON.parse(localStorage.getItem("ignoredExpirations") || "[]"), ...ignored];
    localStorage.setItem("ignoredExpirations", JSON.stringify(updatedIgnoredList)); // Sauvegarder dans le localStorage
    setIgnoredProducts(updatedIgnoredList.map(item => item.nom)); // Mettre à jour la liste des produits ignorés
    setShowModal(false);
  };

  return (
    <>
      {/* Modal amélioré */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full transform transition-all duration-300 scale-100 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">⚠️ Produits bientôt expirés</h2>
          </div>

          <ul className="mt-4 bg-gray-100 p-4 rounded-md max-h-40 overflow-y-auto">
            {expiringProducts.map((product, index) => (
              <li key={index} className="text-red-600 font-medium">
                {product.nom} - <span className="font-semibold">{new Date(product.dateexpi).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all"
            >
              OK, compris
            </button>
            <button
              onClick={ignoreProducts}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md transition-all"
            >
              Rappel dans 7 jours
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ProductReminder;
