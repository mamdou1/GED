// // src/pages/clients/AssignationTypeDocToTypeCompte.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { Dialog } from "primereact/dialog";
// import { Button } from "primereact/button";
// import { Dropdown } from "primereact/dropdown";
// import { Toast } from "primereact/toast";
// import { X, Save, GitCompareArrows, Building2 } from "lucide-react";
// import { TypeDocument } from "../../interfaces";
// import { useTypeComptes } from "../../hooks//useTypeComptes";
// import { useAssignTypeCompteToTypeDocument } from "../../hooks/useTypeDocuments";

// interface AssignationTypeDocToTypeCompteProps {
//   visible: boolean;
//   onHide: () => void;
//   typeDocument: TypeDocument | null;
//   onSuccess?: () => void;
// }

// const AssignationTypeDocToTypeCompte: React.FC<
//   AssignationTypeDocToTypeCompteProps
// > = ({ visible, onHide, typeDocument, onSuccess }) => {
//   const toast = useRef<Toast>(null);
//   const { data: typeComptesData, refetch: refetchTypeComptes } =
//     useTypeComptes();
//   const assignMutation = useAssignTypeCompteToTypeDocument();

//   const [selectedTypeCompteId, setSelectedTypeCompteId] = useState<
//     number | null
//   >(null);
//   const [loading, setLoading] = useState(false);

//   const typeComptes = typeComptesData?.data || typeComptesData || [];

//   useEffect(() => {
//     if (typeDocument) {
//       setSelectedTypeCompteId(typeDocument.type_compte_id || null);
//     }
//   }, [typeDocument, visible]);

//   const typeCompteOptions = [
//   { label: "Aucun", value: null },
//   ...(Array.isArray(typeComptes) ? typeComptes : []).map((tc: any) => ({
//     label: tc.nom,
//     value: tc.id,
//   })),
// ];

//   const handleSubmit = async () => {
//     if (!typeDocument) return;

//     setLoading(true);
//     try {
//       await assignMutation.mutateAsync({
//         typeDocumentId: typeDocument.id,
//         typeCompteId: selectedTypeCompteId,
//       });

//       toast.current?.show({
//         severity: "success",
//         summary: "Succès",
//         detail: selectedTypeCompteId
//           ? "Type de compte assigné avec succès"
//           : "Type de compte dissocié avec succès",
//       });

//       onSuccess?.();
//       onHide();
//     } catch (error: any) {
//       toast.current?.show({
//         severity: "error",
//         summary: "Erreur",
//         detail: error.response?.data?.message || "Une erreur est survenue",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const labelClass =
//     "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";

//   return (
//     <>
//       <Toast ref={toast} />
//       <Dialog
//         header={
//           <div className="flex items-center gap-2 text-slate-800 font-bold">
//             <div className="bg-emerald-100 p-2 rounded-lg">
//               <GitCompareArrows size={18} className="text-emerald-600" />
//             </div>
//             <span>Assigner un type de compte</span>
//           </div>
//         }
//         visible={visible}
//         style={{ width: "500px", maxWidth: "90vw" }}
//         onHide={onHide}
//         draggable={false}
//         className="rounded-2xl overflow-hidden shadow-2xl"
//         footer={
//           <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
//             <Button
//               label="Annuler"
//               icon={<X size={18} className="mr-2" />}
//               onClick={onHide}
//               className="p-button-text text-slate-400 font-bold hover:text-slate-600"
//               disabled={loading}
//             />
//             <Button
//               label={loading ? "Enregistrement..." : "Enregistrer"}
//               icon={!loading && <Save size={18} className="mr-2" />}
//               onClick={handleSubmit}
//               disabled={loading}
//               className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
//             />
//           </div>
//         }
//       >
//         <div className="space-y-5 pt-2">
//           <div className="space-y-2">
//             <label className={labelClass}>
//               <Building2 size={14} className="text-emerald-500" /> Type de
//               document
//             </label>
//             <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
//               <p className="font-medium text-slate-800">{typeDocument?.nom}</p>
//               <p className="text-xs text-slate-500 font-mono mt-1">
//                 Code: {typeDocument?.code}
//               </p>
//               {typeDocument?.conserne && (
//                 <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
//                   {typeDocument.conserne === "Personne physique"
//                     ? "👤 Personne physique"
//                     : "🏢 Personne morale"}
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className={labelClass}>
//               <GitCompareArrows size={14} className="text-emerald-500" /> Type
//               de compte à associer
//             </label>
//             <Dropdown
//               value={selectedTypeCompteId}
//               options={typeCompteOptions}
//               onChange={(e) => setSelectedTypeCompteId(e.value)}
//               placeholder="Sélectionner un type de compte"
//               className="w-full bg-slate-50 border border-slate-200 rounded-xl"
//               showClear
//             />
//             <p className="text-[10px] text-slate-400 mt-1">
//               Sélectionnez "Aucun" pour dissocier le type de compte.
//             </p>
//           </div>

//           {/* Aperçu de l'association actuelle */}
//           <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
//             <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
//               <span>ℹ️</span> Information
//             </p>
//             <p className="text-xs text-amber-600 mt-1">
//               {typeDocument?.type_compte
//                 ? `Ce type de document est actuellement associé à : "${typeDocument.type_compte.nom}"`
//                 : "Ce type de document n'est associé à aucun type de compte"}
//             </p>
//           </div>
//         </div>
//       </Dialog>
//     </>
//   );
// };

// export default AssignationTypeDocToTypeCompte;

// src/pages/clients/AssignationTypeDocToTypeCompte.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import {
  Save,
  GitCompareArrows,
  CheckSquare,
  List,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import { TypeCompte, TypeDocument } from "../../interfaces";
import { useTypeComptes } from "../../hooks/useTypeComptes";
import {
  useAssignTypeCompteToTypeDocument,
  useTypesWithConserne,
} from "../../hooks/useTypeDocuments";

interface AssignationTypeDocToTypeCompteProps {
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  typeCompte?: TypeCompte | null;
}

const AssignationTypeDocToTypeCompte: React.FC<
  AssignationTypeDocToTypeCompteProps
> = ({ visible, onHide, onSuccess, typeCompte }) => {
  const toast = useRef<Toast>(null);
  const { data: typeComptesData } = useTypeComptes();
  const assignMutation = useAssignTypeCompteToTypeDocument();
  const { data: typesWithConserneData, refetch: refetchTypes } =
    useTypesWithConserne({ limit: 200 });

  const [selectedTypeCompteId, setSelectedTypeCompteId] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);

  // États pour l'affectation multiple
  const [availableTypes, setAvailableTypes] = useState<TypeDocument[]>([]);
  const [assignedTypes, setAssignedTypes] = useState<TypeDocument[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAvailable, setFilteredAvailable] = useState<TypeDocument[]>(
    [],
  );
  const [originalAssignedIds, setOriginalAssignedIds] = useState<number[]>([]);

  const typeComptesRaw = typeComptesData?.data || typeComptesData || [];
  const typeComptes: any[] = Array.isArray(typeComptesRaw)
    ? typeComptesRaw
    : [];

  const typesWithConserne: TypeDocument[] = Array.isArray(typesWithConserneData)
    ? typesWithConserneData
    : typesWithConserneData?.data || [];

  // Initialiser / recalculer les listes quand le modal s'ouvre ou que le
  // `selectedTypeCompteId` change. On conserve `originalAssignedIds` pour
  // détecter ce qui doit être assigné ou dissocié lors de la soumission.
  useEffect(() => {
    if (!visible || typesWithConserne.length === 0) return;

    let assigned: TypeDocument[] = [];
    let available: TypeDocument[] = [];

    if (selectedTypeCompteId === null) {
      // Mode "Aucun" : on affiche à droite les types qui sont actuellement
      // associés à un type de compte (pour permettre leur dissociation)
      assigned = typesWithConserne.filter(
        (t) => t.type_compte_id !== null && t.type_compte_id !== undefined,
      );
      available = typesWithConserne.filter(
        (t) => t.type_compte_id === null || t.type_compte_id === undefined,
      );
      setOriginalAssignedIds(assigned.map((t) => t.id));
    } else {
      // Mode normal : à droite les types associés au `selectedTypeCompteId`,
      // à gauche tous les autres
      assigned = typesWithConserne.filter(
        (t) => t.type_compte_id === selectedTypeCompteId,
      );
      available = typesWithConserne.filter(
        (t) => t.type_compte_id !== selectedTypeCompteId,
      );
      setOriginalAssignedIds(assigned.map((t) => t.id));
    }

    setAssignedTypes(assigned);
    setAvailableTypes(available);
    setFilteredAvailable(available);
    setSelectedAvailable([]);
    setSelectedAssigned([]);
  }, [visible, typesWithConserne, selectedTypeCompteId]);

  // Filtrer les types disponibles
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

  // useEffect(() => {
  //   console.log("🔍 typeComptesData:", typeComptesData);
  //   console.log("🔍 typeComptesRaw:", typeComptesRaw);
  //   console.log("🔍 typeComptes:", typeComptes);
  //   console.log("🔍 typeCompteOptions:", typeCompteOptions);
  // }, [typeComptesData, visible]);

  useEffect(() => {
    if (typeCompte) {
      setSelectedTypeCompteId(typeCompte.id);
    }
  }, [typeCompte]);

  // Déplacer vers la droite (ajouter à l'affectation)
  const handleAddTypes = () => {
    const toAdd = availableTypes.filter((t) =>
      selectedAvailable.includes(t.id),
    );
    setAssignedTypes([...assignedTypes, ...toAdd]);
    setAvailableTypes(
      availableTypes.filter((t) => !selectedAvailable.includes(t.id)),
    );
    setSelectedAvailable([]);
  };

  // Déplacer vers la gauche (retirer de l'affectation)
  const handleRemoveTypes = () => {
    const toRemove = assignedTypes.filter((t) =>
      selectedAssigned.includes(t.id),
    );
    setAvailableTypes([...availableTypes, ...toRemove]);
    setAssignedTypes(
      assignedTypes.filter((t) => !selectedAssigned.includes(t.id)),
    );
    setSelectedAssigned([]);
  };

  const typeCompteOptions = [
    { label: "Aucun", value: null },
    ...typeComptes.map((tc: any) => ({
      label: tc.nom,
      value: tc.id,
    })),
  ];

  // Soumettre l'affectation multiple
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Déterminer les changements : assignations et désassignations
      const currentAssignedIds = assignedTypes.map((t) => t.id);

      if (selectedTypeCompteId === null) {
        // Mode dissociation : tous les `assignedTypes` doivent être dissociés
        for (const id of currentAssignedIds) {
          await assignMutation.mutateAsync({
            typeDocumentId: id,
            typeCompteId: null,
          });
        }
      } else {
        const toAssign = currentAssignedIds.filter(
          (id) => !originalAssignedIds.includes(id),
        );
        const toUnassign = originalAssignedIds.filter(
          (id) => !currentAssignedIds.includes(id),
        );

        for (const id of toAssign) {
          await assignMutation.mutateAsync({
            typeDocumentId: id,
            typeCompteId: selectedTypeCompteId,
          });
        }

        for (const id of toUnassign) {
          await assignMutation.mutateAsync({
            typeDocumentId: id,
            typeCompteId: null,
          });
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${assignedTypes.length} type(s) de document affecté(s) avec succès`,
      });

      refetchTypes();
      onSuccess?.();
      onHide();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <GitCompareArrows size={18} className="text-emerald-600" />
            </div>
            <span>Affectation multiple de types de documents</span>
          </div>
        }
        visible={visible}
        style={{
          width: "1100px",
          maxWidth: "95vw",
        }}
        onHide={onHide}
        draggable={false}
        className="rounded-2xl overflow-hidden shadow-2xl"
        footer={
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Annuler"
              onClick={onHide}
              className="p-button-text text-slate-400 font-bold hover:text-slate-600"
              disabled={loading}
            />
            <Button
              label={loading ? "Enregistrement..." : "Enregistrer"}
              icon={!loading && <Save size={18} className="mr-2" />}
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
            />
          </div>
        }
      >
        <div className="pt-4">
          {/* Sélection du type de compte cible */}
          <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <label className={labelClass}>
              <GitCompareArrows size={14} className="text-emerald-500" /> Type
              de compte à appliquer
            </label>
            <Dropdown
              value={selectedTypeCompteId}
              options={typeCompteOptions}
              onChange={(e) => {
                console.log("✅ Type de compte sélectionné:", e.value);
                setSelectedTypeCompteId(e.value);
              }}
              placeholder="Sélectionner un type de compte"
              className="w-full bg-white border border-emerald-200 rounded-xl"
              showClear
              filter // ✅ Ajoutez filter pour pouvoir rechercher
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Sélectionnez "Aucun" pour dissocier les types de leur type de
              compte.
            </p>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Zone principale avec les deux listes */}
          <div className="flex gap-4 h-[450px]">
            {/* Liste des types disponibles (gauche) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <List size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Types disponibles ({filteredAvailable.length})
                </span>
              </div>
              <div className="flex-1 border-2 border-slate-200 rounded-2xl overflow-y-auto bg-white shadow-inner">
                {filteredAvailable.length > 0 ? (
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
                        <span className="truncate">{t.nom}</span>
                        {t.conserne && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                            {t.conserne === "Personne physique" ? "👤" : "🏢"}
                          </span>
                        )}
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
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                tooltip="Ajouter à l'affectation"
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
                tooltip="Retirer de l'affectation"
                tooltipOptions={{ position: "top" }}
              />
            </div>

            {/* Liste des types à affecter (droite) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Types à affecter ({assignedTypes.length})
                </span>
              </div>
              <div className="flex-1 border-2 border-emerald-200 rounded-2xl overflow-y-auto bg-emerald-50/30 shadow-inner">
                {assignedTypes.length > 0 ? (
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
                        <span className="truncate">{t.nom}</span>
                        {t.type_compte && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                            {t.type_compte.nom}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                    Aucun type à affecter
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AssignationTypeDocToTypeCompte;
