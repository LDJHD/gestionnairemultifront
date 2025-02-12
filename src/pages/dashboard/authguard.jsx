import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Remplace par ta logique d'authentification

  return isAuthenticated ? <Navigate to="/dashboard/home" replace /> : children;
};

export default AuthGuard;
