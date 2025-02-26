import {
    Card,
    CardHeader,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import Toastadd from "@/widgets/toast/toastadd";
import Modaledituser from "@/widgets/modal/modaledituser";
import Swal from 'sweetalert2';

export function User() {
    const [users, setUsers] = useState([]);
    const [toast, setToast] = useState(false);
    const rep = "Enregistrement effectué avec succès";
    const [loading, setLoading] = useState(true);

    const roles = ["User", "Admin", "Caissière", "Gestionnaire", "Comptabilité"];

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
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Utilisateurs</span>

                    </div>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <img src="/image/loading.png" alt="Chargement..." className="w-24 h-24 animate-spin" />
                        </div>
                    ) : (
                        <table className="w-full min-w-[1000px] table-auto">
                            <thead>
                                <tr>
                                    {["Nom", "Prénom", "Email", "Téléphone", "Adresse", "Statut", "Actif", "Date de création", "Options"].map((el) => (
                                        <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                            <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, key) => {
                                    const className = `py-3 px-5 ${key === users.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                                    return (
                                        <tr key={user.id}>
                                            <td className={className}>{user.nom}</td>
                                            <td className={className}>{user.prenom}</td>
                                            <td className={className}>{user.email}</td>
                                            <td className={className}>{user.telephone}</td>
                                            <td className={className}>{user.adresse}</td>

                                            <td className={className}>
                                                <select value={user.status} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
                                                    {roles.map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* <td className={className}>
                                                <input type="checkbox" checked={user.actif === 1} onChange={() => toggleUserStatus(user.id, user.actif)} className="cursor-pointer" />
                                            </td> */}
<td className="px-4 py-2">
    <button
        onClick={() => {
            toggleUserStatus(user.id, user.actif);
        }}
        className={`relative w-12 h-6 rounded-full transition-colors ${
            user.actif === 1 ? "bg-green-500" : "bg-gray-400"
        }`}
    >
        <span
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                user.actif === 1 ? "translate-x-6" : ""
            }`}
        ></span>
    </button>
</td>


                                            <td className={className}>{user.date}</td>

                                            <td className={className}>
                                                <div className="flex gap-2">
                                                    <Modaledituser userId={user.id} handletoast={() => setToast(true)} />
                                                    {/* <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">Supprimer</button> */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="w-4 text-red-600 rounded-full flex items-center justify-center"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="text-sm"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </CardBody>
            </Card>
            {toast && <Toastadd reponse={rep} />}
        </div>
    );
}

export default User;
