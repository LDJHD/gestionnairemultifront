import { useState } from "react";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function Modifiepassword({ userId, handleformclick }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe doivent etre identiques !", { autoClose: 600 });
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expiree. Reconnectez-vous.");
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, id: userId }),
      });
      if (response.ok) {
        toast.success("Mot de passe mis a jour avec succes !", { autoClose: 800 });
        setPassword("");
        setConfirmPassword("");
        if (typeof handleformclick === "function") {
          setTimeout(() => handleformclick(), 500);
        }
      } else {
        let msg = "Echec de la mise a jour du mot de passe.";
        try {
          const data = await response.json();
          if (data && data.erreur) msg = data.erreur;
        } catch (_) {}
        toast.error(msg);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur : " + (error?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full mx-auto rounded-lg p-6 bg-white shadow-md">
      <div className="flex justify-end">
        <button
          onClick={handleformclick}
          type="button"
          className="text-xl rounded-full text-ink-800 w-8 h-8 bg-gray-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="border-b border-ink-100 pb-5">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">Modifier le mot de passe</h2>
          <p className="mt-1.5 text-[13px] text-ink-500">Mettez a jour votre mot de passe.</p>
        </div>
        <div className="mt-6 space-y-4">
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400">
                {showPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
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
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400">
                {showConfirmPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" disabled={saving} className="lg-btn-primary lg-btn-lg w-full">
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default Modifiepassword;
