// src/pages/courriers/CourrierAttribuer.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { RadioButton } from "primereact/radiobutton";
import { Toast } from "primereact/toast";
import {
  UserPlus,
  X,
  CheckCircle,
  Trash2,
  Building2,
  Users,
} from "lucide-react";
import { useAttribuerMultiple } from "../../hooks/useCourriers";
import api from "../../api/axios";

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

interface CourrierAttribuerProps {
  visible: boolean;
  onHide: () => void;
  courrierId: number | null;
  onSuccess: () => void;
}

const CourrierAttribuer: React.FC<CourrierAttribuerProps> = ({
  visible,
  onHide,
  courrierId,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const attribuerMultipleMutation = useAttribuerMultiple();

  // États internes
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [agentsWithService, setAgentsWithService] = useState<Agent[]>([]);
  const [agentsDirection, setAgentsDirection] = useState<Agent[]>([]);
  const [entiteesDeuxList, setEntiteesDeuxList] = useState<EntiteeOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<EntiteeOption[]>([]);
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

  // Chargement des données
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/user");
        let agents: Agent[] = [];
        if (response.data.success) {
          agents = response.data.data || [];
        } else if (Array.isArray(response.data)) {
          agents = response.data;
        } else {
          agents = [];
        }

        const withService = agents.filter(
          (agent: Agent) =>
            agent.fonction_details?.entitee_deux_id !== null &&
            agent.fonction_details?.entitee_deux_id !== undefined,
        );
        const direction = agents.filter(
          (agent: Agent) =>
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

    if (visible) {
      fetchAgents();
      fetchEntiteesDeux();
    }
  }, [visible]);

  const getEntiteeDisplayName = (e: EntiteeOption): string => {
    if (e.libelle && e.libelle.trim()) return e.libelle;
    if (e.titre && e.titre.trim()) return e.titre;
    if (e.code && e.code.trim()) return e.code;
    return `Service ${e.id}`;
  };

  const getAgentOptions = (agents: Agent[]) => {
    return agents.map((agent) => ({
      id: agent.id,
      label:
        `${agent.nom || ""} ${agent.prenom || ""}`.trim() ||
        agent.email ||
        `Agent ${agent.id}`,
    }));
  };

  const filteredAgents = React.useMemo(() => {
    if (selectedServices.length === 0) {
      return agentsWithService;
    }
    const serviceIds = selectedServices.map((s) => s.id);
    return agentsWithService.filter((agent) => {
      const agentServiceId = agent.fonction_details?.entitee_deux_id;
      return (
        agentServiceId !== null &&
        agentServiceId !== undefined &&
        serviceIds.includes(agentServiceId)
      );
    });
  }, [selectedServices, agentsWithService]);

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
    if (!attributionItems.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Aucune attribution",
        detail: "Ajoutez au moins une attribution",
      });
      return;
    }

    if (!courrierId) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Courrier non identifié",
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

      await attribuerMultipleMutation.mutateAsync({
        id: courrierId,
        attributions: attributions,
      });

      toast.current?.show({
        severity: "success",
        summary: "Attribué",
        detail: `${attributions.length} attribution(s) effectuée(s)`,
      });

      setAttributionItems([]);
      onSuccess();
    } catch (err: any) {
      console.error("❌ Erreur:", err.response?.data);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
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
                setAttributionItems([]);
                onHide();
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
    </>
  );
};

export default CourrierAttribuer;
