// src/pages/courriers/CourrierRejeter.tsx
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { XCircle, X, AlertCircle } from "lucide-react";
import { useRejeterCourrier } from "../../hooks/useCourriers";

interface CourrierRejeterProps {
  visible: boolean;
  onHide: () => void;
  courrierId: number | null;
  onSuccess: () => void;
}

const CourrierRejeter: React.FC<CourrierRejeterProps> = ({
  visible,
  onHide,
  courrierId,
  onSuccess,
}) => {
  const toast = React.useRef<Toast>(null);
  const [rejetMotif, setRejetMotif] = useState("");
  const rejeterMutation = useRejeterCourrier();

  const handleSubmitRejet = async () => {
    if (!rejetMotif.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Motif requis",
        detail: "Veuillez indiquer le motif du rejet",
      });
      return;
    }

    try {
      await rejeterMutation.mutateAsync({
        id: courrierId!,
        motif: rejetMotif,
      });
      toast.current?.show({
        severity: "success",
        summary: "Rejeté",
        detail: "Courrier rejeté avec succès",
      });
      setRejetMotif("");
      onSuccess();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={() => {
          setRejetMotif("");
          onHide();
        }}
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle size={18} className="text-red-600" />
            </div>
            <span>Rejeter le courrier</span>
          </div>
        }
        style={{ width: "480px" }}
        className="rounded-2xl overflow-hidden shadow-2xl"
        draggable={false}
        footer={
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Annuler"
              icon={<X size={16} className="mr-2" />}
              onClick={() => {
                setRejetMotif("");
                onHide();
              }}
              className="p-button-text text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
            />
            <Button
              label="Rejeter"
              icon={<XCircle size={16} className="mr-2" />}
              onClick={handleSubmitRejet}
              className="bg-red-600 hover:bg-red-700 text-white border-none px-6 py-2 rounded-xl shadow-lg shadow-red-200 transition-all font-bold"
            />
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle size={18} className="text-red-600 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed">
              <span className="font-bold block uppercase mb-1">
                ⚠️ Action irréversible
              </span>
              Cette action est définitive. Le courrier sera marqué comme rejeté.
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <XCircle size={14} className="text-red-500" /> Motif du rejet *
            </label>
            <InputTextarea
              value={rejetMotif}
              onChange={(e) => setRejetMotif(e.target.value)}
              placeholder="Indiquez la raison du rejet..."
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all"
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CourrierRejeter;
