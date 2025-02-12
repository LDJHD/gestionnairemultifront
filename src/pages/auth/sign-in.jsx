import { useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
        toast.success("Authentification réussie !");
        setTimeout(() => {
          navigate("/home");
        }, 3100);
      } else {
        toast.error("Échec de l'authentification. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification :", error);
    }
  };

  return (
    <section className="m-8 flex items-center justify-center min-h-screen">
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
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.4C5.78 5.5 9.27 3 12 3c2.73 0 6.22 2.5 8.02 5.4.35.58.35 1.32 0 1.9C18.22 13.5 14.73 16 12 16c-2.73 0-6.22-2.5-8.02-5.4a1.49 1.49 0 010-1.9z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5l1 1m-2-2L3 3m18 18l-9-9m9 9l-9-9m0 0l-2-2m2 2l-2-2m2 2l-2-2m2 2l-2-2" />
                )}
              </svg>
            </div>
          </div>
          <Button className="mt-6" fullWidth type="submit">
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
