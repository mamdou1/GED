import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../../components/layout/Layoutt";
import DocumentForm from "./DocumentForm";
import DocumentDetails from "./DocumentDetails";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  FileStack,
  Check,
  CloudDownload,
  Layers,
  ChevronRight,
  ChevronDown,
  Building2,
  GitMerge,
  Pencil,
  XCircle,
} from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import Pagination from "../../components/layout/Pagination";
import api from "../../api/axios";
import DocumentPiece from "./DocumentPieces";
import UploadPreview from "./UploadPreview";
import { TypeDocument, Document } from "../../interfaces";
import DocumentUploadPieces from "./DocumentUploadPieces";
import DocumentDisponiblePieces from "./DocumentDisponiblePieces";
import { useAuth } from "../../context/AuthContext";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useInitialData,
  useDocumentsByType,
  useMetaFieldsByType,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "../../hooks/useDocuments";

// Interfaces pour les entités
interface Entitee {
  id: number;
  libelle: string;
  code?: string;
  titre?: string;
  type: "un" | "deux" | "trois";
  parent_id?: number;
}

export default function DocumentPage() {
  const { user } = useAuth();
  const toast = useRef<Toast>(null);
  const location = useLocation();

  // ✅ ÉTAT 1: Remplacer les useState multiples par useInitialData
  const {
    documents: allDocs = [],
    types = [],
    entitees = [],
    isLoading,
    error,
    refetch,
  } = useInitialData();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  // États UI (inchangés)
  const [selected, setSelected] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const itemsPerPage = 5;

  const [entiteePage, setEntiteePage] = useState(1);
  const [typePage, setTypePage] = useState(1);

  const entiteesPerPage = 5;
  const typesPerPage = 5;
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [filteredTypes, setFilteredTypes] = useState<TypeDocument[]>([]);

  // États pour les accordéons imbriqués
  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<number | null>(null);

  const [tempFile, setTempFile] = useState<File | null>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [disponibleVisible, setDisponibleVisible] = useState(false);
  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [pendingTypeId, setPendingTypeId] = useState<number | null>(null);
  const [pageByType, setPageByType] = useState<Record<number, number>>({});

  // ✅ AJOUT : état pour l'entité à passer au formulaire (champs personnalisés)
  const [currentEntityForForm, setCurrentEntityForForm] = useState<{
    id: number;
    type: "un" | "deux" | "trois";
    label: string;
  } | null>(null);

  // ✅ ÉTAT 3: Requêtes conditionnelles avec TanStack Query
  const { data: typeDocuments = [] } = useDocumentsByType(documentType_id);
  const { data: metaFields = [] } = useMetaFieldsByType(
    documentType_id || expandedType || null,
  );

  useEffect(() => {
    if (formVisible && pendingTypeId) {
      setDocumentType_id(pendingTypeId);
      setPendingTypeId(null);
    }
  }, [formVisible, pendingTypeId]);

  // =============================================
  // FONCTIONS UTILITAIRES POUR LES ACCÈS (inchangées)
  // =============================================

  const isUserAdmin = (): boolean => {
    if (!user) return false;
    const droitLibelle =
      typeof user.droit === "object" ? user.droit?.libelle : user.droit;
    if (!droitLibelle) return false;
    const libelle = droitLibelle.toString().toLowerCase();
    return (
      libelle.includes("admin") ||
      libelle.includes("administrateur") ||
      libelle === "admin" ||
      libelle === "administrateur"
    );
  };

  const getUserAccessibleEntityIds = () => {
    if (!user)
      return {
        un: new Set<number>(),
        deux: new Set<number>(),
        trois: new Set<number>(),
      };

    const ids = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    if (user.fonction_details?.entitee_un?.id) {
      ids.un.add(user.fonction_details.entitee_un.id);
    }
    if (user.fonction_details?.entitee_deux?.id) {
      ids.deux.add(user.fonction_details.entitee_deux.id);
    }
    if (user.fonction_details?.entitee_trois?.id) {
      ids.trois.add(user.fonction_details.entitee_trois.id);
    }

    user.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) ids.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id) ids.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id) ids.trois.add(access.entitee_trois.id);
    });

    return ids;
  };

  const hasAdditionalAccess = (): boolean => {
    return (user?.agent_access?.length ?? 0) > 0;
  };

  const getUserFonctionEntityType = (): "un" | "deux" | "trois" | null => {
    if (user?.fonction_details?.entitee_trois) return "trois";
    if (user?.fonction_details?.entitee_deux) return "deux";
    if (user?.fonction_details?.entitee_un) return "un";
    return null;
  };

  const getUserFonctionEntityId = (): number | null => {
    return (
      user?.fonction_details?.entitee_trois?.id ||
      user?.fonction_details?.entitee_deux?.id ||
      user?.fonction_details?.entitee_un?.id ||
      null
    );
  };

  const getAccessibleTypesForNiveau = (niveau: "un" | "deux" | "trois") => {
    const ids = getUserAccessibleEntityIds();
    const targetSet = ids[niveau];

    return types.filter((doc) => {
      if (niveau === "un")
        return (
          doc.entitee_un_id !== null &&
          doc.entitee_un_id !== undefined &&
          targetSet.has(doc.entitee_un_id)
        );
      if (niveau === "deux")
        return (
          doc.entitee_deux_id !== null &&
          doc.entitee_deux_id !== undefined &&
          targetSet.has(doc.entitee_deux_id)
        );
      if (niveau === "trois")
        return (
          doc.entitee_trois_id !== null &&
          doc.entitee_trois_id !== undefined &&
          targetSet.has(doc.entitee_trois_id)
        );
      return false;
    });
  };

  const getUserFonctionTypes = () => {
    const entityType = getUserFonctionEntityType();
    const entityId = getUserFonctionEntityId();

    if (!entityType || !entityId) return [];

    return types.filter((doc) => {
      if (entityType === "un")
        return (
          doc.entitee_un_id !== null &&
          doc.entitee_un_id !== undefined &&
          doc.entitee_un_id === entityId
        );
      if (entityType === "deux")
        return (
          doc.entitee_deux_id !== null &&
          doc.entitee_deux_id !== undefined &&
          doc.entitee_deux_id === entityId
        );
      if (entityType === "trois")
        return (
          doc.entitee_trois_id !== null &&
          doc.entitee_trois_id !== undefined &&
          doc.entitee_trois_id === entityId
        );
      return false;
    });
  };

  // ✅ AJOUT : fonction utilitaire pour récupérer l'entité de la fonction courante
  const getCurrentFonctionEntity = () => {
    const entityType = getUserFonctionEntityType();
    const entityId = getUserFonctionEntityId();
    if (!entityType || !entityId) return null;
    const entitee = entitees.find(e => e.id === entityId && e.type === entityType);
    return entitee ? { id: entityId, type: entityType, label: entitee.libelle } : null;
  };

  // ✅ PLUS BESOIN DE LA FONCTION load() NI DE useEffect !

  // LIRE LE PARAMÈTRE D'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const entitee = params.get("entitee");
    const typeId = params.get("typeId");
    const niveaux = params.get("niveaux");

    if (typeId) {
      setDocumentType_id(Number(typeId));
      setSelectedNiveau(null);
    } else if (entitee) {
      setSelectedNiveau(entitee);

      let filtered: TypeDocument[] = [];

      if (isUserAdmin()) {
        filtered = types.filter((t) => {
          if (entitee === "un") return t.entitee_un_id !== null;
          if (entitee === "deux") return t.entitee_deux_id !== null;
          if (entitee === "trois") return t.entitee_trois_id !== null;
          return false;
        });
      } else if (hasAdditionalAccess()) {
        filtered = getAccessibleTypesForNiveau(
          entitee as "un" | "deux" | "trois",
        );
      } else {
        filtered = [];
      }

      setFilteredTypes(filtered);
    }
  }, [location.search, types]);

  const filteredEntitees = useMemo(() => {
    if (!selectedNiveau) return [];

    let entiteesDuNiveau = entitees.filter((e) => e.type === selectedNiveau);

    if (hasAdditionalAccess() && !isUserAdmin()) {
      const accessibleIds = getUserAccessibleEntityIds();
      const targetSet =
        accessibleIds[selectedNiveau as keyof typeof accessibleIds];

      entiteesDuNiveau = entiteesDuNiveau.filter((e) => targetSet.has(e.id));
    }

    return entiteesDuNiveau;
  }, [entitees, selectedNiveau, user]);

  // ✅ ÉTAPE 4: Remplacer onEdit
  const onEdit = async (payload: any) => {
    if (!editingDoc?.id) {
      console.error("❌ Aucun document sélectionné pour modification");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: String(editingDoc.id),
        data: payload,
      });

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document modifié avec succès",
      });

      setFormVisible(false);
      setEditingDoc(null);
    } catch (error: any) {
      console.error("❌ Erreur modification document:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          error?.response?.data?.message ||
          "Impossible de modifier le document",
      });
    }
  };

  // ✅ ÉTAPE 5: Remplacer handleSubmit
  const handleSubmit = async (payload: any) => {
    try {
      await createMutation.mutateAsync(payload);
      setFormVisible(false);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document archivé avec succès",
      });
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de créer le document",
      });
    }
  };

  // ✅ ÉTAPE 6: Remplacer handleDelete
  // const handleDelete = (id: string) => {
  //   confirmDialog({
  //     message: "Voulez-vous supprimer ce document définitivement ?",
  //     header: "Confirmation",
  //     icon: "pi pi-info-circle",
  //     acceptLabel: "Supprimer",
  //     rejectLabel: "Annuler",
  //     acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
  //     rejectClassName:
  //       "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
  //     style: { width: "450px" },
  //     accept: async () => {
  //       await deleteMutation.mutateAsync(id);
  //       toast.current?.show({ severity: "success", summary: "Supprimé" });
  //     },
  //   });
  // };

  const handleDelete = (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce document définitivement ? Cette action est irréversible.",
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
              "Ce type de document ne peut pas être supprimé car il contient des pièces charger avec ou sans méta donnée associées.",
            life: 5000,
          });
        }
      },
    });
  };

  // Grouper les types par entité - UNIQUEMENT pour le niveau sélectionné
  const typesByEntitee = useMemo(() => {
    const grouped: Record<number, TypeDocument[]> = {};

    // Récupérer les types à afficher
    let typesToShow: TypeDocument[] = [];

    if (isUserAdmin()) {
      // Pour ADMIN, filtrer selon le niveau sélectionné
      if (selectedNiveau === "un") {
        // Niveau 1 : uniquement les types liés DIRECTEMENT à une entitee_un
        // (sans entitee_deux_id et sans entitee_trois_id)
        typesToShow = types.filter(
          (type) =>
            type.entitee_un_id !== null &&
            type.entitee_un_id !== undefined &&
            !type.entitee_deux_id &&
            !type.entitee_trois_id,
        );
      } else if (selectedNiveau === "deux") {
        // Niveau 2 : uniquement les types liés DIRECTEMENT à une entitee_deux
        // (avec entitee_deux_id mais sans entitee_trois_id)
        typesToShow = types.filter(
          (type) =>
            type.entitee_deux_id !== null &&
            type.entitee_deux_id !== undefined &&
            !type.entitee_trois_id,
        );
      } else if (selectedNiveau === "trois") {
        // Niveau 3 : uniquement les types liés DIRECTEMENT à une entitee_trois
        typesToShow = types.filter(
          (type) =>
            type.entitee_trois_id !== null &&
            type.entitee_trois_id !== undefined,
        );
      }
    } else if (hasAdditionalAccess()) {
      // Pour utilisateur avec accès supplémentaires
      const accessibleIds = getUserAccessibleEntityIds();

      if (selectedNiveau === "un") {
        typesToShow = types.filter(
          (type) =>
            type.entitee_un_id !== null &&
            type.entitee_un_id !== undefined &&
            accessibleIds.un.has(type.entitee_un_id) &&
            !type.entitee_deux_id &&
            !type.entitee_trois_id,
        );
      } else if (selectedNiveau === "deux") {
        typesToShow = types.filter(
          (type) =>
            type.entitee_deux_id !== null &&
            type.entitee_deux_id !== undefined &&
            accessibleIds.deux.has(type.entitee_deux_id) &&
            !type.entitee_trois_id,
        );
      } else if (selectedNiveau === "trois") {
        typesToShow = types.filter(
          (type) =>
            type.entitee_trois_id !== null &&
            type.entitee_trois_id !== undefined &&
            accessibleIds.trois.has(type.entitee_trois_id),
        );
      }
    } else {
      // Cas sans accès supplémentaires (ne devrait pas arriver ici car CAS 2.2 est séparé)
      typesToShow = [];
    }

    // Grouper les types par entité (l'entité à laquelle ils sont directement liés)
    typesToShow.forEach((type) => {
      let entiteeId: number | null | undefined = null;

      if (selectedNiveau === "un") {
        entiteeId = type.entitee_un_id;
      } else if (selectedNiveau === "deux") {
        entiteeId = type.entitee_deux_id;
      } else if (selectedNiveau === "trois") {
        entiteeId = type.entitee_trois_id;
      }

      // Vérifier que entiteeId est un nombre valide avant de l'utiliser
      if (entiteeId !== null && entiteeId !== undefined) {
        if (!grouped[entiteeId]) grouped[entiteeId] = [];
        grouped[entiteeId].push(type);
      }
    });

    return grouped;
  }, [types, selectedNiveau, user]);

  const toggleEntitee = (entiteeId: number) => {
    setExpandedEntitee(expandedEntitee === entiteeId ? null : entiteeId);
    setExpandedType(null);
  };

  const toggleType = async (typeId: number) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      setDocumentType_id(typeId);

      // ✅ reset pagination
      setPageByType((prev) => ({
        ...prev,
        [typeId]: 1,
      }));
    }
  };

  const confirmUpload = async () => {
    if (!tempFile || !targetDocId) return;

    const formData = new FormData();
    formData.append("files", tempFile);

    try {
      await api.post(`/documents/${targetDocId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.current?.show({
        severity: "success",
        summary: "Fichier uploadé avec succès",
      });
      setPreviewVisible(false);
      setTempFile(null);
      refetch();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Échec de l'envoi" });
    }
  };

  // ✅ ÉTAPE 7: Gérer les états de chargement/erreur
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

  const handlePageChange = (typeId: number, page: number) => {
    setPageByType((prev) => ({
      ...prev,
      [typeId]: page,
    }));
  };

  const getCurrentPageForType = (typeId: number) => {
    return pageByType[typeId] || 1;
  };

  // Déterminer ce qu'il faut afficher
  const getDisplayContent = () => {
    const params = new URLSearchParams(location.search);
    const typeId = params.get("typeId");
    const entitee = params.get("entitee");
    // ===== CAS 1 : ADMIN (affichage complet avec entités + types)
    if (isUserAdmin()) {
      if (!selectedNiveau && !entitee) {
        return (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
              <Layers size={40} />
            </div>
            <p className="text-slate-400 font-medium">
              Sélectionnez un niveau dans le menu de gauche
            </p>
          </div>
        );
      }

      // Filtrer et paginer les entités
      const filteredEntiteesList = filteredEntitees.filter((e: Entitee) =>
        e.libelle?.toLowerCase().includes(query.toLowerCase()),
      );
      const paginatedEntiteesList = filteredEntiteesList.slice(
        (entiteePage - 1) * entiteesPerPage,
        entiteePage * entiteesPerPage,
      );

      return (
        <div className="space-y-4">
          {filteredEntiteesList.length > 0 ? (
            paginatedEntiteesList.map((entiteeItem: Entitee) => {
              const entiteeTypes = typesByEntitee[entiteeItem.id] || [];
              const isExpanded = expandedEntitee === entiteeItem.id;

              return (
                <div
                  key={`${entiteeItem.type}-${entiteeItem.id}`}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                    isExpanded
                      ? "border-emerald-500 ring-2 ring-emerald-200"
                      : "border-slate-100"
                  }`}
                >
                  {/* HEADER ENTITÉ - garde ton code existant ici */}
                  <button
                    onClick={() => toggleEntitee(entiteeItem.id)}
                    className={`w-full flex items-center justify-between p-5 transition-all ${
                      isExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isExpanded
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {entiteeItem.type === "un" && <Building2 size={20} />}
                        {entiteeItem.type === "deux" && <Layers size={20} />}
                        {entiteeItem.type === "trois" && <GitMerge size={20} />}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-bold ${
                              isExpanded ? "text-emerald-800" : "text-slate-700"
                            }`}
                          >
                            {entiteeItem.libelle}
                          </h3>
                          {entiteeItem.code && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                              {entiteeItem.code}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              entiteeItem.type === "un"
                                ? "bg-blue-100 text-blue-700"
                                : entiteeItem.type === "deux"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            N
                            {entiteeItem.type === "un"
                              ? "1"
                              : entiteeItem.type === "deux"
                                ? "2"
                                : "3"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {entiteeTypes.length} type(s) de document
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-emerald-500" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </button>

                  {/* TYPES DE DOCUMENTS DE L'ENTITÉ - garde ton code existant */}
                  {/* TYPES DE DOCUMENTS DE L'ENTITÉ */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/30">
                      {entiteeTypes.length > 0 ? (
                        entiteeTypes.map((type) => {
                          const isTypeExpanded = expandedType === type.id;
                          const typeDocs = allDocs.filter(
                            (d) => d.type_document_id === type.id,
                          );
                          const currentPageForType = getCurrentPageForType(
                            type.id,
                          );
                          const paginatedDocs = typeDocs.slice(
                            (currentPageForType - 1) * itemsPerPage,
                            currentPageForType * itemsPerPage,
                          );

                          return (
                            <div
                              key={type.id}
                              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                                isTypeExpanded
                                  ? "border-emerald-400"
                                  : "border-slate-100"
                              }`}
                            >
                              {/* HEADER TYPE */}
                              <div
                                onClick={() => toggleType(type.id)}
                                className={`w-full flex items-center justify-between p-4 transition-all ${
                                  isTypeExpanded
                                    ? "bg-emerald-50/50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-1.5 rounded-lg ${
                                      isTypeExpanded
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    <FileStack size={16} />
                                  </div>
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-sm font-bold ${
                                          isTypeExpanded
                                            ? "text-emerald-700"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {type.nom}
                                      </span>
                                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                        {type.code}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">
                                      {typeDocs.length} document(s)
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPendingTypeId(type.id);
                                      setEditingDoc(null);
                                      // ✅ AJOUT : stocker l'entité courante
                                      setCurrentEntityForForm({ id: entiteeItem.id, type: entiteeItem.type, label: entiteeItem.libelle });
                                      setFormVisible(true);
                                    }}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    title="Nouveau document"
                                  >
                                    <Plus size={14} />
                                  </button>
                                  {isTypeExpanded ? (
                                    <ChevronDown
                                      size={16}
                                      className="text-emerald-500"
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={16}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* TABLEAU DES DOCUMENTS */}
                              {isTypeExpanded && (
                                <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                                  {typeDocs.length > 0 ? (
                                    <>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                          <thead>
                                            <tr className="bg-emerald-50/30 border-b border-emerald-50">
                                              <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                                                Réf.
                                              </th>
                                              {metaFields.map((m) => (
                                                <th
                                                  key={m.id}
                                                  className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                                                >
                                                  {m.label}
                                                </th>
                                              ))}
                                              <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-emerald-50">
                                            {paginatedDocs.map((doc) => (
                                              <tr
                                                key={doc.id}
                                                onClick={() => {
                                                  setSelected(doc);
                                                  setDetailsVisible(true);
                                                }}
                                                className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                                              >
                                                <td className="p-3">
                                                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                                                    #
                                                    {String(doc.id).padStart(
                                                      3,
                                                      "0",
                                                    )}
                                                  </span>
                                                </td>
                                                {metaFields.map((m) => {
                                                  const value =
                                                    doc.values?.find(
                                                      (v: any) =>
                                                        v.metaField?.id ===
                                                        m.id,
                                                    )?.value;
                                                  return (
                                                    <td
                                                      key={m.id}
                                                      className="p-3 text-sm text-emerald-900 font-medium"
                                                    >
                                                      {value || (
                                                        <span className="text-emerald-200">
                                                          ---
                                                        </span>
                                                      )}
                                                    </td>
                                                  );
                                                })}
                                                <td className="p-3">
                                                  <div
                                                    className="flex justify-center gap-1"
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                  >
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingDoc(doc);
                                                        setPendingTypeId(
                                                          type.id,
                                                        );
                                                        // ✅ AJOUT : stocker l'entité courante
                                                        setCurrentEntityForForm({ id: entiteeItem.id, type: entiteeItem.type, label: entiteeItem.libelle });
                                                        setFormVisible(true);
                                                      }}
                                                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                      title="Modifier le document"
                                                    >
                                                      <Pencil size={18} />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        setSelected(doc);
                                                        setDisponibleVisible(
                                                          true,
                                                        );
                                                        e.stopPropagation();
                                                      }}
                                                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                      title="Contrôle de la disponibilité des pièces"
                                                    >
                                                      <Check size={18} />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        setSelected(doc);
                                                        setAjoutVisible(true);
                                                        e.stopPropagation();
                                                      }}
                                                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                      title="Chargement des fichiers"
                                                    >
                                                      <CloudDownload
                                                        size={18}
                                                      />
                                                    </button>
                                                    <button
                                                      onClick={(e) =>
                                                        handleDelete(
                                                          String(doc.id),
                                                          e.stopPropagation,
                                                        )
                                                      }
                                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                      <Trash2 size={18} />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      <div className="mt-4 flex justify-center">
                                        <Pagination
                                          currentPage={currentPageForType}
                                          itemsPerPage={itemsPerPage}
                                          totalItems={typeDocs.length}
                                          onPageChange={(page) =>
                                            handlePageChange(type.id, page)
                                          }
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-8">
                                      <FileText
                                        size={32}
                                        className="mx-auto text-slate-300 mb-2"
                                      />
                                      <p className="text-sm text-slate-400 italic">
                                        Aucun document pour ce type
                                      </p>
                                      <button
                                        onClick={() => {
                                          setDocumentType_id(type.id);
                                          // ✅ AJOUT : stocker l'entité courante
                                          setCurrentEntityForForm({ id: entiteeItem.id, type: entiteeItem.type, label: entiteeItem.libelle });
                                          setFormVisible(true);
                                        }}
                                        className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                                      >
                                        <Plus
                                          size={14}
                                          className="inline mr-1"
                                        />
                                        Créer le premier document
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-400 text-sm italic">
                            Aucun type de document pour cette entité
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                <Building2 size={40} />
              </div>
              <p className="text-slate-400 font-medium">
                Aucune entité trouvée pour ce niveau
              </p>
            </div>
          )}
          {filteredEntiteesList.length > entiteesPerPage && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={entiteePage}
                itemsPerPage={entiteesPerPage}
                totalItems={filteredEntiteesList.length}
                onPageChange={setEntiteePage}
              />
            </div>
          )}
        </div>
      );
    }

    // ===== CAS 2.1 : Utilisateur avec accès supplémentaires
    if (hasAdditionalAccess() && selectedNiveau) {
      const filteredEntiteesList = filteredEntitees.filter((e: Entitee) =>
        e.libelle?.toLowerCase().includes(query.toLowerCase()),
      );
      const paginatedEntiteesList = filteredEntiteesList.slice(
        (entiteePage - 1) * entiteesPerPage,
        entiteePage * entiteesPerPage,
      );

      return (
        <div className="space-y-4">
          {filteredEntiteesList.length > 0 ? (
            paginatedEntiteesList.map((entiteeItem: Entitee) => {
              const entiteeTypes = typesByEntitee[entiteeItem.id] || [];
              const isExpanded = expandedEntitee === entiteeItem.id;

              return (
                <div
                  key={`${entiteeItem.type}-${entiteeItem.id}`}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                    isExpanded
                      ? "border-emerald-500 ring-2 ring-emerald-200"
                      : "border-slate-100"
                  }`}
                >
                  {/* HEADER ENTITÉ - même contenu que CAS 1 */}
                  <button
                    onClick={() => toggleEntitee(entiteeItem.id)}
                    className={`w-full flex items-center justify-between p-5 transition-all ${
                      isExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isExpanded
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {entiteeItem.type === "un" && <Building2 size={20} />}
                        {entiteeItem.type === "deux" && <Layers size={20} />}
                        {entiteeItem.type === "trois" && <GitMerge size={20} />}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-bold ${
                              isExpanded ? "text-emerald-800" : "text-slate-700"
                            }`}
                          >
                            {entiteeItem.libelle}
                          </h3>
                          {entiteeItem.code && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                              {entiteeItem.code}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              entiteeItem.type === "un"
                                ? "bg-blue-100 text-blue-700"
                                : entiteeItem.type === "deux"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            N
                            {entiteeItem.type === "un"
                              ? "1"
                              : entiteeItem.type === "deux"
                                ? "2"
                                : "3"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {entiteeTypes.length} type(s) de document
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-emerald-500" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </button>

                  {/* TYPES DE DOCUMENTS DE L'ENTITÉ */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/30">
                      {entiteeTypes.length > 0 ? (
                        entiteeTypes.map((type) => {
                          const isTypeExpanded = expandedType === type.id;
                          const typeDocs = allDocs.filter(
                            (d) => d.type_document_id === type.id,
                          );
                          const currentPageForType = getCurrentPageForType(
                            type.id,
                          );

                          const paginatedDocs = typeDocs.slice(
                            (currentPageForType - 1) * itemsPerPage,
                            currentPageForType * itemsPerPage,
                          );

                          return (
                            <div
                              key={type.id}
                              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                                isTypeExpanded
                                  ? "border-emerald-400"
                                  : "border-slate-100"
                              }`}
                            >
                              {/* HEADER TYPE */}
                              <div
                                onClick={() => toggleType(type.id)}
                                className={`w-full flex items-center justify-between p-4 transition-all ${
                                  isTypeExpanded
                                    ? "bg-emerald-50/50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-1.5 rounded-lg ${
                                      isTypeExpanded
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    <FileStack size={16} />
                                  </div>
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-sm font-bold ${
                                          isTypeExpanded
                                            ? "text-emerald-700"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {type.nom}
                                      </span>
                                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                        {type.code}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">
                                      {typeDocs.length} document(s)
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPendingTypeId(type.id);
                                      setEditingDoc(null);
                                      // ✅ AJOUT : stocker l'entité courante
                                      setCurrentEntityForForm({ id: entiteeItem.id, type: entiteeItem.type, label: entiteeItem.libelle });
                                      setFormVisible(true);
                                    }}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    title="Nouveau document"
                                  >
                                    <Plus size={14} />
                                  </button>
                                  {isTypeExpanded ? (
                                    <ChevronDown
                                      size={16}
                                      className="text-emerald-500"
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={16}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* TABLEAU DES DOCUMENTS */}
                              {isTypeExpanded && (
                                <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                                  {typeDocs.length > 0 ? (
                                    <>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                          <thead>
                                            <tr className="bg-emerald-50/30 border-b border-emerald-50">
                                              <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                                                Réf.
                                              </th>
                                              {metaFields.map((m) => (
                                                <th
                                                  key={m.id}
                                                  className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                                                >
                                                  {m.label}
                                                </th>
                                              ))}
                                              <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-emerald-50">
                                            {paginatedDocs.map((doc) => (
                                              <tr
                                                key={doc.id}
                                                onClick={() => {
                                                  setSelected(doc);
                                                  setDetailsVisible(true);
                                                }}
                                                className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                                              >
                                                <td className="p-3">
                                                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                                                    #
                                                    {String(doc.id).padStart(
                                                      3,
                                                      "0",
                                                    )}
                                                  </span>
                                                </td>
                                                {metaFields.map((m) => {
                                                  const value =
                                                    doc.values?.find(
                                                      (v: any) =>
                                                        v.metaField?.id ===
                                                        m.id,
                                                    )?.value;
                                                  return (
                                                    <td
                                                      key={m.id}
                                                      className="p-3 text-sm text-emerald-900 font-medium"
                                                    >
                                                      {value || (
                                                        <span className="text-emerald-200">
                                                          ---
                                                        </span>
                                                      )}
                                                    </td>
                                                  );
                                                })}
                                                <td className="p-3">
                                                  <div
                                                    className="flex justify-center gap-1"
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                  >
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingDoc(doc);
                                                        setPendingTypeId(
                                                          type.id,
                                                        );
                                                        // ✅ AJOUT : stocker l'entité courante
                                                        setCurrentEntityForForm({ id: entiteeItem.id, type: entiteeItem.type, label: entiteeItem.libelle });
                                                        setFormVisible(true);
                                                      }}
                                                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                      title="Modifier le document"
                                                    >
                                                      <Pencil size={18} />
                                                    </button>

                                                    <button
                                                      onClick={(e) => {
                                                        setSelected(doc);
                                                        setDisponibleVisible(
                                                          true,
                                                        );
                                                        e.stopPropagation();
                                                      }}
                                                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                      title="Contrôle de la disponibilité des pièces"
                                                    >
                                                      <Check size={18} />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        setSelected(doc);
                                                        setAjoutVisible(true);
                                                        e.stopPropagation();
                                                      }}
                                                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                      title="Chargement des fichiers"
                                                    >
                                                      <CloudDownload
                                                        size={18}
                                                      />
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleDelete(
                                                          String(doc.id),
                                                        )
                                                      }
                                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                      <Trash2 size={18} />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      <div className="mt-4 flex justify-center">
                                        <Pagination
                                          currentPage={currentPageForType}
                                          itemsPerPage={itemsPerPage}
                                          totalItems={typeDocs.length}
                                          onPageChange={(page) =>
                                            handlePageChange(type.id, page)
                                          }
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-8">
                                      <FileText
                                        size={32}
                                        className="mx-auto text-slate-300 mb-2"
                                      />
                                      <p className="text-sm text-slate-400 italic">
                                        Aucun document pour ce type
                                      </p>
                                      <button
                                        onClick={() => {
                                          setDocumentType_id(type.id);
                                          // ✅ AJOUT : stocker l'entité courante
                                          setCurrentEntityForForm({ id: entiteeItem.id, type: entiteeItem.type, label: entiteeItem.libelle });
                                          setFormVisible(true);
                                        }}
                                        className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                                      >
                                        <Plus
                                          size={14}
                                          className="inline mr-1"
                                        />
                                        Créer le premier document
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-400 text-sm italic">
                            Aucun type de document pour cette entité
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                <Building2 size={40} />
              </div>
              <p className="text-slate-400 font-medium">
                Aucune entité trouvée pour ce niveau
              </p>
            </div>
          )}

          {filteredEntitees.length > entiteesPerPage && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={entiteePage}
                itemsPerPage={entiteesPerPage}
                totalItems={filteredEntitees.length}
                onPageChange={setEntiteePage}
              />
            </div>
          )}
        </div>
      );
    }

    // ===== CAS 2.2 : Utilisateur SANS accès supplémentaires (fonction seulement)
    if (!hasAdditionalAccess() && !isUserAdmin()) {
      const fonctionTypes = getUserFonctionTypes();

      const paginatedTypes = fonctionTypes.slice(
        (typePage - 1) * typesPerPage,
        typePage * typesPerPage,
      );

      if (fonctionTypes.length === 0) {
        return (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <FileStack size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-medium">
              Aucun type de document disponible pour votre fonction
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {paginatedTypes.map((type) => {
            const typeDocs = allDocs.filter(
              (d) => d.type_document_id === type.id,
            );
            const isTypeExpanded = expandedType === type.id;

            // ✅ Pagination spécifique à ce type
            const currentPageForType = getCurrentPageForType(type.id);
            const totalItems = typeDocs.length;
            const paginatedDocs = typeDocs.slice(
              (currentPageForType - 1) * itemsPerPage,
              currentPageForType * itemsPerPage,
            );

            return (
              <div
                key={type.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  isTypeExpanded
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-slate-100"
                }`}
              >
                {/* HEADER TYPE */}
                <div
                  onClick={() => toggleType(type.id)}
                  className={`w-full flex items-center justify-between p-5 transition-all ${
                    isTypeExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isTypeExpanded
                          ? "bg-emerald-500 text-white"
                          : "bg-red-100 text-slate-500"
                      }`}
                    >
                      <FileStack size={20} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold ${
                            isTypeExpanded
                              ? "text-emerald-800"
                              : "text-slate-700"
                          }`}
                        >
                          {type.nom}
                        </h3>
                        {type.code && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                            {type.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {typeDocs.length} document(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingTypeId(type.id);
                        setEditingDoc(null);
                        // ✅ AJOUT : récupérer l'entité de la fonction courante
                        const entity = getCurrentFonctionEntity();
                        if (entity) setCurrentEntityForForm(entity);
                        setFormVisible(true);
                      }}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Nouveau document"
                    >
                      <Plus size={16} />
                    </button>
                    {isTypeExpanded ? (
                      <ChevronDown size={20} className="text-emerald-500" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* TABLEAU DES DOCUMENTS */}
                {isTypeExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/30">
                    {typeDocs.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-emerald-50/30 border-b border-emerald-50">
                                <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                                  Réf.
                                </th>
                                {metaFields.map((m) => (
                                  <th
                                    key={m.id}
                                    className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                                  >
                                    {m.label}
                                  </th>
                                ))}
                                <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50">
                              {paginatedDocs.map((doc) => (
                                <tr
                                  key={doc.id}
                                  onClick={() => {
                                    setSelected(doc);
                                    setDetailsVisible(true);
                                  }}
                                  className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                                >
                                  <td className="p-3">
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                                      #{String(doc.id).padStart(3, "0")}
                                    </span>
                                  </td>
                                  {metaFields.map((m) => {
                                    const value = doc.values?.find(
                                      (v: any) => v.metaField?.id === m.id,
                                    )?.value;
                                    return (
                                      <td
                                        key={m.id}
                                        className="p-3 text-sm text-emerald-900 font-medium"
                                      >
                                        {value || (
                                          <span className="text-emerald-200">
                                            ---
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="p-3">
                                    <div
                                      className="flex justify-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingDoc(doc);
                                          setPendingTypeId(type.id);
                                          // ✅ AJOUT : récupérer l'entité de la fonction courante
                                          const entity = getCurrentFonctionEntity();
                                          if (entity) setCurrentEntityForForm(entity);
                                          setFormVisible(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                        title="Modifier le document"
                                      >
                                        <Pencil size={18} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          setSelected(doc);
                                          setDisponibleVisible(true);
                                          e.stopPropagation();
                                        }}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                        title="Contrôle de la disponibilité des pièces"
                                      >
                                        <Check size={18} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          setSelected(doc);
                                          setAjoutVisible(true);
                                          e.stopPropagation();
                                        }}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                        title="Chargement des fichiers"
                                      >
                                        <CloudDownload size={18} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDelete(String(doc.id))
                                        }
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/*
                         * pourquoi la pagination ne marche t'elle pas
                         */}

                        {/* ✅ PAGINATION spécifique à ce type */}
                        {totalItems > itemsPerPage && (
                          <div className="mt-4 flex justify-center">
                            <Pagination
                              currentPage={currentPageForType}
                              itemsPerPage={itemsPerPage}
                              totalItems={totalItems}
                              onPageChange={(page) =>
                                handlePageChange(type.id, page)
                              }
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <FileText
                          size={32}
                          className="mx-auto text-slate-300 mb-2"
                        />
                        <p className="text-sm text-slate-400 italic">
                          Aucun document pour ce type
                        </p>
                        <button
                          onClick={() => {
                            setDocumentType_id(type.id);
                            // ✅ AJOUT : récupérer l'entité de la fonction courante
                            const entity = getCurrentFonctionEntity();
                            if (entity) setCurrentEntityForForm(entity);
                            setFormVisible(true);
                          }}
                          className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                        >
                          <Plus size={14} className="inline mr-1" />
                          Créer le premier document
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {fonctionTypes.length > typesPerPage && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={typePage}
                itemsPerPage={typesPerPage}
                totalItems={fonctionTypes.length}
                onPageChange={setTypePage}
              />
            </div>
          )}
        </div>
      );
    }
    // ===== CAS PAR DÉFAUT (affichage du message de sélection)
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
          <Layers size={40} />
        </div>
        <p className="text-slate-400 font-medium">
          Sélectionnez un niveau dans le menu de gauche
        </p>
      </div>
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <FileStack size={24} />
            </div>
            Gestion des Documents
          </h1>
          <p className="text-emerald-600/70 text-sm mt-1 ml-16 font-medium">
            Parcourez les documents par structure
          </p>
        </div>
        <Button
          label="Nouveau Document"
          icon={<Plus size={18} className="mr-2" />}
          onClick={() => {
            setSelected(null);
            setCurrentEntityForForm(null); // ✅ AJOUT : réinitialiser
            setFormVisible(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
        />
      </div>

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un document..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* AFFICHAGE DYNAMIQUE SELON LE CAS */}
      {getDisplayContent()}

      {/* Modals */}
      <DocumentForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditingDoc(null);
          setCurrentEntityForForm(null); // ✅ AJOUT : nettoyer
        }}
        onSubmit={editingDoc ? onEdit : handleSubmit}
        refresh={() => {}} // ✅ PLUS BESOIN de refresh !
        documentType={types}
        selectedTypeId={documentType_id}
        editingDoc={editingDoc}
        // ✅ AJOUT : passer l'entité courante au formulaire
        preselectedEntity={
          currentEntityForForm
            ? {
                entity_id: currentEntityForForm.id,
                entity_type: currentEntityForForm.type === "un" ? "EntiteeUn" : currentEntityForForm.type === "deux" ? "EntiteeDeux" : "EntiteeTrois",
                entity_label: currentEntityForForm.label,
              }
            : null
        }
      />
      <DocumentDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        doc={selected}
        onRefresh={() => refetch()}
      />
      <UploadPreview
        visible={previewVisible}
        onHide={() => {
          setPreviewVisible(false);
          setTempFile(null);
        }}
        file={tempFile}
        onConfirm={confirmUpload}
      />
      <DocumentUploadPieces
        visible={ajoutVisible}
        onHide={() => setAjoutVisible(false)}
        document={selected}
        onSuccess={() => refetch()} // ✅ Recharger après upload
      />
      <DocumentDisponiblePieces
        visible={disponibleVisible}
        onHide={() => setDisponibleVisible(false)}
        document={selected}
        onSuccess={() => {
          refetch();
          // if (selected) {
          //   const updatedDoc = allDocs.find((d) => d.id === selected.id);
          //   if (updatedDoc) {
          //     setSelected(updatedDoc);
          //   }
          // }
        }}
      />
    </Layout>
  );
}