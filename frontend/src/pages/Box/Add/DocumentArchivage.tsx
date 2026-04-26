// import React, { useState, useMemo } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { MapPin, DoorOpen, Grid3X3, Columns, Archive } from "lucide-react";
// import { Toast } from "primereact/toast";
// import api from "../../../api/axios";
// import {
//   useSites,
//   useSalles,
//   useRayons,
//   useTraves,
//   useBoxes,
// } from "../../../hooks/useArchivageQueries";
// import { addDocumentToBox } from "../../../api/box";

// interface DocumentArchivageProps {
//   selectedDocuments: Array<{
//     documentId: number;
//     typeDocumentId: number;
//     documentRef: string;
//   }>;
//   onDocumentsArchived: () => void;
// }

// const DocumentArchivage: React.FC<DocumentArchivageProps> = ({
//   selectedDocuments,
//   onDocumentsArchived,
// }) => {
//   const queryClient = useQueryClient();
//   const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
//   const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
//   const [selectedRayonId, setSelectedRayonId] = useState<number | null>(null);
//   const [selectedTraveId, setSelectedTraveId] = useState<number | null>(null);
//   const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
//   const [isArchiving, setIsArchiving] = useState(false);
//   const toastRef = React.useRef<Toast>(null);

//   // =============================================
//   // ✅ CORRECTION : Passer les IDs aux hooks pour le filtrage
//   // =============================================
//   const { data: sites = [], isLoading: sitesLoading } = useSites();

//   // ✅ useSalles reçoit selectedSiteId → ne charge que si un site est sélectionné
//   const { data: sallesBrutes = [], isLoading: sallesLoading } = useSalles(
//     selectedSiteId ?? undefined,
//   );

//   // ✅ useRayons reçoit selectedSalleId → ne charge que si une salle est sélectionnée
//   const { data: rayonsBruts = [], isLoading: rayonsLoading } = useRayons(
//     selectedSalleId ?? undefined,
//   );

//   // ✅ useTraves reçoit selectedRayonId → ne charge que si un rayon est sélectionné
//   const { data: travesBruts = [], isLoading: travesLoading } = useTraves(
//     selectedRayonId ?? undefined,
//   );

//   // ✅ useBoxes charge tous les boxes (filtrés côté client ensuite)
//   const { data: boxes = [], isLoading: boxesLoading } = useBoxes();

//   // =============================================
//   // ✅ SUPPRIMÉ : Les useMemo de filtrage ne sont plus nécessaires
//   // car les hooks retournent déjà les données filtrées
//   // =============================================
//   const salles = sallesBrutes;
//   const rayons = rayonsBruts;
//   const traves = travesBruts;

//   const filteredBoxes = useMemo(() => {
//     if (!selectedTraveId) return [];
//     return boxes.filter((b) => Number(b.trave_id) === selectedTraveId);
//   }, [boxes, selectedTraveId]);

//   // =============================================
//   // RÉINITIALISATION DES SÉLECTIONS EN CASCADE
//   // =============================================
//   const handleSiteChange = (siteId: number | null) => {
//     setSelectedSiteId(siteId);
//     setSelectedSalleId(null);
//     setSelectedRayonId(null);
//     setSelectedTraveId(null);
//     setSelectedBoxId(null);
//   };

//   const handleSalleChange = (salleId: number | null) => {
//     setSelectedSalleId(salleId);
//     setSelectedRayonId(null);
//     setSelectedTraveId(null);
//     setSelectedBoxId(null);
//   };

//   const handleRayonChange = (rayonId: number | null) => {
//     setSelectedRayonId(rayonId);
//     setSelectedTraveId(null);
//     setSelectedBoxId(null);
//   };

//   const handleTraveChange = (traveId: number | null) => {
//     setSelectedTraveId(traveId);
//     setSelectedBoxId(null);
//   };

//   // =============================================
//   // ARCHIVAGE DES DOCUMENTS SÉLECTIONNÉS
//   // =============================================
//   const handleArchive = async () => {
//     if (!selectedBoxId || selectedDocuments.length === 0) {
//       toastRef.current?.show({
//         severity: "warn",
//         summary: "Attention",
//         detail: "Veuillez sélectionner un box et au moins un document",
//       });
//       return;
//     }

//     const selectedBox = boxes.find((b) => Number(b.id) === selectedBoxId);
//     if (
//       selectedBox &&
//       Number(selectedBox.current_count) + selectedDocuments.length >
//         Number(selectedBox.capacite_max)
//     ) {
//       toastRef.current?.show({
//         severity: "error",
//         summary: "Erreur",
//         detail: `Capacité insuffisante ! Le box peut contenir ${selectedBox.capacite_max} documents, ${selectedBox.current_count} déjà présents.`,
//       });
//       return;
//     }

//     setIsArchiving(true);
//     try {
//       const promises = selectedDocuments.map((doc) =>
//         addDocumentToBox(String(selectedBoxId), String(doc.documentId)),
//       );

//       await Promise.all(promises);

//       toastRef.current?.show({
//         severity: "success",
//         summary: "Succès",
//         detail: `${selectedDocuments.length} document(s) archivé(s) avec succès`,
//       });

//       queryClient.invalidateQueries({ queryKey: ["boxes"] });
//       queryClient.invalidateQueries({ queryKey: ["documents"] });

//       onDocumentsArchived();
//     } catch (error: any) {
//       toastRef.current?.show({
//         severity: "error",
//         summary: "Erreur",
//         detail:
//           error.response?.data?.message ||
//           "Erreur lors de l'archivage des documents",
//       });
//     } finally {
//       setIsArchiving(false);
//     }
//   };

//   // =============================================
//   // OPTIONS POUR LES DROPDOWNS
//   // =============================================
//   const siteOptions = useMemo(() => {
//     return sites.map((s) => ({
//       id: Number(s.id),
//       libelle: s.nom || `Site #${s.id}`,
//     }));
//   }, [sites]);

//   const salleOptions = useMemo(() => {
//     return salles.map((s) => ({
//       id: Number(s.id),
//       libelle: s.libelle || `Salle #${s.id}`,
//       code: s.code_salle,
//     }));
//   }, [salles]);

//   const rayonOptions = useMemo(() => {
//     return rayons.map((r) => ({
//       id: Number(r.id),
//       libelle: r.code || `Rayon #${r.id}`,
//     }));
//   }, [rayons]);

//   const traveOptions = useMemo(() => {
//     return traves.map((t) => ({
//       id: Number(t.id),
//       libelle: t.code || `Travée #${t.id}`,
//     }));
//   }, [traves]);

//   const boxOptions = useMemo(() => {
//     return filteredBoxes.map((b) => ({
//       id: Number(b.id),
//       libelle: b.libelle,
//       code: b.code_box,
//       current_count: Number(b.current_count),
//       capacite_max: Number(b.capacite_max),
//     }));
//   }, [filteredBoxes]);

//   // =============================================
//   // COMPOSANT DROPDOWN RÉUTILISABLE
//   // =============================================
//   const DropdownFilter: React.FC<{
//     label: string;
//     icon: React.ReactNode;
//     value: number | null;
//     options: Array<{
//       id: number;
//       libelle: string;
//       code?: string;
//       current_count?: number;
//       capacite_max?: number;
//     }>;
//     onChange: (value: number | null) => void;
//     isLoading?: boolean;
//     disabled?: boolean;
//     placeholder?: string;
//     extraInfo?: (item: any) => string;
//   }> = ({
//     label,
//     icon,
//     value,
//     options,
//     onChange,
//     isLoading,
//     disabled,
//     placeholder = "Sélectionner...",
//     extraInfo,
//   }) => (
//     <div className="mb-4">
//       <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
//         {label}
//       </label>
//       <div className="relative">
//         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//           {icon}
//         </div>
//         <select
//           value={value || ""}
//           onChange={(e) =>
//             onChange(e.target.value ? Number(e.target.value) : null)
//           }
//           disabled={disabled || isLoading}
//           className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700
//                      focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
//                      disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
//                      appearance-none cursor-pointer transition-all"
//         >
//           <option value="">{placeholder}</option>
//           {options.map((option) => (
//             <option key={option.id} value={option.id}>
//               {option.libelle}
//               {option.code ? ` (${option.code})` : ""}
//               {extraInfo ? ` - ${extraInfo(option)}` : ""}
//             </option>
//           ))}
//         </select>
//         {isLoading && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2">
//             <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // =============================================
//   // RENDU
//   // =============================================
//   return (
//     <div className="h-full overflow-y-auto">
//       <Toast ref={toastRef} />

//       <div className="p-4 border-b border-slate-200 bg-slate-50">
//         <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//           <Archive size={20} />
//           Destination d'archivage
//         </h2>
//         <p className="text-xs text-slate-500 mt-1">
//           Site → Salle → Rayon → Travée → Box
//         </p>
//       </div>

//       <div className="p-4 space-y-2">
//         {/* FILTRE 1 : SITE */}
//         <DropdownFilter
//           label="Site"
//           icon={<MapPin size={18} />}
//           value={selectedSiteId}
//           options={siteOptions}
//           onChange={handleSiteChange}
//           isLoading={sitesLoading}
//           placeholder="Choisir un site..."
//         />

//         {/* FILTRE 2 : SALLE */}
//         <DropdownFilter
//           label="Salle"
//           icon={<DoorOpen size={18} />}
//           value={selectedSalleId}
//           options={salleOptions}
//           onChange={handleSalleChange}
//           isLoading={sallesLoading}
//           disabled={!selectedSiteId}
//           placeholder={
//             !selectedSiteId
//               ? "Sélectionnez d'abord un site"
//               : sallesLoading
//                 ? "Chargement..."
//                 : salleOptions.length === 0
//                   ? "Aucune salle disponible"
//                   : "Choisir une salle..."
//           }
//         />

//         {/* FILTRE 3 : RAYON */}
//         <DropdownFilter
//           label="Rayon"
//           icon={<Grid3X3 size={18} />}
//           value={selectedRayonId}
//           options={rayonOptions}
//           onChange={handleRayonChange}
//           isLoading={rayonsLoading}
//           disabled={!selectedSalleId}
//           placeholder={
//             !selectedSalleId
//               ? "Sélectionnez d'abord une salle"
//               : rayonsLoading
//                 ? "Chargement..."
//                 : rayonOptions.length === 0
//                   ? "Aucun rayon disponible"
//                   : "Choisir un rayon..."
//           }
//         />

//         {/* FILTRE 4 : TRAVÉE */}
//         <DropdownFilter
//           label="Travée"
//           icon={<Columns size={18} />}
//           value={selectedTraveId}
//           options={traveOptions}
//           onChange={handleTraveChange}
//           isLoading={travesLoading}
//           disabled={!selectedRayonId}
//           placeholder={
//             !selectedRayonId
//               ? "Sélectionnez d'abord un rayon"
//               : travesLoading
//                 ? "Chargement..."
//                 : traveOptions.length === 0
//                   ? "Aucune travée disponible"
//                   : "Choisir une travée..."
//           }
//         />

//         {/* FILTRE 5 : BOX */}
//         <DropdownFilter
//           label="Box"
//           icon={<Archive size={18} />}
//           value={selectedBoxId}
//           options={boxOptions}
//           onChange={setSelectedBoxId}
//           isLoading={boxesLoading}
//           disabled={!selectedTraveId}
//           placeholder={
//             !selectedTraveId
//               ? "Sélectionnez d'abord une travée"
//               : boxesLoading
//                 ? "Chargement..."
//                 : boxOptions.length === 0
//                   ? "Aucun box disponible"
//                   : "Choisir un box..."
//           }
//           extraInfo={(box) =>
//             `${box.current_count || 0}/${box.capacite_max || "?"} docs`
//           }
//         />

//         {/* Aperçu du box sélectionné */}
//         {selectedBoxId &&
//           (() => {
//             const selectedBox = boxes.find(
//               (b) => Number(b.id) === selectedBoxId,
//             );
//             if (!selectedBox) return null;

//             const capaciteRestante =
//               Number(selectedBox.capacite_max) -
//               Number(selectedBox.current_count);
//             const isCapaciteOk = capaciteRestante >= selectedDocuments.length;

//             return (
//               <div
//                 className={`mt-4 p-4 rounded-xl border ${
//                   isCapaciteOk
//                     ? "bg-emerald-50 border-emerald-200"
//                     : "bg-red-50 border-red-200"
//                 }`}
//               >
//                 <h4 className="font-bold text-sm mb-2">
//                   Box sélectionné : {selectedBox.libelle}
//                 </h4>
//                 <div className="space-y-1 text-xs">
//                   <p>
//                     <span className="text-slate-500">Code :</span>{" "}
//                     <span className="font-mono font-bold">
//                       {selectedBox.code_box}
//                     </span>
//                   </p>
//                   <p>
//                     <span className="text-slate-500">Capacité :</span>{" "}
//                     <span className="font-bold">
//                       {selectedBox.current_count}/{selectedBox.capacite_max}
//                     </span>
//                   </p>
//                   <p>
//                     <span className="text-slate-500">
//                       Documents à archiver :
//                     </span>{" "}
//                     <span className="font-bold">
//                       {selectedDocuments.length}
//                     </span>
//                   </p>
//                   {!isCapaciteOk && (
//                     <p className="text-red-600 font-bold mt-2">
//                       ⚠️ Capacité insuffisante ! ({capaciteRestante} place(s)
//                       restante(s))
//                     </p>
//                   )}
//                 </div>
//               </div>
//             );
//           })()}

//         {/* Bouton d'archivage */}
//         <div className="mt-6 pt-4 border-t border-slate-200">
//           <button
//             onClick={handleArchive}
//             disabled={
//               isArchiving || !selectedBoxId || selectedDocuments.length === 0
//             }
//             className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
//               ${
//                 isArchiving || !selectedBoxId || selectedDocuments.length === 0
//                   ? "bg-slate-300 cursor-not-allowed"
//                   : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
//               }`}
//           >
//             {isArchiving ? (
//               <>
//                 <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
//                 Archivage en cours...
//               </>
//             ) : (
//               <>
//                 <Archive size={18} />
//                 Archiver {selectedDocuments.length} document(s)
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentArchivage;

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  DoorOpen,
  Grid3X3,
  Columns,
  Archive,
  ArrowLeftRight,
} from "lucide-react";
import { Toast } from "primereact/toast";
import {
  useSites,
  useSalles,
  useRayons,
  useTraves,
  useBoxes,
} from "../../../hooks/useArchivageQueries";
import { addDocumentToBox } from "../../../api/box";
import { Box, Trave, Rayon, Salle, Site } from "../../../interfaces";

interface DocumentArchivageProps {
  selectedDocuments: Array<{
    documentId: number;
    typeDocumentId: number;
    documentRef: string;
  }>;
  onDocumentsArchived: () => void;
}

const DocumentArchivage: React.FC<DocumentArchivageProps> = ({
  selectedDocuments,
  onDocumentsArchived,
}) => {
  const queryClient = useQueryClient();

  // États des dropdowns (dans l'ordre d'affichage : Site → Salle → Rayon → Travée)
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
  const [selectedRayonId, setSelectedRayonId] = useState<number | null>(null);
  const [selectedTraveId, setSelectedTraveId] = useState<number | null>(null);

  // ✅ Le box est sélectionné en PREMIER maintenant
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const toastRef = useRef<Toast>(null);

  // =============================================
  // CHARGEMENT DES DONNÉES
  // =============================================
  const { data: allSites = [], isLoading: sitesLoading } = useSites();
  const { data: allSalles = [], isLoading: sallesLoading } = useSalles();
  const { data: allRayons = [], isLoading: rayonsLoading } = useRayons();
  const { data: allTraves = [], isLoading: travesLoading } = useTraves();
  const { data: allBoxes = [], isLoading: boxesLoading } = useBoxes();

  // =============================================
  // ✅ FILTRER LES BOXES PAR TYPE DE DOCUMENT
  // =============================================
  const typeDocumentId =
    selectedDocuments.length > 0 ? selectedDocuments[0].typeDocumentId : null;

  const compatibleBoxes = useMemo(() => {
    if (!typeDocumentId) return [];
    return allBoxes.filter(
      (box) => Number(box.type_document_id) === typeDocumentId,
    );
  }, [allBoxes, typeDocumentId]);

  // =============================================
  // ✅ FONCTION POUR RECONSTRUIRE LE CHEMIN D'UN BOX
  // =============================================
  const getBoxPath = (box: Box) => {
    const trave = allTraves.find((t) => Number(t.id) === Number(box.trave_id));
    if (!trave) return null;

    const rayon = allRayons.find(
      (r) => Number(r.id) === Number(trave.rayon_id),
    );
    if (!rayon) return { trave };

    const salle = allSalles.find(
      (s) => Number(s.id) === Number(rayon.salle_id),
    );
    if (!salle) return { trave, rayon };

    const site = allSites.find((s) => Number(s.id) === Number(salle.site_id));
    return { trave, rayon, salle, site };
  };

  // =============================================
  // ✅ QUAND UN BOX EST SÉLECTIONNÉ, CHARGER LE CHEMIN
  // =============================================
  const handleBoxChange = (boxId: number | null) => {
    setSelectedBoxId(boxId);

    if (!boxId) {
      // Réinitialiser tout le chemin
      setSelectedTraveId(null);
      setSelectedRayonId(null);
      setSelectedSalleId(null);
      setSelectedSiteId(null);
      return;
    }

    const box = allBoxes.find((b) => Number(b.id) === boxId);
    if (!box) return;

    const path = getBoxPath(box);
    if (!path) return;

    // ✅ Charger le chemin dans l'ordre inverse (du box vers le site)
    if (path.trave) {
      setSelectedTraveId(Number(path.trave.id));
    }
    if (path.rayon) {
      setSelectedRayonId(Number(path.rayon.id));
    }
    if (path.salle) {
      setSelectedSalleId(Number(path.salle.id));
    }
    if (path.site) {
      setSelectedSiteId(Number(path.site.id));
    }
  };

  // =============================================
  // RÉINITIALISATION DES SÉLECTIONS EN CASCADE
  // =============================================
  const handleSiteChange = (siteId: number | null) => {
    setSelectedSiteId(siteId);
    setSelectedSalleId(null);
    setSelectedRayonId(null);
    setSelectedTraveId(null);
    setSelectedBoxId(null);
  };

  const handleSalleChange = (salleId: number | null) => {
    setSelectedSalleId(salleId);
    setSelectedRayonId(null);
    setSelectedTraveId(null);
    setSelectedBoxId(null);
  };

  const handleRayonChange = (rayonId: number | null) => {
    setSelectedRayonId(rayonId);
    setSelectedTraveId(null);
    setSelectedBoxId(null);
  };

  const handleTraveChange = (traveId: number | null) => {
    setSelectedTraveId(traveId);
    setSelectedBoxId(null);
  };

  // =============================================
  // ARCHIVAGE DES DOCUMENTS SÉLECTIONNÉS
  // =============================================
  const handleArchive = async () => {
    if (!selectedBoxId || selectedDocuments.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Veuillez sélectionner un box et au moins un document",
      });
      return;
    }

    const selectedBox = allBoxes.find((b) => Number(b.id) === selectedBoxId);
    if (
      selectedBox &&
      Number(selectedBox.current_count) + selectedDocuments.length >
        Number(selectedBox.capacite_max)
    ) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: `Capacité insuffisante ! Le box peut contenir ${selectedBox.capacite_max} documents, ${selectedBox.current_count} déjà présents.`,
      });
      return;
    }

    setIsArchiving(true);
    try {
      const promises = selectedDocuments.map((doc) =>
        addDocumentToBox(String(selectedBoxId), String(doc.documentId)),
      );

      await Promise.all(promises);

      toastRef.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${selectedDocuments.length} document(s) archivé(s) avec succès`,
      });

      queryClient.invalidateQueries({ queryKey: ["boxes"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      onDocumentsArchived();
    } catch (error: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          error.response?.data?.message ||
          "Erreur lors de l'archivage des documents",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // =============================================
  // OPTIONS POUR LES DROPDOWNS
  // =============================================

  // ✅ Boxes compatibles (filtrées par type de document)
  const boxOptions = useMemo(() => {
    return compatibleBoxes.map((b) => ({
      id: Number(b.id),
      libelle: b.libelle,
      code: b.code_box,
      current_count: Number(b.current_count),
      capacite_max: Number(b.capacite_max),
    }));
  }, [compatibleBoxes]);

  // Sites (tous, mais filtrés si un box est sélectionné)
  const siteOptions = useMemo(() => {
    let sitesToShow = allSites;
    // Si un box est sélectionné, on n'affiche que le site correspondant
    if (selectedBoxId && selectedSiteId) {
      sitesToShow = allSites.filter((s) => Number(s.id) === selectedSiteId);
    }
    return sitesToShow.map((s) => ({
      id: Number(s.id),
      libelle: s.nom || `Site #${s.id}`,
    }));
  }, [allSites, selectedBoxId, selectedSiteId]);

  // Salles (filtrées par site)
  const sallesFiltrees = useMemo(() => {
    if (!selectedSiteId) return [];
    return allSalles.filter((s) => Number(s.site_id) === selectedSiteId);
  }, [allSalles, selectedSiteId]);

  const salleOptions = useMemo(() => {
    return sallesFiltrees.map((s) => ({
      id: Number(s.id),
      libelle: s.libelle || `Salle #${s.id}`,
      code: s.code_salle,
    }));
  }, [sallesFiltrees]);

  // Rayons (filtrés par salle)
  const rayonsFiltres = useMemo(() => {
    if (!selectedSalleId) return [];
    return allRayons.filter((r) => Number(r.salle_id) === selectedSalleId);
  }, [allRayons, selectedSalleId]);

  const rayonOptions = useMemo(() => {
    return rayonsFiltres.map((r) => ({
      id: Number(r.id),
      libelle: r.code || `Rayon #${r.id}`,
    }));
  }, [rayonsFiltres]);

  // Travées (filtrées par rayon)
  const travesFiltrees = useMemo(() => {
    if (!selectedRayonId) return [];
    return allTraves.filter((t) => Number(t.rayon_id) === selectedRayonId);
  }, [allTraves, selectedRayonId]);

  const traveOptions = useMemo(() => {
    return travesFiltrees.map((t) => ({
      id: Number(t.id),
      libelle: t.code || `Travée #${t.id}`,
    }));
  }, [travesFiltrees]);

  // =============================================
  // COMPOSANT DROPDOWN RÉUTILISABLE
  // =============================================
  const DropdownFilter: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number | null;
    options: Array<{
      id: number;
      libelle: string;
      code?: string;
      current_count?: number;
      capacite_max?: number;
    }>;
    onChange: (value: number | null) => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    extraInfo?: (item: any) => string;
    highlight?: boolean;
  }> = ({
    label,
    icon,
    value,
    options,
    onChange,
    isLoading,
    disabled,
    placeholder = "Sélectionner...",
    extraInfo,
    highlight,
  }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <select
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          disabled={disabled || isLoading}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium transition-all appearance-none cursor-pointer
            ${
              highlight
                ? "bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-200"
                : "bg-white border-slate-200 text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            }
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.libelle}
              {option.code ? ` (${option.code})` : ""}
              {extraInfo ? ` - ${extraInfo(option)}` : ""}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );

  // =============================================
  // RENDU
  // =============================================
  return (
    <div className="h-full overflow-y-auto">
      <Toast ref={toastRef} />

      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Archive size={20} />
          Destination d'archivage
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {typeDocumentId
            ? "Box → Travée → Rayon → Salle → Site"
            : "Site → Salle → Rayon → Travée → Box"}
        </p>
      </div>

      <div className="p-4 space-y-2">
        {/* ✅ FILTRE 1 : BOX (en premier, filtré par type de document) */}
        <DropdownFilter
          label="Box compatible"
          icon={<Archive size={18} />}
          value={selectedBoxId}
          options={boxOptions}
          onChange={handleBoxChange}
          isLoading={boxesLoading}
          placeholder={
            !typeDocumentId
              ? "Sélectionnez d'abord un document"
              : boxesLoading
                ? "Chargement..."
                : boxOptions.length === 0
                  ? "Aucun box compatible"
                  : "Choisir un box..."
          }
          disabled={!typeDocumentId}
          extraInfo={(box) =>
            `${box.current_count || 0}/${box.capacite_max || "?"} docs`
          }
          highlight={!!selectedBoxId}
        />

        {/* Séparateur visuel */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="text-[10px] text-slate-400 uppercase font-bold">
            Chemin du box
          </span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {/* FILTRE 2 : SITE (auto-rempli si box sélectionné) */}
        <DropdownFilter
          label="Site"
          icon={<MapPin size={18} />}
          value={selectedSiteId}
          options={siteOptions}
          onChange={handleSiteChange}
          isLoading={sitesLoading}
          disabled={true} // ✅ Toujours désactivé quand on passe par le box
          placeholder="Auto-détecté"
        />

        {/* FILTRE 3 : SALLE (auto-rempli si box sélectionné) */}
        <DropdownFilter
          label="Salle"
          icon={<DoorOpen size={18} />}
          value={selectedSalleId}
          options={salleOptions}
          onChange={handleSalleChange}
          isLoading={sallesLoading}
          disabled={true} // ✅ Toujours désactivé quand on passe par le box
          placeholder="Auto-détecté"
        />

        {/* FILTRE 4 : RAYON (auto-rempli si box sélectionné) */}
        <DropdownFilter
          label="Rayon"
          icon={<Grid3X3 size={18} />}
          value={selectedRayonId}
          options={rayonOptions}
          onChange={handleRayonChange}
          isLoading={rayonsLoading}
          disabled={true} // ✅ Toujours désactivé quand on passe par le box
          placeholder="Auto-détecté"
        />

        {/* FILTRE 5 : TRAVÉE (auto-rempli si box sélectionné) */}
        <DropdownFilter
          label="Travée"
          icon={<Columns size={18} />}
          value={selectedTraveId}
          options={traveOptions}
          onChange={handleTraveChange}
          isLoading={travesLoading}
          disabled={true} // ✅ Toujours désactivé quand on passe par le box
          placeholder="Auto-détecté"
        />

        {/* Aperçu du box sélectionné */}
        {selectedBoxId &&
          (() => {
            const selectedBox = allBoxes.find(
              (b) => Number(b.id) === selectedBoxId,
            );
            if (!selectedBox) return null;

            const capaciteRestante =
              Number(selectedBox.capacite_max) -
              Number(selectedBox.current_count);
            const isCapaciteOk = capaciteRestante >= selectedDocuments.length;

            return (
              <div
                className={`mt-4 p-4 rounded-xl border ${
                  isCapaciteOk
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <h4 className="font-bold text-sm mb-2">
                  Box sélectionné : {selectedBox.libelle}
                </h4>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-slate-500">Code :</span>{" "}
                    <span className="font-mono font-bold">
                      {selectedBox.code_box}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Capacité :</span>{" "}
                    <span className="font-bold">
                      {selectedBox.current_count}/{selectedBox.capacite_max}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">
                      Documents à archiver :
                    </span>{" "}
                    <span className="font-bold">
                      {selectedDocuments.length}
                    </span>
                  </p>
                  {!isCapaciteOk && (
                    <p className="text-red-600 font-bold mt-2">
                      ⚠️ Capacité insuffisante ! ({capaciteRestante} place(s)
                      restante(s))
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

        {/* Bouton d'archivage */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleArchive}
            disabled={
              isArchiving || !selectedBoxId || selectedDocuments.length === 0
            }
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
              ${
                isArchiving || !selectedBoxId || selectedDocuments.length === 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
              }`}
          >
            {isArchiving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Archivage en cours...
              </>
            ) : (
              <>
                <Archive size={18} />
                Archiver {selectedDocuments.length} document(s)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentArchivage;
