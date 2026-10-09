import { useEffect, useState } from "react";
import Toastadd from "@/widgets/toast/toastadd";
import Modaledituser from "@/widgets/modal/modaledituser";
import Swal from 'sweetalert2';
import Modaleditpassword from "@/widgets/modal/modaleditpassword";
import {
    TrashIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

function estAdministrateurConnecte() {
    try {
        const token = localStorage.getItem("token");
        const payload = token?.split(".")[1];
        if (!payload) return false;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const role = JSON.parse(atob(base64)).role || "";
        return String(role).toLocaleLowerCase("fr-FR") === "admin";
    } catch {
        return false;
    }
}

export function User() {
    const [users, setUsers] = useState([]);
    const [toast, setToast] = useState(false);
    const rep = "Enregistrement effectué avec succès";
    const [loading, setLoading] = useState(true);
    const [estAdmin] = useState(estAdministrateurConnecte);

    const roles = ["user", "Admin", "Caissiere", "Gestionnaire", "Comptabilite"];

    // Modifier le rôle de l'utilisateur
    const handleRoleChange = async (id, newRole) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, status: newRole }),
            });

            if (response.ok) {
                setUsers(users.map(user =>
                    user.id === id ? { ...user, status: newRole } : user
                ));
                Swal.fire("Mise à jour réussie", "Le rôle de l'utilisateur a été modifié.", "success");
            } else {
                Swal.fire("Erreur", "Impossible de mettre à jour le rôle.", "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Problème de connexion au serveur.", "error");
        }
    };

    // Activer/Désactiver un utilisateur
    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, actif: newStatus }),
            });

            if (response.ok) {
                setUsers(users.map(user =>
                    user.id === id ? { ...user, actif: newStatus } : user
                ));
            } else {
                console.error("Erreur lors de la mise à jour du statut.");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    };

    // Supprimer un utilisateur
    const handleDeleteUser = async (id) => {
        Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Cette action est irréversible!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer!",
            cancelButtonText: "Annuler",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/delete/${id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        setUsers(users.filter(user => user.id !== id));
                        Swal.fire("Supprimé!", "L'utilisateur a été supprimé.", "success");
                    } else {
                        Swal.fire("Erreur", "Impossible de supprimer l'utilisateur.", "error");
                    }
                } catch (error) {
                    Swal.fire("Erreur", "Problème de connexion au serveur.", "error");
                }
            }
        });
    };

    // Récupérer les utilisateurs
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/utilisateur/listall`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error("Erreur lors de la récupération des utilisateurs:", response.status);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    

    return (
        <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
            {/* ══════════════ EN-TÊTE DE PAGE ══════════════ */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="lg-page-title">Utilisateurs</h1>
                    <p className="lg-page-sub">
                        Gérez les comptes, les rôles et les accès de votre équipe.
                    </p>
                </div>
                <span className="lg-badge-brand tabular">
                    {loading ? "…" : `${users.length} compte(s)`}
                </span>
            </header>

            {/* ══════════════ LISTE DES COMPTES ══════════════ */}
            <div className="lg-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                            <UserGroupIcon className="h-[18px] w-[18px]" />
                        </span>
                        <div>
                            <p className="font-display text-base font-extrabold text-ink-900">
                Comptes utilisateurs
                            </p>
                            <p className="text-[13px] text-ink-500">
                                {estAdmin
                                    ? "Droits administrateur : modification des rôles et suppression"
                                    : "Consultation de la liste des comptes"}
                            </p>
                        </div>
                    </div>
                    <span className="lg-badge-neutral">Rôles : {roles.length}</span>
                </div>

                {loading ? (
                    <div className="space-y-3 p-5">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="lg-skeleton h-14 w-full" />
                        ))}
                    </div>
                ) : !users || users.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-ink-700">Aucun utilisateur</p>
                        <p className="mt-1 text-[13px] text-ink-500">
                            Aucun compte n'a encore été créé sur la plateforme.
                        </p>
                    </div>
                ) : (
                    <div className="lg-table-wrap">
                        <table className="lg-table w-full min-w-[1100px]">
                            <thead>
                                <tr>
                                    {["Nom", "Prénom", "Email", "Téléphone", "Adresse", "Statut", "Actif", "Date de création", "Options"].map((el) => (
                                        <th key={el}>{el}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="lg-td font-semibold text-ink-800">{user.nom}</td>
                                        <td className="lg-td text-ink-700">{user.prenom}</td>
                                        <td className="lg-td text-[13px] text-ink-500">{user.email}</td>
                                        <td className="lg-td text-[13px] text-ink-500 tabular">{user.whatsapp}</td>
                                        <td className="lg-td text-[13px] text-ink-500">{user.pays}</td>

                                        <td className="lg-td">
                                            {estAdmin ? (
                                                <div className="w-36">
                                                    <select
                                                        value={user.status}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        className="lg-select py-1.5 text-[13px]"
                                                    >
                                                        {roles.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <span className="lg-badge-neutral">{user.status}</span>
                                            )}
                                        </td>

                                        <td className="lg-td">
                                            {estAdmin ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUserStatus(user.id, user.actif)}
                                                    aria-label={user.actif === 1 ? "Désactiver le compte" : "Activer le compte"}
                                                    className={`relative h-6 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                                                        user.actif === 1
                                                            ? "bg-accent-500"
                                                            : "bg-ink-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                                            user.actif === 1 ? "translate-x-6" : ""
                                                        }`}
                                                    ></span>
                                                </button>
                                            ) : user.actif === 1 ? (
                                                <span className="lg-badge-accent">Actif</span>
                                            ) : (
                                                <span className="lg-badge-danger">Inactif</span>
                                            )}
                                        </td>

                                        <td className="lg-td text-[13px] text-ink-500 tabular">{user.date}</td>

                                        <td className="lg-td">
                                            <div className="flex items-center justify-end gap-2">
                                                <Modaledituser userId={user.id} handletoast={() => setToast(true)} />
                                                <Modaleditpassword userId={user.id} handletoast={() => setToast(true)} />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="lg-btn-danger lg-btn-sm"
                                                    title="Supprimer l'utilisateur"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {toast && <Toastadd reponse={rep} />}
        </div>
    );
}

export default User;