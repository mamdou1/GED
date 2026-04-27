import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { useTraiterCourrier, useAddPiecesJointes } from "../../hooks/useCourriers";

import { FileText, Save, X, Upload, Info } from "lucide-react";

interface TraitementCourrierModalProps {
  visible: boolean;
  onHide: () => void;
  courrier: any;
  onTraitementComplete: () => void;
}

const TraitementCourrierModal: React.FC<TraitementCourrierModalProps> = ({
  visible,
  onHide,
  courrier,
  onTraitementComplete,
}) => {
  const toast = React.useRef<any>(null);
  const [reponse, setReponse] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const traiterMutation = useTraiterCourrier();
  const addPiecesMutation = useAddPiecesJointes();

  const handleSubmit = async () => {
    if (!reponse.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Obligatoire",
        detail: "Veuillez rédiger votre traitement / réponse",
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ Correction : Structure attendue par le hook
      await traiterMutation.mutateAsync({
        id: courrier.idcourrier,
        payload: {
          action: "TRAITER",
          nouveau_statut: "TRAITE",
          motif: reponse,
        },
      });

      // Ajout des pièces jointes si présentes
      if (files.length > 0) {
        await addPiecesMutation.mutateAsync({
          id: courrier.idcourrier,
          files,
        });
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Traitement enregistré avec succès",
      });

      onTraitementComplete();
      onHide();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.message || "Échec du traitement",
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
      <Button
        label="Annuler"
        icon={<X size={18} className="mr-2" />}
        onClick={onHide}
        className="p-button-text text-slate-400 font-bold hover:text-slate-600"
        disabled={loading}
      />
      <Button
        label={loading ? "Enregistrement..." : "Valider le traitement"}
        icon={!loading && <Save size={18} className="mr-2" />}
        onClick={handleSubmit}
        loading={loading}
        disabled={!reponse.trim()}
        className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
      />
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <FileText size={18} className="text-emerald-600" />
          </div>
          <span>Traitement du courrier</span>
        </div>
      }
      visible={visible}
      style={{ width: "720px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
      footer={footer}
    >
      <Toast ref={toast} />

      <div className="pt-4 space-y-6">
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <Info size={18} className="text-emerald-600 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Courrier : {courrier?.reference}</div>
            <div className="text-xs text-emerald-700 mt-0.5">{courrier?.objet}</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-emerald-500" /> Votre réponse / Traitement <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={8}
            placeholder="Décrivez les actions réalisées, la réponse apportée ou la conclusion..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Upload size={14} className="text-emerald-500" /> Pièces justificatives (optionnel)
          </label>
          <FileUpload
            name="files"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            maxFileSize={20000000}
            chooseLabel="Choisir fichiers"
            mode="basic"
            onSelect={(e) => setFiles((prev) => [...prev, ...Array.from(e.files)])}
            className="w-full border border-slate-200 rounded-xl p-3"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default TraitementCourrierModal;