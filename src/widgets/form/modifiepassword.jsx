import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function Modifiepassword({ userId, handleformclick }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    if (password !== confirmPassword) {
      toast.error("Les mots de passe doivent être identiques !", { autoClose: 600 });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
          id: userId,
        }),
      });

      if (response.ok) {
        toast.success("Mot de passe mis à jour avec succès !", { autoClose: 600 });
      } else {
        toast.error("Échec de la mise à jour du mot de passe.");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="w-full mx-auto rounded-lg p-6 bg-white shadow-md">
      <div className="flex justify-end">
        <button
          onClick={handleformclick}
          className="text-xl rounded-full text-black w-8 h-8 bg-gray-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form className="w-full" onSubmit={handleSubmit}>
        <ToastContainer position="top-right" autoClose={600} />

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier le mot de passe</h2>
          <p className="mt-2 text-sm text-gray-500">Mettez à jour votre mot de passe.</p>
        </div>

        <div className="mt-6 space-y-4">
          {/* Champ Nouveau Mot de Passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Champ Confirmation du Mot de Passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showConfirmPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}

export default Modifiepassword;
