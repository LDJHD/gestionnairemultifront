// Helper pour lire les informations de l'entreprise connectée depuis le JWT.
// Le token contient : { id, email, role, entreprise_id, entreprise_nom, entreprise_ifu, super_admin }

const CLE_TOKEN = "token";

export function lireToken() {
  try {
    const brut = localStorage.getItem(CLE_TOKEN);
    if (!brut) return null;
    const payload = brut.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function lireEntrepriseId() {
  const token = lireToken();
  return token?.entreprise_id ?? null;
}

export function lireEntrepriseIfu() {
  const token = lireToken();
  return token?.entreprise_ifu || "";
}

export function lireEntrepriseNom() {
  const token = lireToken();
  return token?.entreprise_nom || "";
}

export function lireRole() {
  const token = lireToken();
  return token?.role || "";
}

export function estSuperAdmin() {
  const token = lireToken();
  return !!token?.super_admin;
}

export function lireUtilisateurId() {
  const token = lireToken();
  return token?.id ?? null;
}
