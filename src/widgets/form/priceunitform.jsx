import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function PriceUnitForm({ onChange, charge }) {
  const [fields, setFields] = useState([]);
  const [unit, setunit] = useState([]);

  // Fonction pour récupérer les categories
  const fetchunit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/unit/listall`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setunit(data);
      } else {
        console.error("Erreur lors de la récupération des categories:", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  // Appel de fetchcategories lors du chargement du composant
  useEffect(() => {
    fetchunit();
  }, []);

  useEffect(() => {
    setFields([]); // Ferme les champs quand `resetTrigger` change
  }, [charge]);

  useEffect(() => {
    onChange(fields); // Met à jour le parent à chaque changement
  }, [fields, onChange]);

  const handleAddField = () => {
    setFields([...fields, { id: Date.now(), prix: "", unit: "" }]);
  };

  const handleInputChange = (id, field, value) => {
    setFields(fields.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveField = (id) => {
    setFields(fields.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h3 className="mb-2 font-display text-base font-extrabold text-ink-900">
        Informations sur les produits
      </h3>

      {fields.length === 0 ? (
        <p className="mb-2 text-[13px] text-ink-500">Aucun champ ajouté.</p>
      ) : (
        fields.map((item) => (
          <div key={item.id} className="flex items-center gap-4 mb-2">
            <div className="w-1/2">
              <label className="lg-label">Prix</label>
              <input
                type="number"
                value={item.prix}
                onChange={(e) => handleInputChange(item.id, "prix", e.target.value)}
                className="lg-input"
                placeholder="0.00"
              />
            </div>
            <div className="w-1/2">
              <label className="lg-label">Unité</label>
              <select
                value={item.unit}
                onChange={(e) => handleInputChange(item.id, "unit", e.target.value)}
                className="lg-input"
              >
                <option value="">Sélectionner</option>
                {unit.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nom}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleRemoveField(item.id)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          </div>
        ))
      )}

      <button
        onClick={handleAddField}
        className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800"
      >
        <PlusIcon className="h-6 w-6" />
        Ajouter un autre
      </button>
    </div>
  );
}
