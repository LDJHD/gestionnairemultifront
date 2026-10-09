import { useState } from "react";
import { toast } from "react-toastify";
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
          className="text-xl rounded-full text-ink-800 w-8 h-8 bg-gray-200 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="border-b border-ink-100 pb-5">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
            Modifier le mot de passe
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-500">Mettez à jour votre mot de passe.</p>
        </div>

        <div className="mt-6 space-y-4">
          {/* Champ Nouveau Mot de Passe */}
          <div>
            <label className="lg-label">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="lg-input"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400"
              >
                {showPassword ? (
                  <EyeIcon className="h-6 w-6" />
                ) : (
                  <EyeSlashIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Champ Confirmation du Mot de Passe */}
          <div>
            <label className="lg-label">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="lg-input"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="h-6 w-6" />
                ) : (
                  <EyeSlashIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="lg-btn-primary lg-btn-lg w-full">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}

export default Modifiepassword;
