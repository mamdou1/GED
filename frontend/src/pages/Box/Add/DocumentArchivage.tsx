import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  DoorOpen,
  Grid3X3,
  Columns,
  Archive,
  ArrowLeftRight,
  Package,
} from "lucide-react";
import { Toast } from "primereact/toast";
import {
  useSites,
  useSalles,
  useRayons,
  useTraves,
  useBoxes,
} from "../../../hooks/useArchivageQueries";
import { useTypeOutilsConservation } from "../../../hooks/useTypeOutilsConservation";
import { addDocumentToBox } from "../../../api/box";
import {
  Box,
  Trave,
  Rayon,
  Salle,
  Site,
  TypeOutilsConservation,
} from "../../../interfaces";

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

  // États des filtres
  const [selectedOutilsConservationId, setSelectedOutilsConservationId] =
    useState<number | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);

  // États du chemin (auto-remplis)
  const [selectedTraveId, setSelectedTraveId] = useState<number | null>(null);
  const [selectedRayonId, setSelectedRayonId] = useState<number | null>(null);
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

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
  const {
    data: allOutilsConservation = [],
    isLoading: outilsConservationLoading,
  } = useTypeOutilsConservation();

  // =============================================
  // TYPE DE DOCUMENT DES DOCUMENTS SÉLECTIONNÉS
  // =============================================
  const typeDocumentId =
    selectedDocuments.length > 0 ? selectedDocuments[0].typeDocumentId : null;

  // =============================================
  // ✅ 1. FILTRER LES BOXES PAR TYPE DE DOCUMENT ET PAR TYPE D'OUTILS DE CONSERVATION
  // =============================================
  const boxesByTypeDocument = useMemo(() => {
    if (!typeDocumentId) return [];
    return allBoxes.filter(
      (box) => Number(box.type_document_id) === typeDocumentId,
    );
  }, [allBoxes, typeDocumentId]);

  // Filtrer par type d'outils de conservation
  const boxesByOutilsConservation = useMemo(() => {
    if (!selectedOutilsConservationId) return boxesByTypeDocument;
    return boxesByTypeDocument.filter(
      (box) =>
        Number(box.type_outils_conservation_id) ===
        selectedOutilsConservationId,
    );
  }, [boxesByTypeDocument, selectedOutilsConservationId]);

  // =============================================
  // ✅ 2. OPTIONS DES OUTILS DE CONSERVATION (filtrés par type de document)
  // =============================================
  const outilsConservationOptions = useMemo(() => {
    // Extraire les IDs uniques des outils de conservation présents dans les boxes compatibles
    const uniqueOutilsIds = new Set(
      boxesByTypeDocument
        .map((box) => box.type_outils_conservation_id)
        .filter((id) => id !== null && id !== undefined),
    );

    return allOutilsConservation
      .filter((outil) => uniqueOutilsIds.has(Number(outil.id)))
      .map((outil) => ({
        id: Number(outil.id),
        nom: outil.nom,
      }));
  }, [boxesByTypeDocument, allOutilsConservation]);

  // =============================================
  // ✅ 3. OPTIONS DES BOXES (filtrés par outils de conservation sélectionné)
  // =============================================
  const boxOptions = useMemo(() => {
    return boxesByOutilsConservation.map((b) => ({
      id: Number(b.id),
      libelle: b.libelle,
      code: b.code_box,
      current_count: Number(b.current_count),
      capacite_max: Number(b.capacite_max),
      type_outils_conservation_id: Number(b.type_outils_conservation_id),
    }));
  }, [boxesByOutilsConservation]);

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

    // Charger le chemin dans l'ordre inverse (du box vers le site)
    if (path.trave) setSelectedTraveId(Number(path.trave.id));
    if (path.rayon) setSelectedRayonId(Number(path.rayon.id));
    if (path.salle) setSelectedSalleId(Number(path.salle.id));
    if (path.site) setSelectedSiteId(Number(path.site.id));
  };

  // =============================================
  // ✅ QUAND LE TYPE D'OUTILS DE CONSERVATION CHANGE
  // =============================================
  const handleOutilsConservationChange = (outilsId: number | null) => {
    setSelectedOutilsConservationId(outilsId);
    setSelectedBoxId(null); // Réinitialiser le box
    setSelectedTraveId(null);
    setSelectedRayonId(null);
    setSelectedSalleId(null);
    setSelectedSiteId(null);
  };

  // =============================================
  // RÉINITIALISATION DES SÉLECTIONS EN CASCADE (si nécessaire)
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
  // COMPOSANT DROPDOWN RÉUTILISABLE
  // =============================================
  const DropdownFilter: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number | null;
    options: Array<{
      id: number;
      libelle?: string;
      nom?: string;
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
              {option.libelle || option.nom}
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
          Type d'outils → Box → Chemin automatique
        </p>
      </div>

      <div className="p-4 space-y-2">
        {/* ✅ FILTRE 1 : Type d'outils de conservation (en premier) */}
        <DropdownFilter
          label="Type d'outils de conservation"
          icon={<Package size={18} />}
          value={selectedOutilsConservationId}
          options={outilsConservationOptions}
          onChange={handleOutilsConservationChange}
          isLoading={outilsConservationLoading || boxesLoading}
          placeholder={
            !typeDocumentId
              ? "Sélectionnez d'abord un document"
              : outilsConservationOptions.length === 0
                ? "Aucun type d'outils disponible"
                : "Choisir un type d'outils..."
          }
          disabled={!typeDocumentId}
          highlight={!!selectedOutilsConservationId}
        />

        {/* ✅ FILTRE 2 : Box (filtré par type d'outils de conservation) */}
        <DropdownFilter
          label="Box"
          icon={<Archive size={18} />}
          value={selectedBoxId}
          options={boxOptions}
          onChange={handleBoxChange}
          isLoading={boxesLoading}
          placeholder={
            !selectedOutilsConservationId
              ? "Sélectionnez d'abord un type d'outils"
              : boxOptions.length === 0
                ? "Aucun box disponible pour ce type"
                : "Choisir un box..."
          }
          disabled={!selectedOutilsConservationId}
          extraInfo={(box) =>
            box.current_count !== undefined && box.capacite_max !== undefined
              ? `${box.current_count}/${box.capacite_max} docs`
              : ""
          }
          highlight={!!selectedBoxId}
        />

        {/* Séparateur visuel */}
        {selectedBoxId && (
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Chemin du box
            </span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>
        )}

        {/* FILTRE : SITE (auto-rempli) */}
        <DropdownFilter
          label="Site"
          icon={<MapPin size={18} />}
          value={selectedSiteId}
          options={allSites.map((s) => ({
            id: Number(s.id),
            libelle: s.nom || `Site #${s.id}`,
          }))}
          onChange={handleSiteChange}
          isLoading={sitesLoading}
          disabled={true}
          placeholder={selectedBoxId ? "Auto-détecté" : "Sélectionner un site"}
        />

        {/* FILTRE : SALLE (auto-rempli) */}
        <DropdownFilter
          label="Salle"
          icon={<DoorOpen size={18} />}
          value={selectedSalleId}
          options={allSalles
            .filter((s) =>
              selectedSiteId ? Number(s.site_id) === selectedSiteId : true,
            )
            .map((s) => ({
              id: Number(s.id),
              libelle: s.libelle || `Salle #${s.id}`,
            }))}
          onChange={handleSalleChange}
          isLoading={sallesLoading}
          disabled={true}
          placeholder={
            selectedBoxId ? "Auto-détecté" : "Sélectionner une salle"
          }
        />

        {/* FILTRE : RAYON (auto-rempli) */}
        <DropdownFilter
          label="Rayon"
          icon={<Grid3X3 size={18} />}
          value={selectedRayonId}
          options={allRayons
            .filter((r) =>
              selectedSalleId ? Number(r.salle_id) === selectedSalleId : true,
            )
            .map((r) => ({
              id: Number(r.id),
              libelle: r.code || `Rayon #${r.id}`,
            }))}
          onChange={handleRayonChange}
          isLoading={rayonsLoading}
          disabled={true}
          placeholder={selectedBoxId ? "Auto-détecté" : "Sélectionner un rayon"}
        />

        {/* FILTRE : TRAVÉE (auto-rempli) */}
        <DropdownFilter
          label="Travée"
          icon={<Columns size={18} />}
          value={selectedTraveId}
          options={allTraves
            .filter((t) =>
              selectedRayonId ? Number(t.rayon_id) === selectedRayonId : true,
            )
            .map((t) => ({
              id: Number(t.id),
              libelle: t.code || `Travée #${t.id}`,
            }))}
          onChange={handleTraveChange}
          isLoading={travesLoading}
          disabled={true}
          placeholder={
            selectedBoxId ? "Auto-détecté" : "Sélectionner une travée"
          }
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
