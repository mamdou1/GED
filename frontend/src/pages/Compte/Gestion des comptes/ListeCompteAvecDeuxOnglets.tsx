// src/pages/Compte/Liste/ListeCompteAvecDeuxOnglet.tsx
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
  CreditCard,
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useClients } from "../../../hooks/useClients";
import { useComptes, useDeleteCompte } from "../../../hooks/useComptes";
import { useTypeComptes } from "../../../hooks/useTypeComptes";
import { Compte } from "../../../interfaces";
import CompteDetails from "../CompteDetails";
import CompteForm from "../CompteForm";

export default function ListeCompteAvecDeuxOnglets() {
  const toast = useRef<Toast>(null);
  const { data: comptesData, isLoading, error, refetch } = useComptes();
  const { data: typesData } = useTypeComptes();
  const { data: clientsData } = useClients();
  const deleteMutation = useDeleteCompte();

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingCompte, setEditingCompte] = useState<Compte | null>(null);
  const [selectedCompte, setSelectedCompte] = useState<Compte | null>(null);
  const [query, setQuery] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedPersonneType, setSelectedPersonneType] = useState<
    "Personne physique" | "Personne morale" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const comptes = comptesData?.data || [];
  const types = typesData?.data || [];
  const clients = clientsData?.data || [];

  const getClientDisplayName = (client: any): string => {
    if (!client) return "-";
    if (client.raison_sociale) return client.raison_sociale;
    return `${client.prenom || ""} ${client.nom || ""}`.trim() || "-";
  };

  const getCompteLabel = (compte: Compte): string => {
    const firstValue = compte.values?.find((value) => value.value)?.value;
    return firstValue || `Compte #${compte.id}`;
  };

  const getClientConserne = (client: any) => {
    if (!client) return null;
    if (client.conserne) return client.conserne;
    return client.raison_sociale ? "Personne morale" : "Personne physique";
  };

  const filteredComptes = useMemo(() => {
    let filtered = comptes;

    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter((compte: Compte) => {
        const valuesMatch = (compte.values || []).some((value) =>
          `${value.metaField?.label || ""} ${value.value || ""}`
            .toLowerCase()
            .includes(searchLower),
        );

        return (
          getCompteLabel(compte).toLowerCase().includes(searchLower) ||
          (compte.type_compte?.nom || "").toLowerCase().includes(searchLower) ||
          getClientDisplayName(compte.client)
            .toLowerCase()
            .includes(searchLower) ||
          valuesMatch
        );
      });
    }

    if (selectedTypeId) {
      filtered = filtered.filter(
        (compte: Compte) => compte.type_compte_id === selectedTypeId,
      );
    }

    if (selectedClientId) {
      filtered = filtered.filter(
        (compte: Compte) => compte.client_id === selectedClientId,
      );
    }

    if (selectedPersonneType) {
      filtered = filtered.filter(
        (compte: Compte) =>
          getClientConserne(compte.client) === selectedPersonneType,
      );
    }

    return filtered;
  }, [comptes, query, selectedTypeId, selectedClientId, selectedPersonneType]);

  const paginated = filteredComptes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const typeOptions = [
    { label: "Tous les types", value: null },
    ...types.map((type: any) => ({ label: type.nom, value: type.id })),
  ];

  const clientOptions = [
    { label: "Tous les clients", value: null },
    ...clients.map((client: any) => ({
      label: getClientDisplayName(client),
      value: client.id,
    })),
  ];

  const openNew = () => {
    setEditingCompte(null);
    setFormVisible(true);
  };

  const openEdit = (compte: Compte) => {
    setEditingCompte(compte);
    setFormVisible(true);
  };

  const openDetails = (compte: Compte) => {
    setSelectedCompte(compte);
    setDetailsVisible(true);
  };

  const handleDelete = (compte: Compte) => {
    confirmDialog({
      message: `Supprimer "${getCompteLabel(compte)}" ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(compte.id);
          toast.current?.show({
            severity: "success",
            summary: "Supprime",
            detail: "Compte supprime avec succes",
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
          {error.message || "Impossible de charger les comptes."}
        </p>
        <Button
          label="Reessayer"
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
            Liste des comptes
          </h2>
          <p className="text-sm text-slate-500">
            Recherche et gestion des comptes clients.
          </p>
        </div>
        <Button
          label="Nouveau compte"
          icon={<Plus size={20} className="mr-2" />}
          onClick={openNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              { label: "Tous", value: null },
              { label: "Personne physique", value: "Personne physique" },
              { label: "Personne morale", value: "Personne morale" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setSelectedPersonneType(tab.value);
                setCurrentPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                selectedPersonneType === tab.value
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <InputText
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              placeholder="Rechercher par client, type ou metadonnees..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full sm:w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              <Filter size={12} className="inline mr-1" />
              Type de compte
            </label>
            <Dropdown
              value={selectedTypeId}
              options={typeOptions}
              onChange={(e) => {
                setSelectedTypeId(e.value);
                setCurrentPage(1);
              }}
              placeholder="Tous les types"
              className="w-full bg-slate-50 border-slate-200 rounded-xl"
              showClear
            />
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              <Building2 size={12} className="inline mr-1" />
              Client
            </label>
            <Dropdown
              value={selectedClientId}
              options={clientOptions}
              onChange={(e) => {
                setSelectedClientId(e.value);
                setCurrentPage(1);
              }}
              placeholder="Tous les clients"
              className="w-full bg-slate-50 border-slate-200 rounded-xl"
              showClear
              filter
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          {filteredComptes.length} compte(s) trouve(s)
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4 w-[25%]">Compte</th>
                <th className="px-6 py-4 w-[20%]">Type</th>
                <th className="px-6 py-4 w-[30%]">Client</th>
                <th className="px-6 py-4 w-[15%]">Metadonnees</th>
                <th className="px-6 py-4 w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((compte: Compte) => (
                  <tr
                    key={compte.id}
                    className="hover:bg-emerald-50/30 transition-all group cursor-pointer"
                    onClick={() => openDetails(compte)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-sm">
                        {getCompteLabel(compte)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Tag
                        value={compte.type_compte?.nom || "-"}
                        severity="info"
                        className="px-3 py-1 rounded-lg text-sm font-semibold"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {getClientDisplayName(compte.client)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {compte.values?.length || 0} champ(s)
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetails(compte)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Voir details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openEdit(compte)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(compte)}
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
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <CreditCard
                      size={48}
                      className="mx-auto text-slate-200 mb-4"
                    />
                    <p className="text-slate-500 font-medium">
                      Aucun compte trouve
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredComptes.length > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredComptes.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <CompteForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        compte={editingCompte}
        onSuccess={() => {
          setFormVisible(false);
          refetch();
        }}
      />

      <CompteDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        compte={selectedCompte}
        onEdit={() => {
          setDetailsVisible(false);
          if (selectedCompte) openEdit(selectedCompte);
        }}
        onRefresh={refetch}
      />
    </div>
  );
}
