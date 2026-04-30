import { useState, useEffect, useRef, useMemo } from "react";
import { BACKEND_URL } from "../../api/axios";
import Layout from "../../components/layout/Layoutt";
import UserForm from "./UsersForm";
import type { User } from "../../interfaces";
import UserDetails from "./UserDetails";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "primereact/dropdown";
import Pagination from "../../components/layout/Pagination";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit3,
  Trash2,
  XCircle,
  ArrowUpDown,
  FolderLock,
} from "lucide-react";
import UserAcces from "./UserAcces";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useInitialData,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useGrantAccess,
} from "../../hooks/useUsers";

export default function UserPage() {
  const { user } = useAuth();
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer les useState multiples par useInitialData
  const {
    users: allUser = [],
    droits: droit = [],
    onLigneUsers = [],
    isLoading,
    error,
    refetch,
  } = useInitialData();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const grantAccessMutation = useGrantAccess();

  // États UI (inchangés)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [accesUser, setAccesUser] = useState(false);
  const [editing, setEditing] = useState<Partial<User> | null>(null);
  const [query, setQuery] = useState("");
  const [champDeTrie, setChampDeTrie] = useState<keyof User>("prenom");
  const [ordreDeTrie, setOrdreDeTrie] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedDroit, setSelectedDroit] = useState<string | null>(null);

  // ✅ PLUS BESOIN DE LA FONCTION affichage() NI DE useEffect !

  const onlineUserIds = useMemo(() => {
    return new Set(onLigneUsers.map((u: any) => Number(u.id)));
  }, [onLigneUsers]);

  const isUserOnline = (userId: number) => {
    return onlineUserIds.has(Number(userId));
  };

  // ✅ ÉTAPE 3: Remplacer onCreate
  const onCreate = async (payload: Partial<User>, photoFile?: File) => {
    try {
      await createMutation.mutateAsync({ payload, photoFile });
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Utilisateur créé",
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de création",
      });
    }
  };

  // ✅ ÉTAPE 4: Remplacer onEdit
  const onEdit = async (payload: Partial<User>, photoFile?: File) => {
    if (!editing?.id) return;
    try {
      await updateMutation.mutateAsync({
        id: String(editing.id),
        payload,
        photoFile,
      });
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Utilisateur modifié",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de modification",
      });
    }
  };

  // ✅ ÉTAPE 5: Remplacer handleDelete
  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer cet agent définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Membre retiré",
          });
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Échec de suppression",
          });
        }
      },
    });
  };

  // ✅ ÉTAPE 6: Remplacer handleGrantAccess
  const handleGrantAccess = async (payload: any[]) => {
    try {
      if (!payload || payload.length === 0) {
        toast.current?.show({
          severity: "warn",
          summary: "Attention",
          detail: "Aucun accès sélectionné",
        });
        return;
      }

      console.log("📦 Payload envoyé:", payload);
      await grantAccessMutation.mutateAsync(payload);

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${payload.length} accès ajoutés avec succès`,
      });

      setAccesUser(false);
    } catch (e: any) {
      console.error("❌ Erreur grantAccess:", e);
      const errorMessage =
        e.response?.data?.message || "Impossible d'appliquer les accès";
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: errorMessage,
      });
    }
  };

  // Filtrer, trier et paginer (inchangé)
  const filteredUsers = useMemo(() => {
    return allUser.filter((u) => {
      const matchesSearch = [u.nom, u.prenom, u.telephone]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      const userDroitId = typeof u.droit === "object" ? u.droit?.id : u.droit;
      const matchesDroit =
        !selectedDroit || String(userDroitId) === String(selectedDroit);

      return matchesSearch && matchesDroit;
    });
  }, [allUser, query, selectedDroit]);

  const profilOption = [
    { label: "Tous les profils", value: null },
    ...droit.map((x) => ({
      label: x.libelle,
      value: x.id,
    })),
  ];

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aVal = String(a[champDeTrie] || "").toLowerCase();
      const bVal = String(b[champDeTrie] || "").toLowerCase();
      return ordreDeTrie === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredUsers, champDeTrie, ordreDeTrie]);

  const paginatedUser = useMemo(() => {
    return sortedUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [sortedUsers, currentPage, itemsPerPage]);

  // ✅ ÉTAPE 7: Gérer les états de chargement/erreur
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600 p-8">
          <XCircle size={48} className="mx-auto mb-4" />
          <p>Erreur de chargement: {error.message}</p>
          <Button
            label="Réessayer"
            onClick={() => refetch()}
            className="mt-4"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header Section (inchangé) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-emerald-800 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Gestion des <span className="text-emerald-600">Agent</span>
              </h1>
            </div>
          </div>
          <div>
            <p className="text-slate-500 font-medium mt-5 ml-5">
              Consultez et gérez les accès des agents à platforme (
              {allUser.length})
            </p>
          </div>
        </div>

        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        >
          <UserPlus size={20} className="mr-2" />
          <span className="font-bold">Nouveau membre</span>
        </Button>
      </div>

      {/* Filter Bar (inchangé) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, téléphone..."
            value={query}
          />
        </div>

        <div className="w-64">
          <Dropdown
            value={selectedDroit}
            onChange={(e) => setSelectedDroit(e.value)}
            options={profilOption}
            placeholder="Filtrer par Profil"
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
            showClear
          />
        </div>

        {(query || selectedDroit) && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedDroit(null);
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
          >
            <XCircle size={18} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table Section (inchangé) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">
                Photo
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">
                Num matricule
              </th>
              <th
                className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                onClick={() => {
                  setChampDeTrie("prenom");
                  setOrdreDeTrie(ordreDeTrie === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Prénom <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors"
                onClick={() => {
                  setChampDeTrie("nom");
                  setOrdreDeTrie(ordreDeTrie === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Nom <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Profil
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Fonction
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">
                Téléphone
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                Statut
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedUser.map((u) => (
              <tr
                key={u.id}
                onClick={() => {
                  setSelectedUser(u);
                  setDetailsUser(true);
                }}
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
              >
                <td className="px-6 py-4 flex justify-center">
                  <div className="relative">
                    {/* Badge online */}
                    {u.is_on_line && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                    {u.photo_profil ? (
                      <img
                        src={`${BACKEND_URL}/uploads/profiles/${u.photo_profil}`}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                        <Users size={20} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {u.num_matricule}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {u.prenom}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{u.nom}</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-100 flex items-center gap-1 w-fit">
                    {typeof u.droit === "object"
                      ? u.droit?.libelle
                      : "Non definie"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg text-sm italic">
                    {u.fonction_details?.libelle || "Non défini"}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {u.telephone}
                </td>
                <td className="px-6 py-4">
                  {u.is_on_line ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      ● En ligne
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                      Hors ligne
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                        setAccesUser(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <FolderLock size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setDetailsUser(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(u);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(u.id as any);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals (inchangés) */}
      <UserForm
        visible={formVisible}
        onHide={() => {
          setEditing(null);
          setFormVisible(false);
        }}
        onSubmit={editing ? onEdit : onCreate}
        refresh={() => {}} // ✅ PLUS BESOIN de refresh !
        initial={editing || undefined}
        title={editing ? "Modifier le membre" : "Ajouter un nouveau membre"}
        droits={droit}
      />

      <UserDetails
        visible={detailsUser}
        onHide={() => {
          setDetailsUser(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onRefresh={() => refetch()} // ✅ Utiliser refetch
        onEditAccess={(access) => {
          console.log("Éditer l'accès:", access);
          setDetailsUser(false);
          setAccesUser(true);
        }}
      />

      <UserAcces
        visible={accesUser}
        onHide={() => setAccesUser(false)}
        onSubmit={handleGrantAccess}
        agentId={Number(selectedUser?.id)}
        initial={selectedUser?.agent_access || []}
        title="Gestion des accès"
      />
    </Layout>
  );
}
