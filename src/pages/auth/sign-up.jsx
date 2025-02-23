import { useState } from 'react';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function SignUp() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pays, setPays] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmpassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (!termsAccepted) {
      alert("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    const utilisateur = { nom, prenom, email, password, whatsapp, pays, confirmpassword };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateurs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utilisateur)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Inscription réussie", result);
        toast.success("Inscription réussie !", { autoClose: 600 });
        navigate("/auth/sign-in"); 
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de l'inscription :", errorData.erreur);
        toast.error(errorData.erreur || "Erreur lors de l'inscription", { autoClose: 600 });
      }
    } catch (error) {
      console.error("Erreur de serveur :", error);
      toast.error("Erreur Serveur", { autoClose: 600 });
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen">
      <ToastContainer position="top-right" autoClose={600} />
      <div className="w-full sm:w-6/12 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Inscrivez-vous !</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Entrez vos informations pour créer un compte.
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg border-4 border-gray-100 rounded-xl p-4 lg:w-1/2">
          <div className="mb-4 flex flex-col gap-6">
            <Input size="lg" label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            <Input size="lg" label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            <Input size="lg" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input size="lg" label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
            <Input size="lg" label="Pays" value={pays} onChange={(e) => setPays(e.target.value)} required />

            {/* Champ Mot de passe */}
            <div className="relative">
              <Input 
                size="lg"
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-3 text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
            </div>

            {/* Champ Confirmation Mot de passe */}
            <div className="relative">
              <Input 
                size="lg"
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-3 text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <Checkbox
            label={
              <Typography variant="small" color="gray" className="flex items-center justify-start font-medium">
                J'accepte les&nbsp;
                <a href="#" className="font-normal text-black transition-colors hover:text-gray-900 underline">
                  Termes et Conditions
                </a>
              </Typography>
            }
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            containerProps={{ className: "-ml-2.5" }}
          />
          <Button type="submit" className="mt-6" fullWidth>
            S'inscrire maintenant
          </Button>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Vous avez déjà un compte ? 
            <Link to="/auth/sign-in" className="text-gray-900 ml-1">Se connecter/Revenir</Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
