import React, { useState, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  DoorOpen,
  Grid3X3,
  Columns,
  Archive,
  AlertTriangle,
  ArrowRight,
  X,
  ExternalLink,
} from "lucide-react";
import { Toast } from "primereact/toast";
import { addBoxToTrave, retireBoxToTrave } from "../../../api/trave";
import {
  useSites,
  useSalles,
  useRayons,
  useTraves,
} from "../../../hooks/useArchivageQueries";
import { Trave } from "../../../interfaces";

interface SelectedBox {
  boxId: string;
  boxCode: string;
  boxLibelle: string;
  current_count: number;
  capacite_max: number;
  trave_id?: string; // ✅ Pour savoir si le box est déjà dans une travée
  trave_code?: string;
  site_nom?: string;
  salle_libelle?: string;
  rayon_code?: string;
}

interface BoxAffectationTraveeProps {
  selectedBoxes: SelectedBox[];
  onBoxesAffected: () => void;
}

const BoxAffectationTravee: React.FC<BoxAffectationTraveeProps> = ({
  selectedBoxes,
  onBoxesAffected,
}) => {
  const queryClient = useQueryClient();
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
  const [selectedRayonId, setSelectedRayonId] = useState<number | null>(null);
  const [selectedTraveId, setSelectedTraveId] = useState<number | null>(null);
  const [isAffecting, setIsAffecting] = useState(false);
  const [mode, setMode] = useState<"add" | "move" | "remove">("add"); // ✅ Mode d'opération
  const toastRef = useRef<Toast>(null);

  // Chargement des données en cascade
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: salles = [], isLoading: sallesLoading } = useSalles(
    selectedSiteId ?? undefined,
  );
  const { data: rayons = [], isLoading: rayonsLoading } = useRayons(
    selectedSalleId ?? undefined,
  );
  const { data: traves = [], isLoading: travesLoading } = useTraves(
    selectedRayonId ?? undefined,
  );

  // =============================================
  // DÉTERMINER LE MODE AUTOMATIQUEMENT
  // =============================================
  const hasBoxesWithTrave = selectedBoxes.some((b) => b.trave_id);
  const allBoxesHaveSameTrave =
    hasBoxesWithTrave &&
    selectedBoxes.every((b) => b.trave_id === selectedBoxes[0]?.trave_id);

  // =============================================
  // RÉINITIALISATION EN CASCADE
  // =============================================
  const handleSiteChange = (siteId: number | null) => {
    setSelectedSiteId(siteId);
    setSelectedSalleId(null);
    setSelectedRayonId(null);
    setSelectedTraveId(null);
  };

  const handleSalleChange = (salleId: number | null) => {
    setSelectedSalleId(salleId);
    setSelectedRayonId(null);
    setSelectedTraveId(null);
  };

  const handleRayonChange = (rayonId: number | null) => {
    setSelectedRayonId(rayonId);
    setSelectedTraveId(null);
  };

  // =============================================
  // AFFECTATION / DÉPLACEMENT / RETRAIT
  // =============================================
  const handleAction = async () => {
    if (mode === "remove") {
      await handleRetirer();
    } else {
      await handleAffecterOuDeplacer();
    }
  };

  const handleAffecterOuDeplacer = async () => {
    if (!selectedTraveId || selectedBoxes.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Veuillez sélectionner une travée et au moins un box",
      });
      return;
    }

    // Vérifier la capacité de la travée
    const selectedTrave = traves.find(
      (t) => Number(t.id) === selectedTraveId,
    ) as Trave | undefined;

    if (selectedTrave) {
      const currentInTrave = Number(selectedTrave.current_count) || 0;
      const capaciteMaxTrave = Number(selectedTrave.capacite_max) || 0;

      // Pour le déplacement, on ne compte que les box qui changent de travée
      const boxesToMove = selectedBoxes.filter(
        (b) => String(b.trave_id) !== String(selectedTraveId),
      );
      const boxesToAddCount = boxesToMove.length;

      if (
        capaciteMaxTrave > 0 &&
        currentInTrave + boxesToAddCount > capaciteMaxTrave
      ) {
        toastRef.current?.show({
          severity: "error",
          summary: "Capacité insuffisante",
          detail: `La travée peut contenir ${capaciteMaxTrave} box, ${currentInTrave} déjà présents. Impossible d'ajouter ${boxesToAddCount} box.`,
        });
        return;
      }
    }

    setIsAffecting(true);
    try {
      const promises = selectedBoxes.map(async (box) => {
        // Si le box est déjà dans une autre travée, on le retire d'abord
        if (box.trave_id && String(box.trave_id) !== String(selectedTraveId)) {
          await retireBoxToTrave(box.boxId);
        }
        // Puis on l'ajoute à la nouvelle travée
        if (String(box.trave_id) !== String(selectedTraveId)) {
          await addBoxToTrave(box.boxId, String(selectedTraveId));
        }
      });

      await Promise.all(promises);

      const actionVerb = mode === "move" ? "déplacé(s)" : "affecté(s)";
      toastRef.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${selectedBoxes.length} box ${actionVerb} avec succès`,
      });

      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
      queryClient.invalidateQueries({ queryKey: ["traves"] });

      onBoxesAffected();
    } catch (error: any) {
      console.error("❌ Erreur affectation:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          error.response?.data?.message ||
          "Erreur lors de l'opération sur les box",
      });
    } finally {
      setIsAffecting(false);
    }
  };

  const handleRetirer = async () => {
    setIsAffecting(true);
    try {
      const boxesToRemove = selectedBoxes.filter((b) => b.trave_id);
      const promises = boxesToRemove.map((box) => retireBoxToTrave(box.boxId));

      await Promise.all(promises);

      toastRef.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${boxesToRemove.length} box retiré(s) de leur travée`,
      });

      queryClient.invalidateQueries({ queryKey: ["boxes"] });
      queryClient.invalidateQueries({ queryKey: ["traves"] });

      onBoxesAffected();
    } catch (error: any) {
      console.error("❌ Erreur retrait:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          error.response?.data?.message || "Erreur lors du retrait d' un outils de conservation",
      });
    } finally {
      setIsAffecting(false);
    }
  };

  // =============================================
  // OPTIONS POUR LES DROPDOWNS
  // =============================================
  const siteOptions = useMemo(() => {
    return sites.map((s) => ({
      id: Number(s.id),
      libelle: s.nom || `Site #${s.id}`,
    }));
  }, [sites]);

  const salleOptions = useMemo(() => {
    return salles.map((s) => ({
      id: Number(s.id),
      libelle: s.libelle || `Salle #${s.id}`,
      code: s.code_salle,
    }));
  }, [salles]);

  const rayonOptions = useMemo(() => {
    return rayons.map((r) => ({
      id: Number(r.id),
      libelle: r.code || `Rayon #${r.id}`,
    }));
  }, [rayons]);

  const traveOptions = useMemo(() => {
    return traves.map((t) => ({
      id: Number(t.id),
      libelle: t.code || `Travée #${t.id}`,
      current_count: Number(t.current_count) || 0,
      capacite_max: Number(t.capacite_max) || 0,
    }));
  }, [traves]);

  // =============================================
  // DROPDOWN RÉUTILISABLE
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
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 
                     focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                     disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
                     appearance-none cursor-pointer transition-all"
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

  // Calcul pour la vérification de capacité
  const selectedTrave = selectedTraveId
    ? traves.find((t) => Number(t.id) === selectedTraveId)
    : null;

  const capaciteActuelle = selectedTrave
    ? Number(selectedTrave.current_count) || 0
    : 0;
  const capaciteMax = selectedTrave
    ? Number(selectedTrave.capacite_max) || 0
    : 0;

  // Pour le déplacement, ne compter que les box qui changent de travée
  const boxesQuiChangent =
    mode === "remove"
      ? []
      : selectedBoxes.filter(
          (b) => String(b.trave_id) !== String(selectedTraveId),
        );
  const capaciteApresAffectation = capaciteActuelle + boxesQuiChangent.length;
  const isCapaciteOk =
    capaciteMax === 0 || capaciteApresAffectation <= capaciteMax;

  // Déterminer le libellé de l'action
  const getActionLabel = () => {
    if (mode === "remove") return "Retirer";
    if (hasBoxesWithTrave && !allBoxesHaveSameTrave) return "Réaffecter";
    if (hasBoxesWithTrave) return "Déplacer";
    return "Affecter";
  };

  const getActionColor = () => {
    if (mode === "remove") return "bg-red-600 hover:bg-red-700 shadow-red-200";
    if (hasBoxesWithTrave)
      return "bg-amber-500 hover:bg-amber-600 shadow-amber-200";
    return "bg-purple-600 hover:bg-purple-700 shadow-purple-200";
  };

  return (
    <div className="h-full flex flex-col">
      <Toast ref={toastRef} />

      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Columns size={20} />
          Destination
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Site → Salle → Rayon → Travée
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* ✅ Sélecteur de mode */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("add")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              mode === "add"
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
            }`}
          >
            Affecter / Déplacer
          </button>
          <button
            onClick={() => setMode("remove")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              mode === "remove"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
            }`}
            disabled={!hasBoxesWithTrave}
          >
            Retirer
          </button>
        </div>

        {/* Info sur les box sélectionnés */}
        {selectedBoxes.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs">
            <p className="font-bold text-slate-700 mb-2">
              {selectedBoxes.length} box sélectionné(s) :
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedBoxes.map((box) => (
                <div
                  key={box.boxId}
                  className="flex items-center justify-between text-slate-600"
                >
                  <span className="font-mono">{box.boxCode}</span>
                  <span className="truncate ml-2">{box.boxLibelle}</span>
                  {box.trave_code ? (
                    <span className="text-amber-600 ml-2 flex items-center gap-1">
                      → {box.trave_code}
                    </span>
                  ) : (
                    <span className="text-slate-400 ml-2">Non affecté</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {mode !== "remove" && (
          <>
            {/* SITE */}
            <DropdownFilter
              label="Site"
              icon={<MapPin size={18} />}
              value={selectedSiteId}
              options={siteOptions}
              onChange={handleSiteChange}
              isLoading={sitesLoading}
              placeholder="Choisir un site..."
            />

            {/* SALLE */}
            <DropdownFilter
              label="Salle"
              icon={<DoorOpen size={18} />}
              value={selectedSalleId}
              options={salleOptions}
              onChange={handleSalleChange}
              isLoading={sallesLoading}
              disabled={!selectedSiteId}
              placeholder={
                !selectedSiteId
                  ? "Sélectionnez d'abord un site"
                  : sallesLoading
                    ? "Chargement..."
                    : salleOptions.length === 0
                      ? "Aucune salle disponible"
                      : "Choisir une salle..."
              }
            />

            {/* RAYON */}
            <DropdownFilter
              label="Rayon"
              icon={<Grid3X3 size={18} />}
              value={selectedRayonId}
              options={rayonOptions}
              onChange={handleRayonChange}
              isLoading={rayonsLoading}
              disabled={!selectedSalleId}
              placeholder={
                !selectedSalleId
                  ? "Sélectionnez d'abord une salle"
                  : rayonsLoading
                    ? "Chargement..."
                    : rayonOptions.length === 0
                      ? "Aucun rayon disponible"
                      : "Choisir un rayon..."
              }
            />

            {/* TRAVÉE */}
            <DropdownFilter
              label="Travée"
              icon={<Columns size={18} />}
              value={selectedTraveId}
              options={traveOptions}
              onChange={setSelectedTraveId}
              isLoading={travesLoading}
              disabled={!selectedRayonId}
              placeholder={
                !selectedRayonId
                  ? "Sélectionnez d'abord un rayon"
                  : travesLoading
                    ? "Chargement..."
                    : traveOptions.length === 0
                      ? "Aucune travée disponible"
                      : "Choisir une travée..."
              }
              extraInfo={(trave) =>
                `${trave.current_count || 0}/${trave.capacite_max || "∞"} box`
              }
            />

            {/* Aperçu de la travée sélectionnée */}
            {selectedTraveId && selectedTrave && (
              <div
                className={`mt-4 p-4 rounded-xl border ${
                  isCapaciteOk
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <h4 className="font-bold text-sm mb-2">
                  Travée : {selectedTrave.code}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Box actuellement :</span>
                    <span className="font-bold">{capaciteActuelle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Box à ajouter :</span>
                    <span className="font-bold text-amber-600">
                      +{boxesQuiChangent.length}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="text-slate-500">
                      Total après affectation :
                    </span>
                    <span
                      className={`font-bold ${
                        isCapaciteOk ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {capaciteApresAffectation}
                      {capaciteMax > 0 && ` / ${capaciteMax}`}
                    </span>
                  </div>

                  {capaciteMax > 0 && (
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isCapaciteOk ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (capaciteApresAffectation / capaciteMax) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}

                  {!isCapaciteOk && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-100 rounded-lg">
                      <AlertTriangle
                        size={14}
                        className="text-red-500 flex-shrink-0"
                      />
                      <p className="text-red-700 font-medium">
                        Capacité insuffisante ! (
                        {capaciteMax - capaciteActuelle} place(s) restante(s))
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Avertissement pour le mode retrait */}
        {mode === "remove" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h4 className="font-bold text-sm text-red-700">
                Retirer les box de leur travée
              </h4>
            </div>
            <p className="text-xs text-red-600">
              {selectedBoxes.filter((b) => b.trave_id).length} box seront
              retirés de leur travée actuelle.
              {selectedBoxes.filter((b) => !b.trave_id).length > 0 &&
                ` ${selectedBoxes.filter((b) => !b.trave_id).length} box déjà sans travée seront ignorés.`}
            </p>
          </div>
        )}

        {/* Bouton d'action */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleAction}
            disabled={
              isAffecting ||
              (mode !== "remove" && !selectedTraveId) ||
              selectedBoxes.length === 0 ||
              (mode !== "remove" && !isCapaciteOk)
            }
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
              ${
                isAffecting ||
                (mode !== "remove" && !selectedTraveId) ||
                selectedBoxes.length === 0 ||
                (mode !== "remove" && !isCapaciteOk)
                  ? "bg-slate-300 cursor-not-allowed"
                  : getActionColor()
              }`}
          >
            {isAffecting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Traitement en cours...
              </>
            ) : (
              <>
                {mode === "remove" ? <X size={18} /> : <ArrowRight size={18} />}
                {getActionLabel()}{" "}
                {mode !== "remove" && `${selectedBoxes.length} box`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxAffectationTravee;
