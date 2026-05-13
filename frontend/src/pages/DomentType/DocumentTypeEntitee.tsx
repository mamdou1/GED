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
  useAddPieceToEntityTypeDocument,
  useRemovePieceFromEntityTypeDocument,
} from "../../hooks/useTypeDocuments";

import {
  TypeDocument,
  AddPiecesToTypeDocumentPayload,
  User,
} from "../../interfaces";
import { Dropdown } from "primereact/dropdown";
import TypeDocumentAjoutPieces from "./TypeDocumentAjoutPieces";
import DocumentTypeAffectAndForm from "./DocumentTypeAffectAndForm";
import { useAuth } from "../../context/AuthContext";
import EntiteeAjoutTypeDocument from "./EntiteeAjoutTypeDocument";
import TypeDocumentAjoutPiecesEntytee from "./TypeDocumentAjoutPiecesEntytee";

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
  const addPieceToEntityMutation = useAddPieceToEntityTypeDocument();
  const removePieceFromEntityMutation = useRemovePieceFromEntityTypeDocument();

  // États UI
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [affectationFormVisible, setAffectationFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
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
  // Pagination des accordéons (structures)
  const [currentStructurePage, setCurrentStructurePage] = useState(1);
  const structuresPerPage = 5; // Nombre d'accordéons par page

  // Pagination interne pour chaque accordéon (stockée par nom de structure)
  const [internalPages, setInternalPages] = useState<Record<string, number>>(
    {},
  );
  const itemsPerPageInternal = 10; // Nombre de documents par page dans un accordéon

  const [entiteeModalVisible, setEntiteeModalVisible] = useState(false);
  const [selectedEntityForTypes, setSelectedEntityForTypes] = useState<{
    id: number;
    type: "entiteeUn" | "entiteeDeux" | "entiteeTrois";
    label: string;
  } | null>(null);

  const handleOpenEntiteeTypes = (
    entityId: number,
    entityType: "entiteeUn" | "entiteeDeux" | "entiteeTrois",
    entityLabel: string,
  ) => {
    setSelectedEntityForTypes({
      id: entityId,
      type: entityType,
      label: entityLabel,
    });
    setEntiteeModalVisible(true);
  };
  const [selectedAccordionEntity, setSelectedAccordionEntity] = useState<{
    label: string;
    value: string;
    id: number;
    type: "entiteeUn" | "entiteeDeux" | "entiteeTrois";
  } | null>(null);

  const [fieldManagerVisible, setFieldManagerVisible] = useState(false);

  // ✅ AJOUTER la fonction convertEntityType adaptée
  type EntityTypeApi = "entitee_un" | "entitee_deux" | "entitee_trois";

  const convertEntityType = (type: string | undefined): EntityTypeApi => {
    switch (type) {
      case "entiteeUn":
        return "entitee_un";
      case "entiteeDeux":
        return "entitee_deux";
      case "entiteeTrois":
        return "entitee_trois";
      default:
        return "entitee_un";
    }
  };

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

    // ✅ Vérifier via les tableaux de relation
    const hasAccessE3 = (typeDoc.entitee_trois || []).some((e: any) =>
      userEntityIds.trois.has(e.id),
    );
    if (hasAccessE3) return true;

    const hasAccessE2 = (typeDoc.entitee_deux || []).some((e: any) =>
      userEntityIds.deux.has(e.id),
    );
    if (hasAccessE2) return true;

    const hasAccessE1 = (typeDoc.entitee_un || []).some((e: any) =>
      userEntityIds.un.has(e.id),
    );
    if (hasAccessE1) return true;

    // Si aucun accès spécifique mais le doc n'est assigné à aucune entité
    if (
      (!typeDoc.entitee_un || typeDoc.entitee_un.length === 0) &&
      (!typeDoc.entitee_deux || typeDoc.entitee_deux.length === 0) &&
      (!typeDoc.entitee_trois || typeDoc.entitee_trois.length === 0)
    ) {
      return true; // Documents non assignés visibles par tous
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

  const getAllEntitiesAsGroups = () => {
    const groups: Record<string, TypeDocument[]> = {};

    entiteeTrois.forEach((e3) => {
      if (hasAccessToStructure(e3.libelle)) {
        groups[e3.libelle] = [];
      }
    });

    entiteeDeux.forEach((e2) => {
      if (hasAccessToStructure(e2.libelle)) {
        groups[e2.libelle] = [];
      }
    });

    entiteeUn.forEach((e1) => {
      if (hasAccessToStructure(e1.libelle)) {
        groups[e1.libelle] = [];
      }
    });

    groups["Type de documents non assignés"] = [];

    return groups;
  };

  const getGroupedData = () => {
    if (!types || types.length === 0) {
      return getAllEntitiesAsGroups();
    }

    const accessibleTypes = types.filter((t) => hasAccessToEntity(t));

    const filtered = accessibleTypes.filter((t) => {
      const search = query.toLowerCase();
      const matchesSearch =
        t.code.toLowerCase().includes(search) ||
        (t.cote || "").toLowerCase().includes(search) ||
        t.nom.toLowerCase().includes(search);

      if (!selectedTypeDoc) return matchesSearch;

      // ✅ Récupérer les IDs depuis les tableaux de relation
      const e1Ids = (t.entitee_un || []).map((e: any) => String(e.id));
      const e2Ids = (t.entitee_deux || []).map((e: any) => `E2-${e.id}`);
      const e3Ids = (t.entitee_trois || []).map((e: any) => `E3-${e.id}`);

      const allEntityIds = [...e1Ids, ...e2Ids, ...e3Ids];

      return matchesSearch && allEntityIds.includes(selectedTypeDoc);
    });

    // ✅ CRÉER TOUS LES GROUPES VIDES D'ABORD
    const groups: Record<string, TypeDocument[]> = {};

    entiteeTrois.forEach((e3) => {
      if (hasAccessToStructure(e3.libelle)) {
        groups[e3.libelle] = [];
      }
    });

    entiteeDeux.forEach((e2) => {
      if (hasAccessToStructure(e2.libelle)) {
        groups[e2.libelle] = [];
      }
    });

    entiteeUn.forEach((e1) => {
      if (hasAccessToStructure(e1.libelle)) {
        groups[e1.libelle] = [];
      }
    });

    // Groupe pour les non assignés
    const unassignedDocs = filtered.filter(
      (t) =>
        (!t.entitee_un || t.entitee_un.length === 0) &&
        (!t.entitee_deux || t.entitee_deux.length === 0) &&
        (!t.entitee_trois || t.entitee_trois.length === 0),
    );
    if (unassignedDocs.length > 0 || !selectedTypeDoc) {
      groups["Type de documents non assignés"] = unassignedDocs;
    }

    // ✅ Remplir les groupes avec les documents (via les tableaux de relation)
    filtered.forEach((t) => {
      const assignedStructures = new Set<string>();

      // Ajouter les libellés de entiteeTrois
      if (t.entitee_trois && t.entitee_trois.length > 0) {
        t.entitee_trois.forEach((e3: any) => {
          const found = entiteeTrois.find((item) => item.id === e3.id);
          if (found) assignedStructures.add(found.libelle);
        });
      }

      // Ajouter les libellés de entiteeDeux
      if (t.entitee_deux && t.entitee_deux.length > 0) {
        t.entitee_deux.forEach((e2: any) => {
          const found = entiteeDeux.find((item) => item.id === e2.id);
          if (found) assignedStructures.add(found.libelle);
        });
      }

      // Ajouter les libellés de entiteeUn
      if (t.entitee_un && t.entitee_un.length > 0) {
        t.entitee_un.forEach((e1: any) => {
          const found = entiteeUn.find((item) => item.id === e1.id);
          if (found) assignedStructures.add(found.libelle);
        });
      }

      // Si aucune structure assignée, mettre dans "non assignés"
      if (assignedStructures.size === 0) {
        assignedStructures.add("Type de documents non assignés");
      }

      // Ajouter le document à chaque structure à laquelle il appartient
      assignedStructures.forEach((structureLabel) => {
        if (hasAccessToStructure(structureLabel)) {
          if (!groups[structureLabel]) {
            groups[structureLabel] = [];
          }
          // Éviter les doublons
          if (!groups[structureLabel].find((doc) => doc.id === t.id)) {
            groups[structureLabel].push(t);
          }
        }
      });
    });

    if (selectedTypeDoc) {
      const filteredGroups: Record<string, TypeDocument[]> = {};
      Object.entries(groups).forEach(([key, docs]) => {
        if (docs.length > 0) filteredGroups[key] = docs;
      });
      return filteredGroups;
    }

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

  // ✅ PAGINATION DES ACCORDÉONS (structures)
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

  // ✅ Fonction pour obtenir les documents paginés d'une structure
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

  // ✅ Fonction pour changer la page interne d'une structure
  const handleInternalPageChange = (structureName: string, page: number) => {
    setInternalPages((prev) => ({
      ...prev,
      [structureName]: page,
    }));
  };

  // Reset des pages quand les filtres changent
  useEffect(() => {
    setCurrentStructurePage(1);
    setInternalPages({});
  }, [query, selectedTypeDoc]);

  // ✅ handleSubmit (inchangé)
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

        // ✅ Pour le many-to-many, on passe les IDs dans des tableaux
        if (selectedTypeDoc) {
          if (!selectedTypeDoc.includes("-")) {
            // EntiteeUn
            payload.entitee_un_ids = [Number(selectedTypeDoc)];
          } else if (selectedTypeDoc.includes("E2-")) {
            const e2Id = Number(selectedTypeDoc.replace("E2-", ""));
            const e2 = entiteeDeux.find((x) => x.id === e2Id);
            payload.entitee_deux_ids = [e2Id];
            if (e2?.entitee_un_id) {
              payload.entitee_un_ids = [e2.entitee_un_id];
            }
          } else if (selectedTypeDoc.includes("E3-")) {
            const e3Id = Number(selectedTypeDoc.replace("E3-", ""));
            const e3 = entiteeTrois.find((x) => x.id === e3Id);
            payload.entitee_trois_ids = [e3Id];
            if (e3?.entitee_deux_id) {
              payload.entitee_deux_ids = [e3.entitee_deux_id];
              const e2 = entiteeDeux.find((x) => x.id === e3.entitee_deux_id);
              if (e2?.entitee_un_id) {
                payload.entitee_un_ids = [e2.entitee_un_id];
              }
            }
          }
        }

        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Créé avec succès",
        });
      }
      setFormVisible(false);
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Erreur" });
    }
  };

  // ✅ handleDelete (inchangé)
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

  // ✅ handleMetaSubmit (inchangé)
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

  // ✅ onAddPieces (inchangé)
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

  const onAddEntityPiece = async (
    entityType: EntityTypeApi, // ✅ Utiliser EntityTypeApi
    entityId: number,
    pieceId: number,
  ) => {
    if (!selected?.id) return;

    try {
      await addPieceToEntityMutation.mutateAsync({
        typeDocumentId: String(selected.id),
        payload: {
          entity_type: entityType,
          entity_id: entityId,
          piece_id: Number(pieceId),
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Pièce ajoutée à l'entité",
      });

      await refetch();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible d'ajouter la pièce",
      });
    }
  };

  const onRemoveEntityPiece = async (
    entityType: EntityTypeApi, // ✅ Utiliser EntityTypeApi
    entityId: number,
    pieceId: number,
  ) => {
    if (!selected?.id) return;

    try {
      await removePieceFromEntityMutation.mutateAsync({
        typeDocumentId: String(selected.id),
        payload: {
          entity_type: entityType,
          entity_id: entityId,
          piece_id: Number(pieceId),
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Pièce retirée de l'entité",
      });

      await refetch();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de retirer la pièce",
      });
    }
  };

  // ✅ handleAffectationSubmit (inchangé)
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

  // ✅ handleMultipleAffectation (inchangé)
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

  // const handleStructureClick = (structureName: string) => {
  //   setExpandedStructure(
  //     expandedStructure === structureName ? null : structureName,
  //   );

  //   if (structureName !== "Type de documents non assignés") {
  //     const foundOption = filteredOptions.find(
  //       (opt) =>
  //         opt.label?.includes(structureName) ||
  //         opt.label?.includes(`🏢 ${structureName}`) ||
  //         opt.label?.includes(`📂 ${structureName}`) ||
  //         opt.label?.includes(`📄 ${structureName}`),
  //     );

  //     if (foundOption && foundOption.value !== null) {
  //       setSelectedAccordionStructure({
  //         label: foundOption.label,
  //         value: foundOption.value,
  //       });
  //       setSelectedTypeDoc(foundOption.value);
  //     }
  //   }
  // };

  const handleStructureClick = (structureName: string) => {
    setExpandedStructure(
      expandedStructure === structureName ? null : structureName,
    );

    if (structureName !== "Type de documents non assignés") {
      // Chercher l'entité correspondante
      let entityId: number | undefined;
      let entityType: "entiteeUn" | "entiteeDeux" | "entiteeTrois" | undefined;

      const foundE3 = entiteeTrois.find((e) => e.libelle === structureName);
      if (foundE3) {
        entityId = foundE3.id;
        entityType = "entiteeTrois";
      }

      if (!entityId) {
        const foundE2 = entiteeDeux.find((e) => e.libelle === structureName);
        if (foundE2) {
          entityId = foundE2.id;
          entityType = "entiteeDeux";
        }
      }

      if (!entityId) {
        const foundE1 = entiteeUn.find((e) => e.libelle === structureName);
        if (foundE1) {
          entityId = foundE1.id;
          entityType = "entiteeUn";
        }
      }

      if (entityId && entityType) {
        setSelectedAccordionEntity({
          label: structureName,
          value:
            entityType === "entiteeUn"
              ? String(entityId)
              : entityType === "entiteeDeux"
                ? `E2-${entityId}`
                : `E3-${entityId}`,
          id: entityId,
          type: entityType,
        });
      }
    }
  };

  // ✅ Gestion des états de chargement/erreur
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
                // Récupérer les documents paginés pour cette structure
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
                    {/* ✅ HEADER DE L'ACCORDÉON */}
                    <div
                      onClick={() => handleStructureClick(structureName)}
                      className={`w-full flex items-center justify-between p-5 transition-all cursor-pointer ${
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

                            {/* ✅ BOUTON GÉRER LES TYPES - maintenant dans une <div> */}
                            {!isNonAssigned && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let entityId: number | undefined;
                                  let entityTypeValue:
                                    | "entiteeUn"
                                    | "entiteeDeux"
                                    | "entiteeTrois"
                                    | undefined;

                                  const foundE3 = entiteeTrois.find(
                                    (e) => e.libelle === structureName,
                                  );
                                  if (foundE3) {
                                    entityId = foundE3.id;
                                    entityTypeValue = "entiteeTrois";
                                  }

                                  if (!entityId) {
                                    const foundE2 = entiteeDeux.find(
                                      (e) => e.libelle === structureName,
                                    );
                                    if (foundE2) {
                                      entityId = foundE2.id;
                                      entityTypeValue = "entiteeDeux";
                                    }
                                  }

                                  if (!entityId) {
                                    const foundE1 = entiteeUn.find(
                                      (e) => e.libelle === structureName,
                                    );
                                    if (foundE1) {
                                      entityId = foundE1.id;
                                      entityTypeValue = "entiteeUn";
                                    }
                                  }

                                  if (entityId && entityTypeValue) {
                                    handleOpenEntiteeTypes(
                                      entityId,
                                      entityTypeValue,
                                      structureName,
                                    );
                                  }
                                }}
                                className="p-1.5 text-dgcc5 hover:bg-dgcc12 rounded-lg transition-colors"
                                title="Gérer les types de documents"
                              >
                                <Layers size={16} />
                              </button>
                            )}

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
                    </div>
                    {/* ✅ CONTENU DE L'ACCORDÉON */}
                    {expandedStructure === structureName && (
                      <div className="border-t border-slate-50">
                        {totalDocuments > 0 ? (
                          <>
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
                                            title="Ajouter des pièces"
                                          >
                                            <FilePlus size={25} />
                                          </button>

                                          {isNonAssigned && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelected(t);
                                                if (
                                                  selectedAccordionStructure
                                                ) {
                                                  setSelectedTypeDoc(
                                                    selectedAccordionStructure.value,
                                                  );
                                                  setAffectationFormVisible(
                                                    true,
                                                  );
                                                } else {
                                                  setAffectationFormVisible(
                                                    true,
                                                  );
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
                                            title="Modifier"
                                          >
                                            <Pencil size={25} />
                                          </button>

                                          <button
                                            onClick={(e) => {
                                              setSelected(t);
                                              setMetaVisible(true);
                                              e.stopPropagation();
                                            }}
                                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                                            title="Métadonnées"
                                          >
                                            <Settings size={25} />
                                          </button>

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(String(t.id));
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            title="Supprimer"
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

                            {/* ✅ Pagination interne pour cet accordéon */}
                            {totalPages > 1 && (
                              <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                                <div className="flex justify-center items-center">
                                  <Pagination
                                    currentPage={internalPage}
                                    totalItems={totalDocuments}
                                    itemsPerPage={itemsPerPageInternal}
                                    onPageChange={(page) =>
                                      handleInternalPageChange(
                                        structureName,
                                        page,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* ✅ Message quand l'entité existe mais n'a pas de documents */
                          <div className="text-center py-8">
                            <FileText
                              size={32}
                              className="mx-auto text-slate-300 mb-2"
                            />
                            <p className="text-sm text-slate-400 italic">
                              Aucun type de document pour cette entité
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Ouvrir le formulaire de création pré-rempli
                                setEditing(null);
                                setFormVisible(true);
                              }}
                              className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                            >
                              <Plus size={14} className="inline mr-1" /> Créer
                              le premier type
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            )}

            {/* ✅ Pagination des accordéons (structures) */}
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
      {/* <TypeDocumentAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={onAddPieces}
        initial={selected}
        title={"Pièces à fournir"}
        pieces={pieces}
      /> */}

      {/* ✅ Remplacer le bloc des modals pièces */}
      {!expandedStructure ||
      expandedStructure === "Type de documents non assignés" ? (
        <TypeDocumentAjoutPieces
          visible={formPiecesVisible}
          onHide={() => setFormPiecesVisible(false)}
          onSubmit={onAddPieces}
          initial={selected}
          title={"Pièces à fournir"}
          pieces={pieces}
        />
      ) : (
        <TypeDocumentAjoutPiecesEntytee
          visible={formPiecesVisible}
          onHide={() => setFormPiecesVisible(false)}
          onSubmit={onAddPieces}
          onAddEntityPiece={onAddEntityPiece}
          onRemoveEntityPiece={onRemoveEntityPiece}
          entityType={convertEntityType(selectedAccordionEntity?.type)}
          entityId={selectedAccordionEntity?.id || 0}
          initial={selected}
          pieces={pieces}
        />
      )}

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
      {/* ✅ MODAL GESTION DES TYPES PAR ENTITÉ */}
      {entiteeModalVisible &&
        selectedEntityForTypes &&
        selectedEntityForTypes.id > 0 && (
          <EntiteeAjoutTypeDocument
            visible={entiteeModalVisible}
            onHide={() => {
              setEntiteeModalVisible(false);
              setSelectedEntityForTypes(null);
            }}
            entityId={selectedEntityForTypes.id}
            entityType={selectedEntityForTypes.type}
            entityLabel={selectedEntityForTypes.label}
            allTypes={types}
            onSuccess={() => {
              refetch();
            }}
          />
        )}
    </Layout>
  );
}
