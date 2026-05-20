import React, { useState, useMemo } from "react";
import {
  Building2,
  Layers,
  GitMerge,
  ChevronRight,
  ChevronDown,
  Archive,
  CheckSquare,
  Square,
  Package,
  HardDrive,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  useBoxes,
  useSites,
  useSalles,
  useRayons,
  useTraves,
} from "../../../hooks/useArchivageQueries"; // ✅ Importer tous les hooks
import { useInitialData } from "../../../hooks/useDocuments";
import {
  Box,
  TypeDocument,
  Site,
  Salle,
  Rayon,
  Trave,
} from "../../../interfaces";

interface SelectedBox {
  boxId: string;
  boxCode: string;
  boxLibelle: string;
  current_count: number;
  capacite_max: number;
  trave_id?: string;
  trave_code?: string;
  rayon_code?: string;
  salle_libelle?: string;
  site_nom?: string;
}

interface BoxListeProps {
  selectedBoxes: SelectedBox[];
  onBoxesChange: (boxes: SelectedBox[]) => void;
}

const BoxListe: React.FC<BoxListeProps> = ({
  selectedBoxes,
  onBoxesChange,
}) => {
  const { user } = useAuth();
  const { data: allBoxes = [] } = useBoxes();
  const { types = [], entitees = [] } = useInitialData();

  // ✅ Charger TOUTES les données de référence
  const { data: allSites = [] } = useSites();
  const { data: allSalles = [] } = useSalles(); // Sans filtre = toutes les salles
  const { data: allRayons = [] } = useRayons(); // Sans filtre = tous les rayons
  const { data: allTraves = [] } = useTraves(); // Sans filtre = toutes les travées

  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<number | null>(null);

  // =============================================
  // FONCTIONS D'ACCÈS
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

    user.agent_access?.forEach((access: any) => {
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

  // =============================================
  // ✅ FONCTION POUR RECONSTRUIRE LE CHEMIN COMPLET (VERSION ROBUSTE)
  // =============================================
  const getBoxChemin = (
    box: Box,
  ): {
    trave_id?: string;
    trave_code?: string;
    rayon_code?: string;
    salle_libelle?: string;
    site_nom?: string;
  } => {
    try {
      // Si pas de trave_id, retourner vide
      if (!box.trave_id) return {};

      const traveId = Number(box.trave_id);

      // 1. Trouver la travée
      const trave = allTraves.find((t) => Number(t.id) === traveId);
      if (!trave) {
        return {
          trave_id: String(box.trave_id),
          trave_code: `Travée #${box.trave_id}`,
        };
      }

      const result: {
        trave_id: string;
        trave_code: string;
        rayon_code?: string;
        salle_libelle?: string;
        site_nom?: string;
      } = {
        trave_id: String(box.trave_id),
        trave_code: trave.code || `Travée #${traveId}`,
      };

      // 2. Trouver le rayon de la travée
      if (trave.rayon_id) {
        const rayonId = Number(trave.rayon_id);
        const rayon = allRayons.find((r) => Number(r.id) === rayonId);

        if (rayon) {
          result.rayon_code = rayon.code;

          // 3. Trouver la salle du rayon
          if (rayon.salle_id) {
            const salleId = Number(rayon.salle_id);
            const salle = allSalles.find((s) => Number(s.id) === salleId);

            if (salle) {
              result.salle_libelle = salle.libelle;

              // 4. Trouver le site de la salle
              if (salle.site_id) {
                const siteId = Number(salle.site_id);
                const site = allSites.find((s) => Number(s.id) === siteId);

                if (site) {
                  result.site_nom = site.nom;
                }
              }
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Erreur dans getBoxChemin:", error);
      return {
        trave_id: box.trave_id ? String(box.trave_id) : undefined,
        trave_code: box.trave_id ? `Travée #${box.trave_id}` : undefined,
      };
    }
  };

  // =============================================
  // REGROUPEMENT DES OUTILS DE CONSERVATION PAR ENTITÉ → TYPE DE DOCUMENT
  // =============================================
  const boxesByEntiteeAndType = useMemo(() => {
    let accessibleBoxes = allBoxes;

    if (!isUserAdmin()) {
      if (hasAdditionalAccess()) {
        const accessibleIds = getUserAccessibleEntityIds();
        accessibleBoxes = allBoxes.filter((box) => {
          if (box.entitee_trois_id)
            return accessibleIds.trois.has(Number(box.entitee_trois_id));
          if (box.entitee_deux_id)
            return accessibleIds.deux.has(Number(box.entitee_deux_id));
          if (box.entitee_un_id)
            return accessibleIds.un.has(Number(box.entitee_un_id));
          return false;
        });
      } else {
        const entityType = getUserFonctionEntityType();
        const entityId = getUserFonctionEntityId();
        accessibleBoxes = allBoxes.filter((box) => {
          if (entityType === "un") return box.entitee_un_id === entityId;
          if (entityType === "deux") return box.entitee_deux_id === entityId;
          if (entityType === "trois") return box.entitee_trois_id === entityId;
          return false;
        });
      }
    }

    const grouped: Record<
      number,
      {
        entitee: any;
        niveau: "un" | "deux" | "trois";
        types: Record<number, { type: TypeDocument; boxes: Box[] }>;
      }
    > = {};

    accessibleBoxes.forEach((box) => {
      let entiteeId: number | undefined;
      let niveau: "un" | "deux" | "trois" = "un";

      if (box.entitee_trois_id) {
        entiteeId = Number(box.entitee_trois_id);
        niveau = "trois";
      } else if (box.entitee_deux_id) {
        entiteeId = Number(box.entitee_deux_id);
        niveau = "deux";
      } else if (box.entitee_un_id) {
        entiteeId = Number(box.entitee_un_id);
        niveau = "un";
      }

      if (!entiteeId) return;

      const entitee = entitees.find((e) => e.id === entiteeId);
      if (!entitee) return;

      if (!grouped[entiteeId]) {
        grouped[entiteeId] = { entitee, niveau, types: {} };
      }

      const typeId = Number(box.type_document_id);
      if (typeId) {
        const type = types.find((t) => t.id === typeId);
        if (type) {
          if (!grouped[entiteeId].types[typeId]) {
            grouped[entiteeId].types[typeId] = { type, boxes: [] };
          }
          grouped[entiteeId].types[typeId].boxes.push(box);
        }
      }
    });

    return grouped;
  }, [allBoxes, entitees, types, user]);

  // =============================================
  // GESTION DE LA SÉLECTION
  // =============================================
  const isBoxSelected = (boxId: string): boolean => {
    return selectedBoxes.some((b) => b.boxId === boxId);
  };

  const toggleBoxSelection = (box: Box) => {
    if (isBoxSelected(String(box.id))) {
      onBoxesChange(selectedBoxes.filter((b) => b.boxId !== String(box.id)));
    } else {
      const chemin = getBoxChemin(box);
      onBoxesChange([
        ...selectedBoxes,
        {
          boxId: String(box.id),
          boxCode: box.code_box,
          boxLibelle: box.libelle,
          current_count: Number(box.current_count),
          capacite_max: Number(box.capacite_max),
          ...chemin,
        },
      ]);
    }
  };

  const areAllBoxesOfTypeSelected = (typeId: number, boxes: Box[]): boolean => {
    return boxes.every((box) => isBoxSelected(String(box.id)));
  };

  const toggleAllBoxesOfType = (typeId: number, boxes: Box[]) => {
    const allSelected = areAllBoxesOfTypeSelected(typeId, boxes);

    if (allSelected) {
      onBoxesChange(
        selectedBoxes.filter(
          (b) => !boxes.some((box) => String(box.id) === b.boxId),
        ),
      );
    } else {
      const newSelections = boxes
        .filter((box) => !isBoxSelected(String(box.id)))
        .map((box) => ({
          boxId: String(box.id),
          boxCode: box.code_box,
          boxLibelle: box.libelle,
          current_count: Number(box.current_count),
          capacite_max: Number(box.capacite_max),
          ...getBoxChemin(box),
        }));
      onBoxesChange([...selectedBoxes, ...newSelections]);
    }
  };

  // =============================================
  // STATISTIQUES
  // =============================================
  const totalSelectedCapacity = selectedBoxes.reduce(
    (sum, b) => sum + b.current_count,
    0,
  );
  const totalSelectedMaxCapacity = selectedBoxes.reduce(
    (sum, b) => sum + b.capacite_max,
    0,
  );

  // =============================================
  // RENDU
  // =============================================
  const niveauIcons = {
    un: <Building2 size={18} />,
    deux: <Layers size={18} />,
    trois: <GitMerge size={18} />,
  };
  const niveauColors = {
    un: "bg-blue-100 text-blue-700 border-blue-200",
    deux: "bg-purple-100 text-purple-700 border-purple-200",
    trois: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Archive size={20} />
          Outils de conservation disponibles
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {selectedBoxes.length} outil(s) de conservation sélectionné(s)
        </p>
        {selectedBoxes.length > 0 && (
          <div className="mt-2 flex gap-3 text-[10px] text-slate-500">
            <span>
              Capacité utilisée :{" "}
              <span className="font-bold text-amber-600">
                {totalSelectedCapacity}
              </span>
            </span>
            <span>
              Capacité max :{" "}
              <span className="font-bold text-slate-600">
                {totalSelectedMaxCapacity}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Liste des outils de conservation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {Object.entries(boxesByEntiteeAndType).length > 0 ? (
          Object.entries(boxesByEntiteeAndType).map(
            ([entiteeId, { entitee, niveau, types: typesGrouped }]) => (
              <div
                key={entiteeId}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Header Entité */}
                <button
                  onClick={() =>
                    setExpandedEntitee(
                      expandedEntitee === Number(entiteeId)
                        ? null
                        : Number(entiteeId),
                    )
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${niveauColors[niveau]}`}>
                      {niveauIcons[niveau]}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-slate-700">
                        {entitee.libelle}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ml-2 font-bold ${niveauColors[niveau]}`}
                      >
                        N{niveau === "un" ? "1" : niveau === "deux" ? "2" : "3"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {Object.values(typesGrouped).reduce(
                        (sum, t) => sum + t.boxes.length,
                        0,
                      )}{" "}
                      outil(s) de conservation
                    </span>
                    {expandedEntitee === Number(entiteeId) ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Types de documents */}
                {expandedEntitee === Number(entiteeId) && (
                  <div className="border-t border-slate-100 bg-slate-50/30 p-2 space-y-1">
                    {Object.entries(typesGrouped).map(
                      ([typeId, { type, boxes }]) => {
                        const allSelected = areAllBoxesOfTypeSelected(
                          Number(typeId),
                          boxes,
                        );

                        return (
                          <div key={typeId}>
                            {/* Header Type */}
                            <button
                              onClick={() =>
                                setExpandedType(
                                  expandedType === Number(typeId)
                                    ? null
                                    : Number(typeId),
                                )
                              }
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAllBoxesOfType(Number(typeId), boxes);
                                  }}
                                  className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                >
                                  {allSelected ? (
                                    <CheckSquare
                                      size={16}
                                      className="text-emerald-600"
                                    />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </div>
                                <HardDrive
                                  size={14}
                                  className="text-slate-400"
                                />
                                <span className="text-sm font-medium text-slate-600">
                                  {type.nom}
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({boxes.length})
                                </span>
                              </div>
                              {expandedType === Number(typeId) ? (
                                <ChevronDown
                                  size={14}
                                  className="text-slate-400"
                                />
                              ) : (
                                <ChevronRight
                                  size={14}
                                  className="text-slate-400"
                                />
                              )}
                            </button>

                            {/* Liste des outils de conservation */}
                            {expandedType === Number(typeId) && (
                              <div className="ml-6 space-y-1 mb-2">
                                {boxes.length > 0 ? (
                                  boxes.map((box) => {
                                    const ratio =
                                      (Number(box.current_count) /
                                        Number(box.capacite_max)) *
                                      100;
                                    const isFull = ratio >= 100;
                                    const chemin = getBoxChemin(box);
                                    const isAffected = !!chemin.trave_code;

                                    return (
                                      <label
                                        key={box.id}
                                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors group ${
                                          isBoxSelected(String(box.id))
                                            ? "bg-purple-50 border border-purple-200"
                                            : "hover:bg-white border border-transparent"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isBoxSelected(
                                            String(box.id),
                                          )}
                                          onChange={() =>
                                            toggleBoxSelection(box)
                                          }
                                          //disabled={isFull}
                                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-30 mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <Package
                                              size={14}
                                              className="text-slate-400 flex-shrink-0"
                                            />
                                            <span className="text-xs font-bold text-slate-700 truncate">
                                              {box.libelle}
                                            </span>
                                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">
                                              {box.code_box}
                                            </span>
                                            {isFull && (
                                              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                                                Plein
                                              </span>
                                            )}
                                          </div>

                                          {/* ✅ CHEMIN D'AFFECTATION COMPLET */}
                                          {isAffected && (
                                            <div className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-500 bg-slate-50 rounded-lg px-2 py-1 overflow-x-auto">
                                              <MapPin
                                                size={10}
                                                className="text-blue-400 flex-shrink-0"
                                              />
                                              {chemin.site_nom && (
                                                <>
                                                  <span className="text-blue-600 font-medium whitespace-nowrap">
                                                    {chemin.site_nom}
                                                  </span>
                                                  <span className="text-slate-300 flex-shrink-0">
                                                    →
                                                  </span>
                                                </>
                                              )}
                                              {chemin.salle_libelle && (
                                                <>
                                                  <span className="text-purple-600 font-medium whitespace-nowrap">
                                                    {chemin.salle_libelle}
                                                  </span>
                                                  <span className="text-slate-300 flex-shrink-0">
                                                    →
                                                  </span>
                                                </>
                                              )}
                                              {chemin.rayon_code && (
                                                <>
                                                  <span className="text-orange-600 font-medium whitespace-nowrap">
                                                    {chemin.rayon_code}
                                                  </span>
                                                  <span className="text-slate-300 flex-shrink-0">
                                                    →
                                                  </span>
                                                </>
                                              )}
                                              <span className="text-emerald-600 font-bold whitespace-nowrap">
                                                {chemin.trave_code}
                                              </span>
                                            </div>
                                          )}

                                          {/* Barre de capacité */}
                                          <div className="mt-1 flex items-center gap-2">
                                            <div className="flex-1 bg-slate-100 rounded-full h-1">
                                              <div
                                                className={`h-1 rounded-full ${
                                                  isFull
                                                    ? "bg-red-500"
                                                    : ratio > 80
                                                      ? "bg-orange-400"
                                                      : "bg-emerald-500"
                                                }`}
                                                style={{
                                                  width: `${Math.min(ratio, 100)}%`,
                                                }}
                                              />
                                            </div>
                                            <span
                                              className={`text-[9px] font-bold flex-shrink-0 ${
                                                isFull
                                                  ? "text-red-500"
                                                  : "text-slate-500"
                                              }`}
                                            >
                                              {box.current_count}/
                                              {box.capacite_max}
                                            </span>
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })
                                ) : (
                                  <p className="text-xs text-slate-400 italic p-2">
                                    Aucun box
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            ),
          )
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Archive size={40} className="mx-auto mb-3 opacity-50" />
            <p>Aucun box disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxListe;
