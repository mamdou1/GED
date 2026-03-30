import React, { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  FileCheck,
  X,
  Printer,
  Folder,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Document } from "../../interfaces";
import { updateDocumentPieceDisponibilite } from "../../api/document";

type Props = {
  visible: boolean;
  onHide: () => void;
  document: Document | null;
  onSuccess?: () => void;
};

export default function DocumentDisponiblePieces({
  visible,
  onHide,
  document,
  onSuccess,
}: Props) {
  const toast = useRef<Toast>(null);
  const [piecesState, setPiecesState] = useState<any[]>([]);
  const [expandedDivisions, setExpandedDivisions] = useState<
    Record<string, boolean>
  >({});

  const toggleDivision = (division: string) => {
    setExpandedDivisions((prev) => ({
      ...prev,
      [division]: !prev[division],
    }));
  };

  useEffect(() => {
    if (document && document.pieces) {
      // On utilise directement document.pieces car le backend renvoie déjà
      // la liste des pièces avec l'objet DocumentPieces (pivot) inclus.
      const merged = document.pieces.map((p: any) => {
        return {
          ...p,
          // Si DocumentPieces existe, on le garde, sinon on initialise
          DocumentPieces: p.DocumentPieces || { disponible: false },
        };
      });

      setPiecesState(merged);
    } else {
      setPiecesState([]);
    }
  }, [document]);

  /* ================== TOGGLE DISPONIBILITÉ ================== */

  const togglePiece = async (index: number) => {
    if (!document) return;

    const piece = piecesState[index];
    const newDisponible = !piece.DocumentPieces?.disponible;

    const updatedPieces = [...piecesState];
    updatedPieces[index] = {
      ...piece,
      DocumentPieces: {
        ...piece.DocumentPieces,
        disponible: newDisponible,
      },
    };

    setPiecesState(updatedPieces);

    try {
      await updateDocumentPieceDisponibilite(
        String(document.id)!,
        piece.id,
        newDisponible,
      );

      toast.current?.show({
        severity: "success",
        summary: "Mise à jour",
        detail: `${piece.libelle} : ${
          newDisponible ? "Disponible" : "Non disponible"
        }`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setPiecesState(piecesState);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la mise à jour",
      });
    }
  };

  const handlePrint = () => window.print();

  // Dans documentDisponiblePieces.tsx

  const groupedPieces = piecesState.reduce((acc: any, item: any) => {
    // On cherche la division soit à la racine, soit dans l'objet piece imbriqué
    const divisionObj = item.division || item.piece?.division;
    const divLibelle = divisionObj?.libelle || "AUTRES PIECES";

    if (!acc[divLibelle]) {
      acc[divLibelle] = [];
    }
    acc[divLibelle].push(item);
    return acc;
  }, {});

  if (!document) return null;

  const getLabel = (field: any) =>
    typeof field === "object"
      ? field?.libelle || field?.sigle || field?.nom
      : field;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: "95vw", maxWidth: "1400px" }}
        header={false}
        showHeader={false} // Header personnalisé ci-dessous
        className="rounded-3xl overflow-hidden border-none shadow-2xl"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 p-6 pt-10 -mx-6 -mt-6 mb-6 flex justify-between items-center text-white no-print">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase">
                Contrôle de Conformité
              </h2>
              <p className="text-emerald-200 text-xs font-mono">
                ID: {document.id?.toString().slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              icon={<Printer size={18} />}
              label="Imprimer"
              onClick={handlePrint}
              className="bg-white text-emerald-800 font-bold"
            />

            <button onClick={onHide}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-4 space-y-3 max-h-[75vh] overflow-y-auto no-print pr-2">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2">
              Cocher les pièces reçues
            </h3>

            {Object.entries(groupedPieces).map(
              ([division, pieces]: [string, any]) => {
                const isExpanded = expandedDivisions[division] ?? false; // Ouvert par défaut

                return (
                  <div
                    key={division}
                    className="mb-3 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* HEADER DE LA DIVISION (CLIQUABLE) */}
                    <div
                      onClick={() => toggleDivision(division)}
                      className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <Folder size={16} className="text-emerald-600" />
                        <span className="text-xs font-black uppercase text-slate-700 tracking-tight">
                          {division}
                        </span>
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">
                          {pieces.length}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>

                    {/* CONTENU : LISTE DES PIÈCES */}
                    {isExpanded && (
                      <div className="p-2 space-y-2 animate-in fade-in duration-300">
                        {pieces.map((p: any) => {
                          // On retrouve l'index global dans piecesState pour garder votre logique de togglePiece
                          const globalIndex = piecesState.findIndex(
                            (item) => item.id === p.id,
                          );
                          const isDisponible =
                            p.DocumentPieces?.disponible ??
                            p.DocumentPieces?.disponible ??
                            false;

                          return (
                            <div
                              key={p.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isDisponible
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-white border-slate-100"
                              }`}
                            >
                              <Checkbox
                                checked={isDisponible}
                                onChange={() => togglePiece(globalIndex)}
                                className="flex-shrink-0 border border-emerald-300"
                              />
                              <span
                                className={`text-xs font-semibold leading-tight ${
                                  isDisponible
                                    ? "text-emerald-900"
                                    : "text-slate-600"
                                }`}
                              >
                                {p.libelle}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>

          {/* COLONNE DROITE : ZONE D'IMPRESSION */}
          <div
            id="printable-area"
            className="lg:col-span-8 bg-white text-black p-4"
          >
            <table className="w-full border-collapse border-2 border-black text-sm">
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-bold w-1/3">
                    Type de document
                  </td>
                  <td className="border border-black p-2 uppercase font-medium">
                    {document.typeDocument?.nom || "N/A"}
                  </td>
                </tr>

                {/* CORRECTION JSX ICI : Ajout de <React.Fragment> autour des deux <td> */}
                {document.values?.map((v: any) => (
                  <tr key={v.id}>
                    <React.Fragment>
                      <td className="border border-black p-2 font-bold">
                        {v.metaField?.label}
                      </td>
                      <td className="border border-black p-2 font-mono">
                        {v.value} {/* Note: v.value et non v.metaField.value */}
                      </td>
                    </React.Fragment>
                  </tr>
                ))}

                <tr className="bg-slate-100 print:bg-gray-200">
                  <td
                    className="border-2 border-black p-3 font-black text-center uppercase"
                    colSpan={2}
                  >
                    Suivie et contôle des pièces <br />
                    <span className="text-[10px] font-normal normal-case italic">
                      (Seuils réglementaires applicables)
                    </span>
                  </td>
                </tr>

                {/* --- SECTION MILIEU : TITRE DE LA PROCÉDURE --- */}
                <tr className="bg-slate-50">
                  <td
                    className="border-2 border-black p-3 font-black text-center uppercase"
                    colSpan={1}
                  >
                    LISTE DES PIECES <br />
                  </td>
                  <td className="border-2 border-black p-3 font-black text-center uppercase">
                    Observation
                  </td>
                </tr>

                {/* --- SECTION BAS : PIÈCES GROUPÉES PAR DIVISION --- */}
                {Object.entries(groupedPieces).map(
                  ([division, pieces]: [string, any]) => (
                    <React.Fragment key={division}>
                      {/* Ligne Titre de la Division */}
                      <tr className="bg-slate-100 print:bg-gray-200">
                        <td
                          className="border-2 text-center border-black p-2 font-black text-sm uppercase italic"
                          colSpan={2}
                        >
                          {division}
                        </td>
                      </tr>

                      {/* Liste des pièces de cette division */}
                      {pieces.map((p: any, idx: number) => {
                        return (
                          <tr key={p.id}>
                            <td className="border border-black p-2 text-xs">
                              - {p?.libelle || "Sans nom"}
                            </td>
                            <td className="border border-black p-2 text-center font-bold">
                              {p.DocumentPieces?.disponible ? (
                                <span className="text-emerald-700">
                                  DISPONIBLE
                                </span>
                              ) : (
                                <span className="text-slate-300">
                                  NON DISPONIBLE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>

            {/* Zone de Signature (Visible à l'impression) */}
            <div className="mt-8 hidden print:grid grid-cols-2 gap-10 text-center text-[10px] font-bold uppercase">
              <div className="border-t-2 border-black pt-2">Le Responsable</div>
              <div className="border-t-2 border-black pt-2">
                Le Contrôleur Financier
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <style>
        {`@media print {
       .no-print { display: none !important; }
       
        #printable-area {

         width: 100%; 
         border: none; 
         padding: 0; 
         margin: 0; 
         } 
         #printable-area th { 
         font-size: 16pt !
         important; /* ✅ force la taille */ }
          body { 
          background: white; 
          
          } 

          table {
          width: 100%;
          font-size: 30pt; 
          border-collapse: collapse;
        }

          td, th {
            padding: 8px 10px;      /* ⬅ augmente la hauteur des lignes */
            line-height: 1.5;      /* ⬅ espace vertical du texte */
          }
          
          .p-dialog { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          max-width: none !important; 
          box-shadow: none !important; 
          } 
           } `}
      </style>
    </>
  );
}
