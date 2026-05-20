// src/pages/destinataires/DestinatairesExternesPage.tsx
import React, { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import {
  Building2,
  Send,
  Search,
  Plus,
  Trash2,
  XCircle,
  RefreshCw,
  Eye,
  Pencil,
} from "lucide-react";
import {
  useDestinatairesExternes,
  useDeleteDestinataireExterne,
} from "../../hooks/destinataireExterne";
import { DestinataireExterne } from "../../interfaces/destinataireExterne";
import DestinatairesExternesForm from "./DestinatairesExternesForm";
import DestinatairesExternesDetails from "./DestinatairesExternesDetails";

const DestinatairesExternesPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const {
    data: destinataires = [],
    isLoading,
    error,
    refetch,
  } = useDestinatairesExternes();
  const deleteMutation = useDeleteDestinataireExterne();

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingDestinataire, setEditingDestinataire] =
    useState<DestinataireExterne | null>(null);
  const [selectedDestinataire, setSelectedDestinataire] =
    useState<DestinataireExterne | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const openNew = () => {
    setEditingDestinataire(null);
    setFormVisible(true);
  };

  const openEdit = (destinataire: DestinataireExterne) => {
    setEditingDestinataire(destinataire);
    setFormVisible(true);
  };

  const openDetails = (destinataire: DestinataireExterne) => {
    setSelectedDestinataire(destinataire);
    setDetailsVisible(true);
  };

  const handleDelete = (id: number, nom: string) => {
    confirmDialog({
      message: `Supprimer "${nom}" ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Destinataire supprimé avec succès",
          });
          refetch();
        } catch (error: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: error.response?.data?.message || error.message,
          });
        }
      },
    });
  };

  const nomBodyTemplate = (rowData: DestinataireExterne) => {
    if (rowData.type === "PERSONNE") {
      return `${rowData.nom || ""} ${rowData.prenom || ""}`.trim() || "-";
    }
    return rowData.raison_sociale || "-";
  };

  const typeBodyTemplate = (rowData: DestinataireExterne) => {
    if (rowData.type === "PERSONNE") {
      return (
        <Tag
          value="Personne"
          severity="info"
          className="px-3 py-1 rounded-lg text-sm font-semibold"
        />
      );
    }
    return (
      <Tag
        value="Structure"
        severity="success"
        className="px-3 py-1 rounded-lg text-sm font-semibold"
      />
    );
  };

  const actionBodyTemplate = (rowData: DestinataireExterne) => {
    const displayName =
      rowData.type === "PERSONNE"
        ? `${rowData.nom || ""} ${rowData.prenom || ""}`.trim()
        : rowData.raison_sociale || "";
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => openDetails(rowData)}
          className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
          title="Voir détails"
        >
          <Eye size={20} />
        </button>
        <button
          onClick={() => openEdit(rowData)}
          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
          title="Modifier"
        >
          <Pencil size={20} />
        </button>
        <button
          onClick={() =>
            handleDelete(
              rowData.iddestinataire_externe,
              displayName || "cet élément",
            )
          }
          className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
          title="Supprimer"
        >
          <Trash2 size={20} />
        </button>
      </div>
    );
  };

  const filteredData = React.useMemo(() => {
    return destinataires.filter((d: DestinataireExterne) =>
      `${d.nom || ""} ${d.prenom || ""} ${d.raison_sociale || ""} ${d.email || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [destinataires, query]);

  const paginated = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 text-center px-6">
          <XCircle size={72} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Erreur de chargement
          </h2>
          <p className="text-slate-600 mb-8 max-w-md">
            {error.message || "Impossible de charger les destinataires."}
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <Send size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Gestion des Destinataires Externes
            </h1>
            <p className="text-slate-500 font-medium">
              Personnes ou structures qui reçoivent des courriers
            </p>
          </div>
        </div>
        <Button
          label="Nouveau destinataire"
          icon={<Plus size={20} className="mr-2" />}
          onClick={openNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
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
            placeholder="Rechercher par nom, email..."
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4 w-[10%]">ID</th>
                <th className="px-6 py-4 w-[15%]">Type</th>
                <th className="px-6 py-4 w-[30%]">Nom / Raison sociale</th>
                <th className="px-6 py-4 w-[15%]">Téléphone</th>
                <th className="px-6 py-4 w-[20%]">Email</th>
                <th className="px-6 py-4 w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length > 0 ? (
                paginated.map((d: DestinataireExterne) => (
                  <tr
                    key={d.iddestinataire_externe}
                    className="hover:bg-emerald-50/30 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        {d.iddestinataire_externe}
                      </span>
                    </td>
                    <td className="px-6 py-4">{typeBodyTemplate(d)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {nomBodyTemplate(d)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {d.telephone || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {d.email ? (
                        <a
                          href={`mailto:${d.email}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {d.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">{actionBodyTemplate(d)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <Send size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">
                      Aucun destinataire externe trouvé
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Pagination avec le composant réutilisable */}
      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modale Formulaire */}
      <DestinatairesExternesForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        destinataire={editingDestinataire}
        onSuccess={() => {
          setFormVisible(false);
          refetch();
        }}
      />

      {/* Modale Détails */}
      <DestinatairesExternesDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        destinataire={selectedDestinataire}
        onEdit={() => {
          setDetailsVisible(false);
          if (selectedDestinataire) {
            openEdit(selectedDestinataire);
          }
        }}
      />
    </Layout>
  );
};

export default DestinatairesExternesPage;
