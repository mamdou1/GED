import React, { useRef, useState, useMemo, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../../components/layout/Pagination";
import api from "../../../api/axios";
import { useInitialData } from "../../../hooks/useDocuments";
import {
  Building2,
  Search,
  Plus,
  Trash2,
  XCircle,
  RefreshCw,
  Eye,
  Pencil,
  Users,
  Filter,
  FileStack,
  ChevronRight,
  ChevronDown,
  CloudDownload,
  Check,
  FileText,
  Banknote,
  GitCompareArrows,
  Settings,
  FilePlus,
  Folder,
  Folders,
} from "lucide-react";
import {
  useClients,
  useDeleteClient,
  useTypesDocumentByClient,
} from "../../../hooks/useClients";
import {
  useComptesByClient,
  useTypeDocumentsByCompte,
} from "../../../hooks/useComptes";
import {
  Client,
  TypeDocument,
  Compte,
  AddPiecesToTypeDocumentPayload,
} from "../../../interfaces/index";
import ClientForm from "../../Client/ClientForm";
import CompteForm from "../../Compte/CompteForm";
import ClientDetails from "../../Client/ClientDetails";
import DocumentForm from "../../Document/DocumentForm";
import DocumentDetails from "../../Document/DocumentDetails";
import AssignationTypeDocToTypeCompte from "../../DomentType/AssignationTypeDocToTypeCompte";
import DocumentUploadPieces from "../../Document/DocumentUploadPieces";
import DocumentDisponiblePieces from "../../Document/DocumentDisponiblePieces";
import TypeDocumentAjoutPieces from "../../DomentType/TypeDocumentAjoutPieces";
import DocumentTypeMetaForm from "../../DomentType/DocumentTypeMetaForm";
import DocumentTypeAffectAndForm from "../../DomentType/DocumentTypeAffectAndForm";
import { useTypeComptes } from "../../../hooks/useTypeComptes";
import { Dropdown } from "primereact/dropdown";
import {
  useDocumentsByType,
  useMetaFieldsByType,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "../../../hooks/useDocuments";
import {
  useTypesWithConserne,
  useAssignTypeCompteToTypeDocument,
  useCreateTypeDocument,
  useUpdateTypeDocument,
  useDeleteTypeDocument,
  useAddPiecesToTypeDocument,
} from "../../../hooks/useTypeDocuments";
import CompteItem from "../../Client/CompteItem";
import { useAddPieceToEntityTypeDocument } from "../../../hooks/useTypeDocuments";
import { usePieces } from "../../../hooks/usePieces";

const CONSERNE_OPTIONS = [
  { label: "Tous les types", value: null },
  { label: "Personne physique", value: "Personne physique" },
  { label: "Personne morale", value: "Personne morale" },
];

export default function ClientListe() {
  const toast = useRef<Toast>(null);
  const { data: clientsData, isLoading, error, refetch } = useClients();
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteClient();
  const deleteDocumentMutation = useDeleteDocument();
  const assignMutation = useAssignTypeCompteToTypeDocument();
  const { data: typesWithConserneData, refetch: refetchTypesWithConserne } =
    useTypesWithConserne({ limit: 100 });
  const typesWithConserne: TypeDocument[] = Array.isArray(typesWithConserneData)
    ? typesWithConserneData
    : typesWithConserneData?.data || [];
  const { data: typeComptes = [] } = useTypeComptes();
  const createTypeDocMutation = useCreateTypeDocument();
  const updateTypeDocMutation = useUpdateTypeDocument();
  const addPiecesMutation = useAddPiecesToTypeDocument();
  const deleteTypeDocumentMutation = useDeleteTypeDocument();
  const { data: piecesData = [] } = usePieces();
  const pieces = Array.isArray(piecesData) ? piecesData : [];

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingTypeDoc, setEditingTypeDoc] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [query, setQuery] = useState("");
  const [selectedConserne, setSelectedConserne] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // États pour la navigation Client → Type → Document
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [expandedCompte, setExpandedCompte] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [pageByType, setPageByType] = useState<Record<number, number>>({});
  const itemsPerPageDocs = 5;

  const [expandedAllTypes, setExpandedAllTypes] = useState(false);
  const [typeCompteModalVisible, setTypeCompteModalVisible] = useState(false);
  const [selectedTypeForCompte, setSelectedTypeForCompte] =
    useState<TypeDocument | null>(null);
  const [selectedTypeCompteId, setSelectedTypeCompteId] = useState<
    number | null
  >(null);

  // États pour les modales des types de document
  const [allTypesMetaVisible, setAllTypesMetaVisible] = useState(false);
  const [allTypesPiecesVisible, setAllTypesPiecesVisible] = useState(false);
  const [allTypesEditVisible, setAllTypesEditVisible] = useState(false);
  const [selectedAllType, setSelectedAllType] = useState<TypeDocument | null>(
    null,
  );

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTypeForAssign, setSelectedTypeForAssign] =
    useState<TypeDocument | null>(null);

  // États pour les modales de documents
  const [docFormVisible, setDocFormVisible] = useState(false);
  const [docDetailsVisible, setDocDetailsVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [disponibleVisible, setDisponibleVisible] = useState(false);
  const [selectedTypeForDoc, setSelectedTypeForDoc] =
    useState<TypeDocument | null>(null);
  const [selectedClientForDoc, setSelectedClientForDoc] =
    useState<Client | null>(null);

  const clients = clientsData?.data || [];

  // ✅ Récupérer tous les documents avec leurs métadonnées
  const {
    documents: allDocuments = [],
    // pieces = [],
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
  } = useInitialData();

  // Récupérer les types de documents d'un client
  const { data: clientTypes = [], refetch: refetchTypes } =
    useTypesDocumentByClient(expandedClient || undefined);

  const {
    data: clientComptesData,
    isLoading: isLoadingComptes,
    error: comptesError,
    refetch: refetchComptes,
  } = useComptesByClient(expandedClient || undefined);

  const clientComptesRaw = clientComptesData?.data || clientComptesData || [];
  const clientComptes: Compte[] = Array.isArray(clientComptesRaw)
    ? clientComptesRaw
    : [];

  const unassignedTypes = useMemo(
    () =>
      clientTypes.filter(
        (type: TypeDocument) =>
          !clientComptes.some(
            (compte) => compte.type_compte_id === type.type_compte_id,
          ),
      ),
    [clientTypes, clientComptes],
  );

  const { data: metaFields = [] } = useMetaFieldsByType(
    selectedTypeForDoc?.id || null,
  );
  const [formTypeId, setFormTypeId] = useState<number | null>(null);
  const [compteFormVisible, setCompteFormVisible] = useState(false);
  const [metaFieldsByType, setMetaFieldsByType] = useState<
    Record<number, any[]>
  >({});
  const [selectedClientForCompte, setSelectedClientForCompte] =
    useState<Client | null>(null);

  useEffect(() => {
    const loadMetaFieldsForType = async (typeId: number) => {
      if (!metaFieldsByType[typeId]) {
        try {
          const response = await api.get(`/meta-fields/${typeId}`);
          setMetaFieldsByType((prev) => ({
            ...prev,
            [typeId]: response.data.data || response.data || [],
          }));
        } catch (error) {
          console.error("Erreur chargement metaFields:", error);
          setMetaFieldsByType((prev) => ({
            ...prev,
            [typeId]: [],
          }));
        }
      }
    };

    if (expandedType) {
      loadMetaFieldsForType(expandedType);
    }
  }, [expandedType]);

  const openCompteForm = (client: Client) => {
    setSelectedClientForCompte(client);
    setCompteFormVisible(true);
  };

  const openClientForm = (client: Client) => {
    setSelectedClientForCompte(client);
    setDetailsVisible(true);
  };

  const openNew = () => {
    setEditingClient(null);
    setFormVisible(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormVisible(true);
  };

  const openDetails = (client: Client) => {
    setSelectedClient(client);
    setDetailsVisible(true);
  };

  const renderTypeSection = (type: TypeDocument, client: Client) => {
    const isTypeExpanded = expandedType === type.id;
    const typeDocs = allDocuments.filter(
      (doc: any) => doc.type_document_id === type.id,
    );
    const currentPageForType = getCurrentPageForType(type.id);
    const paginatedDocs = typeDocs.slice(
      (currentPageForType - 1) * itemsPerPageDocs,
      currentPageForType * itemsPerPageDocs,
    );
    const metaFieldsForType = metaFieldsByType[type.id] || [];
    return (
      <div
        key={type.id}
        className={`bg-white border rounded-xl overflow-hidden transition-all ${
          isTypeExpanded ? "border-emerald-400" : "border-slate-100"
        }`}
      >
        <div
          onClick={() => toggleType(type.id)}
          className={`w-full flex items-center justify-between p-4 transition-all cursor-pointer ${
            isTypeExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
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
                    isTypeExpanded ? "text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {type.nom}
                </span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {type.code}
                </span>
                {type.conserne && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {type.conserne === "Personne physique" ? "👤 PP" : "🏢 PM"}
                  </span>
                )}
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
                setSelectedTypeForDoc(type);
                setSelectedClientForDoc(client);
                setFormTypeId(type.id);
                setEditingDoc(null);
                setDocFormVisible(true);
              }}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              title="Nouveau document"
            >
              <Plus size={14} />
            </button>
            {isTypeExpanded ? (
              <ChevronDown size={16} className="text-emerald-500" />
            ) : (
              <ChevronRight size={16} className="text-slate-400" />
            )}
          </div>
        </div>

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
                        {(metaFieldsForType.length
                          ? metaFieldsForType
                          : metaFields
                        ).map((m) => (
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
                            setSelectedDoc(doc);
                            setDetailsVisible(true);
                          }}
                          className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                              #{String(doc.id).padStart(3, "0")}
                            </span>
                          </td>
                          {(metaFieldsForType.length
                            ? metaFieldsForType
                            : metaFields
                          ).map((m) => {
                            const value = doc.values?.find(
                              (v: any) => v.metaField?.id === m.id,
                            )?.value;
                            return (
                              <td
                                key={m.id}
                                className="p-3 text-sm text-emerald-900 font-medium"
                              >
                                {value || (
                                  <span className="text-emerald-200">---</span>
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
                                  // setPendingTypeId(type.id);
                                  // setCurrentEntityForForm({
                                  //   id: entiteeItem.id,
                                  //   type: entiteeItem.type,
                                  //   label: entiteeItem.libelle,
                                  // });
                                  setFormVisible(true);
                                }}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Modifier le document"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  setSelectedDoc(doc);
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
                                  setSelectedDoc(doc);
                                  setAjoutVisible(true);
                                  e.stopPropagation();
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Chargement des fichiers"
                              >
                                <CloudDownload size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id);
                                }}
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
                {typeDocs.length > itemsPerPageDocs && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      currentPage={currentPageForType}
                      itemsPerPage={itemsPerPageDocs}
                      totalItems={typeDocs.length}
                      onPageChange={(page) => handlePageChange(type.id, page)}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400 italic">
                  Aucun document pour ce type
                </p>
                <button
                  onClick={() => {
                    setSelectedTypeForDoc(type);
                    setSelectedClientForDoc(client);
                    setFormTypeId(type.id);
                    setEditingDoc(null);
                    setDocFormVisible(true);
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
  };

  const onAddPieces = async (
    typeId: string,
    payload: AddPiecesToTypeDocumentPayload,
  ) => {
    try {
      await addPiecesMutation.mutateAsync({ typeId, payload });
      toast.current?.show({ severity: "success", summary: "Pièces ajoutées" });
      setAllTypesPiecesVisible(false);
    } catch (err) {
      /* ignoré */
    }
  };

  const handleDelete = (id: number) => {
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
          await deleteDocumentMutation.mutateAsync(String(id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Client supprimé avec succès",
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

  const handleDeleteClient = (id: number, nom: string) => {
    confirmDialog({
      message: `Supprimer "${nom}" ? Cette action supprimera également tous les documents associés.`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
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
            summary: "Supprimé",
            detail: "Client supprimé avec succès",
          });
          refetch();
        } catch (error: any) {
          // ✅ Message d'erreur plus explicite
          const errorMessage = error.response?.data?.message || error.message;
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: errorMessage,
            life: 5000,
          });
        }
      },
    });
  };

  const handleDeleteTypeDocument = (id: string) => {
    confirmDialog({
      message: "Voulez-vous supprimer ce type de document définitivement ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteTypeDocumentMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Type de document supprimé avec succès",
          });
          refetchTypesWithConserne();
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

  const handleCreate = async (payload: any) => {
    try {
      if (editingDoc) {
        // Mise à jour
        await updateMutation.mutateAsync({
          id: editingDoc.id,
          data: payload,
        });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Document modifié avec succès",
        });
      } else {
        // Création
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Document créé avec succès",
        });
      }

      // Fermer le formulaire et rafraîchir
      setDocFormVisible(false);
      refetch();
      refetchTypes();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || "Une erreur est survenue",
      });
    }
  };

  const handleAssignTypeCompte = async (
    typeDocumentId: number,
    typeCompteId: number | null,
  ) => {
    try {
      await assignMutation.mutateAsync({ typeDocumentId, typeCompteId });
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Type de compte assigné avec succès",
      });
      refetchTypesWithConserne();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || error.message,
      });
    }
  };

  const handleSubmit = async (formData: {
    code: string;
    nom: string;
    //cote: string;
  }) => {
    let payload: any = { ...formData };
    try {
      if (editingTypeDoc?.id) {
        await updateTypeDocMutation.mutateAsync({
          id: String(editingTypeDoc.id),
          data: formData,
        });
        toast.current?.show({ severity: "success", summary: "Mis à jour" });
      } else {
        let payload: any = { ...formData };
        await createTypeDocMutation.mutateAsync(payload);
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

  // const typeCompteOptions = [
  //   { label: "Aucun", value: null },
  //   ...(typeComptes?.data || typeComptes || []).map((tc: any) => ({
  //     label: tc.nom,
  //     value: tc.id,
  //   })),
  // ];

  const getClientDisplayName = (client: Client): string => {
    if (client.raison_sociale) return client.raison_sociale;
    return `${client.prenom || ""} ${client.nom || ""}`.trim() || "-";
  };

  const getClientTypeBadge = (client: Client) => {
    if (client.raison_sociale) {
      return (
        <Tag
          value="Personne morale"
          severity="success"
          className="px-3 py-1 rounded-lg text-sm font-semibold"
        />
      );
    }
    return (
      <Tag
        value="Personne physique"
        severity="info"
        className="px-3 py-1 rounded-lg text-sm font-semibold"
      />
    );
  };

  const getConserneBadge = (conserne: string | null) => {
    if (!conserne) {
      return (
        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
          Non spécifié
        </span>
      );
    }
    return conserne === "Personne physique" ? (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
        👤 Personne physique
      </span>
    ) : (
      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
        🏢 Personne morale
      </span>
    );
  };

  const toggleClient = (clientId: number) => {
    const isSameClient = expandedClient === clientId;
    setExpandedClient(isSameClient ? null : clientId);
    setExpandedCompte(null);
    setExpandedType(null);
    setSelectedTypeId(null);
  };

  const toggleCompte = (compteId: number) => {
    const isSameCompte = expandedCompte === compteId;
    setExpandedCompte(isSameCompte ? null : compteId);
    setExpandedType(null);
    setSelectedTypeId(null);
  };

  const toggleType = (typeId: number) => {
    if (expandedType === typeId) {
      setExpandedType(null);
      setSelectedTypeId(null);
    } else {
      setExpandedType(typeId);
      setSelectedTypeId(typeId);
    }
  };

  const getCurrentPageForType = (typeId: number) => pageByType[typeId] || 1;

  const handlePageChange = (typeId: number, page: number) => {
    setPageByType((prev) => ({ ...prev, [typeId]: page }));
  };

  const filteredClients = useMemo(() => {
    let filtered = clients;
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter((c: Client) =>
        `${c.nom || ""} ${c.prenom || ""} ${c.raison_sociale || ""} ${c.email || ""} ${c.num_matricule || ""}`
          .toLowerCase()
          .includes(searchLower),
      );
    }
    if (selectedConserne) {
      filtered = filtered.filter(
        (c: Client) => c.conserne === selectedConserne,
      );
    }
    return filtered;
  }, [clients, query, selectedConserne]);

  const paginated = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ Gérer l'état de chargement des clients
  if (isLoading || isLoadingDocuments) {
    return (
      <div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  // ✅ Gérer les erreurs
  if (error || documentsError) {
    const errorMessage =
      error?.message || documentsError?.message || "Erreur de chargement";
    return (
      <div>
        <div className="flex flex-col items-center justify-center h-96 text-center px-6">
          <XCircle size={72} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Erreur de chargement
          </h2>
          <p className="text-slate-600 mb-8 max-w-md">{errorMessage}</p>
          <Button
            label="Réessayer"
            icon={<RefreshCw size={20} className="mr-2" />}
            onClick={() => {
              refetch();
              refetchDocuments();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3"
          />
        </div>
      </div>
    );
  }

  if (!allDocuments.length && !isLoadingDocuments) {
    console.log("⚠️ Aucun document chargé, tentative de rechargement...");
    refetchDocuments();
  }

  return (
    <div>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Liste des Clients
          </h2>
          <p className="text-sm text-slate-500">
            Client → Type de document → Document
          </p>
        </div>
        <div className="gap-3">
          <Button
            label="Type Document"
            icon={<Plus size={20} />}
            onClick={() => {
              setEditingTypeDoc(null);
              setAllTypesEditVisible(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl m-2 shadow-md font-bold"
          />
          <Button
            label="Nouveau client"
            icon={<Plus size={20} className="mr-2" />}
            onClick={openNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl m-2 shadow-lg transition-all"
          />
        </div>
      </div>

      {/* Barre de recherche et filtre */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <InputText
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              placeholder="Rechercher un client..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              <Filter size={12} className="inline mr-1" />
              Filtrer par type
            </label>
            <Dropdown
              value={selectedConserne}
              options={CONSERNE_OPTIONS}
              onChange={(e) => {
                setSelectedConserne(e.value);
                setCurrentPage(1);
              }}
              placeholder="Tous les types"
              className="w-full bg-slate-50 border-slate-200 rounded-xl"
              showClear
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          {filteredClients.length} client(s) trouvé(s)
        </div>
      </div>

      <div className="mb-8">
        <div
          className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
            expandedAllTypes
              ? "border-emerald-500 ring-2 ring-emerald-200"
              : "border-slate-100"
          }`}
        >
          {/* HEADER ACCORDÉON */}
          <button
            onClick={() => setExpandedAllTypes(!expandedAllTypes)}
            className={`w-full flex items-center justify-between p-5 transition-all ${
              expandedAllTypes ? "bg-emerald-50/50" : "hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg ${
                  expandedAllTypes
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Folders size={20} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-bold ${
                      expandedAllTypes ? "text-emerald-800" : "text-slate-700"
                    }`}
                  >
                    📋 Tous les types de documents
                  </h3>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">
                    {typesWithConserne.length} type(s)
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Types avec conserne (Personne physique/morale)
                </p>
              </div>
            </div>
            {expandedAllTypes ? (
              <ChevronDown size={20} className="text-emerald-500" />
            ) : (
              <ChevronRight size={20} className="text-slate-400" />
            )}
          </button>

          {/* CONTENU DE L'ACCORDÉON */}
          {expandedAllTypes && (
            <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/30">
              {typesWithConserne.length > 0 ? (
                typesWithConserne.map((type: TypeDocument) => {
                  return (
                    <div
                      key={type.id}
                      className="bg-white border rounded-xl overflow-hidden transition-all border-emerald-400"
                    >
                      {/* HEADER TYPE */}
                      <div className="w-full p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-yellow-500 text-white">
                              <Folder size={16} />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                  {type.nom}
                                </span>
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {type.code}
                                </span>
                                {type.conserne && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                    {type.conserne === "Personne physique"
                                      ? "👤 PP"
                                      : "🏢 PM"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ligne Type de compte associé */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                Type de compte associé :
                              </span>
                              {type.type_compte ? (
                                <Tag
                                  value={type.type_compte.nom}
                                  severity="info"
                                  className="text-xs px-2 py-0.5 rounded-md"
                                />
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Aucun
                                </span>
                              )}
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setSelectedTypeForAssign(type);
                                  setAssignModalVisible(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Assigner un type de compte"
                              >
                                <GitCompareArrows size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAllType(type);
                                  setAllTypesPiecesVisible(true);
                                }}
                                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                title="Ajouter des pièces"
                              >
                                <FilePlus size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAllType(type);
                                  setAllTypesEditVisible(true);
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Modifier"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAllType(type);
                                  setAllTypesMetaVisible(true);
                                }}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                                title="Métadonnées"
                              >
                                <Settings size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteTypeDocument(type.id.toString())
                                }
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FileStack
                    size={32}
                    className="mx-auto text-slate-300 mb-2"
                  />
                  <p className="text-sm text-slate-400 italic">
                    Aucun type de document avec conserne
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Liste des clients avec accordéons */}
      <div className="space-y-4">
        {paginated.length > 0 ? (
          paginated.map((client: Client) => {
            const isExpanded = expandedClient === client.id;
            // Filtrer les comptes pour ce client
            const clientComptesFiltered = clientComptes.filter(
              (compte: Compte) => compte.client_id === client.id,
            );

            return (
              <div
                key={client.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  isExpanded
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-slate-100"
                }`}
              >
                {/* HEADER CLIENT */}
                <div className="flex  items-center">
                  <button
                    onClick={() => toggleClient(client.id)}
                    className={`flex-1 flex items-center justify-between p-5 transition-all ${
                      isExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          isExpanded
                            ? "bg-emerald-500 text-white"
                            : client.raison_sociale
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {client.raison_sociale ? (
                          <Building2 size={20} />
                        ) : (
                          <Users size={20} />
                        )}
                      </div>

                      {/* ✅ TOUTES LES INFOS SUR UNE SEULE LIGNE */}
                      <div className="flex items-center gap-10 flex-1 min-w-0 overflow-hidden">
                        {/* Nom / Raison sociale */}
                        <h3
                          className={`font-bold text-sm whitespace-nowrap ${isExpanded ? "text-emerald-800" : "text-slate-700"}`}
                        >
                          {getClientDisplayName(client)}
                        </h3>

                        {/* Sigle (si présent) */}
                        {client.sigle && (
                          <h3 className="font-bold text-sm whitespace-nowrap ">
                            {client.sigle}
                          </h3>
                        )}

                        {/* Badge type */}
                        <h3 className="whitespace-nowrap">
                          {getClientTypeBadge(client)}
                        </h3>

                        {/* Matricule */}
                        {client.num_matricule && (
                          <h3 className="font-bold text-sm whitespace-nowrap ">
                            N° {client.num_matricule}
                          </h3>
                        )}

                        {/* ✅ Champs spécifiques selon le type */}
                        {client.raison_sociale ? (
                          // Personne morale
                          <>
                            {client.numero_registre_commerce && (
                              <h3 className="font-bold text-sm whitespace-nowrap ">
                                RCCM: {client.numero_registre_commerce}
                              </h3>
                            )}
                            {client.nif && (
                              <h3 className="font-bold text-sm whitespace-nowrap ">
                                NIF: {client.nif}
                              </h3>
                            )}
                          </>
                        ) : (
                          // Personne physique
                          <>
                            {client.profession && (
                              <h3 className="font-bold text-sm whitespace-nowrap ">
                                {client.profession}
                              </h3>
                            )}
                            {client.telephone && (
                              <h3 className="font-bold text-sm whitespace-nowrap ">
                                {client.telephone}
                              </h3>
                            )}
                            {client.email && (
                              <h3 className="font-bold text-sm whitespace-nowrap ">
                                {client.email}
                              </h3>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    {isExpanded ? (
                      <ChevronDown
                        size={20}
                        className="text-emerald-500 flex-shrink-0 ml-2"
                      />
                    ) : (
                      <ChevronRight
                        size={20}
                        className="text-slate-400 flex-shrink-0 ml-2"
                      />
                    )}
                  </button>

                  {/* Boutons d'action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetails(client);
                      setDetailsVisible(true);
                    }}
                    className="p-2 mr-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex-shrink-0"
                    title="détails du compte bancaire"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCompteForm(client);
                    }}
                    className="p-2 mr-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex-shrink-0"
                    title="Créer un compte bancaire"
                  >
                    <Banknote size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(client);
                    }}
                    className="p-2 mr-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                    title="Modifier le client"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClient(
                        client.id,
                        getClientDisplayName(client),
                      );
                    }}
                    className="p-2 mr-4 text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                    title="Supprimer le client"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                {/* CONTENU EXPANDÉ DU CLIENT */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/30">
                    {/* SECTION COMPTES BANCAIRES */}
                    {clientComptesFiltered.length > 0 ? (
                      clientComptesFiltered.map((compte: Compte) => (
                        <CompteItem
                          key={compte.id}
                          compte={compte}
                          client={client}
                          expandedCompte={expandedCompte}
                          onToggleCompte={toggleCompte}
                          expandedType={expandedType}
                          onToggleType={toggleType}
                          allDocuments={allDocuments}
                          metaFieldsByType={metaFieldsByType}
                          getCurrentPageForType={getCurrentPageForType}
                          handlePageChange={handlePageChange}
                          itemsPerPageDocs={itemsPerPageDocs}
                          onNewDocument={(type, client) => {
                            setSelectedTypeForDoc(type);
                            setSelectedClientForDoc(client);
                            setFormTypeId(type.id);
                            setEditingDoc(null);
                            setDocFormVisible(true);
                          }}
                          onEditDocument={(doc) => {
                            setEditingDoc(doc);
                            setDocFormVisible(true);
                          }}
                          onCheckPieces={(doc) => {
                            setSelectedDoc(doc);
                            setDisponibleVisible(true);
                          }}
                          onUploadFiles={(doc) => {
                            setSelectedDoc(doc);
                            setAjoutVisible(true);
                          }}
                          onDeleteDocument={(id) => handleDelete(id)}
                          onViewDocument={(doc) => {
                            setSelectedDoc(doc);
                            setDocDetailsVisible(true);
                          }}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
                        <Banknote
                          size={32}
                          className="mx-auto text-slate-300 mb-2"
                        />
                        <p className="text-sm text-slate-400 italic">
                          Aucun compte bancaire associé à ce client
                        </p>
                        <button
                          onClick={() => openCompteForm(client)}
                          className="mt-3 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
                        >
                          <Plus size={14} className="inline mr-1" />
                          Créer un compte bancaire
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Pagination clients */}
      {filteredClients.length > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredClients.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modales */}
      <ClientForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        client={editingClient}
        onSuccess={() => {
          setFormVisible(false);
          refetch();
        }}
      />

      <ClientDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        client={selectedClient}
        onEdit={() => {
          setDetailsVisible(false);
          if (selectedClient) openEdit(selectedClient);
        }}
        onRefresh={refetch}
      />

      <DocumentForm
        visible={docFormVisible}
        onHide={() => {
          setDocFormVisible(false);
          setEditingDoc(null);
          setSelectedTypeForDoc(null);
          setSelectedClientForDoc(null);
          setFormTypeId(null);
        }}
        onSubmit={handleCreate}
        refresh={() => {
          refetch();
          refetchTypes();
        }}
        documentType={typesWithConserne} // ✅ Types avec conserne
        selectedTypeId={formTypeId}
        editingDoc={editingDoc}
        preselectedEntity={null}
        selectedClientForDoc={selectedClientForDoc}
        entitee_un={[]}
        entitee_deux={[]}
        entitee_trois={[]}
      />

      <DocumentDetails
        visible={docDetailsVisible}
        onHide={() => setDocDetailsVisible(false)}
        doc={selectedDoc}
        onRefresh={() => {
          refetch();
          refetchTypes();
        }}
      />

      <DocumentUploadPieces
        visible={ajoutVisible}
        onHide={() => setAjoutVisible(false)}
        document={selectedDoc}
        onSuccess={() => {
          refetch();
          refetchTypes();
        }}
      />

      <DocumentDisponiblePieces
        visible={disponibleVisible}
        onHide={() => setDisponibleVisible(false)}
        document={selectedDoc}
        onSuccess={() => {
          refetch();
          refetchTypes();
        }}
      />

      <CompteForm
        visible={compteFormVisible}
        onHide={() => setCompteFormVisible(false)}
        compte={null}
        preselectedClient={selectedClientForCompte}
        onSuccess={() => {
          setCompteFormVisible(false);
          refetch();
          refetchTypes();
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Compte créé avec succès",
          });
        }}
      />

      <TypeDocumentAjoutPieces
        visible={allTypesPiecesVisible}
        onHide={() => setAllTypesPiecesVisible(false)}
        onSubmit={onAddPieces}
        initial={selectedAllType}
        title="Pièces à fournir"
        pieces={pieces}
      />

      <DocumentTypeMetaForm
        visible={allTypesMetaVisible}
        onHide={() => setAllTypesMetaVisible(false)}
        onSubmit={async (fieldsPayload) => {
          // Logique de sauvegarde des métadonnées
          setAllTypesMetaVisible(false);
          refetchTypesWithConserne();
        }}
        type={selectedAllType}
      />

      <DocumentTypeAffectAndForm
        visible={allTypesEditVisible}
        onHide={() => setAllTypesEditVisible(false)}
        onSubmitSingle={handleSubmit}
        initial={selectedAllType}
        types={[]}
        isFiltered={false}
        structureLabel=""
      />

      <AssignationTypeDocToTypeCompte
        visible={assignModalVisible}
        onHide={() => {
          setAssignModalVisible(false);
          setSelectedTypeForAssign(null);
        }}
        // typeDocument={selectedTypeForAssign}
        onSuccess={() => {
          refetchTypesWithConserne();
        }}
      />
    </div>
  );
}
