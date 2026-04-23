import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { FileText, Tag, Box, ArrowLeft, Eye } from "lucide-react";
import { Button } from "primereact/button";
import AddToBoxForm from "../Box/AddToBoxForm";
import { retireDocumentFromBox } from "../../api/box";
import { Toast } from "primereact/toast";
import { useAuth } from "../../context/AuthContext";

export default function DocumentDetails({
  visible,
  onHide,
  doc,
  onRefresh,
}: any) {
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const toast = useRef<Toast>(null);
  const { can } = useAuth();

  if (!doc) return null;

  // Réinitialiser l'état quand on ferme la modale
  const handleClose = () => {
    setShowArchiveForm(false);
    onHide();
  };

  const handleRetire = async () => {
    if (!doc.box_id) {
      alert("Ce document n'est pas archivé dans un box.");
      return;
    }
    try {
      await retireDocumentFromBox(doc.box_id, doc.id);
      if (onRefresh) onRefresh();
      toast.current?.show({
        severity: "success",
        summary: "Ok",
        detail: "Document retirer avec succès",
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "erreur",
        detail: "Erreur lors du retrait du document",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
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
        style={{ width: "600px" }}
        onHide={handleClose}
        className="custom-dialog overflow-hidden"
        footer={
          <div className="flex justify-end p-4 bg-emerald-50/50">
            <Button
              label="Fermer la vue"
              onClick={handleClose}
              className="px-8 py-2.5 bg-white text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-all"
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

          {/* SECTION ARCHIVAGE DYNAMIQUE */}

          {can("box", "create") && (
            <div className="border-t border-b border-emerald-50 py-4">
              {doc.box_id ? (
                // ✅ Si déjà archivé → bouton Retirer
                <button
                  onClick={handleRetire}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl font-black hover:bg-red-100 transition-all border-2 border-dashed border-red-200"
                >
                  <Box size={20} />
                  Retirer des archives
                </button>
              ) : !showArchiveForm ? (
                // ✅ Si pas archivé → bouton Archiver
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
                        summary: "Ok",
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
