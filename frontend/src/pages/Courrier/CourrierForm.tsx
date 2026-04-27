// src/pages/courriers/CourrierForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { useAuth } from "../../context/AuthContext";
import { useCreateCourrier, useAddPiecesJointes } from "../../hooks/useCourriers";
import api from "../../api/axios"; // ✅ Utiliser l'instance configurée

import {
  FileText,
  Save,
  Info,
  X,
  Upload,
} from "lucide-react";

interface CourrierFormProps {
  visible: boolean;
  onHide: () => void;
  courrier?: any;
  onSuccess: () => void;
  mode?: "add" | "edit";
}

interface ExpediteurOption {
  idexpediteur: number;
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  code?: string;
}

interface DestinataireOption {
  iddestinataire_externe: number;
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  code?: string;
}

const CourrierForm: React.FC<CourrierFormProps> = ({
  visible,
  onHide,
  courrier,
  onSuccess,
  mode = "add",
}) => {
  const { user } = useAuth();
  const toast = useRef<any>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [expediteurs, setExpediteurs] = useState<ExpediteurOption[]>([]);
  const [destinataires, setDestinataires] = useState<DestinataireOption[]>([]);
  const [loadingExpediteurs, setLoadingExpediteurs] = useState(false);
  const [loadingDestinataires, setLoadingDestinataires] = useState(false);

  const createMutation = useCreateCourrier();
  const addPiecesMutation = useAddPiecesJointes();

  const [formData, setFormData] = useState({
    objet: "",
    nature: "",
    corps: "",
    expediteur_id: null as number | null,
    expediteur_nom: "",
    destinataire_externe_id: null as number | null,
    destinataire_nom: "",
    type: "ARRIVE" as "ARRIVE" | "DEPART",
  });

  const getExpediteurNom = (exp: ExpediteurOption) => {
    if (exp.raison_sociale) return exp.raison_sociale;
    if (exp.prenom) return `${exp.nom} ${exp.prenom}`;
    return exp.nom;
  };

  const getDestinataireNom = (dest: DestinataireOption) => {
    if (dest.raison_sociale) return dest.raison_sociale;
    if (dest.prenom) return `${dest.nom} ${dest.prenom}`;
    return dest.nom;
  };

  // Charger les expéditeurs - ✅ CORRECTION ICI
  const fetchExpediteurs = async () => {
    setLoadingExpediteurs(true);
    try {
      // ✅ Utiliser l'instance api, pas axios direct
      const response = await api.get("/expediteur");
      if (response.data.success) {
        setExpediteurs(response.data.data);
      }
    } catch (err: any) {
      console.error("Erreur chargement expéditeurs:", err);
      toast.current?.show({ 
        severity: "error", 
        summary: "Erreur", 
        detail: err.response?.data?.message || "Impossible de charger les expéditeurs" 
      });
    } finally {
      setLoadingExpediteurs(false);
    }
  };

  // Charger les destinataires - ✅ CORRECTION ICI
  const fetchDestinataires = async () => {
    setLoadingDestinataires(true);
    try {
      // ✅ Utiliser l'instance api, pas axios direct
      const response = await api.get("/destinataire-externe");
      if (response.data.success) {
        setDestinataires(response.data.data);
      }
    } catch (err: any) {
      console.error("Erreur chargement destinataires:", err);
      toast.current?.show({ 
        severity: "error", 
        summary: "Erreur", 
        detail: err.response?.data?.message || "Impossible de charger les destinataires" 
      });
    } finally {
      setLoadingDestinataires(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchExpediteurs();
      fetchDestinataires();
      
      if (mode === "add") {
        setFormData({
          objet: "",
          nature: "",
          corps: "",
          expediteur_id: null,
          expediteur_nom: "",
          destinataire_externe_id: null,
          destinataire_nom: "",
          type: "ARRIVE",
        });
        setFiles([]);
        setActiveTab(0);
      } else if (courrier) {
        setFormData({
          objet: courrier.objet || "",
          nature: courrier.nature || "",
          corps: courrier.corps || "",
          expediteur_id: courrier.expediteur_id || null,
          expediteur_nom: courrier.expediteur || "",
          destinataire_externe_id: courrier.destinataire_externe_id || null,
          destinataire_nom: courrier.destinataire || "",
          type: courrier.type || "ARRIVE",
        });
        setActiveTab(courrier.type === "DEPART" ? 1 : 0);
      }
    }
  }, [visible, mode, courrier]);

  const handleSubmit = async () => {
    if (!formData.objet.trim()) {
      toast.current?.show({ severity: "warn", summary: "Obligatoire", detail: "L'objet est requis" });
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        type: activeTab === 0 ? "ARRIVE" : "DEPART",
        objet: formData.objet,
        nature: formData.nature || "Ordinaire",
        corps: formData.corps || "",
      };

      if (activeTab === 0) {
        if (formData.expediteur_id) {
          payload.expediteur_id = formData.expediteur_id;
        } else if (formData.expediteur_nom) {
          payload.expediteur = formData.expediteur_nom;
        }
      } else {
        if (formData.destinataire_externe_id) {
          payload.destinataire_externe_id = formData.destinataire_externe_id;
        } else if (formData.destinataire_nom) {
          payload.destinataire = formData.destinataire_nom;
        }
      }

      const newCourrier = await createMutation.mutateAsync(payload);

      if (files.length > 0 && newCourrier.idcourrier) {
        await addPiecesMutation.mutateAsync({ id: newCourrier.idcourrier, files });
      }

      toast.current?.show({ severity: "success", summary: "Succès", detail: "Courrier enregistré avec succès" });
      onSuccess();
      onHide();
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      toast.current?.show({ severity: "error", summary: "Erreur", detail: error.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputStyle = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20";

  const expediteurOptions = expediteurs.map(e => ({
    label: getExpediteurNom(e),
    value: e.idexpediteur
  }));

  const destinataireOptions = destinataires.map(d => ({
    label: getDestinataireNom(d),
    value: d.iddestinataire_externe
  }));

  const footer = (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
      <Button
        label="Annuler"
        icon={<X size={18} className="mr-2" />}
        onClick={onHide}
        className="p-button-text text-slate-400 font-bold hover:text-slate-600"
        disabled={loading}
      />
      <Button
        label={loading ? "Enregistrement..." : "Enregistrer le courrier"}
        icon={!loading && <Save size={18} className="mr-2" />}
        onClick={handleSubmit}
        disabled={loading || !formData.objet.trim()}
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
          <span>{mode === "add" ? "Nouveau Courrier" : "Modifier le courrier"}</span>
        </div>
      }
      visible={visible}
      style={{ width: "820px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
      footer={footer}
    >
      <Toast ref={toast} />

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)} className="pt-4">
        
        <TabPanel header="Courrier Arrivé">
          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <Info size={18} className="text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800">Enregistrement d'un courrier reçu</div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>
                <FileText size={14} className="text-emerald-500" /> Objet <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                placeholder="Objet du courrier"
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>Nature</label>
                <Dropdown
                  value={formData.nature}
                  options={["Ordinaire", "Urgent", "Confidentiel", "Recommandé"]}
                  onChange={(e) => setFormData({ ...formData, nature: e.value })}
                  placeholder="Sélectionner"
                  className="w-full border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>Expéditeur</label>
                <Dropdown
                  value={formData.expediteur_id}
                  options={expediteurOptions}
                  onChange={(e) => setFormData({ ...formData, expediteur_id: e.value, expediteur_nom: "" })}
                  placeholder={loadingExpediteurs ? "Chargement..." : "Sélectionner un expéditeur"}
                  className="w-full border border-slate-200 rounded-xl p-3"
                  filter
                  showClear
                  disabled={loadingExpediteurs}
                />
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center px-3 text-slate-400">ou</div>
                  <InputText
                    value={formData.expediteur_nom}
                    onChange={(e) => setFormData({ ...formData, expediteur_nom: e.target.value, expediteur_id: null })}
                    placeholder="Nouvel expéditeur (nom)"
                    className={`${inputStyle} pl-12`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>
                <Upload size={14} className="text-emerald-500" /> Pièces jointes
              </label>
              <FileUpload
                name="files"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                maxFileSize={20000000}
                chooseLabel="Choisir fichiers"
                mode="basic"
                onSelect={(e) => setFiles((prev) => [...prev, ...Array.from(e.files || [])])}
                className="w-full border border-slate-200 rounded-xl p-3"
              />
              {files.length > 0 && (
                <div className="text-sm text-slate-500 mt-2">
                  {files.length} fichier(s) sélectionné(s)
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Courrier Départ">
          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <Info size={18} className="text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">Enregistrement d'un courrier à envoyer</div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>
                <FileText size={14} className="text-emerald-500" /> Objet <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                placeholder="Objet du courrier départ"
                className={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>Destinataire externe</label>
              <Dropdown
                value={formData.destinataire_externe_id}
                options={destinataireOptions}
                onChange={(e) => setFormData({ ...formData, destinataire_externe_id: e.value, destinataire_nom: "" })}
                placeholder={loadingDestinataires ? "Chargement..." : "Sélectionner un destinataire"}
                className="w-full border border-slate-200 rounded-xl p-3"
                filter
                showClear
                disabled={loadingDestinataires}
              />
              <div className="relative mt-2">
                <div className="absolute inset-0 flex items-center px-3 text-slate-400">ou</div>
                <InputText
                  value={formData.destinataire_nom}
                  onChange={(e) => setFormData({ ...formData, destinataire_nom: e.target.value, destinataire_externe_id: null })}
                  placeholder="Nouveau destinataire (nom)"
                  className={`${inputStyle} pl-12`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>Corps / Contenu</label>
              <InputTextarea
                value={formData.corps}
                onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
                rows={8}
                placeholder="Contenu du courrier à envoyer..."
                className={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>
                <Upload size={14} className="text-emerald-500" /> Pièces jointes
              </label>
              <FileUpload
                name="files"
                multiple
                accept="*/*"
                maxFileSize={20000000}
                chooseLabel="Choisir fichiers"
                mode="basic"
                onSelect={(e) => setFiles((prev) => [...prev, ...Array.from(e.files || [])])}
                className="w-full border border-slate-200 rounded-xl p-3"
              />
              {files.length > 0 && (
                <div className="text-sm text-slate-500 mt-2">
                  {files.length} fichier(s) sélectionné(s)
                </div>
              )}
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Dialog>
  );
};

export default CourrierForm;