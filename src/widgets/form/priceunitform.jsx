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
    <div className="min-w-0 rounded-xl border border-ink-200 bg-white p-4 shadow-xs">
      <h3 className="mb-2 font-display text-base font-extrabold text-ink-900">
        Informations sur les produits
      </h3>

      {fields.length === 0 ? (
        <p className="mb-2 text-[13px] text-ink-500">Aucun champ ajouté.</p>
      ) : (
        fields.map((item) => (
          <div key={item.id} className="price-unit-row mb-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="lg-field min-w-0">
              <label className="lg-label">Prix</label>
              <input
                type="number"
                inputMode="decimal"
                value={item.prix}
                onChange={(e) => handleInputChange(item.id, "prix", e.target.value)}
                className="lg-input min-w-0"
                placeholder="0.00"
              />
            </div>
            <div className="lg-field flex min-w-0 items-end gap-2">
              <div className="min-w-0 flex-1">
                <label className="lg-label">Unité</label>
                <select
                  value={item.unit}
                  onChange={(e) => handleInputChange(item.id, "unit", e.target.value)}
                  className="lg-select min-w-0"
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
                type="button"
                onClick={() => handleRemoveField(item.id)}
                aria-label="Retirer ce champ"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={handleAddField}
        className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        <PlusIcon className="h-5 w-5" />
        Ajouter un autre
      </button>
    </div>
  );
}
