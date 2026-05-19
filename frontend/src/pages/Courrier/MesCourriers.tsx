import React, { useState, useRef, useMemo } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import Pagination from "../../components/layout/Pagination";
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

// Composants
import CourrierDetails from "./CourrierDetails";
import TraitementCourrierModal from "./TraitementCourrierModal";
import { getCourrierById } from "../../api/courrier"; // ✅ IMPORT AJOUTÉ

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

  const {
    data: mesCourriers = [],
    isLoading,
    error,
    refetch,
  } = useMesAttribues();

  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(
    null,
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [showTraitement, setShowTraitement] = useState(false);
  const [courrierToTraiter, setCourrierToTraiter] = useState<Courrier | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const itemsPerPage = 9;

  // ✅ NOUVELLE FONCTION : Ouvre les détails avec appel API
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
      // Fallback : utiliser les données de la liste
      setSelectedCourrier(courrier);
      setDetailsVisible(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ✅ Afficher TOUS les courriers (sans filtre par statut)
  const filteredData = useMemo(() => {
    return mesCourriers.filter((c: Courrier) =>
      `${c.reference || ""} ${c.objet || ""} ${c.statut || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [mesCourriers, query]);

  const paginated = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  // ✅ Fonction pour obtenir la sévérité du statut
  const getStatutSeverity = (statut: string) => {
    if (statut === "TRAITE") return "success";
    if (statut === "EN_COURS") return "warning";
    if (statut === "ATTRIBUE") return "info";
    if (statut === "VALIDE") return "info";
    if (statut === "REJETE") return "danger";
    return "warning";
  };

  // ✅ Fonction pour obtenir le libellé du statut
  const getStatutLabel = (statut: string) => {
    if (statut === "TRAITE") return "Traité";
    if (statut === "EN_COURS") return "En cours";
    if (statut === "ATTRIBUE") return "Attribué";
    if (statut === "VALIDE") return "Validé";
    if (statut === "REJETE") return "Rejeté";
    return statut || "En attente";
  };

  // ✅ Gestion du chargement
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
        <div className="flex flex-col items-center justify-center h-96 text-center px-6">
          <XCircle size={72} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Erreur de chargement
          </h2>
          <p className="text-slate-600 mb-8 max-w-md">
            {error.message || "Impossible de charger vos courriers attribués."}
          </p>
          <Button
            label="Réessayer"
            icon={<RefreshCw size={20} className="mr-2" />}
            onClick={() => refetch()}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Mes Courriers
            </h1>
            <p className="text-slate-500 font-medium">
              Courriers attribués • En cours et traités
            </p>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            placeholder="Rechercher par référence ou objet..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Référence</th>
              <th className="px-6 py-4">Objet</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length > 0 ? (
              paginated.map((c: Courrier) => (
                <tr
                  key={c.idcourrier}
                  className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
                  onClick={() => handleViewDetail(c)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      {c.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 line-clamp-2">
                    {c.objet}
                  </td>
                  <td className="px-6 py-4">
                    <Tag
                      value={c.type === "ARRIVE" ? "Arrivé" : "Départ"}
                      severity={c.type === "ARRIVE" ? "success" : "info"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Tag 
                      value={getStatutLabel(c.statut)} 
                      severity={getStatutSeverity(c.statut)} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="flex items-center justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Bouton Voir détails */}
                      <button
                        onClick={() => handleViewDetail(c)}
                        className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                        title="Voir détails"
                      >
                        <Eye size={20} />
                      </button>

                      {/* Bouton Traiter - visible pour les statuts non traités */}
                      {c.statut !== "TRAITE" && (
                        <button
                          onClick={() => handleTraiter(c)}
                          className="p-3 text-slate-400 hover:text-green-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Traiter le courrier"
                        >
                          <CheckCircle size={20} />
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
                  className="px-6 py-16 text-center text-slate-500"
                >
                  {query
                    ? "Aucun courrier ne correspond à votre recherche."
                    : "Aucun courrier attribué pour le moment."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modale Détails avec chargement */}
      <CourrierDetails
        visible={detailsVisible}
        onHide={() => {
          setDetailsVisible(false);
          setSelectedCourrier(null);
        }}
        courrier={selectedCourrier}
      />

      {/* Modale Traitement */}
      <TraitementCourrierModal
        visible={showTraitement}
        onHide={() => setShowTraitement(false)}
        courrier={courrierToTraiter}
        onTraitementComplete={handleTraitementComplete}
      />
    </Layout>
  );
}