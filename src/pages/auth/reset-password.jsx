import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les mots de passe doivent etre identiques.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/reinitialiser-mot-de-passe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Mot de passe reinitialise ! Redirection...");
        setTimeout(() => navigate("/auth/sign-in"), 1500);
      } else {
        toast.error(data.erreur || "Echec de la reinitialisation.");
      }
    } catch (e) {
      toast.error("Erreur reseau.");
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lift p-8 text-center">
          <h1 className="text-xl font-bold text-ink-900">Token manquant</h1>
          <p className="mt-2 text-[13px] text-ink-500">Le lien de reinitialisation semble invalide.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
      <ToastContainer position="top-right" autoClose={600} />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lift p-8">
        <h1 className="font-display text-xl font-extrabold text-ink-900">Nouveau mot de passe</h1>
        <p className="mt-1.5 text-[13px] text-ink-500">Choisissez un nouveau mot de passe (15 min max apres la demande).</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="lg-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="lg-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="lg-label">Confirmer</label>
            <input
              type="password"
              className="lg-input"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="lg-btn-primary lg-btn-lg w-full">
            {saving ? "Enregistrement..." : "Reinitialiser"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;