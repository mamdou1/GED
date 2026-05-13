// EntiteeAjoutTypeDocument.tsx - Version pour entitee_un/deux/trois
import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import {
  ArrowRight,
  ArrowLeft,
  List,
  CheckSquare,
  Search,
  Building2,
  Briefcase,
  Split,
} from "lucide-react";
import { TypeDocument } from "../../interfaces";

// ✅ IMPORTER LES HOOKS POUR LES TYPES D'ENTITÉS
import {
  useEntiteeUnTypes,
  useAddTypesToEntiteeUn,
  useRemoveTypesFromEntiteeUn,
  useEntiteeDeuxTypes,
  useAddTypesToEntiteeDeux,
  useRemoveTypesFromEntiteeDeux,
  useEntiteeTroisTypes,
  useAddTypesToEntiteeTrois,
  useRemoveTypesFromEntiteeTrois,
  useEntiteeUnById,
  useEntiteeDeuxById,
  useEntiteeTroisById,
} from "../../hooks";

type EntityType = "entiteeUn" | "entiteeDeux" | "entiteeTrois";

type Props = {
  visible: boolean;
  onHide: () => void;
  entityId: number;
  entityType: EntityType;
  entityLabel?: string;
  allTypes: TypeDocument[];
  onSuccess?: () => void;
};

export default function EntiteeAjoutTypeDocument({
  visible,
  onHide,
  entityId,
  entityType,
  entityLabel,
  allTypes,
  onSuccess,
}: Props) {
  const toast = React.useRef<Toast>(null);

  // État pour les listes
  const [availableTypes, setAvailableTypes] = useState<TypeDocument[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<TypeDocument[]>(
    [],
  );
  const [assignedTypes, setAssignedTypes] = useState<TypeDocument[]>([]);

  // États pour les sélections
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Hooks conditionnels selon le type d'entité
  const entiteeUnTypesQuery = useEntiteeUnTypes(
    visible && entityType === "entiteeUn" ? entityId : undefined,
  );
  const entiteeDeuxTypesQuery = useEntiteeDeuxTypes(
    visible && entityType === "entiteeDeux" ? entityId : undefined,
  );
  const entiteeTroisTypesQuery = useEntiteeTroisTypes(
    visible && entityType === "entiteeTrois" ? entityId : undefined,
  );

  // Récupérer la query appropriée
  const getTypesQuery = () => {
    switch (entityType) {
      case "entiteeUn":
        return entiteeUnTypesQuery;
      case "entiteeDeux":
        return entiteeDeuxTypesQuery;
      case "entiteeTrois":
        return entiteeTroisTypesQuery;
    }
  };
  const typesQuery = getTypesQuery();

  // Mutations
  const addToEntiteeUn = useAddTypesToEntiteeUn();
  const addToEntiteeDeux = useAddTypesToEntiteeDeux();
  const addToEntiteeTrois = useAddTypesToEntiteeTrois();
  const removeFromEntiteeUn = useRemoveTypesFromEntiteeUn();
  const removeFromEntiteeDeux = useRemoveTypesFromEntiteeDeux();
  const removeFromEntiteeTrois = useRemoveTypesFromEntiteeTrois();

  // Récupérer les infos de l'entité pour le titre
  const { data: entiteeUn } = useEntiteeUnById(
    entityType === "entiteeUn" ? entityId : null,
  );
  const { data: entiteeDeux } = useEntiteeDeuxById(
    entityType === "entiteeDeux" ? entityId : null,
  );
  const { data: entiteeTrois } = useEntiteeTroisById(
    entityType === "entiteeTrois" ? entityId : null,
  );

  // ✅ Titre dynamique depuis la BDD
  const entityDisplayTitle = useMemo(() => {
    const baseLabel = entityLabel || "Entité";

    switch (entityType) {
      case "entiteeUn":
        return entiteeUn?.titre
          ? `${entiteeUn.titre} : ${entiteeUn.libelle || baseLabel}`
          : `Entité 1 : ${baseLabel}`;
      case "entiteeDeux":
        return entiteeDeux?.titre
          ? `${entiteeDeux.titre} : ${entiteeDeux.libelle || baseLabel}`
          : `Entité 2 : ${baseLabel}`;
      case "entiteeTrois":
        return entiteeTrois?.titre
          ? `${entiteeTrois.titre} : ${entiteeTrois.libelle || baseLabel}`
          : `Entité 3 : ${baseLabel}`;
      default:
        return baseLabel;
    }
  }, [entityType, entiteeUn, entiteeDeux, entiteeTrois, entityLabel]);

  // Icône selon le type
  const getEntityIcon = () => {
    switch (entityType) {
      case "entiteeUn":
        return <Building2 size={20} className="text-dgcc5" />;
      case "entiteeDeux":
        return <Briefcase size={20} className="text-dgcc5" />;
      case "entiteeTrois":
        return <Split size={20} className="text-blue-600" />;
    }
  };

  // Charger les types quand le modal s'ouvre
  useEffect(() => {
    if (visible && entityId > 0) {
      typesQuery.refetch();
    }
  }, [visible, entityId]);

  // Mettre à jour les listes
  useEffect(() => {
    // Vérifier que les données sont chargées
    const queryData = typesQuery.data;
    const allTypesAvailable = allTypes && allTypes.length > 0;

    if (allTypesAvailable) {
      // Si la query a des données, filtrer selon les IDs assignés
      if (queryData && Array.isArray(queryData) && queryData.length > 0) {
        const assignedIds = new Set(queryData.map((t: TypeDocument) => t.id));
        const assigned = allTypes.filter((t) => assignedIds.has(t.id));
        const available = allTypes.filter((t) => !assignedIds.has(t.id));

        console.log(
          `📊 [${entityType}] Assigned: ${assigned.length}, Available: ${available.length}`,
        );

        setAssignedTypes(assigned);
        setAvailableTypes(available);
      } else {
        // Aucun type assigné : tout est disponible
        console.log(
          `📊 [${entityType}] Aucun type assigné, tout disponible: ${allTypes.length}`,
        );
        setAssignedTypes([]);
        setAvailableTypes([...allTypes]);
      }

      setSelectedAvailable([]);
      setSelectedAssigned([]);
      setSearchQuery("");
    }
  }, [typesQuery.data, allTypes, entityType]);

  // Filtrer
  useEffect(() => {
    if (searchQuery) {
      setFilteredAvailable(
        availableTypes.filter(
          (t) =>
            t.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.code?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredAvailable(availableTypes);
    }
  }, [availableTypes, searchQuery]);

  // Ajoutez ceci juste après le useEffect de mise à jour
  useEffect(() => {
    console.log("🔍 DEBUG EntiteeAjoutTypeDocument:", {
      entityType,
      entityId,
      visible,
      allTypesCount: allTypes?.length,
      typesQueryData: typesQuery.data,
      typesQueryIsLoading: typesQuery.isLoading,
      typesQueryIsSuccess: typesQuery.isSuccess,
      availableCount: availableTypes.length,
      assignedCount: assignedTypes.length,
      filteredAvailableCount: filteredAvailable.length,
    });
  }, [
    visible,
    typesQuery.data,
    allTypes,
    availableTypes,
    assignedTypes,
    filteredAvailable,
  ]);

  useEffect(() => {
    // Si on a allTypes mais pas encore de données de la query
    if (visible && allTypes && allTypes.length > 0 && !typesQuery.data) {
      console.log(
        `📦 [${entityType}] Initialisation avec allTypes: ${allTypes.length}`,
      );
      setAvailableTypes([...allTypes]);
      setAssignedTypes([]);
      setFilteredAvailable([...allTypes]);
    }
  }, [visible, allTypes, typesQuery.data, entityType]);

  // Ajouter
  const handleAddTypes = () => {
    const typesToAdd = availableTypes.filter((t) =>
      selectedAvailable.includes(t.id),
    );
    setAssignedTypes([...assignedTypes, ...typesToAdd]);
    setAvailableTypes(
      availableTypes.filter((t) => !selectedAvailable.includes(t.id)),
    );
    setSelectedAvailable([]);
  };

  // Retirer
  const handleRemoveTypes = () => {
    const typesToRemove = assignedTypes.filter((t) =>
      selectedAssigned.includes(t.id),
    );
    setAvailableTypes([...availableTypes, ...typesToRemove]);
    setAssignedTypes(
      assignedTypes.filter((t) => !selectedAssigned.includes(t.id)),
    );
    setSelectedAssigned([]);
  };

  // Mutation ajout selon le type
  const addMutation = (id: number, typeIds: number[]) => {
    switch (entityType) {
      case "entiteeUn":
        return addToEntiteeUn.mutateAsync({ entiteeUnId: id, typeIds });
      case "entiteeDeux":
        return addToEntiteeDeux.mutateAsync({ entiteeDeuxId: id, typeIds });
      case "entiteeTrois":
        return addToEntiteeTrois.mutateAsync({ entiteeTroisId: id, typeIds });
    }
  };

  // Mutation retrait selon le type
  const removeMutation = (id: number, typeIds: number[]) => {
    switch (entityType) {
      case "entiteeUn":
        return removeFromEntiteeUn.mutateAsync({ entiteeUnId: id, typeIds });
      case "entiteeDeux":
        return removeFromEntiteeDeux.mutateAsync({
          entiteeDeuxId: id,
          typeIds,
        });
      case "entiteeTrois":
        return removeFromEntiteeTrois.mutateAsync({
          entiteeTroisId: id,
          typeIds,
        });
    }
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!entityId || entityId <= 0) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "ID d'entité invalide",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    const initialAssignedIds = new Set(
      (typesQuery.data || []).map((t: TypeDocument) => t.id),
    );
    const currentAssignedIds = new Set(assignedTypes.map((t) => t.id));

    const toAdd = assignedTypes
      .filter((t) => !initialAssignedIds.has(t.id))
      .map((t) => t.id);

    const toRemove = (typesQuery.data || [])
      .filter((t: TypeDocument) => !currentAssignedIds.has(t.id))
      .map((t: TypeDocument) => t.id);

    try {
      if (toAdd.length > 0) await addMutation(entityId, toAdd);
      if (toRemove.length > 0) await removeMutation(entityId, toRemove);

      await typesQuery.refetch();

      setTimeout(() => {
        onSuccess?.();
        onHide();
      }, 500);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || "Une erreur est survenue",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3 text-slate-800">
            {getEntityIcon()}
            <div>
              <span className="font-bold text-lg">
                Gestion des types de documents
              </span>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
                {entityDisplayTitle}
              </p>
            </div>
          </div>
        }
        visible={visible}
        style={{ width: "1100px" }}
        onHide={onHide}
        draggable={false}
        className="rounded-2xl"
      >
        <div className="pt-4">
          {/* Barre de recherche */}
          <div className="mb-4 px-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher un type de document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dgcc5/20 focus:border-dgcc5"
              />
            </div>
          </div>

          {/* Zone principale avec les deux listes */}
          <div className="flex gap-4 h-[500px]">
            {/* Liste des types disponibles (gauche) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <List size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Types disponibles ({filteredAvailable.length})
                </span>
              </div>
              <div className="flex-1 border-2 border-slate-200 rounded-2xl overflow-y-auto bg-white shadow-inner">
                {typesQuery.isLoading ? (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dgcc5"></div>
                  </div>
                ) : filteredAvailable.length > 0 ? (
                  filteredAvailable.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors"
                    >
                      <Checkbox
                        inputId={`avail-${t.id}`}
                        onChange={(e) => {
                          if (e.checked) {
                            setSelectedAvailable([...selectedAvailable, t.id]);
                          } else {
                            setSelectedAvailable(
                              selectedAvailable.filter((id) => id !== t.id),
                            );
                          }
                        }}
                        checked={selectedAvailable.includes(t.id)}
                      />
                      <label
                        htmlFor={`avail-${t.id}`}
                        className="text-sm font-medium text-slate-700 cursor-pointer flex-1 flex items-center gap-2"
                      >
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                          {t.code}
                        </span>
                        <span>{t.nom}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <span className="text-sm italic">
                      {searchQuery
                        ? "Aucun type trouvé"
                        : "Aucun type disponible"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons de transfert */}
            <div className="flex flex-col gap-4 items-center justify-center px-2">
              <Button
                icon={<ArrowRight size={20} />}
                onClick={handleAddTypes}
                disabled={selectedAvailable.length === 0}
                className={`p-3 rounded-full shadow-md transition-all ${
                  selectedAvailable.length > 0
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                tooltip="Ajouter"
                tooltipOptions={{ position: "top" }}
              />
              <Button
                icon={<ArrowLeft size={20} />}
                onClick={handleRemoveTypes}
                disabled={selectedAssigned.length === 0}
                className={`p-3 rounded-full shadow-md transition-all ${
                  selectedAssigned.length > 0
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                tooltip="Retirer"
                tooltipOptions={{ position: "top" }}
              />
            </div>

            {/* Liste des types affectés (droite) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-dgcc6" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Types affectés ({assignedTypes.length})
                </span>
              </div>
              <div className="flex-1 border-2 border-dgcc12 rounded-2xl overflow-y-auto bg-dgcc13/30 shadow-inner">
                {typesQuery.isLoading ? (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dgcc5"></div>
                  </div>
                ) : assignedTypes.length > 0 ? (
                  assignedTypes.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors"
                    >
                      <Checkbox
                        inputId={`assigned-${t.id}`}
                        onChange={(e) => {
                          if (e.checked) {
                            setSelectedAssigned([...selectedAssigned, t.id]);
                          } else {
                            setSelectedAssigned(
                              selectedAssigned.filter((id) => id !== t.id),
                            );
                          }
                        }}
                        checked={selectedAssigned.includes(t.id)}
                      />
                      <label
                        htmlFor={`assigned-${t.id}`}
                        className="text-sm font-medium text-slate-700 cursor-pointer flex-1 flex items-center gap-2"
                      >
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                          {t.code}
                        </span>
                        <span>{t.nom}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                    Aucun type affecté
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button
              label="Annuler"
              onClick={onHide}
              className="p-button-text text-slate-400 hover:text-slate-600 font-medium"
            />
            <Button
              label={loading ? "Enregistrement..." : "Enregistrer"}
              onClick={handleSave}
              className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3 rounded-xl border-none shadow-lg transition-all"
              disabled={loading}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
