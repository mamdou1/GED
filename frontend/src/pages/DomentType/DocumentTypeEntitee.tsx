import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DocumentTypeDetails from "./DocumentTypeDetails";
import DocumentTypeMetaForm from "./DocumentTypeMetaForm";
import { confirmDialog } from "primereact/confirmdialog";
import DocumentTypeAffectationForm from "./DocumentTypeAffectationForm";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Database,
  Settings,
  Search,
  Layers,
  FilePlus,
  SplinePointer,
  XCircle,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";

import {
  useInitialData,
  useCreateTypeDocument,
  useUpdateTypeDocument,
  useDeleteTypeDocument,
  useAddPiecesToTypeDocument,
  useCreateMetaField,
  useUpdateMetaField,
  useMultipleAffectation,
} from "../../hooks/useTypeDocuments";

import {
  TypeDocument,
  AddPiecesToTypeDocumentPayload,
  Pieces,
  User,
} from "../../interfaces";
import { Dropdown } from "primereact/dropdown";
import TypeDocumentAjoutPieces from "./TypeDocumentAjoutPieces";
import DocumentTypeAffectAndForm from "./DocumentTypeAffectAndForm";
import { useAuth } from "../../context/AuthContext";
import EntityFieldManager from "./EntityFieldManager";

export default function DocumentTypeEntitee() {
  const { user } = useAuth();
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer les useState multiples par useInitialData
  const {
    types = [],
    pieces = [],
    entiteeUn = [],
    entiteeDeux = [],
    entiteeTrois = [],
    optionsEntites = [],
    isLoading,
    error,
    refetch,
  } = useInitialData();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateTypeDocument();
  const updateMutation = useUpdateTypeDocument();
  const deleteMutation = useDeleteTypeDocument();
  const addPiecesMutation = useAddPiecesToTypeDocument();
  const createMetaMutation = useCreateMetaField();
  const updateMetaMutation = useUpdateMetaField();
  const multipleAffectationMutation = useMultipleAffectation();

  // États UI
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [affectationFormVisible, setAffectationFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
  const [entityFieldManagerVisible, setEntityFieldManagerVisible] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>("EntiteeUn");
  const [query, setQuery] = useState("");
  const [formPiecesVisible, setFormPiecesVisible] = useState(false);
  const [selectedTypeDoc, setSelectedTypeDoc] = useState<string | null>(null);
  const [selectedAccordionStructure, setSelectedAccordionStructure] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [expandedStructure, setExpandedStructure] = useState<string | null>(
    null,
  );

  // ✅ ÉTATS PAGINATION
  const [currentStructurePage, setCurrentStructurePage] = useState(1);
  const structuresPerPage = 5;
  const [internalPages, setInternalPages] = useState<Record<string, number>>(
    {},
  );
  const itemsPerPageInternal = 10;

  // Fonctions utilitaires (inchangées)
  const isUserAdmin = (user: User | null): boolean => {
    if (!user) return false;
    const droitLibelle =
      typeof user.droit === "object" ? user.droit?.libelle : user.droit;
    if (!droitLibelle) return false;
    const libelle = droitLibelle.toString().toLowerCase();
    return (
      libelle.includes("admin") ||
      libelle.includes("administrateur") ||
      libelle === "admin" ||
      libelle === "Administrateur"
    );
  };

  const hasAccessToEntity = (typeDoc: TypeDocument): boolean => {
    if (isUserAdmin(user)) return true;

    const userEntityIds = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    if (user?.fonction_details?.entitee_un?.id) {
      userEntityIds.un.add(user.fonction_details.entitee_un.id);
    }
    if (user?.fonction_details?.entitee_deux?.id) {
      userEntityIds.deux.add(user.fonction_details.entitee_deux.id);
    }
    if (user?.fonction_details?.entitee_trois?.id) {
      userEntityIds.trois.add(user.fonction_details.entitee_trois.id);
    }

    user?.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) userEntityIds.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id)
        userEntityIds.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id)
        userEntityIds.trois.add(access.entitee_trois.id);
    });

    if (typeDoc.entitee_trois_id) {
      return userEntityIds.trois.has(typeDoc.entitee_trois_id);
    }
    if (typeDoc.entitee_deux_id && !typeDoc.entitee_trois_id) {
      return userEntityIds.deux.has(typeDoc.entitee_deux_id);
    }
    if (
      typeDoc.entitee_un_id &&
      !typeDoc.entitee_deux_id &&
      !typeDoc.entitee_trois_id
    ) {
      return userEntityIds.un.has(typeDoc.entitee_un_id);
    }
    return false;
  };

  const hasAccessToStructure = (structureName: string): boolean => {
    const isAdmin = isUserAdmin(user);
    if (isAdmin) return true;
    if (structureName === "Type de documents non assignés") return false;

    const userEntityIds = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    if (user?.fonction_details?.entitee_un?.id) {
      userEntityIds.un.add(user.fonction_details.entitee_un.id);
    }

    user?.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) userEntityIds.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id)
        userEntityIds.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id)
        userEntityIds.trois.add(access.entitee_trois.id);
    });

    const foundInOptions = optionsEntites.find((opt) =>
      opt.label?.includes(structureName),
    );

    if (foundInOptions) {
      const value = foundInOptions.value;
      if (!value?.toString().includes("-")) {
        return userEntityIds.un.has(Number(value));
      } else {
        const [prefix, id] = value.split("-");
        const numId = Number(id);
        if (prefix === "E2") return userEntityIds.deux.has(numId);
        if (prefix === "E3") return userEntityIds.trois.has(numId);
      }
    }
    return false;
  };

  const getGroupedData = () => {
    const accessibleTypes = types.filter((t) => hasAccessToEntity(t));

    const filtered = accessibleTypes.filter((t) => {
      const search = query.toLowerCase();
      const matchesSearch =
        t.code.toLowerCase().includes(search) ||
        t.cote.toLowerCase().includes(search) ||
        t.nom.toLowerCase().includes(search);

      if (!selectedTypeDoc) return matchesSearch;

      const e1Id = String(t.entitee_un_id || (t.entitee_un as any)?.id);
      const e2Id = `E2-${t.entitee_deux_id || (t.entitee_deux as any)?.id}`;
      const e3Id = `E3-${t.entitee_trois_id || (t.entitee_trois as any)?.id}`;

      return (
        matchesSearch &&
        (selectedTypeDoc === e1Id ||
          selectedTypeDoc === e2Id ||
          selectedTypeDoc === e3Id)
      );
    });

    const groups: Record<string, TypeDocument[]> = {};

    filtered.forEach((t) => {
      const structureLabel =
        t.entitee_trois?.libelle ||
        t.entitee_deux?.libelle ||
        t.entitee_un?.libelle ||
        "Type de documents non assignés";

      if (!hasAccessToStructure(structureLabel)) return;

      if (!groups[structureLabel]) groups[structureLabel] = [];
      groups[structureLabel].push(t);
    });

    return groups;
  };

  type EntiteeOption = {
    label: string;
    value: string | null;
    titre?: string;
  };

  const filteredOptions = useMemo(() => {
    const isAdmin = isUserAdmin(user);

    if (isAdmin) {
      return (optionsEntites as EntiteeOption[]).filter((opt) => {
        if (opt.value === null) return true;
        const aUnTitre =
          opt.titre && typeof opt.titre === "string" && opt.titre.trim() !== "";
        return aUnTitre;
      });
    }

    const accessibleEntityIds = new Set();

    if (user?.fonction_details?.entitee_un?.id) {
      accessibleEntityIds.add(String(user.fonction_details.entitee_un.id));
    }
    if (user?.fonction_details?.entitee_deux?.id) {
      accessibleEntityIds.add(`E2-${user.fonction_details.entitee_deux.id}`);
    }
    if (user?.fonction_details?.entitee_trois?.id) {
      accessibleEntityIds.add(`E3-${user.fonction_details.entitee_trois.id}`);
    }

    user?.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) {
        accessibleEntityIds.add(String(access.entitee_un.id));
      }
      if (access.entitee_deux?.id) {
        accessibleEntityIds.add(`E2-${access.entitee_deux.id}`);
      }
      if (access.entitee_trois?.id) {
        accessibleEntityIds.add(`E3-${access.entitee_trois.id}`);
      }
    });

    return (optionsEntites as EntiteeOption[]).filter((opt) => {
      if (opt.value === null) return true;
      const aUnTitre =
        opt.titre && typeof opt.titre === "string" && opt.titre.trim() !== "";
      if (!aUnTitre) return false;
      return accessibleEntityIds.has(opt.value);
    });
  }, [optionsEntites, user]);

  const groupedTypes = getGroupedData();

  const paginatedStructures = useMemo(() => {
    const structureNames = Object.keys(groupedTypes);
    const startIndex = (currentStructurePage - 1) * structuresPerPage;
    const endIndex = startIndex + structuresPerPage;
    const paginatedNames = structureNames.slice(startIndex, endIndex);

    const paginated: Record<string, TypeDocument[]> = {};
    paginatedNames.forEach((name) => {
      paginated[name] = groupedTypes[name];
    });

    return paginated;
  }, [groupedTypes, currentStructurePage, structuresPerPage]);

  const totalStructures = Object.keys(groupedTypes).length;

  const getPaginatedDocumentsForStructure = (
    structureName: string,
    documents: TypeDocument[],
  ) => {
    const currentInternalPage = internalPages[structureName] || 1;
    const startIndex = (currentInternalPage - 1) * itemsPerPageInternal;
    const endIndex = startIndex + itemsPerPageInternal;
    const paginatedDocs = documents.slice(startIndex, endIndex);

    return {
      documents: paginatedDocs,
      totalDocuments: documents.length,
      currentPage: currentInternalPage,
      totalPages: Math.ceil(documents.length / itemsPerPageInternal),
    };
  };

  const handleInternalPageChange = (structureName: string, page: number) => {
    setInternalPages((prev) => ({
      ...prev,
      [structureName]: page,
    }));
  };

  useEffect(() => {
    setCurrentStructurePage(1);
    setInternalPages({});
  }, [query, selectedTypeDoc]);

  const handleSubmit = async (formData: {
    code: string;
    nom: string;
    cote: string;
  }) => {
    try {
      if (editing?.id) {
        await updateMutation.mutateAsync({
          id: String(editing.id),
          data: formData,
        });
        toast.current?.show({ severity: "success", summary: "Mis à jour" });
      } else {
        let payload: any = { ...formData };

        if (selectedTypeDoc) {
          const cleanId = Number(
            selectedTypeDoc.replace("E2-", "").replace("E3-", ""),
          );

          const n1 = entiteeUn.find(
            (x) => x.id === cleanId && !selectedTypeDoc.includes("E"),
          );
          const n2 = entiteeDeux.find(
            (x) => x.id === cleanId && selectedTypeDoc.includes("E2"),
          );
          const n3 = entiteeTrois.find(
            (x) => x.id === cleanId && selectedTypeDoc.includes("E3"),
          );

          if (n1) {
            payload.entitee_un_id = n1.id;
          } else if (n2) {
            payload.entitee_un_id = n2.entitee_un_id;
            payload.entitee_deux_id = n2.id;
          } else if (n3) {
            const parentN2 = entiteeDeux.find(
              (x) => x.id === n3.entitee_deux_id,
            );
            payload.entitee_un_id = parentN2?.entitee_un_id;
            payload.entitee_deux_id = n3.entitee_deux_id;
            payload.entitee_trois_id = n3.id;
          }
        }

        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Créé avec succès",
          detail: payload.entitee_un_id
            ? "Affectation automatique réussie"
            : "Document générique créé",
        });
      }

      setFormVisible(false);
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Erreur" });
    }
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce type de document définitivement ? Cette action est irréversible.",
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
            summary: "Succès",
            detail: "Type de document supprimé avec succès",
          });
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Suppression impossible",
            detail:
              "Ce type de document ne peut pas être supprimé car il contient des documents ou des pièces associées.",
            life: 5000,
          });
        }
      },
    });
  };

  const handleMetaSubmit = async (fieldsPayload: any[]) => {
    if (!selected?.id) return;
    try {
      for (const field of fieldsPayload) {
        if (field.id) {
          await updateMetaMutation.mutateAsync({ id: field.id, field });
        } else {
          await createMetaMutation.mutateAsync({
            typeId: selected.id,
            field,
          });
        }
      }
      toast.current?.show({
        severity: "success",
        summary: "Métadonnées à jour",
      });
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Erreur" });
    }
  };

  const onAddPieces = async (
    typeId: string,
    payload: AddPiecesToTypeDocumentPayload,
  ) => {
    try {
      await addPiecesMutation.mutateAsync({ typeId, payload });
      toast.current?.show({ severity: "success", summary: "Pièces ajoutées" });
      setFormPiecesVisible(false);
    } catch (err) {
      /* erreur */
    }
  };

  const handleAffectationSubmit = async (payload: any) => {
    try {
      if (selected?.id) {
        await updateMutation.mutateAsync({
          id: String(selected.id),
          data: payload,
        });
        toast.current?.show({
          severity: "success",
          summary: "Affectation mise à jour",
        });
        setAffectationFormVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMultipleAffectation = async (typeIds: string[]) => {
    try {
      if (!selectedTypeDoc) return;

      let structureData: any = {
        entitee_un_id: null,
        entitee_deux_id: null,
        entitee_trois_id: null,
      };

      const [prefix, rawId] = selectedTypeDoc.split("-");
      const targetId = Number(rawId);

      if (prefix === "E1") {
        const n1 = entiteeUn.find((x) => x.id === targetId);
        if (n1) structureData.entitee_un_id = n1.id;
      } else if (prefix === "E2") {
        const n2 = entiteeDeux.find((x) => x.id === targetId);
        if (n2) {
          structureData.entitee_un_id = n2.entitee_un_id;
          structureData.entitee_deux_id = n2.id;
        }
      } else if (prefix === "E3") {
        const n3 = entiteeTrois.find((x) => x.id === targetId);
        if (n3) {
          const parentN2 = entiteeDeux.find((x) => x.id === n3.entitee_deux_id);
          structureData.entitee_un_id = parentN2?.entitee_un_id;
          structureData.entitee_deux_id = n3.entitee_deux_id;
          structureData.entitee_trois_id = n3.id;
        }
      }

      await multipleAffectationMutation.mutateAsync({ typeIds, structureData });

      toast.current?.show({
        severity: "success",
        summary: "Affectation réussie",
      });
    } catch (error) {
      console.error("Erreur affectation:", error);
    }
  };

  const handleStructureClick = (structureName: string) => {
    setExpandedStructure(
      expandedStructure === structureName ? null : structureName,
    );

    if (structureName !== "Type de documents non assignés") {
      const foundOption = filteredOptions.find(
        (opt) =>
          opt.label?.includes(structureName) ||
          opt.label?.includes(`🏢 ${structureName}`) ||
          opt.label?.includes(`📂 ${structureName}`) ||
          opt.label?.includes(`📄 ${structureName}`),
      );

      if (foundOption && foundOption.value !== null) {
        setSelectedAccordionStructure({
          label: foundOption.label,
          value: foundOption.value,
        });
        setSelectedTypeDoc(foundOption.value);
      }
    }
  };

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
              <Layers size={24} />
            </div>
            Types par Structure
          </h1>
        </div>
        <Button
          label="Nouveau Type"
          icon={<Plus size={20} />}
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-md font-bold"
        />
      </div>

      {/* Barre de recherche et filtre */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un document..."
            value={query}
          />
        </div>
        <Dropdown
          value={selectedTypeDoc}
          onChange={(e) => setSelectedTypeDoc(e.value)}
          options={filteredOptions}
          placeholder="Filtrer par structure"
          className="w-64 bg-slate-50 border-slate-200 rounded-xl"
          showClear
          filter
        />
      </div>

      {/* Liste des types avec pagination des accordéons */}
      <div className="space-y-4">
        {Object.entries(paginatedStructures).length > 0 ? (
          <>
            {Object.entries(paginatedStructures).map(
              ([structureName, docs]) => {
                const {
                  documents: paginatedDocs,
                  totalDocuments,
                  currentPage: internalPage,
                  totalPages,
                } = getPaginatedDocumentsForStructure(structureName, docs);

                const isNonAssigned =
                  structureName === "Type de documents non assignés";

                return (
                  <div
                    key={structureName}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                      selectedAccordionStructure?.label?.includes(structureName)
                        ? "border-emerald-500 ring-2 ring-emerald-200"
                        : "border-slate-100"
                    }`}
                  >
                    <button
                      onClick={() => handleStructureClick(structureName)}
                      className={`w-full flex items-center justify-between p-5 transition-all ${
                        expandedStructure === structureName
                          ? "bg-emerald-50/50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            expandedStructure === structureName
                              ? "bg-emerald-500 text-white"
                              : selectedAccordionStructure?.label.includes(
                                    structureName,
                                  )
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Database size={20} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-bold ${
                                expandedStructure === structureName
                                  ? "text-emerald-800"
                                  : selectedAccordionStructure?.label.includes(
                                        structureName,
                                      )
                                    ? "text-emerald-700"
                                    : "text-slate-700"
                              }`}
                            >
                              {structureName}
                            </h3>
                            {selectedAccordionStructure?.label.includes(
                              structureName,
                            ) && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                                Structure active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {totalDocuments} document(s)
                          </p>
                        </div>
                      </div>
                      {expandedStructure === structureName ? (
                        <ChevronDown size={20} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={20} className="text-slate-400" />
                      )}
                    </button>

                    {expandedStructure === structureName && (
                      <div className="border-t border-slate-50">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50/50">
                              <tr>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-left">
                                  Code
                                </th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-left">
                                  Cote
                                </th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-left">
                                  Libellé
                                </th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-center">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {paginatedDocs.map((t) => (
                                <tr
                                  key={t.id}
                                  onClick={() => {
                                    setSelected(t);
                                    setDetailsVisible(true);
                                  }}
                                  className="cursor-pointer hover:bg-slate-100/80 transition-colors"
                                >
                                  <td className="p-4">
                                    <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded-md text-xs font-bold">
                                      {t.code}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">
                                      {t.cote}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                      <FileText
                                        size={25}
                                        className="text-emerald-500"
                                      />
                                      {t.nom}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex justify-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          setSelected(t);
                                          setFormPiecesVisible(true);
                                          e.stopPropagation();
                                        }}
                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                                      >
                                        <FilePlus size={25} />
                                      </button>
                                      {isNonAssigned && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelected(t);
                                            if (selectedAccordionStructure) {
                                              setSelectedTypeDoc(
                                                selectedAccordionStructure.value,
                                              );
                                              setAffectationFormVisible(true);
                                            } else {
                                              setAffectationFormVisible(true);
                                            }
                                          }}
                                          className={`p-2 rounded-lg ${
                                            selectedAccordionStructure
                                              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                              : "text-blue-500 hover:bg-blue-50"
                                          }`}
                                          title={
                                            selectedAccordionStructure
                                              ? `Affecter à ${selectedAccordionStructure.label}`
                                              : "Affecter à une structure"
                                          }
                                        >
                                          <SplinePointer size={25} />
                                        </button>
                                      )}

                                      <button
                                        onClick={(e) => {
                                          setEditing(t);
                                          setFormVisible(true);
                                          e.stopPropagation();
                                        }}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                      >
                                        <Pencil size={25} />
                                      </button>
                                      
                                      {/* Bouton Métadonnées de base */}
                                      <button
                                        onClick={(e) => {
                                          setSelected(t);
                                          setMetaVisible(true);
                                          e.stopPropagation();
                                        }}
                                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                                        title="Gérer les champs de base"
                                      >
                                        <Settings size={25} />
                                      </button>

                                      {/* Bouton Personnalisation par entité */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelected(t);
                                          // Déterminer le type d'entité
                                          if (t.entitee_trois_id) {
                                            setSelectedEntityType("EntiteeTrois");
                                          } else if (t.entitee_deux_id) {
                                            setSelectedEntityType("EntiteeDeux");
                                          } else if (t.entitee_un_id) {
                                            setSelectedEntityType("EntiteeUn");
                                          } else {
                                            setSelectedEntityType("EntiteeUn");
                                          }
                                          setEntityFieldManagerVisible(true);
                                        }}
                                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"
                                        title="Personnaliser les champs pour cette entité"
                                      >
                                        <Settings size={25} />
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(String(t.id));
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                      >
                                        <Trash2 size={25} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {totalPages > 1 && (
                          <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                            <div className="flex justify-center items-center">
                              <Pagination
                                currentPage={internalPage}
                                totalItems={totalDocuments}
                                itemsPerPage={itemsPerPageInternal}
                                onPageChange={(page) =>
                                  handleInternalPageChange(structureName, page)
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            )}

            {totalStructures > structuresPerPage && (
              <div className="mt-8 flex justify-center pt-4 border-t border-slate-200">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm text-slate-500">
                    {totalStructures} structures au total
                  </div>
                  <Pagination
                    currentPage={currentStructurePage}
                    totalItems={totalStructures}
                    itemsPerPage={structuresPerPage}
                    onPageChange={setCurrentStructurePage}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
              <Search size={40} />
            </div>
            <p className="text-slate-400 font-medium">
              Aucun document trouvé pour cette sélection.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <DocumentTypeDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        type={selected}
      />
      
      <DocumentTypeMetaForm
        visible={metaVisible}
        onHide={() => setMetaVisible(false)}
        onSubmit={handleMetaSubmit}
        type={selected}
      />
      
      <TypeDocumentAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={onAddPieces}
        initial={selected}
        title={"Pièces à fournir"}
        pieces={pieces}
      />
      
      <DocumentTypeAffectationForm
        visible={affectationFormVisible}
        onHide={() => setAffectationFormVisible(false)}
        onSubmit={handleAffectationSubmit}
        initial={selected}
        title={`Affectation : ${selected?.nom}`}
      />

      <DocumentTypeAffectAndForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmitSingle={handleSubmit}
        onSubmitMultiple={handleMultipleAffectation}
        types={types}
        initial={editing}
        isFiltered={!!selectedAccordionStructure || !!selectedTypeDoc}
        structureLabel={
          selectedAccordionStructure?.label ||
          filteredOptions.find((o) => o.value === selectedTypeDoc)?.label ||
          ""
        }
      />

      {/* Modal pour la personnalisation des champs par entité */}
      <EntityFieldManager
        visible={entityFieldManagerVisible}
        onHide={() => setEntityFieldManagerVisible(false)}
        typeDocumentId={selected?.id}
        entityType={selectedEntityType}
        entityId={
          selected?.entitee_trois_id ||
          selected?.entitee_deux_id ||
          selected?.entitee_un_id ||
          0
        }
        typeDocumentName={selected?.nom}
        entityName={
          selected?.entitee_trois?.libelle ||
          selected?.entitee_deux?.libelle ||
          selected?.entitee_un?.libelle ||
          "Entité"
        }
        onRefresh={() => {
          refetch();
        }}
      />
    </Layout>
  );
}