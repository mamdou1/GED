// src/pages/courriers/MesCourriers.tsx
import React, { useState, useRef, useMemo } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import Pagination from "../../components/layout/Pagination";
import { Dialog } from "primereact/dialog";
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

// Hooks
import { useMesAttribues } from "../../hooks/useCourriers";

// Composants & API
import CourrierDetails from "./CourrierDetails";
import TraitementCourrierModal from "./TraitementCourrierModal";
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
  nature?: string;
}

export default function MesCourriers() {
  const toast = useRef<Toast>(null);

  // TanStack Query pour récupérer les attributions personnelles
  const {
    data: mesCourriers = [],
    isLoading,
    error,
    refetch,
  } = useMesAttribues();

  // États de gestion des modales et détails
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(
    null,
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [showTraitement, setShowTraitement] = useState(false);
  const [courrierToTraiter, setCourrierToTraiter] = useState<Courrier | null>(
    null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Recherche & Pagination
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Récupération asynchrone des détails complets au clic
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
      // Solution de secours (Fallback) avec les données partielles de la liste
      setSelectedCourrier(courrier);
      setDetailsVisible(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filtrage intelligent
  const filteredData = useMemo(() => {
    return mesCourriers.filter((c: Courrier) =>
      `${c.reference || ""} ${c.objet || ""} ${c.statut || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [mesCourriers, query]);

  // Données segmentées pour la pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleTraiter = (courrier: Courrier) => {
    setCourrierToTraiter(courrier);
    setShowTraitement(true);
  };

  const handleTraitementComplete = () => {
    setShowTraitement(false);
    setCourrierToTraiter(null);
    refetch();
    toast.current?.show({
      severity: "success",
      summary: "Succès",
      detail: "Traitement enregistré avec succès",
    });
  };

  // Couleurs dynamiques basées sur l'état d'avancement du pli
  const getStatutSeverity = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case "TRAITE":
      case "TRAITÉ":
        return "success";
      case "EN_COURS":
        return "warning";
      case "ATTRIBUE":
      case "ATTRIBUÉ":
      case "VALIDE":
      case "VALIDÉ":
        return "info";
      case "REJETE":
      case "REJETÉ":
        return "danger";
      default:
        return "warning";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case "TRAITE":
      case "TRAITÉ":
        return "Traité";
      case "EN_COURS":
        return "En cours";
      case "ATTRIBUE":
      case "ATTRIBUÉ":
        return "Attribué";
      case "VALIDE":
      case "VALIDÉ":
        return "Validé";
      case "REJETE":
      case "REJETÉ":
        return "Rejeté";
      default:
        return statut || "En attente";
    }
  };

  // Rendu de l'état d'erreur réseau ou serveur
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
          <XCircle size={64} className="text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm text-sm">
            {error.message || "Impossible de charger vos courriers attribués."}
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

  // Loader principal de chargement de page
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-2 justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-emerald-600"></div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Chargement de votre espace...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl text-white shadow-md shadow-emerald-100">
            <FileText size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Mes Courriers
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Consultez et traitez les plis officiels qui vous ont été
              directement assignés
            </p>
          </div>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <InputText
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/60 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm placeholder:text-slate-400"
            placeholder="Rechercher par référence ou objet..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Tableau des courriers assignés */}
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
                    <td className="px-6 py-4 text-center">
                      <div
                        className="flex items-center justify-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleViewDetail(c)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Consulter les détails"
                        >
                          <Eye size={18} />
                        </button>

                        {c.statut !== "TRAITE" && c.statut !== "TRAITÉ" && (
                          <button
                            onClick={() => handleTraiter(c)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Traiter le courrier"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
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
                    {query
                      ? "Aucun courrier ne correspond à votre recherche."
                      : "Aucun courrier ne vous est attribué pour le moment."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barre de pagination */}
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

      {/* Modale d'attente lors de la récupération asynchrone / Fenêtre de Détails */}
      <Dialog
        visible={isLoadingDetails || detailsVisible}
        onHide={() => {
          if (!isLoadingDetails) {
            setDetailsVisible(false);
            setSelectedCourrier(null);
          }
        }}
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

      {/* Modale dédiée au formulaire d'enregistrement du traitement */}
      {showTraitement && (
        <TraitementCourrierModal
          visible={showTraitement}
          onHide={() => {
            setShowTraitement(false);
            setCourrierToTraiter(null);
          }}
          courrier={courrierToTraiter}
          onTraitementComplete={handleTraitementComplete}
        />
      )}
    </Layout>
  );
}
