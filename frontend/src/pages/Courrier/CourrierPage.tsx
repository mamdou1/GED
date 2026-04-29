// src/pages/courriers/CourrierPage.tsx
import React, { useRef, useState, useEffect } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import Pagination from "../../components/layout/Pagination";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { RadioButton } from "primereact/radiobutton";
import {
  FileText,
  Search,
  Eye,
  Trash2,
  XCircle,
  RefreshCw,
  CheckCircle,
  UserPlus,
  X,
  AlertCircle,
  Building2,
  Users,
} from "lucide-react";

// Hooks TanStack Query
import {
  useCourriers,
  useValiderCourrier,
  useRejeterCourrier,
  useDeleteCourrier,
  useAttribuerMultiple,
} from "../../hooks/useCourriers";

// Composants
import CourrierDetails from "./CourrierDetails";
import api from "../../api/axios";

// Types
interface Courrier {
  idcourrier: number;
  reference: string;
  type: "ARRIVE" | "DEPART";
  objet: string;
  statut: string;
  expediteur?: string;
  destinataire?: string;
  date_reception?: string;
}

interface EntiteeOption {
  id: number;
  titre?: string;
  libelle?: string;
  code?: string;
  nom?: string;
}

interface AttributionItem {
  id: string;
  type: "agent" | "entiteeDeux" | "direction";
  entiteeDeuxIds: number[];
  agentIds: number[];
  agentNoms: string[];
  entiteeNoms: string[];
  date_limite_traitement: Date | null;
  instructions: string;
  commentaire: string;
}

// ✅ AJOUTER CETTE INTERFACE
interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  fonction_details?: {
    entitee_deux_id?: number | null;
    entitee_trois_id?: number | null;
  };
}

export default function CourrierPage() {
  const toast = useRef<Toast>(null);

  // Queries
  const {
    data: allCourriers = [],
    isLoading,
    error,
    refetch,
  } = useCourriers({});

  // Mutations
  const validerMutation = useValiderCourrier();
  const rejeterMutation = useRejeterCourrier();
  const attribuerMultipleMutation = useAttribuerMultiple();
  const deleteMutation = useDeleteCourrier();

  // États UI
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(
    null,
  );
  const [showAttribution, setShowAttribution] = useState(false);
  const [showRejet, setShowRejet] = useState(false);
  const [rejetMotif, setRejetMotif] = useState("");
  const [currentCourrierId, setCurrentCourrierId] = useState<number | null>(
    null,
  );

  // Attribution multiple
  const [attributionItems, setAttributionItems] = useState<AttributionItem[]>(
    [],
  );
  const [currentItem, setCurrentItem] = useState<AttributionItem>({
    id: "",
    type: "entiteeDeux",
    entiteeDeuxIds: [],
    agentIds: [],
    agentNoms: [],
    entiteeNoms: [],
    date_limite_traitement: null,
    instructions: "",
    commentaire: "",
  });

  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [agentsWithService, setAgentsWithService] = useState<Agent[]>([]);
  const [agentsDirection, setAgentsDirection] = useState<Agent[]>([]);
  const [entiteesDeuxList, setEntiteesDeuxList] = useState<EntiteeOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<EntiteeOption[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const getEntiteeDisplayName = (e: EntiteeOption): string => {
    if (e.libelle && e.libelle.trim()) return e.libelle;
    if (e.titre && e.titre.trim()) return e.titre;
    if (e.code && e.code.trim()) return e.code;
    return `Service ${e.id}`;
  };

  // ✅ Préparer les options des agents pour les MultiSelect
  const getAgentOptions = (agents: any[]) => {
    return agents.map((agent) => ({
      id: agent.id,
      label:
        `${agent.nom || ""} ${agent.prenom || ""}`.trim() ||
        agent.email ||
        `Agent ${agent.id}`,
    }));
  };

  // ✅ Filtrer les agents par service sélectionné (utilisation de useMemo pour performance)
  // ✅ Filtrer les agents par service sélectionné (utilisation de useMemo pour performance)
  const filteredAgents = React.useMemo(() => {
    if (selectedServices.length === 0) {
      return agentsWithService;
    }
    const serviceIds = selectedServices.map((s) => s.id);
    return agentsWithService.filter((agent) => {
      const agentServiceId = agent.fonction_details?.entitee_deux_id;
      // ✅ Correction : Vérifier que agentServiceId n'est pas null/undefined avant includes
      return (
        agentServiceId !== null &&
        agentServiceId !== undefined &&
        serviceIds.includes(agentServiceId)
      );
    });
  }, [selectedServices, agentsWithService]);
  // Charger les données
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/user");
        let agents: Agent[] = []; // ✅ Ajouter le type
        if (response.data.success) {
          agents = response.data.data || [];
        } else if (Array.isArray(response.data)) {
          agents = response.data;
        } else {
          agents = [];
        }

        // Séparer les agents avec service et les agents de direction
        const withService = agents.filter(
          (
            agent: Agent, // ✅ Ajouter le type
          ) =>
            agent.fonction_details?.entitee_deux_id !== null &&
            agent.fonction_details?.entitee_deux_id !== undefined,
        );
        const direction = agents.filter(
          (
            agent: Agent, // ✅ Ajouter le type
          ) =>
            (!agent.fonction_details?.entitee_deux_id ||
              agent.fonction_details?.entitee_deux_id === null) &&
            (!agent.fonction_details?.entitee_trois_id ||
              agent.fonction_details?.entitee_trois_id === null),
        );

        setAgentsList(agents);
        setAgentsWithService(withService);
        setAgentsDirection(direction);
      } catch (err) {
        console.error("Erreur chargement agents", err);
        setAgentsList([]);
        setAgentsWithService([]);
        setAgentsDirection([]);
      }
    };

    const fetchEntiteesDeux = async () => {
      try {
        const response = await api.get("/entiteeDeux");
        let data = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data.entiteeDeux &&
          Array.isArray(response.data.entiteeDeux)
        ) {
          data = response.data.entiteeDeux;
        } else {
          data = [];
        }
        setEntiteesDeuxList(data);
      } catch (err) {
        console.error("Erreur chargement entiteesDeux", err);
        setEntiteesDeuxList([]);
      }
    };

    fetchAgents();
    fetchEntiteesDeux();
  }, []);

  const filteredData = React.useMemo(() => {
    return allCourriers.filter((c: Courrier) =>
      `${c.reference || ""} ${c.objet || ""} ${c.type || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [allCourriers, query]);

  const paginated = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Actions
  const handleValider = async (courrier: Courrier) => {
    try {
      await validerMutation.mutateAsync(courrier.idcourrier);
      toast.current?.show({
        severity: "success",
        summary: "Validé",
        detail: "Courrier validé avec succès",
      });
      refetch();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message || "Échec de la validation",
      });
    }
  };

  const handleOpenRejet = (courrier: Courrier) => {
    setCurrentCourrierId(courrier.idcourrier);
    setRejetMotif("");
    setShowRejet(true);
  };

  const handleSubmitRejet = async () => {
    if (!rejetMotif.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Motif requis",
        detail: "Veuillez indiquer le motif du rejet",
      });
      return;
    }

    try {
      await rejeterMutation.mutateAsync({
        id: currentCourrierId!,
        motif: rejetMotif,
      });
      toast.current?.show({
        severity: "success",
        summary: "Rejeté",
        detail: "Courrier rejeté avec succès",
      });
      setShowRejet(false);
      setRejetMotif("");
      refetch();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message,
      });
    }
  };

  const handleOpenAttribution = (courrier: Courrier) => {
    setCurrentCourrierId(courrier.idcourrier);
    setAttributionItems([]);
    setCurrentItem({
      id: "",
      type: "entiteeDeux",
      entiteeDeuxIds: [],
      agentIds: [],
      agentNoms: [],
      entiteeNoms: [],
      date_limite_traitement: null,
      instructions: "",
      commentaire: "",
    });
    setSelectedServices([]);
    setShowAttribution(true);
  };

  const addAttributionItem = () => {
    if (currentItem.type === "agent" && currentItem.agentIds.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Veuillez sélectionner au moins un agent",
      });
      return;
    }
    if (currentItem.type === "direction" && currentItem.agentIds.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Veuillez sélectionner au moins un agent de la direction",
      });
      return;
    }
    if (
      currentItem.type === "entiteeDeux" &&
      currentItem.entiteeDeuxIds.length === 0
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Veuillez sélectionner au moins un service",
      });
      return;
    }

    let entiteeNoms: string[] = [];
    if (
      currentItem.type === "entiteeDeux" &&
      currentItem.entiteeDeuxIds.length > 0
    ) {
      entiteeNoms = currentItem.entiteeDeuxIds.map((id) => {
        const entitee = entiteesDeuxList.find((e) => e.id === id);
        return getEntiteeDisplayName(entitee || { id });
      });
    }

    let agentNoms: string[] = [];
    if (
      (currentItem.type === "agent" || currentItem.type === "direction") &&
      currentItem.agentIds.length > 0
    ) {
      agentNoms = currentItem.agentIds.map((id) => {
        const agent = agentsList.find((a) => a.id === id);
        return agent
          ? `${agent.nom || ""} ${agent.prenom || ""}`.trim()
          : `Agent ${id}`;
      });
    }

    const newItem: AttributionItem = {
      id: Date.now().toString(),
      type: currentItem.type,
      entiteeDeuxIds: [...currentItem.entiteeDeuxIds],
      agentIds: [...currentItem.agentIds],
      agentNoms: agentNoms,
      entiteeNoms: entiteeNoms,
      date_limite_traitement: currentItem.date_limite_traitement,
      instructions: currentItem.instructions,
      commentaire: currentItem.commentaire,
    };

    setAttributionItems([...attributionItems, newItem]);

    // Réinitialiser
    setCurrentItem({
      id: "",
      type: "entiteeDeux",
      entiteeDeuxIds: [],
      agentIds: [],
      agentNoms: [],
      entiteeNoms: [],
      date_limite_traitement: null,
      instructions: "",
      commentaire: "",
    });
    setSelectedServices([]);
  };

  const removeAttributionItem = (id: string) => {
    setAttributionItems(attributionItems.filter((item) => item.id !== id));
  };

  const submitMultipleAttributions = async () => {
    if (attributionItems.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Aucune attribution",
        detail: "Ajoutez au moins une attribution",
      });
      return;
    }

    try {
      const attributions: any[] = [];

      for (const item of attributionItems) {
        if (item.type === "agent" || item.type === "direction") {
          for (const agentId of item.agentIds) {
            attributions.push({
              type: "agent",
              id: agentId,
              date_limite_traitement:
                item.date_limite_traitement?.toISOString(),
              instructions: item.instructions,
              commentaire: item.commentaire,
            });
          }
        } else if (item.type === "entiteeDeux") {
          for (const serviceId of item.entiteeDeuxIds) {
            attributions.push({
              type: "entiteeDeux",
              id: serviceId,
              commentaire: item.commentaire,
            });
          }
        }
      }

      console.log("📤 Envoi attributions multiples:", attributions);

      const response = await attribuerMultipleMutation.mutateAsync({
        id: currentCourrierId!,
        attributions: attributions,
      });

      toast.current?.show({
        severity: "success",
        summary: "Attribué",
        detail:
          response.data?.message ||
          `${attributions.length} attribution(s) effectuée(s)`,
      });
      setShowAttribution(false);
      setAttributionItems([]);
      refetch();
    } catch (err: any) {
      console.error("❌ Erreur:", err.response?.data);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDelete = (id: number) => {
    confirmDialog({
      message: "Supprimer définitivement ce courrier ?",
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
            detail: "Courrier supprimé",
          });
          refetch();
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: err.message,
          });
        }
      },
    });
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
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Gestion des Courriers
            </h1>
            <p className="text-slate-500 font-medium">
              Validation, rejet et attribution multiple
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
                  onClick={() => setSelectedCourrier(c)}
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
                    <Tag value={c.statut || "En attente"} severity="warning" />
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
                      {c.statut === "EN_ATTENTE" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleValider(c);
                            }}
                            className="p-3 text-slate-400 hover:text-green-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                            title="Valider"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRejet(c);
                            }}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                            title="Rejeter"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                      {c.statut === "VALIDÉ" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAttribution(c);
                          }}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Attribuer"
                        >
                          <UserPlus size={20} />
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
                  colSpan={5}
                  className="px-6 py-16 text-center text-slate-500"
                >
                  Aucun courrier trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {/* MODALE D'ATTRIBUTION MULTIPLE */}
      <Dialog
        visible={showAttribution}
        onHide={() => {
          setShowAttribution(false);
          setAttributionItems([]);
        }}
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <UserPlus size={18} className="text-emerald-600" />
            </div>
            <span>Attribuer le courrier (multiple)</span>
          </div>
        }
        style={{ width: "800px" }}
        className="rounded-2xl overflow-hidden shadow-2xl"
        draggable={false}
        footer={
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Annuler"
              icon={<X size={16} className="mr-2" />}
              onClick={() => {
                setShowAttribution(false);
                setAttributionItems([]);
              }}
              className="p-button-text text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
            />
            <Button
              label="Ajouter"
              icon={<UserPlus size={16} className="mr-2" />}
              onClick={addAttributionItem}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-2 rounded-xl shadow-lg shadow-blue-200 transition-all font-bold"
            />
            <Button
              label={`Attribuer (${attributionItems.length})`}
              icon={<CheckCircle size={16} className="mr-2" />}
              onClick={submitMultipleAttributions}
              disabled={attributionItems.length === 0}
              className="bg-emerald-700 hover:bg-emerald-800 text-white border-none px-6 py-2 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
            />
          </div>
        }
      >
        <div className="space-y-6 pt-2">
          {/* Liste des attributions en attente */}
          {attributionItems.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-emerald-500" />
                Attributions à envoyer ({attributionItems.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attributionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex-1">
                      {item.type === "agent" ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-blue-600" />
                            <span className="text-sm font-medium text-slate-700">
                              Agents ({item.agentNoms.length}):
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 ml-6">
                            {item.agentNoms.join(", ")}
                          </div>
                        </div>
                      ) : item.type === "direction" ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">
                              Agents Direction ({item.agentNoms.length}):
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 ml-6">
                            {item.agentNoms.join(", ")}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-purple-600" />
                            <span className="text-sm font-medium text-slate-700">
                              Services ({item.entiteeNoms.length}):
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 ml-6">
                            {item.entiteeNoms.join(", ")}
                          </div>
                        </div>
                      )}
                      {item.date_limite_traitement && (
                        <p className="text-xs text-slate-500 mt-1 ml-6">
                          📅 Date limite:{" "}
                          {item.date_limite_traitement.toLocaleString()}
                        </p>
                      )}
                      {item.instructions && (
                        <p className="text-xs text-slate-400 mt-1 ml-6">
                          📝 Instructions: {item.instructions.substring(0, 50)}
                          ...
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeAttributionItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire d'ajout */}
          <div className="space-y-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                <UserPlus size={14} className="text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">
                Ajouter une attribution
              </h4>
            </div>

            {/* Radio Buttons */}
            <div className="flex gap-6 flex-wrap p-3 bg-white rounded-xl border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioButton
                  value="entiteeDeux"
                  onChange={(e) => {
                    setCurrentItem({
                      ...currentItem,
                      type: e.value,
                      entiteeDeuxIds: [],
                      agentIds: [],
                    });
                    setSelectedServices([]);
                  }}
                  checked={currentItem.type === "entiteeDeux"}
                />
                <span className="text-sm font-medium text-slate-600">
                  Services
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioButton
                  value="agent"
                  onChange={(e) => {
                    setCurrentItem({
                      ...currentItem,
                      type: e.value,
                      entiteeDeuxIds: [],
                      agentIds: [],
                    });
                    setSelectedServices([]);
                  }}
                  checked={currentItem.type === "agent"}
                />
                <span className="text-sm font-medium text-slate-600">
                  Agents
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioButton
                  value="direction"
                  onChange={(e) => {
                    setCurrentItem({
                      ...currentItem,
                      type: e.value,
                      entiteeDeuxIds: [],
                      agentIds: [],
                    });
                    setSelectedServices([]);
                  }}
                  checked={currentItem.type === "direction"}
                />
                <span className="text-sm font-medium text-slate-600">
                  Agents Direction
                </span>
              </label>
            </div>

            {/* Sélection des Services */}
            {currentItem.type === "entiteeDeux" && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-emerald-500" /> Services
                  *
                </label>
                <MultiSelect
                  value={currentItem.entiteeDeuxIds}
                  options={entiteesDeuxList}
                  optionLabel="libelle"
                  optionValue="id"
                  onChange={(e) => {
                    setCurrentItem({ ...currentItem, entiteeDeuxIds: e.value });
                  }}
                  placeholder="Sélectionner un ou plusieurs services"
                  className="w-full"
                  filter
                  display="chip"
                />
              </div>
            )}

            {/* Filtrage par Service pour les Agents */}
            {currentItem.type === "agent" && (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={14} className="text-emerald-500" /> Filtrer
                    par service
                  </label>
                  <MultiSelect
                    value={selectedServices}
                    options={entiteesDeuxList}
                    optionLabel="libelle"
                    optionValue="id"
                    onChange={(e) => {
                      setSelectedServices(e.value);
                      setCurrentItem((prev) => ({ ...prev, agentIds: [] }));
                    }}
                    placeholder="Filtrer les agents par service"
                    className="w-full"
                    filter
                    display="chip"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} className="text-emerald-500" /> Agents *
                  </label>
                  <MultiSelect
                    value={currentItem.agentIds}
                    options={getAgentOptions(filteredAgents)}
                    optionLabel="label"
                    optionValue="id"
                    onChange={(e) => {
                      setCurrentItem({ ...currentItem, agentIds: e.value });
                    }}
                    placeholder="Sélectionner un ou plusieurs agents"
                    className="w-full"
                    filter
                    display="chip"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {filteredAgents.length} agent(s) disponible(s)
                    {selectedServices.length > 0 &&
                      ` pour ${selectedServices.length} service(s) sélectionné(s)`}
                  </div>
                </div>
              </>
            )}

            {/* Agents de Direction */}
            {currentItem.type === "direction" && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-emerald-500" /> Agents de la
                  direction *
                </label>
                <MultiSelect
                  value={currentItem.agentIds}
                  options={getAgentOptions(agentsDirection)}
                  optionLabel="label"
                  optionValue="id"
                  onChange={(e) => {
                    setCurrentItem({ ...currentItem, agentIds: e.value });
                  }}
                  placeholder="Sélectionner un ou plusieurs agents de la direction"
                  className="w-full"
                  filter
                  display="chip"
                />
              </div>
            )}

            {/* Date limite */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                📅 Date limite
              </label>
              <Calendar
                value={currentItem.date_limite_traitement}
                onChange={(e) => {
                  const newDate = Array.isArray(e.value) ? e.value[0] : e.value;
                  setCurrentItem({
                    ...currentItem,
                    date_limite_traitement: newDate || null,
                  });
                }}
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                placeholder="JJ/MM/AAAA HH:MM"
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                📝 Instructions
              </label>
              <InputTextarea
                value={currentItem.instructions}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    instructions: e.target.value,
                  })
                }
                placeholder="Instructions pour cette attribution"
                rows={3}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                💬 Commentaire
              </label>
              <InputText
                value={currentItem.commentaire}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    commentaire: e.target.value,
                  })
                }
                placeholder="Commentaire optionnel"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* MODALE DE REJET */}
      <Dialog
        visible={showRejet}
        onHide={() => setShowRejet(false)}
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle size={18} className="text-red-600" />
            </div>
            <span>Rejeter le courrier</span>
          </div>
        }
        style={{ width: "480px" }}
        className="rounded-2xl overflow-hidden shadow-2xl"
        draggable={false}
        footer={
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Annuler"
              icon={<X size={16} className="mr-2" />}
              onClick={() => setShowRejet(false)}
              className="p-button-text text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
            />
            <Button
              label="Rejeter"
              icon={<XCircle size={16} className="mr-2" />}
              onClick={handleSubmitRejet}
              className="bg-red-600 hover:bg-red-700 text-white border-none px-6 py-2 rounded-xl shadow-lg shadow-red-200 transition-all font-bold"
            />
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle size={18} className="text-red-600 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed">
              <span className="font-bold block uppercase mb-1">
                ⚠️ Action irréversible
              </span>
              Cette action est définitive. Le courrier sera marqué comme rejeté.
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <XCircle size={14} className="text-red-500" /> Motif du rejet *
            </label>
            <InputTextarea
              value={rejetMotif}
              onChange={(e) => setRejetMotif(e.target.value)}
              placeholder="Indiquez la raison du rejet..."
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all"
              autoFocus
            />
          </div>
        </div>
      </Dialog>

      {/* Modale détails */}
      <CourrierDetails
        visible={!!selectedCourrier}
        onHide={() => setSelectedCourrier(null)}
        courrier={selectedCourrier}
      />
    </Layout>
  );
}
