// src/pages/expediteurs/ExpediteursForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Building2, User, Save, X } from "lucide-react";
import {
  useCreateExpediteur,
  useUpdateExpediteur,
} from "../../hooks/useExpediteurs";
import { Expediteur } from "../../interfaces/expediteur";

interface ExpediteursFormProps {
  visible: boolean;
  onHide: () => void;
  expediteur?: Expediteur | null;
  onSuccess: () => void;
}

const ExpediteursForm: React.FC<ExpediteursFormProps> = ({
  visible,
  onHide,
  expediteur,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const createMutation = useCreateExpediteur();
  const updateMutation = useUpdateExpediteur();

  const [formData, setFormData] = useState({
    type: "STRUCTURE" as "PERSONNE" | "STRUCTURE",
    nom: "",
    prenom: "",
    raison_sociale: "",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [loading, setLoading] = useState(false);

  const typeOptions = [
    { label: "Personne physique", value: "PERSONNE" },
    { label: "Structure (Société, Ministère...)", value: "STRUCTURE" },
  ];

  useEffect(() => {
    if (expediteur) {
      setFormData({
        type: expediteur.type || "STRUCTURE",
        nom: expediteur.nom || "",
        prenom: expediteur.prenom || "",
        raison_sociale: expediteur.raison_sociale || "",
        email: expediteur.email || "",
        telephone: expediteur.telephone || "",
        adresse: expediteur.adresse || "",
      });
    } else {
      setFormData({
        type: "STRUCTURE",
        nom: "",
        prenom: "",
        raison_sociale: "",
        email: "",
        telephone: "",
        adresse: "",
      });
    }
  }, [expediteur, visible]);

  const validateForm = (): boolean => {
    if (formData.type === "PERSONNE") {
      if (!formData.nom.trim()) {
        toast.current?.show({
          severity: "warn",
          summary: "Champ requis",
          detail: "Le nom est obligatoire",
        });
        return false;
      }
    } else {
      if (!formData.raison_sociale.trim()) {
        toast.current?.show({
          severity: "warn",
          summary: "Champ requis",
          detail: "La raison sociale est obligatoire",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        type: formData.type,
        nom: formData.type === "PERSONNE" ? formData.nom : null,
        prenom: formData.type === "PERSONNE" ? formData.prenom || null : null,
        raison_sociale:
          formData.type === "STRUCTURE" ? formData.raison_sociale : null,
        email: formData.email || null,
        telephone: formData.telephone || null,
        adresse: formData.adresse || null,
      };

      if (expediteur) {
        await updateMutation.mutateAsync({
          id: expediteur.idexpediteur,
          data: payload,
        });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Expéditeur modifié avec succès",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Expéditeur créé avec succès",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputClass =
    "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none";

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              {formData.type === "PERSONNE" ? (
                <User size={18} className="text-emerald-600" />
              ) : (
                <Building2 size={18} className="text-emerald-600" />
              )}
            </div>
            <span>
              {expediteur ? "Modifier l'expéditeur" : "Nouvel expéditeur"}
            </span>
          </div>
        }
        visible={visible}
        style={{ width: "650px", maxWidth: "90vw" }}
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
              disabled={loading}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
            />
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          {/* Type */}
          <div className="space-y-2">
            <label className={labelClass}>Type *</label>
            <Dropdown
              value={formData.type}
              options={typeOptions}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
              className="w-full border border-slate-200 rounded-xl"
              placeholder="Sélectionner le type"
            />
          </div>

          {/* Champs selon le type */}
          {formData.type === "PERSONNE" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Nom *</label>
                <InputText
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Prénom</label>
                <InputText
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Prénom"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className={labelClass}>Raison sociale *</label>
              <InputText
                value={formData.raison_sociale}
                onChange={(e) =>
                  setFormData({ ...formData, raison_sociale: e.target.value })
                }
                className={inputClass}
                placeholder="Ex: Ministère des Finances, Société X..."
              />
            </div>
          )}

          {/* Adresse */}
          <div className="space-y-2">
            <label className={labelClass}>Adresse</label>
            <InputTextarea
              value={formData.adresse}
              onChange={(e) =>
                setFormData({ ...formData, adresse: e.target.value })
              }
              className={inputClass}
              rows={2}
              placeholder="Adresse complète"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Téléphone</label>
              <InputText
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                className={inputClass}
                placeholder="Téléphone"
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Email</label>
              <InputText
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={inputClass}
                placeholder="Email"
                type="email"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ExpediteursForm;
