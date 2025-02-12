import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function PriceUnitForm({ onChange,charge }) {
  const [fields, setFields] = useState([]);

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
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Informations sur les produits</h3>

      {fields.length === 0 ? (
        <p className="text-gray-500 text-sm mb-2">Aucun champ ajouté.</p>
      ) : (
        fields.map((item) => (
          <div key={item.id} className="flex items-center gap-4 mb-2">
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-gray-700">Prix</label>
              <input
                type="number"
                value={item.prix}
                onChange={(e) => handleInputChange(item.id, "prix", e.target.value)}
                className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
                placeholder="0.00"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-gray-700">Unité</label>
              <select
                value={item.unit}
                onChange={(e) => handleInputChange(item.id, "unit", e.target.value)}
                className="mt-1 p-2 block w-full rounded-md ring-1 ring-black border-gray-300 shadow-sm transition duration-300"
              >
                <option value="">Sélectionner</option>
                <option>Sachet(s)</option>
                <option>Paquet(s)</option>
                <option>Boite(s)</option>
                <option>Plaquette(s)</option>
                <option>Carton(s)</option>
                <option>Bouteille(s)</option>
                <option>Litre(s)</option>
                <option>Kilogramme(s)</option>
                <option>Gramme(s)</option>
                <option>Pot(s)</option>
                <option>Barquette(s)</option>
                <option>Tube(s)</option>
                <option>Piece(s)</option>
                <option>Dose(s)</option>
                <option>Flacon(s)</option>
                <option>Bidon(s)</option>
                <option>Pack(s)</option>
                <option>Palette(s)</option>
                <option>Contenant</option>
                <option>1/2_Demi</option>
              </select>
            </div>
            <button onClick={() => handleRemoveField(item.id)} className="text-red-500 hover:text-red-700 transition">
              <TrashIcon className="w-6 h-6" />
            </button>
          </div>
        ))
      )}

      <button onClick={handleAddField} className="mt-2 flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition">
        <PlusIcon className="w-6 h-6" />
        Ajouter un autre
      </button>
    </div>
  );
}
