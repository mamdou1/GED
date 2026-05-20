// src/pages/courriers/CourrierPage.tsx
import React, { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import Pagination from "../../components/layout/Pagination";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import {
  FileText,
  Search,
  Eye,
  Trash2,
  XCircle,
  RefreshCw,
  CheckCircle,
  UserPlus,
} from "lucide-react";

// Hooks TanStack Query
import {
  useCourriers,
  useValiderCourrier,
  useDeleteCourrier,
} from "../../hooks/useCourriers";

// Composants & API
import CourrierDetails from "./CourrierDetails";
import CourrierAttribuer from "./CourrierAttribuer";
import CourrierRejeter from "./CourrierRejeter";
import { getCourrierById } from "../../api/courrier";

// Types principaux
interface Courrier {
  idcourrier: number;
  reference: string;
  type: "ARRIVE" | "DEPART";
  objet: string;
  statut: string;
  expediteur?: string;
  destinataire?: string;
  date_reception?: string;
}

export default function CourrierPage() {
  const toast = useRef<Toast>(null);

  // Queries & Mutations
  const {
    data: allCourriers = [],
    isLoading,
    error,
    refetch,
  } = useCourriers({});
  const validerMutation = useValiderCourrier();
  const deleteMutation = useDeleteCourrier();

  // États UI fondamentaux
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(
    null,
  );
  const [showAttribution, setShowAttribution] = useState(false);
  const [showRejet, setShowRejet] = useState(false);
  const [currentCourrierId, setCurrentCourrierId] = useState<number | null>(
    null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Recherche & Pagination
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Récupération des détails d'un courrier au clic
  const handleOpenDetails = async (courrier: Courrier) => {
    try {
      setIsLoadingDetails(true);
      const details = await getCourrierById(courrier.idcourrier);
      setSelectedCourrier(details);
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails :", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message || "Impossible de charger les détails du courrier",
      });
      setSelectedCourrier(courrier);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filtrage intelligent basé sur la recherche
  const filteredData = React.useMemo(() => {
    return allCourriers.filter((c: Courrier) =>
      `${c.reference || ""} ${c.objet || ""} ${c.type || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [allCourriers, query]);

  // Données paginées
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Validation rapide
  const handleValider = async (courrier: Courrier) => {
    try {
      await validerMutation.mutateAsync(courrier.idcourrier);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Le courrier a été validé avec succès",
      });
      refetch();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Échec de la validation",
        detail: err.message || "Une erreur est survenue",
      });
    }
  };

  // Suppression avec boite de dialogue de confirmation native PrimeReact
  const handleDelete = (id: number) => {
    confirmDialog({
      message:
        "Êtes-vous sûr de vouloir supprimer définitivement ce courrier ?",
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger rounded-xl",
      rejectClassName: "p-button-text rounded-xl text-slate-600",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Le courrier a bien été retiré du système",
          });
          refetch();
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: err.message || "Impossible de supprimer le courrier",
          });
        }
      },
    });
  };

  // Badge couleur dynamique en fonction du statut réel
  const getStatusSeverity = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case "VALIDE":
      case "VALIDÉ":
        return "success";
      case "REJETE":
      case "REJETÉ":
        return "danger";
      case "EN_ATTENTE":
      default:
        return "warning";
    }
  };

  // Gestion des états d'erreur réseau / API
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
          <XCircle size={64} className="text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Erreur de récupération
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm text-sm">
            {error.message || "La connexion avec le serveur a échoué."}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </Layout>
    );
  }

  // Loader global de la page
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-2 justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-emerald-600"></div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Chargement de la base...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Section En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl text-white shadow-md shadow-emerald-100">
            <FileText size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Gestion des Courriers
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Pilotez la validation, le rejet et le routage de vos flux
              documentaires
            </p>
          </div>
        </div>
      </div>

      {/* Barre de Recherche épurée */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <InputText
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/60 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm placeholder:text-slate-400"
            placeholder="Filtrer par référence ou par objet..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Liste / Tableau principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 w-[20%]">Référence</th>
                <th className="px-6 py-4 w-[45%]">Objet</th>
                <th className="px-6 py-4 w-[15%]">Type</th>
                <th className="px-6 py-4 w-[10%]">Statut</th>
                <th className="px-6 py-4 w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((c: Courrier) => (
                  <tr
                    key={c.idcourrier}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100/50">
                        {c.reference}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate">
                      {c.objet}
                    </td>
                    <td className="px-6 py-4">
                      <Tag
                        value={c.type === "ARRIVE" ? "Arrivé" : "Départ"}
                        severity={c.type === "ARRIVE" ? "success" : "info"}
                        className="rounded-md font-medium text-xs px-2.5 py-0.5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Tag
                        value={c.statut || "En attente"}
                        severity={getStatusSeverity(c.statut)}
                        className="rounded-md font-medium text-xs px-2.5 py-0.5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetails(c)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Consulter les détails"
                        >
                          <Eye size={18} />
                        </button>

                        {c.statut === "EN_ATTENTE" && (
                          <>
                            <button
                              onClick={() => handleValider(c)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Valider le courrier"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentCourrierId(c.idcourrier);
                                setShowRejet(true);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Rejeter le courrier"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                        {(c.statut?.toUpperCase() === "VALIDÉ" ||
                          c.statut?.toUpperCase() === "VALIDE") && (
                          <button
                            onClick={() => {
                              setCurrentCourrierId(c.idcourrier);
                              setShowAttribution(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Assigner / Attribuer"
                          >
                            <UserPlus size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(c.idcourrier)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400 font-medium"
                  >
                    Aucun document ne correspond à vos critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination autonome */}
      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modale d'attribution (Logique de data-fetching déplacée à l'intérieur de ce composant) */}
      {showAttribution && (
        <CourrierAttribuer
          visible={showAttribution}
          onHide={() => {
            setShowAttribution(false);
            setCurrentCourrierId(null);
          }}
          courrierId={currentCourrierId}
          onSuccess={() => {
            setShowAttribution(false);
            refetch();
          }}
        />
      )}

      {/* Modale de Rejet */}
      {showRejet && (
        <CourrierRejeter
          visible={showRejet}
          onHide={() => {
            setShowRejet(false);
            setCurrentCourrierId(null);
          }}
          courrierId={currentCourrierId}
          onSuccess={() => {
            setShowRejet(false);
            refetch();
          }}
        />
      )}

      {/* Modale d'attente / Détails */}
      <Dialog
        visible={isLoadingDetails || !!selectedCourrier}
        onHide={() => !isLoadingDetails && setSelectedCourrier(null)}
        header={isLoadingDetails ? "Synchronisation..." : "Détails du pli"}
        style={{ width: "90%", maxWidth: "650px" }}
        className="rounded-2xl"
        closable={!isLoadingDetails}
        draggable={false}
        resizable={false}
      >
        {isLoadingDetails ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-100 border-b-emerald-600"></div>
          </div>
        ) : (
          <CourrierDetails
            visible={!!selectedCourrier}
            onHide={() => setSelectedCourrier(null)}
            courrier={selectedCourrier}
            onRefresh={refetch}
          />
        )}
      </Dialog>
    </Layout>
  );
}
