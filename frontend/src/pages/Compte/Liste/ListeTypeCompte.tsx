// src/pages/Compte/Liste/ListeTypeCompte.tsx
import React, { useMemo, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../../components/layout/Pagination";
import {
  Building2,
  Eye,
  Filter,
  GitCompareArrows,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useDeleteTypeCompte,
  useTypeComptes,
} from "../../../hooks/useTypeComptes";
import { TypeCompte } from "../../../interfaces";
import TypeCompteForm from "../TypeCompteForm";
import TypeCompteMetafieldForm from "../TypeCompteMetafieldForm";
import TypeCompteDetails from "../TypeCompteDetails";
import AssignationTypeDocToTypeCompte from "../../DomentType/AssignationTypeDocToTypeCompte";
import { TypeDocument } from "../../../interfaces"; // ✅ Importer TypeDocument

export default function ListeTypeCompte() {
  const toast = useRef<Toast>(null);
  const { data, isLoading, error, refetch } = useTypeComptes();
  const deleteMutation = useDeleteTypeCompte();

  const [query, setQuery] = useState("");
  const [metaFilter, setMetaFilter] = useState<"all" | "with" | "without">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingType, setEditingType] = useState<TypeCompte | null>(null);
  const [selectedType, setSelectedType] = useState<TypeCompte | null>(null);

  // ✅ AJOUTER ces states pour le modal d'assignation
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTypeForAssign, setSelectedTypeForAssign] =
    useState<TypeDocument | null>(null);

  const [selectedTypeCompte, setSelectedTypeCompte] =
    useState<TypeCompte | null>(null);

  const itemsPerPage = 10;

  const types = data?.data || [];

  const filteredTypes = useMemo(() => {
    let filtered = types;

    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter((type: TypeCompte) => {
        const metaMatch = (type.metaFields || []).some((field) =>
          `${field.label} ${field.name} ${field.field_type}`
            .toLowerCase()
            .includes(searchLower),
        );

        return type.nom.toLowerCase().includes(searchLower) || metaMatch;
      });
    }

    if (metaFilter === "with") {
      filtered = filtered.filter((type: TypeCompte) => {
        return (type.metaFields?.length || 0) > 0;
      });
    }

    if (metaFilter === "without") {
      filtered = filtered.filter((type: TypeCompte) => {
        return (type.metaFields?.length || 0) === 0;
      });
    }

    return filtered;
  }, [types, query, metaFilter]);

  const paginated = filteredTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const openNew = () => {
    setEditingType(null);
    setFormVisible(true);
  };

  const openEdit = (type: TypeCompte) => {
    setEditingType(type);
    setFormVisible(true);
  };

  const openMetaFields = (type: TypeCompte) => {
    setSelectedType(type);
    setMetaVisible(true);
  };

  const openDetails = (type: TypeCompte) => {
    setSelectedType(type);
    setDetailsVisible(true);
  };

  const handleDelete = (type: TypeCompte) => {
    confirmDialog({
      message: `Supprimer le type "${type.nom}" ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(type.id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Type de compte supprimé avec succès",
          });
          refetch();
        } catch (deleteError: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: deleteError.response?.data?.message || deleteError.message,
          });
        }
      },
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center px-6">
        <XCircle size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Erreur de chargement
        </h2>
        <p className="text-slate-600 mb-8 max-w-md">
          {error.message || "Impossible de charger les types de compte."}
        </p>
        <Button
          label="Réessayer"
          icon={<RefreshCw size={20} className="mr-2" />}
          onClick={() => refetch()}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3"
        />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Liste des types de compte
          </h2>
          <p className="text-sm text-slate-500">
            Paramétrez les types et leurs champs de métadonnées.
          </p>
        </div>
        <Button
          label="Nouveau type"
          icon={<Plus size={20} className="mr-2" />}
          onClick={openNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <InputText
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              placeholder="Rechercher par nom ou métadonnées..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              <Filter size={12} className="inline mr-1" />
              Métadonnées
            </label>
            <Dropdown
              value={metaFilter}
              options={[
                { label: "Tous les types", value: "all" },
                { label: "Avec métadonnées", value: "with" },
                { label: "Sans métadonnées", value: "without" },
              ]}
              onChange={(event) => {
                setMetaFilter(event.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          {filteredTypes.length} type(s) trouvé(s)
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4 w-[35%]">Type de compte</th>
                <th className="px-6 py-4 w-[20%]">Comptes</th>
                <th className="px-6 py-4 w-[30%]">Métadonnées</th>
                <th className="px-6 py-4 w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="mx-auto animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((type: TypeCompte) => (
                  <tr
                    key={type.id}
                    className="hover:bg-emerald-50/30 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{type.nom}</p>
                          <p className="text-xs text-slate-400">
                            ID #{type.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Tag
                        value={`${type.comptes?.length || 0} compte(s)`}
                        severity="success"
                        className="px-3 py-1 rounded-lg text-sm font-semibold"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(type.metaFields || []).slice(0, 3).map((field) => (
                          <span
                            key={field.id}
                            className="px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600"
                          >
                            {field.label}
                          </span>
                        ))}
                        {(type.metaFields?.length || 0) > 3 && (
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-500">
                            +{(type.metaFields?.length || 0) - 3}
                          </span>
                        )}
                        {(type.metaFields?.length || 0) === 0 && (
                          <span className="text-sm text-slate-400">
                            Aucun champ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* ✅ Bouton d'assignation - Note: on passe un TypeDocument fictif car ListeTypeCompte n'a pas de TypeDocument */}
                        <button
                          onClick={() => {
                            setSelectedTypeCompte(type);
                            setAssignModalVisible(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Assigner un type de document à un type de compte"
                        >
                          <GitCompareArrows size={18} />
                        </button>
                        <button
                          onClick={() => openMetaFields(type)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Gérer les métadonnées"
                        >
                          <Settings2 size={18} />
                        </button>
                        <button
                          onClick={() => openDetails(type)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openEdit(type)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(type)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                    colSpan={4}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <Building2
                      size={48}
                      className="mx-auto text-slate-200 mb-4"
                    />
                    <p className="text-slate-500 font-medium">
                      Aucun type de compte trouvé
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTypes.length > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTypes.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modales */}
      <TypeCompteForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        initial={editingType}
        refresh={() => {
          setFormVisible(false);
          refetch();
        }}
      />

      <TypeCompteMetafieldForm
        visible={metaVisible}
        onHide={() => setMetaVisible(false)}
        typeCompte={selectedType}
        onChanged={() => refetch()}
      />

      <TypeCompteDetails
        visible={detailsVisible}
        typeCompte={selectedType}
        onHide={() => setDetailsVisible(false)}
      />

      {/* ✅ Modal d'assignation */}
      <AssignationTypeDocToTypeCompte
        visible={assignModalVisible}
        typeCompte={selectedTypeCompte}
        onHide={() => {
          setAssignModalVisible(false);
          setSelectedTypeCompte(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
