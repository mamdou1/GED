import { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout/Layoutt";
import EntiteeUnDetails from "./EntiteeUnDetails";
import EntiteeUnForm from "./EntiteeUnForm";
import EntiteeUnAjoutFonction from "./EntiteeUnAjoutFonction";
import { EntiteeUn, EntiteeDeux, EntiteeTrois } from "../../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  GitMerge,
  Bookmark,
  PlusIcon,
  XCircle,
} from "lucide-react";
import EntiteeDeuxAjoutFonction from "../EntiteeDeux/EntiteeDeuxAjoutFonction";
import EntiteeDeuxForm from "../EntiteeDeux/EntiteeDeuxForm";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useEntiteeUn,
  useCreateEntiteeUn,
  useUpdateEntiteeUn,
  useDeleteEntiteeUn,
} from "../../../hooks/useEntiteeUn";

import {
  useEntiteeDeux,
  useEntiteeDeuxByEntiteeUn,
  useCreateEntiteeDeux,
  useUpdateEntiteeDeux,
  useDeleteEntiteeDeux,
} from "../../../hooks/useEntiteeDeux";

import { useEntiteeTroisByEntiteeDeux } from "../../../hooks/useEntiteeTrois";
import { getEntiteeDeuxByEntiteeUn } from "../../../api/entiteeDeux";
import { getEntiteeTroisByEntiteeDeux } from "../../../api/entiteeTrois";

export default function EntiteeUnPage() {
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer useState par les hooks
  const {
    data: allEntiteeUn = [],
    isLoading: isLoadingUn,
    error: errorUn,
    refetch: refetchUn,
  } = useEntiteeUn();

  const {
    data: allEntiteeDeux = [],
    isLoading: isLoadingDeux,
    error: errorDeux,
    refetch: refetchDeux,
  } = useEntiteeDeux();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createUnMutation = useCreateEntiteeUn();
  const updateUnMutation = useUpdateEntiteeUn();
  const deleteUnMutation = useDeleteEntiteeUn();
  const createDeuxMutation = useCreateEntiteeDeux();
  const updateDeuxMutation = useUpdateEntiteeDeux();
  const deleteDeuxMutation = useDeleteEntiteeDeux();

  // États UI
  const [selected, setSelected] = useState<EntiteeUn | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [ajoutFonctionDeuxVisible, setAjoutFonctionDeuxVisible] =
    useState(false);
  const [formDeuxVisible, setFormDeuxVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<EntiteeUn> | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // États pour les accordéons
  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [expandedEntiteeDeux, setExpandedEntiteeDeux] = useState<number | null>(
    null,
  );
  const [editingDeux, setEditingDeux] = useState<Partial<EntiteeDeux> | null>(
    null,
  );
  const [selectedEntiteeDeux, setSelectedEntiteeDeux] =
    useState<EntiteeDeux | null>(null);
  const [isEditingDeux, setIsEditingDeux] = useState(false);

  // ✅ Maps pour stocker les données par ID (comme dans l'ancienne version)
  const [entiteeDeuxMap, setEntiteeDeuxMap] = useState<
    Record<number, EntiteeDeux[]>
  >({});
  const [entiteeTroisMap, setEntiteeTroisMap] = useState<
    Record<number, EntiteeTrois[]>
  >({});

  // ✅ Charger les divisions quand on ouvre une entité
  const loadEntiteeDetails = async (entiteeId: number) => {
    if (entiteeDeuxMap[entiteeId]) return; // Déjà chargé

    try {
      const response = await getEntiteeDeuxByEntiteeUn(entiteeId);
      const divisions = Array.isArray(response)
        ? response
        : response.entiteeDeux || [];
      setEntiteeDeuxMap((prev) => ({ ...prev, [entiteeId]: divisions }));
    } catch (err) {
      console.error("Erreur chargement divisions", err);
    }
  };

  // ✅ Charger les sections quand on ouvre une division
  const loadEntiteeTroisDetails = async (entiteeDeuxId: number) => {
    if (entiteeTroisMap[entiteeDeuxId]) return; // Déjà chargé

    try {
      const data = await getEntiteeTroisByEntiteeDeux(entiteeDeuxId);
      setEntiteeTroisMap((prev) => ({
        ...prev,
        [entiteeDeuxId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Erreur chargement sections", err);
    }
  };

  const toggleEntitee = async (entitee: EntiteeUn) => {
    if (expandedEntitee === entitee.id) {
      setExpandedEntitee(null);
      setExpandedEntiteeDeux(null);
    } else {
      setExpandedEntitee(entitee.id);
      await loadEntiteeDetails(entitee.id);
    }
  };

  const toggleEntiteeDeux = async (entiteeDeuxId: number) => {
    if (expandedEntiteeDeux === entiteeDeuxId) {
      setExpandedEntiteeDeux(null);
    } else {
      setExpandedEntiteeDeux(entiteeDeuxId);
      await loadEntiteeTroisDetails(entiteeDeuxId);
    }
  };

  useEffect(() => {
    const preloadDivisions = async () => {
      const map: Record<number, EntiteeDeux[]> = {};
      for (const entitee of allEntiteeUn) {
        const divisions = await getEntiteeDeuxByEntiteeUn(entitee.id);
        map[entitee.id] = Array.isArray(divisions) ? divisions : [];
      }
      setEntiteeDeuxMap(map);
    };

    if (allEntiteeUn.length > 0) {
      preloadDivisions();
    }
  }, [allEntiteeUn]);

  // ✅ ÉTAPE 3: Remplacer les handlers pour EntiteeUn
  const onEdit = async (payload: Partial<EntiteeUn>) => {
    if (!editing?.id) return;
    try {
      await updateUnMutation.mutateAsync({
        id: editing.id,
        data: payload,
      });
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Programme modifié",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Échec de mise à jour",
      });
    }
  };

  const onCreate = async (payload: Partial<EntiteeUn>) => {
    try {
      await createUnMutation.mutateAsync(payload);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Créé avec succès",
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Opération échouée",
      });
    }
  };

  const handleDeleteEntitee = async (id: string) => {
    confirmDialog({
      message: `Voulez-vous supprimer cet élément définitivement ? Cette action est irréversible.`,
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
          await deleteUnMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Élément supprimé",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: err?.response?.data?.message || "Suppression impossible",
          });
        }
      },
    });
  };

  // ✅ ÉTAPE 4: Remplacer les handlers pour EntiteeDeux
  const onCreateDeux = async (payload: Partial<EntiteeDeux>) => {
    try {
      await createDeuxMutation.mutateAsync(payload);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Élément créé",
      });
      setFormDeuxVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Échec de création",
      });
    }
  };

  const onEditDeux = async (payload: Partial<EntiteeDeux>) => {
    if (!editingDeux?.id) return;
    try {
      await updateDeuxMutation.mutateAsync({
        id: editingDeux.id,
        data: payload,
      });
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Division mise à jour",
      });
      setFormDeuxVisible(false);
      setEditingDeux(null);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Échec de mise à jour",
      });
    }
  };

  // Filtrage et pagination
  const filtered = allEntiteeUn.filter((s) => {
    const isPopulated = s.code !== null && s.libelle !== null;
    if (!isPopulated) return false;
    return (s.libelle || "").toLowerCase().includes(query.toLowerCase());
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ ÉTAPE 5: Gérer les états de chargement/erreur
  const isLoading = isLoadingUn || isLoadingDeux;
  const error = errorUn || errorDeux;

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
            onClick={() => {
              refetchUn();
              refetchDeux();
            }}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {allEntiteeUn[0]?.titre || "Entité 1"}
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des {allEntiteeUn[0]?.titre?.toLowerCase() || "entités"}s
            </p>
          </div>
        </div>
        <Button
          label={`Nouveau ${allEntiteeUn[0]?.titre || "Élément"}`}
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
            placeholder="Rechercher ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ACCORDÉON LIST */}
      <div className="space-y-4">
        {paginated.length > 0 ? (
          paginated.map((entitee) => {
            const isExpanded = expandedEntitee === entitee.id;
            const entiteeDivisions = entiteeDeuxMap[entitee.id] || [];

            return (
              <div
                key={entitee.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  isExpanded
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-slate-100"
                }`}
              >
                {/* HEADER DE L'ENTITEE */}
                <div
                  onClick={() => toggleEntitee(entitee)}
                  className={`w-full flex items-center justify-between p-5 transition-all cursor-pointer ${
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
                      <Bookmark size={20} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold ${
                            isExpanded ? "text-emerald-800" : "text-slate-700"
                          }`}
                        >
                          {entitee.libelle}
                        </h3>
                        {entitee.code && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                            {entitee.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {entiteeDivisions.length}{" "}
                        {allEntiteeDeux[0]?.titre || "---"}(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(entitee);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Voir les détails complets"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(entitee);
                        setAjoutFonctionVisible(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Ajouter une fonction"
                    >
                      <PlusCircle size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(entitee);
                        setFormVisible(true);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntitee(String(entitee.id));
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-emerald-500" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* CONTENU DÉPLIÉ */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-6 bg-slate-50/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Layers size={14} className="text-emerald-500" />
                          {entitee.titre || "Divisions"} rattachées (
                          {entiteeDivisions.length})
                        </h4>
                        <Button
                          onClick={(e) => {
                            setIsEditingDeux(false);
                            setEditingDeux({ entitee_un_id: entitee.id });
                            setFormDeuxVisible(true);
                            e.stopPropagation();
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 text-orange-600 font-bold bg-orange-50 hover:bg-orange-600 hover:text-white rounded-xl transition-all border-none shadow-sm hover:shadow-md"
                          tooltip={`Ajouter une nouvelle ${entitee.titre || "division"}`}
                          tooltipOptions={{ position: "top" }}
                        >
                          <PlusIcon size={16} />
                          <span className="text-xs font-bold">Nouveau</span>
                        </Button>
                      </div>

                      {entiteeDivisions.length > 0 ? (
                        <div className="space-y-2">
                          {entiteeDivisions.map((div) => (
                            <div
                              key={div.id}
                              className="border border-slate-100 rounded-xl overflow-hidden bg-white"
                            >
                              {/* HEADER DIVISION */}
                              <div
                                onClick={() => toggleEntiteeDeux(div.id)}
                                className={`w-full flex items-center justify-between p-3 cursor-pointer transition-all ${
                                  expandedEntiteeDeux === div.id
                                    ? "bg-emerald-50/50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div
                                    className={`p-1.5 rounded-lg flex-shrink-0 ${
                                      expandedEntiteeDeux === div.id
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    <Layers size={14} />
                                  </div>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`text-sm font-bold truncate max-w-[400px] ${
                                        expandedEntiteeDeux === div.id
                                          ? "text-emerald-700"
                                          : "text-slate-700"
                                      }`}
                                      title={div.libelle}
                                    >
                                      {div.libelle}
                                    </span>
                                    {div.code && (
                                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex-shrink-0">
                                        {div.code}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mx-2">
                                  <Button
                                    onClick={(e) => {
                                      setIsEditingDeux(true);
                                      setEditingDeux(div);
                                      setFormDeuxVisible(true);
                                      e.stopPropagation();
                                    }}
                                    className="flex items-center gap-2 p-2 text-blue-600 font-bold bg-blue-50 hover:bg-blue-600 hover:text-white rounded-full transition-all border-none shadow-sm hover:shadow-md"
                                    tooltip={`Modifier cet(te) ${entitee.titre || "division"}`}
                                    tooltipOptions={{ position: "top" }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      setSelectedEntiteeDeux(div);
                                      setAjoutFonctionDeuxVisible(true);
                                      e.stopPropagation();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all border-none shadow-sm hover:shadow-md"
                                    tooltip="Ajouter une fonction"
                                    tooltipOptions={{ position: "top" }}
                                  >
                                    <PlusCircle size={15} />
                                    <span className="text-xs hidden sm:inline">
                                      Fonction
                                    </span>
                                  </Button>
                                </div>

                                <div className="flex-shrink-0 ml-1">
                                  {expandedEntiteeDeux === div.id ? (
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

                              {/* CONTENU DIVISION */}
                              {expandedEntiteeDeux === div.id && (
                                <div className="p-3 bg-slate-50/30 border-t border-slate-50 space-y-1 ml-8">
                                  {(entiteeTroisMap[div.id] || []).length >
                                  0 ? (
                                    entiteeTroisMap[div.id].map((sec) => (
                                      <div
                                        key={sec.id}
                                        className="flex items-center gap-3 p-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors"
                                      >
                                        <GitMerge
                                          size={14}
                                          className="text-slate-300"
                                        />
                                        <span className="font-medium">
                                          {sec.libelle}
                                        </span>
                                        {sec.code && (
                                          <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                            {sec.code}
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-[11px] text-slate-400 italic py-2">
                                      Aucune section dans cette division
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
                          <Layers
                            size={32}
                            className="mx-auto text-slate-300 mb-2"
                          />
                          <p className="text-xs text-slate-400 italic mb-3">
                            Aucune division rattachée
                          </p>
                          <Button
                            onClick={(e) => {
                              setFormDeuxVisible(true);
                              e.stopPropagation();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all border-none"
                          >
                            <PlusCircle size={14} />
                            <span className="text-xs">
                              Créer la première{" "}
                              {allEntiteeDeux[0]?.titre || "Entité 1"}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
              <Search size={40} />
            </div>
            <p className="text-slate-400 font-medium">
              Aucun élément trouvé pour cette sélection.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <EntiteeUnForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmit={editing ? onEdit : onCreate}
        refresh={() => {}} // ✅ PLUS BESOIN de refresh !
        initial={editing || undefined}
      />

      <EntiteeUnAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => {
          setAjoutFonctionVisible(false);
        }}
        entiteeUn={selected}
        refresh={() => {
          refetchUn();
          refetchDeux();
        }}
        onSuccess={() => {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée",
          });
        }}
      />

      <EntiteeUnDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        entiteeUn={selected}
        toast={toast}
      />

      <EntiteeDeuxForm
        visible={formDeuxVisible}
        onHide={() => {
          setFormDeuxVisible(false);
          setEditingDeux(null);
          setIsEditingDeux(false);
        }}
        onSubmit={isEditingDeux ? onEditDeux : onCreateDeux}
        refresh={() => {
          refetchUn();
          refetchDeux();
        }}
        initial={editingDeux || undefined}
        title={
          isEditingDeux
            ? `Modifier ${allEntiteeDeux[0]?.titre || "division"}`
            : `Créer ${allEntiteeDeux[0]?.titre || "division"}`
        }
        entiteeUn={allEntiteeUn}
      />

      <EntiteeDeuxAjoutFonction
        visible={ajoutFonctionDeuxVisible}
        onHide={() => {
          setAjoutFonctionDeuxVisible(false);
        }}
        entiteeDeux={selectedEntiteeDeux}
        refresh={() => {
          refetchUn();
          refetchDeux();
        }}
        onSuccess={() => {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée",
          });
        }}
      />
    </Layout>
  );
}
