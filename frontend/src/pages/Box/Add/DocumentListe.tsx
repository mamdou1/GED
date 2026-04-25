import React, { useState, useMemo } from "react";
import {
  Building2,
  Layers,
  GitMerge,
  ChevronRight,
  ChevronDown,
  FileStack,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useInitialData } from "../../../hooks/useDocuments";
import { TypeDocument, Document } from "../../../interfaces";

interface SelectedDocument {
  documentId: number;
  typeDocumentId: number;
  documentRef: string;
}

interface DocumentListeProps {
  selectedDocuments: SelectedDocument[];
  onDocumentsChange: (documents: SelectedDocument[]) => void;
}

const DocumentListe: React.FC<DocumentListeProps> = ({
  selectedDocuments,
  onDocumentsChange,
}) => {
  const { user } = useAuth();
  const {
    documents: allDocs = [],
    types = [],
    entitees = [],
  } = useInitialData();

  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<number | null>(null);

  // =============================================
  // FONCTIONS D'ACCÈS (reprises de DocumentPage)
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
  // REGROUPEMENT DES TYPES PAR NIVEAU D'ENTITÉ
  // =============================================
  const typesByEntiteeAndNiveau = useMemo(() => {
    const grouped: Record<
      string,
      { entitee: any; niveau: "un" | "deux" | "trois"; types: TypeDocument[] }[]
    > = {
      un: [],
      deux: [],
      trois: [],
    };

    if (isUserAdmin()) {
      // ADMIN : tous les types groupés par entité de niveau 1
      const entiteesUn = entitees.filter((e) => e.type === "un");
      entiteesUn.forEach((entitee) => {
        const entiteeTypes = types.filter(
          (t) => t.entitee_un_id === entitee.id,
        );
        if (entiteeTypes.length > 0) {
          grouped.un.push({
            entitee,
            niveau: "un",
            types: entiteeTypes,
          });
        }
      });

      // Niveau 2
      const entiteesDeux = entitees.filter((e) => e.type === "deux");
      entiteesDeux.forEach((entitee) => {
        const entiteeTypes = types.filter(
          (t) => t.entitee_deux_id === entitee.id,
        );
        if (entiteeTypes.length > 0) {
          grouped.deux.push({
            entitee,
            niveau: "deux",
            types: entiteeTypes,
          });
        }
      });

      // Niveau 3
      const entiteesTrois = entitees.filter((e) => e.type === "trois");
      entiteesTrois.forEach((entitee) => {
        const entiteeTypes = types.filter(
          (t) => t.entitee_trois_id === entitee.id,
        );
        if (entiteeTypes.length > 0) {
          grouped.trois.push({
            entitee,
            niveau: "trois",
            types: entiteeTypes,
          });
        }
      });
    } else if (hasAdditionalAccess()) {
      const accessibleIds = getUserAccessibleEntityIds();

      // Niveau 1
      entitees
        .filter((e) => e.type === "un" && accessibleIds.un.has(e.id))
        .forEach((entitee) => {
          const entiteeTypes = types.filter(
            (t) => t.entitee_un_id === entitee.id,
          );
          if (entiteeTypes.length > 0) {
            grouped.un.push({ entitee, niveau: "un", types: entiteeTypes });
          }
        });

      // Niveau 2
      entitees
        .filter((e) => e.type === "deux" && accessibleIds.deux.has(e.id))
        .forEach((entitee) => {
          const entiteeTypes = types.filter(
            (t) => t.entitee_deux_id === entitee.id,
          );
          if (entiteeTypes.length > 0) {
            grouped.deux.push({ entitee, niveau: "deux", types: entiteeTypes });
          }
        });

      // Niveau 3
      entitees
        .filter((e) => e.type === "trois" && accessibleIds.trois.has(e.id))
        .forEach((entitee) => {
          const entiteeTypes = types.filter(
            (t) => t.entitee_trois_id === entitee.id,
          );
          if (entiteeTypes.length > 0) {
            grouped.trois.push({
              entitee,
              niveau: "trois",
              types: entiteeTypes,
            });
          }
        });
    } else {
      // Fonction seulement
      const entityType = getUserFonctionEntityType();
      const entityId = getUserFonctionEntityId();
      if (entityType && entityId) {
        const fonctionEntitee = entitees.find(
          (e) => e.type === entityType && e.id === entityId,
        );
        if (fonctionEntitee) {
          const fonctionTypes = types.filter((t) => {
            if (entityType === "un") return t.entitee_un_id === entityId;
            if (entityType === "deux") return t.entitee_deux_id === entityId;
            if (entityType === "trois") return t.entitee_trois_id === entityId;
            return false;
          });
          grouped[entityType].push({
            entitee: fonctionEntitee,
            niveau: entityType,
            types: fonctionTypes,
          });
        }
      }
    }

    return grouped;
  }, [entitees, types, user]);

  // =============================================
  // GESTION DE LA SÉLECTION
  // =============================================
  const isDocumentSelected = (docId: number): boolean => {
    return selectedDocuments.some((d) => d.documentId === docId);
  };

  const toggleDocumentSelection = (doc: Document, typeId: number) => {
    if (isDocumentSelected(doc.id)) {
      onDocumentsChange(
        selectedDocuments.filter((d) => d.documentId !== doc.id),
      );
    } else {
      onDocumentsChange([
        ...selectedDocuments,
        {
          documentId: doc.id,
          typeDocumentId: typeId,
          documentRef: `#${String(doc.id).padStart(3, "0")}`,
        },
      ]);
    }
  };

  const areAllDocumentsOfTypeSelected = (
    typeId: number,
    docs: Document[],
  ): boolean => {
    return docs.every((doc) => isDocumentSelected(doc.id));
  };

  const toggleAllDocumentsOfType = (typeId: number, docs: Document[]) => {
    const allSelected = areAllDocumentsOfTypeSelected(typeId, docs);

    if (allSelected) {
      // Désélectionner tous
      onDocumentsChange(
        selectedDocuments.filter(
          (d) => !docs.some((doc) => doc.id === d.documentId),
        ),
      );
    } else {
      // Sélectionner tous ceux qui ne le sont pas déjà
      const newSelections = docs
        .filter((doc) => !isDocumentSelected(doc.id))
        .map((doc) => ({
          documentId: doc.id,
          typeDocumentId: typeId,
          documentRef: `#${String(doc.id).padStart(3, "0")}`,
        }));
      onDocumentsChange([...selectedDocuments, ...newSelections]);
    }
  };

  // =============================================
  // RENDU
  // =============================================
  const niveauLabels = { un: "Niveau 1", deux: "Niveau 2", trois: "Niveau 3" };
  const niveauIcons = {
    un: <Building2 size={20} />,
    deux: <Layers size={20} />,
    trois: <GitMerge size={20} />,
  };
  const niveauColors = {
    un: "bg-blue-100 text-blue-700",
    deux: "bg-purple-100 text-purple-700",
    trois: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileStack size={20} />
          Documents disponibles
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {selectedDocuments.length} document(s) sélectionné(s)
        </p>
      </div>

      <div className="p-3 space-y-4">
        {(["un", "deux", "trois"] as const).map((niveau) => {
          const entiteesDuNiveau = typesByEntiteeAndNiveau[niveau];
          if (entiteesDuNiveau.length === 0) return null;

          return (
            <div key={niveau}>
              <div
                className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg mb-2 ${niveauColors[niveau]}`}
              >
                {niveauLabels[niveau]}
              </div>

              <div className="space-y-2">
                {entiteesDuNiveau.map(({ entitee, types: entiteeTypes }) => (
                  <div
                    key={`${niveau}-${entitee.id}`}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    {/* Header Entité */}
                    <button
                      onClick={() =>
                        setExpandedEntitee(
                          expandedEntitee === entitee.id ? null : entitee.id,
                        )
                      }
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                          {niveauIcons[niveau]}
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-semibold text-slate-700">
                            {entitee.libelle}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {entitee.code}
                          </span>
                        </div>
                      </div>
                      {expandedEntitee === entitee.id ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                    </button>

                    {/* Types de documents */}
                    {expandedEntitee === entitee.id && (
                      <div className="border-t border-slate-100 bg-slate-50/30 p-2 space-y-1">
                        {entiteeTypes.map((type) => {
                          const typeDocs = allDocs.filter(
                            (d) => d.type_document_id === type.id,
                          );
                          const allSelected = areAllDocumentsOfTypeSelected(
                            type.id,
                            typeDocs,
                          );

                          return (
                            <div key={type.id}>
                              {/* Header Type */}
                              <button
                                onClick={() =>
                                  setExpandedType(
                                    expandedType === type.id ? null : type.id,
                                  )
                                }
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAllDocumentsOfType(
                                        type.id,
                                        typeDocs,
                                      );
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
                                  <span className="text-sm font-medium text-slate-600">
                                    {type.nom}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    ({typeDocs.length})
                                  </span>
                                </div>
                                {expandedType === type.id ? (
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

                              {/* Liste des documents */}
                              {expandedType === type.id && (
                                <div className="ml-6 space-y-1 mb-2">
                                  {typeDocs.length > 0 ? (
                                    typeDocs.map((doc) => (
                                      <label
                                        key={doc.id}
                                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer transition-colors"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isDocumentSelected(doc.id)}
                                          onChange={() =>
                                            toggleDocumentSelection(
                                              doc,
                                              type.id,
                                            )
                                          }
                                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                        />
                                        <span className="text-xs font-mono bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                          #{String(doc.id).padStart(3, "0")}
                                        </span>
                                        {/* Afficher les métadonnées si disponibles */}
                                        {doc.values
                                          ?.slice(0, 2)
                                          .map((v: any, i: number) => (
                                            <span
                                              key={i}
                                              className="text-xs text-slate-500 truncate max-w-[150px]"
                                            >
                                              {v.value || "---"}
                                            </span>
                                          ))}
                                      </label>
                                    ))
                                  ) : (
                                    <p className="text-xs text-slate-400 italic p-2">
                                      Aucun document
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.values(typesByEntiteeAndNiveau).every(
          (arr) => arr.length === 0,
        ) && (
          <div className="text-center py-12 text-slate-400">
            <FileStack size={40} className="mx-auto mb-3 opacity-50" />
            <p>Aucun document disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentListe;
