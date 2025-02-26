import { useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();

  // const handleSignIn = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       localStorage.setItem("token", data.token);
  //       setDisabled(true)
  //       toast.success("Authentification réussie !");
  //       setTimeout(() => {
  //         navigate("/home");
  //       }, 700);
  //     } else {
  //       toast.error("Échec de l'authentification. Veuillez réessayer.");
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de l'authentification :", error);
  //   }
  // };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            setDisabled(true);
            toast.success("Authentification réussie !");
            setTimeout(() => {
                navigate("/home");
            }, 700);
        } else {
            // 🔥 Correction ici : on utilise `data.erreur` au lieu de `error.response.data.erreur`
            toast.error(data.erreur || "Une erreur s'est produite.");
        }
    } catch (error) {
        console.error("Erreur lors de l'authentification :", error);
        toast.error("Une erreur réseau est survenue.");
    }
};


  return (
    <section className="m-8 flex items-center justify-center min-h-screen">
       <ToastContainer position="top-right" autoClose={600} />
      <div className="w-full h-full sm:w-6/12 border-solid rounded-2xl">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Bienvenue sur ATON HELIOSTORE</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Connectez-vous !
          </Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-full border-4 border-gray-100 rounded-xl p-4 max-w-screen-lg lg:w-1/2" onSubmit={handleSignIn}>
          <div className="mb-1 flex justify-center flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Votre email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Mot de passe
            </Typography>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                size="lg"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg
                onClick={() => setShowPassword(!showPassword)}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-8 w-8 text-black absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                {showPassword ?<EyeIcon className="h-6 w-6" />:<EyeSlashIcon className="h-6 w-6" />}
              </svg>
            </div>
          </div>
          <Button disabled={disabled} className="mt-6" fullWidth type="submit">
            Sign In
          </Button>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignIn;
