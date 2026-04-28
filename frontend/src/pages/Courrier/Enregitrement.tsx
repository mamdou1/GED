import React, { useRef, useState, useMemo } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import Pagination from "../../components/layout/Pagination";
import { confirmDialog } from "primereact/confirmdialog";
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

// Composants
import CourrierForm from "./CourrierForm";
import CourrierDetails from "./CourrierDetails";

interface Courrier {
  idcourrier: number;
  reference: string;
  type: "ARRIVE" | "DEPART";
  objet: string;
  statut: string;
  expediteur?: string;
  destinataire?: string;
  date_reception?: string;
  motif_rejet?: string; // ✅ Ajout du motif de rejet
}

export default function Enregitrement() {
  const toast = useRef<Toast>(null);

  const {
    data: allCourriers = [],
    isLoading,
    error,
    refetch,
  } = useCourriers({});

  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editCourrier, setEditCourrier] = useState<Courrier | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredData = useMemo(() => {
    return allCourriers.filter((c: Courrier) =>
      `${c.reference || ""} ${c.objet || ""} ${c.type || ""} ${c.motif_rejet || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [allCourriers, query]);

  const paginated = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        toast.current?.show({
          severity: "success",
          summary: "Supprimé",
          detail: "Courrier supprimé",
        });
        refetch();
      },
    });
  };

  // ✅ Obtenir le libellé du statut
  const getStatutLabel = (statut: string) => {
    const s = (statut || "").toUpperCase();
    if (s === "EN_ATTENTE") return "En attente";
    if (s === "VALIDÉ") return "Validé";
    if (s === "REJETÉ") return "Rejeté";
    if (s === "ATTRIBUÉ") return "Attribué";
    if (s === "EN_COURS") return "En cours";
    if (s === "TRAITE") return "Traité";
    return statut || "En attente";
  };

  // ✅ Obtenir la couleur du statut
  const getStatutSeverity = (statut: string) => {
    const s = (statut || "").toUpperCase();
    if (s === "REJETÉ") return "danger";
    if (s === "VALIDÉ") return "success";
    if (s === "TRAITE") return "success";
    if (s === "EN_COURS" || s === "ATTRIBUÉ") return "warning";
    return "info";
  };

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 text-center px-6">
          <XCircle size={72} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Erreur de chargement
          </h2>
          <p className="text-slate-600 mb-8 max-w-md">
            {error.message || "Impossible de charger les courriers."}
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
              Gestion des Courriers
            </h1>
            <p className="text-slate-500 font-medium">
              Enregistrement, consultation et modification
            </p>
          </div>
        </div>

        <Button
          label="Nouveau courrier"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-emerald-200"
          onClick={() => {
            setEditCourrier(null);
            setShowForm(true);
          }}
        />
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
            placeholder="Rechercher par référence, objet ou motif de rejet..."
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Objet</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Motif de rejet</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length > 0 ? (
                paginated.map((c: Courrier) => (
                  <tr
                    key={c.idcourrier}
                    className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
                    onClick={() => setSelectedCourrier(c)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        {c.reference}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 max-w-xs">
                      <div className="line-clamp-2">{c.objet}</div>
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
                      {c.statut === "REJETÉ" && c.motif_rejet ? (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          <AlertCircle size={14} />
                          <span className="text-sm">{c.motif_rejet}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourrier(c);
                          }}
                          className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Voir détails"
                        >
                          <Eye size={20} />
                        </button>

                        {(c.statut === "EN_ATTENTE" ||
                          c.statut === "REJETÉ") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(c);
                            }}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                            title="Modifier"
                          >
                            <Pencil size={20} />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c.idcourrier);
                          }}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    Aucun courrier trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
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

      <CourrierDetails
        visible={!!selectedCourrier}
        onHide={() => setSelectedCourrier(null)}
        courrier={selectedCourrier}
        onRefresh={refetch}
      />
    </Layout>
  );
}
