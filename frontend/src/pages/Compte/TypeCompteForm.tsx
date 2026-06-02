// src/pages/compte/TypeCompteForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Building2, Save, X } from "lucide-react";
import {
  useCreateTypeCompte,
  useUpdateTypeCompte,
} from "../../hooks/useTypeComptes";

interface TypeCompteFormProps {
  visible: boolean;
  onHide: () => void;
  onSubmit?: (payload: any) => Promise<void>;
  refresh?: () => void;
  initial?: any;
}

export default function TypeCompteForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial,
}: TypeCompteFormProps) {
  const toast = useRef<Toast>(null);
  const createMutation = useCreateTypeCompte();
  const updateMutation = useUpdateTypeCompte();

  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial?.id) {
      setNom(initial.nom || "");
    } else {
      setNom("");
    }
  }, [initial, visible]);

  const handleSubmit = async () => {
    if (!nom.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Le nom du type de compte est obligatoire",
      });
      return;
    }

    setLoading(true);
    try {
      if (initial?.id) {
        await updateMutation.mutateAsync({
          id: initial.id,
          data: { nom: nom.trim() },
        });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Type de compte modifié avec succès",
        });
      } else {
        await createMutation.mutateAsync({ nom: nom.trim() });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Type de compte créé avec succès",
        });
      }
      setNom("");
      refresh?.();
      onHide();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || "L'opération a échoué",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Building2 size={18} className="text-emerald-600" />
            </div>
            <span>
              {initial?.id
                ? "Modifier le type de compte"
                : "Nouveau type de compte"}
            </span>
          </div>
        }
        visible={visible}
        style={{ width: "480px", maxWidth: "90vw" }}
        onHide={onHide}
        draggable={false}
        className="rounded-2xl overflow-hidden shadow-2xl"
        footer={
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Annuler"
              icon={<X size={18} className="mr-2" />}
              onClick={onHide}
              className="p-button-text text-slate-400 font-bold hover:text-slate-600"
              disabled={loading}
            />
            <Button
              label={loading ? "Enregistrement..." : "Enregistrer"}
              icon={!loading && <Save size={18} className="mr-2" />}
              onClick={handleSubmit}
              disabled={loading || !nom.trim()}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
            />
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} className="text-emerald-500" /> Nom du type
            </label>
            <InputText
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              placeholder="Ex: Compte courant, Compte épargne, Compte professionnel..."
              autoFocus
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Exemples: Compte courant, Compte épargne, Compte professionnel,
              etc.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
