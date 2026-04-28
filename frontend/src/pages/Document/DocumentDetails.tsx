import { useRef, useState, useCallback, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import {
  FileText,
  Tag,
  Box,
  ArrowLeft,
  Eye,
  Move,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "primereact/button";
import AddToBoxForm from "../Box/AddToBoxForm";
import {
  retireDocumentFromBox,
  moveDocumentToBox,
  getBoxes,
} from "../../api/box";
import { Toast } from "primereact/toast";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "primereact/dropdown";
import { Badge } from "primereact/badge";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function DocumentDetails({
  visible,
  onHide,
  doc,
  onRefresh,
}: any) {
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [loadingBoxes, setLoadingBoxes] = useState(false);
  const [moving, setMoving] = useState(false);
  const toast = useRef<Toast>(null);
  const { can } = useAuth();

  // Charger la liste des boxes disponibles pour le déplacement
  const loadBoxes = useCallback(async () => {
    if (!showMoveForm) return;
    setLoadingBoxes(true);
    try {
      const response = await getBoxes();
      // Filtrer pour exclure le box actuel du document
      const availableBoxes = response.filter(
        (box: any) => box.id !== doc?.box_id,
      );
      setBoxes(availableBoxes);
    } catch (error) {
      console.error("Erreur chargement boxes:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger la liste des boxes",
      });
    } finally {
      setLoadingBoxes(false);
    }
  }, [showMoveForm, doc?.box_id]);

  useEffect(() => {
    if (showMoveForm) {
      loadBoxes();
    }
  }, [showMoveForm, loadBoxes]);

  // Réinitialiser l'état quand on ferme la modale
  const handleClose = () => {
    setShowArchiveForm(false);
    setShowMoveForm(false);
    setSelectedBox(null);
    onHide();
  };

  const handleRetire = () => {
    confirmDialog({
      message: "Retirer ce document du box ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        if (!doc?.box_id) {
          toast.current?.show({
            severity: "warn",
            summary: "Attention",
            detail: "Ce document n'est pas archivé dans un box.",
          });
          return;
        }
        try {
          await retireDocumentFromBox(doc.box_id, doc.id);
          if (onRefresh) onRefresh();
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Document retiré avec succès",
          });
          handleClose();
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Erreur lors du retrait du document",
          });
        }
      },
    });
  };

  const handleMoveDocument = async () => {
    if (!selectedBox) {
      toast.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Veuillez sélectionner un box de destination",
      });
      return;
    }

    // Vérifier la capacité du box destination
    if (selectedBox.current_count >= selectedBox.capacite_max) {
      toast.current?.show({
        severity: "error",
        summary: "Capacité atteinte",
        detail: `Le box "${selectedBox.libelle}" est plein (${selectedBox.current_count}/${selectedBox.capacite_max})`,
      });
      return;
    }

    setMoving(true);
    try {
      await moveDocumentToBox(doc.id, doc.box_id, selectedBox.id);

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `Document déplacé vers le box "${selectedBox.libelle}" avec succès`,
      });
      if (onRefresh) onRefresh();
      setShowMoveForm(false);
      setSelectedBox(null);
      handleClose();
    } catch (err) {
      console.error("Erreur déplacement:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Erreur lors du déplacement du document",
      });
    } finally {
      setMoving(false);
    }
  };

  // Template pour l'option du dropdown
  const boxOptionTemplate = (option: any) => {
    if (!option) return null;
    const isFull = option.current_count >= option.capacite_max;
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span className="font-bold text-sm">{option.libelle}</span>
          <span className="text-xs text-slate-400">
            {option.code_box} • {option.current_count}/{option.capacite_max}{" "}
            docs
          </span>
        </div>
        <div className="flex items-center gap-2">
          {option.typeDocument && (
            <Badge
              value={option.typeDocument.nom}
              severity="info"
              className="text-xs"
            />
          )}
          {isFull && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
              Plein
            </span>
          )}
        </div>
      </div>
    );
  };

  // Template pour l'option sélectionnée
  const selectedBoxTemplate = (option: any) => {
    if (!option) return <span>Sélectionner un box...</span>;
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span className="font-bold text-sm">{option.libelle}</span>
          <span className="text-xs text-slate-400">
            {option.code_box} • {option.current_count}/{option.capacite_max}{" "}
            docs
          </span>
        </div>
      </div>
    );
  };

  // Vérifier si le document existe et est archivé
  if (!doc) return null;

  const isArchived = doc.box_id !== null;

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Dialog
        header={
          <div className="flex items-center gap-3 text-emerald-950">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <FileText size={18} />
            </div>
            <span className="font-black tracking-tight">
              Consultation Document
            </span>
          </div>
        }
        visible={visible}
        style={{ width: "650px" }}
        onHide={handleClose}
        className="custom-dialog overflow-hidden"
        footer={
          <div className="flex justify-end gap-3 p-4 bg-emerald-50/50">
            <Button
              label="Fermer"
              onClick={handleClose}
              className="px-6 py-2.5 bg-white text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-all"
            />
          </div>
        }
      >
        <div className="space-y-6 pt-4">
          {/* Banner Référence */}
          <div className="bg-emerald-950 p-6 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-emerald-800/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-emerald-400 text-[10px] uppercase font-black tracking-widest mb-1">
                  ID Archive
                </p>
                <h2 className="text-3xl font-black text-white">
                  #{String(doc.id).padStart(4, "0")}
                </h2>
              </div>
              <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-black">
                {doc.typeDocument?.nom || "Non classé"}
              </div>
            </div>
          </div>

          {/* SECTION ARCHIVAGE DYNAMIQUE AVEC DÉPLACEMENT */}
          {can("box", "create") && (
            <div className="border-t border-b border-emerald-50 py-4 space-y-3">
              {isArchived ? (
                // ✅ Si déjà archivé → Afficher les options (Retirer ou Déplacer)
                <div className="space-y-3">
                  {!showMoveForm ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleRetire}
                        className="flex-1 flex items-center justify-center gap-3 p-3 bg-red-50 text-red-700 rounded-2xl font-black hover:bg-red-100 transition-all border-2 border-dashed border-red-200"
                      >
                        <X size={20} />
                        Retirer des archives
                      </button>
                      <button
                        onClick={() => setShowMoveForm(true)}
                        className="flex-1 flex items-center justify-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-2xl font-black hover:bg-blue-100 transition-all border-2 border-dashed border-blue-200"
                      >
                        <Move size={20} />
                        Déplacer vers un autre box
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setShowMoveForm(false);
                            setSelectedBox(null);
                          }}
                          className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                          <ArrowLeft size={12} /> Annuler le déplacement
                        </button>
                        <div className="text-xs text-slate-400">
                          Box actuel :{" "}
                          <span className="font-bold text-slate-600">
                            {doc.box?.libelle || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500">
                          Sélectionner le box de destination
                        </label>
                        <Dropdown
                          value={selectedBox}
                          options={boxes}
                          onChange={(e) => setSelectedBox(e.value)}
                          optionLabel="libelle"
                          placeholder="Choisir un box..."
                          className="w-full"
                          loading={loadingBoxes}
                          itemTemplate={boxOptionTemplate}
                          valueTemplate={selectedBoxTemplate}
                          //panelClassName="w-full"
                        />
                      </div>

                      {selectedBox &&
                        selectedBox.current_count >=
                          selectedBox.capacite_max && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs">
                            <AlertCircle size={14} />
                            <span>
                              Ce box est plein, veuillez en choisir un autre
                            </span>
                          </div>
                        )}

                      <button
                        onClick={handleMoveDocument}
                        disabled={
                          !selectedBox ||
                          moving ||
                          (selectedBox &&
                            selectedBox.current_count >=
                              selectedBox.capacite_max)
                        }
                        className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black transition-all ${
                          !selectedBox ||
                          moving ||
                          (selectedBox &&
                            selectedBox.current_count >=
                              selectedBox.capacite_max)
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                        }`}
                      >
                        {moving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Déplacement en cours...
                          </>
                        ) : (
                          <>
                            <Check size={20} />
                            Confirmer le déplacement
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : !showArchiveForm ? (
                // ✅ Si pas archivé → bouton Archiver uniquement
                <button
                  onClick={() => setShowArchiveForm(true)}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black hover:bg-emerald-100 transition-all border-2 border-dashed border-emerald-200"
                >
                  <Box size={20} />
                  Archiver dans un Box
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => setShowArchiveForm(false)}
                    className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                  >
                    <ArrowLeft size={12} /> Annuler l'archivage
                  </button>
                  <AddToBoxForm
                    documentId={doc.id}
                    typeDocumentId={doc.type_document_id}
                    onSuccess={() => {
                      setShowArchiveForm(false);
                      if (onRefresh) onRefresh();
                      toast.current?.show({
                        severity: "success",
                        summary: "Succès",
                        detail: "Document archivé avec succès",
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Métadonnées */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest ml-1">
              Métadonnées indexées
            </p>
            <div className="grid grid-cols-1 gap-2">
              {doc.values?.map((v: any) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-4 bg-white border border-emerald-50 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                      <Tag size={14} />
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      {v.metaField?.label}
                    </span>
                  </div>
                  <span className="text-sm font-black text-emerald-950">
                    {v.metaField?.field_type === "file" ? (
                      <a
                        href={v.value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Ouvrir
                      </a>
                    ) : (
                      v.value || "-"
                    )}
                  </span>
                </div>
              ))}
              {/* Section des pièces justificatives */}
              {doc.pieces && doc.pieces.length > 0 && (
                <div className="space-y-3 mt-6">
                  <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest ml-1">
                    Pièces justificatives ({doc.pieces.length})
                  </p>
                  <div className="space-y-2">
                    {doc.pieces.map((piece: any) => {
                      const isDisponible =
                        piece.DocumentPieces?.disponible || false;
                      return (
                        <div
                          key={piece.id}
                          className={`p-3 rounded-xl border ${
                            isDisponible
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isDisponible
                                    ? "bg-emerald-200"
                                    : "bg-slate-100"
                                }`}
                              >
                                <FileText
                                  size={14}
                                  className={
                                    isDisponible
                                      ? "text-emerald-700"
                                      : "text-slate-400"
                                  }
                                />
                              </div>
                              <div>
                                <span
                                  className={`text-sm font-bold ${
                                    isDisponible
                                      ? "text-emerald-900"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {piece.libelle}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      isDisponible
                                        ? "bg-emerald-200 text-emerald-800"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {isDisponible
                                      ? "Disponible"
                                      : "Non disponible"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
