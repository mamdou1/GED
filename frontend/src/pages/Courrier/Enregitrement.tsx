// src/pages/courriers/Enregistrement.tsx
import React, { useRef, useState, useMemo } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import { Dialog } from "primereact/dialog";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Pencil,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Hooks
import { useCourriers } from "../../hooks/useCourriers";

// Composants & API
import CourrierForm from "./CourrierForm";
import CourrierDetails from "./CourrierDetails";
import { getCourrierById } from "../../api/courrier";

interface Courrier {
  idcourrier: number;
  reference: string;
  type: "ARRIVE" | "DEPART";
  objet: string;
  statut: string;
  expediteur?: string;
  destinataire?: string;
  date_reception?: string;
  motif_rejet?: string;
}

export default function Enregistrement() {
  const toast = useRef<Toast>(null);

  // Récupération des données via TanStack Query
  const {
    data: allCourriers = [],
    isLoading,
    error,
    refetch,
  } = useCourriers({});

  // États locaux
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(
    null,
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editCourrier, setEditCourrier] = useState<Courrier | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const itemsPerPage = 9;

  // Récupération asynchrone des détails complets depuis l'API
  const handleViewDetail = async (courrier: Courrier) => {
    try {
      setIsLoadingDetails(true);
      const details = await getCourrierById(courrier.idcourrier);
      setSelectedCourrier(details);
      setDetailsVisible(true);
    } catch (err: any) {
      console.error("Erreur chargement détails:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message || "Impossible de charger les détails du courrier",
      });
      // Fallback : Utilisation des données partielles de la liste si l'API échoue
      setSelectedCourrier(courrier);
      setDetailsVisible(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filtrage intelligent
  const filteredData = useMemo(() => {
    return allCourriers.filter((c: Courrier) =>
      `${c.reference || ""} ${c.objet || ""} ${c.type || ""} ${c.motif_rejet || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [allCourriers, query]);

  // Données paginées
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleEdit = (courrier: Courrier) => {
    setEditCourrier(courrier);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditCourrier(null);
    refetch();
    toast.current?.show({
      severity: "success",
      summary: "Succès",
      detail: "Courrier enregistré avec succès",
    });
  };

  const handleDelete = (id: number) => {
    confirmDialog({
      message: "Voulez-vous supprimer définitivement ce courrier ?",
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName:
        "bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl px-4 py-2 text-sm",
      rejectClassName:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl px-4 py-2 text-sm",
      accept: async () => {
        // TODO: Appeler votre endpoint API de suppression ici
        toast.current?.show({
          severity: "success",
          summary: "Supprimé",
          detail: "Le courrier a été supprimé avec succès.",
        });
        refetch();
      },
    });
  };

  // Libellés des statuts
  const getStatutLabel = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case "EN_ATTENTE":
        return "En attente";
      case "VALIDE":
      case "VALIDÉ":
        return "Validé";
      case "REJETE":
      case "REJETÉ":
        return "Rejeté";
      case "ATTRIBUE":
      case "ATTRIBUÉ":
        return "Attribué";
      case "EN_COURS":
        return "En cours";
      case "TRAITE":
      case "TRAITÉ":
        return "Traité";
      default:
        return statut || "En attente";
    }
  };

  // Sévérités des tags de statuts
  const getStatutSeverity = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case "REJETE":
      case "REJETÉ":
        return "danger";
      case "VALIDE":
      case "VALIDÉ":
      case "TRAITE":
      case "TRAITÉ":
        return "success";
      case "EN_COURS":
      case "ATTRIBUE":
      case "ATTRIBUÉ":
        return "warning";
      default:
        return "info";
    }
  };

  // Vue d'erreur de chargement API
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
          <XCircle size={64} className="text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm text-sm">
            {error.message || "Impossible de charger la liste des courriers."}
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
            Chargement des données...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* En-tête / Header */}
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
              Enregistrement, suivi d'avancement et modification des plis
              officiels
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditCourrier(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-3 rounded-xl shadow-md shadow-emerald-100 transition-all hover:shadow-lg active:scale-95 self-start sm:self-center"
        >
          <Plus size={18} />
          Nouveau courrier
        </button>
      </div>

      {/* Zone de Filtrage / Recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <InputText
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/60 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm placeholder:text-slate-400"
            placeholder="Rechercher par référence, objet ou motif..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Conteneur du Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 w-[15%]">Référence</th>
                <th className="px-6 py-4 w-[35%]">Objet</th>
                <th className="px-6 py-4 w-[12%]">Type</th>
                <th className="px-6 py-4 w-[12%]">Statut</th>
                <th className="px-6 py-4 w-[16%]">Motif de rejet</th>
                <th className="px-6 py-4 w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((c: Courrier) => (
                  <tr
                    key={c.idcourrier}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => handleViewDetail(c)}
                  >
                    <td className="px-6 py-4 font-medium">
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100/50">
                        {c.reference}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-xs">
                      <div className="truncate" title={c.objet}>
                        {c.objet}
                      </div>
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
                        value={getStatutLabel(c.statut)}
                        severity={getStatutSeverity(c.statut)}
                        className="rounded-md font-medium text-xs px-2.5 py-0.5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {c.statut?.toUpperCase() === "REJETE" && c.motif_rejet ? (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50/50 border border-rose-100/60 px-2.5 py-1.5 rounded-xl max-w-xs">
                          <AlertCircle size={14} className="shrink-0" />
                          <span
                            className="text-xs font-medium truncate"
                            title={c.motif_rejet}
                          >
                            {c.motif_rejet}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div
                        className="flex items-center justify-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleViewDetail(c)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>

                        {(c.statut === "EN_ATTENTE" ||
                          c.statut === "REJETE" ||
                          c.statut === "REJETÉ") && (
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(c.idcourrier)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 font-medium"
                  >
                    {query
                      ? "Aucun pli ne correspond à vos critères de recherche."
                      : "Aucun courrier enregistré dans le système."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Formulaire d'Ajout / Édition */}
      {showForm && (
        <CourrierForm
          visible={showForm}
          onHide={() => {
            setShowForm(false);
            setEditCourrier(null);
          }}
          courrier={editCourrier}
          onSuccess={handleFormSuccess}
          mode={editCourrier ? "edit" : "add"}
        />
      )}

      {/* Fenêtre des Détails (avec gestionnaire de chargement API asynchrone intégré) */}
      <Dialog
        visible={isLoadingDetails || detailsVisible}
        onHide={() => {
          if (!isLoadingDetails) {
            setDetailsVisible(false);
            setSelectedCourrier(null);
          }
        }}
        header={
          isLoadingDetails
            ? "Chargement des métadonnées..."
            : "Aperçu complet du courrier"
        }
        style={{ width: "90%", maxWidth: "650px" }}
        className="rounded-2xl"
        closable={!isLoadingDetails}
        draggable={false}
        resizable={false}
      >
        {isLoadingDetails ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-100 border-b-emerald-600"></div>
          </div>
        ) : (
          <CourrierDetails
            visible={detailsVisible}
            onHide={() => {
              setDetailsVisible(false);
              setSelectedCourrier(null);
            }}
            courrier={selectedCourrier}
            onRefresh={refetch}
          />
        )}
      </Dialog>
    </Layout>
  );
}
