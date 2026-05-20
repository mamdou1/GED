// src/pages/courriers/CourrierForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { ProgressBar } from "primereact/progressbar";
import { useAuth } from "../../context/AuthContext";
import PreviewUploadFiles from "./PreviewUploadFiles";
import {
  useCreateCourrier,
  useAddPiecesJointes,
} from "../../hooks/useCourriers";
import api from "../../api/axios";

import {
  FileText,
  Save,
  Info,
  X,
  Upload,
  Trash2,
  File,
  Image,
  File as FileIcon,
  XCircle,
  Calendar as CalendarIcon,
  Hash,
  Eye,
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

interface SelectedFile {
  file: File;
  id: string;
  previewUrl?: string;
  size: string;
  type: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const [expediteurs, setExpediteurs] = useState<ExpediteurOption[]>([]);
  const [destinataires, setDestinataires] = useState<DestinataireOption[]>([]);
  const [loadingExpediteurs, setLoadingExpediteurs] = useState(false);
  const [loadingDestinataires, setLoadingDestinataires] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const createMutation = useCreateCourrier();
  const addPiecesMutation = useAddPiecesJointes();

  const [formData, setFormData] = useState({
    reference: "",
    numero_courrier: "",
    objet: "",
    nature: "",
    corps: "",
    expediteur_id: null as number | null,
    expediteur_nom: "",
    destinataire_externe_id: null as number | null,
    destinataire_nom: "",
    type: "ARRIVE" as "ARRIVE" | "DEPART",
    date_reception: new Date(),
    date_enregistrement: new Date(),
  });

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Générer un aperçu pour les images
  const generatePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        // Pour les PDF, on crée un URL objet
        const url = URL.createObjectURL(file);
        resolve(url);
      } else {
        resolve(null);
      }
    });
  };

  const handlePreviewFiles = () => {
    if (selectedFiles.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Aucun fichier",
        detail: "Veuillez d'abord sélectionner des fichiers",
        life: 3000,
      });
      return;
    }
    setShowPreview(true);
  };

  // Ajouter des fichiers
  const handleAddFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newSelectedFiles: SelectedFile[] = [];

    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) {
        toast.current?.show({
          severity: "warn",
          summary: "Fichier trop volumineux",
          detail: `${file.name} dépasse 10MB`,
          life: 3000,
        });
        continue;
      }

      const previewUrl = await generatePreview(file);

      newSelectedFiles.push({
        file,
        id: `${Date.now()}-${Math.random()}`,
        previewUrl: previewUrl || undefined,
        size: formatFileSize(file.size),
        type: file.type,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newSelectedFiles]);
  };

  // Supprimer un fichier
  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Vider la liste des fichiers
  const handleClearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  // Charger les expéditeurs
  const fetchExpediteurs = async () => {
    setLoadingExpediteurs(true);
    try {
      const response = await api.get("/expediteur");
      if (response.data.success) {
        setExpediteurs(response.data.data);
      }
    } catch (err: any) {
      console.error("Erreur chargement expéditeurs:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          err.response?.data?.message ||
          "Impossible de charger les expéditeurs",
      });
    } finally {
      setLoadingExpediteurs(false);
    }
  };

  // Charger les destinataires
  const fetchDestinataires = async () => {
    setLoadingDestinataires(true);
    try {
      const response = await api.get("/destinataire-externe");
      if (response.data.success) {
        setDestinataires(response.data.data);
      }
    } catch (err: any) {
      console.error("Erreur chargement destinataires:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          err.response?.data?.message ||
          "Impossible de charger les destinataires",
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
          reference: "",
          numero_courrier: "",
          objet: "",
          nature: "",
          corps: "",
          expediteur_id: null,
          expediteur_nom: "",
          destinataire_externe_id: null,
          destinataire_nom: "",
          type: "ARRIVE",
          date_reception: new Date(),
          date_enregistrement: new Date(),
        });
        setSelectedFiles([]);
        setActiveTab(0);
      } else if (courrier) {
        setFormData({
          reference: courrier.reference || "",
          numero_courrier: courrier.numero_courrier || "",
          objet: courrier.objet || "",
          nature: courrier.nature || "",
          corps: courrier.corps || "",
          expediteur_id: courrier.expediteur_id || null,
          expediteur_nom: courrier.expediteur || "",
          destinataire_externe_id: courrier.destinataire_externe_id || null,
          destinataire_nom: courrier.destinataire || "",
          type: courrier.type || "ARRIVE",
          date_reception: courrier.date_reception
            ? new Date(courrier.date_reception)
            : new Date(),
          date_enregistrement: courrier.date_enregistrement
            ? new Date(courrier.date_enregistrement)
            : new Date(),
        });
        setActiveTab(courrier.type === "DEPART" ? 1 : 0);
      }
    }
  }, [visible, mode, courrier]);

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    if (!formData.reference.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Obligatoire",
        detail: "La référence est requise",
      });
      return;
    }

    if (!formData.objet.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Obligatoire",
        detail: "L'objet est requis",
      });
      return;
    }

    if (!formData.numero_courrier.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Obligatoire",
        detail: "Le numéro du courrier est requis",
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ Construction du payload AVANT l'appel API
      const payload: any = {
        type: activeTab === 0 ? "ARRIVE" : "DEPART",
        reference: formData.reference,
        numero_courrier: formData.numero_courrier,
        objet: formData.objet,
        nature: formData.nature || "Ordinaire",
        corps: formData.corps || "",
        date_reception: formData.date_reception,
        date_enregistrement: formData.date_enregistrement,
      };

      // ✅ Gestion de l'expéditeur/destinataire AVANT l'appel
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

      console.log("📤 Création courrier - Payload final:", payload);

      // ✅ 1. Création du courrier
      const newCourrier = await createMutation.mutateAsync(payload);
      console.log(
        "✅ Courrier créé ID:",
        newCourrier?.idcourrier || newCourrier?.data?.idcourrier,
      );

      // Récupérer l'ID correctement
      const courrierId =
        newCourrier?.idcourrier || newCourrier?.data?.idcourrier;

      if (!courrierId) {
        throw new Error("Impossible de récupérer l'ID du courrier créé");
      }

      // ✅ 2. Upload des fichiers (si nécessaire)
      if (selectedFiles.length > 0) {
        const filesToUpload = selectedFiles.map((sf) => sf.file);
        console.log(
          "📤 Upload de",
          filesToUpload.length,
          "fichier(s) pour le courrier",
          courrierId,
        );

        filesToUpload.forEach((f) =>
          console.log("   -", f.name, f.type, f.size),
        );

        // Simuler la progression
        filesToUpload.forEach((_, index) => {
          setUploadProgress((prev) => ({
            ...prev,
            [index]: ((index + 1) / filesToUpload.length) * 50,
          }));
        });

        const uploadResult = await addPiecesMutation.mutateAsync({
          id: courrierId,
          files: filesToUpload,
        });

        console.log("✅ Upload terminé:", uploadResult);

        // Progression à 100%
        filesToUpload.forEach((_, index) => {
          setUploadProgress((prev) => ({
            ...prev,
            [index]: 100,
          }));
        });
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Courrier enregistré avec succès",
      });

      onSuccess();
      onHide();
    } catch (error: any) {
      console.error("❌ Erreur détaillée:", error);
      console.error("❌ Réponse erreur:", error.response?.data);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  const labelStyle =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputStyle =
    "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20";

  const expediteurOptions = expediteurs.map((e) => ({
    label: getExpediteurNom(e),
    value: e.idexpediteur,
  }));

  const destinataireOptions = destinataires.map((d) => ({
    label: getDestinataireNom(d),
    value: d.iddestinataire_externe,
  }));

  // Composant d'affichage des fichiers sélectionnés
  const SelectedFilesList = () => {
    if (selectedFiles.length === 0) return null;

    const getFileIcon = (type: string) => {
      if (type.startsWith("image/"))
        return <Image size={20} className="text-emerald-500" />;
      if (type === "application/pdf")
        return <FileText size={20} className="text-red-500" />;
      return <FileIcon size={20} className="text-slate-500" />;
    };

    return (
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">
            {selectedFiles.length} fichier(s) sélectionné(s)
          </span>
          <Button
            label="Tout vider"
            icon={<XCircle size={14} />}
            onClick={handleClearAllFiles}
            className="p-button-text p-button-sm text-red-500 hover:text-red-700"
            disabled={loading}
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {selectedFiles.map((sf) => (
            <div
              key={sf.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white transition group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {sf.previewUrl ? (
                  <img
                    src={sf.previewUrl}
                    alt={sf.file.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(sf.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {sf.file.name}
                  </p>
                  <p className="text-xs text-slate-400">{sf.size}</p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex justify-end mt-2">
                  <Button
                    title="Aperçu des fichiers"
                    icon={<Eye size={16} className="mr-2" />}
                    onClick={handlePreviewFiles}
                    className="p-button-outlined p-button-secondary text-sm"
                    disabled={loading}
                  />
                </div>
              )}

              {uploadProgress[sf.id] && uploadProgress[sf.id] < 100 ? (
                <div className="w-20">
                  <ProgressBar value={uploadProgress[sf.id]} className="h-1" />
                </div>
              ) : (
                <Button
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemoveFile(sf.id)}
                  className="p-button-text p-button-rounded text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                  title="Supprimer"
                  disabled={loading}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
        disabled={
          loading ||
          !formData.reference.trim() ||
          !formData.objet.trim() ||
          !formData.numero_courrier.trim()
        }
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
          <span>
            {mode === "add" ? "Nouveau Courrier" : "Modifier le courrier"}
          </span>
        </div>
      }
      visible={visible}
      style={{ width: "900px", maxWidth: "90vw" }}
      onHide={onHide}
      draggable={false}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
      footer={footer}
    >
      <Toast ref={toast} />

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
        className="pt-4"
      >
        <TabPanel
          header={
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
                activeTab === 0
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${activeTab === 0 ? "bg-amber-500 animate-pulse" : "bg-transparent"}`}
              ></span>
              Courrier Arrivé
            </div>
          }
        >
          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <Info size={18} className="text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800">
                Enregistrement d'un courrier reçu
              </div>
            </div>

            {/* Ligne pour Référence et Numéro Courrier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>
                  <Hash size={14} className="text-emerald-500" /> Référence{" "}
                  <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Ex: AR-2024-001"
                  className={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>
                  <Hash size={14} className="text-emerald-500" /> Numéro du
                  courrier <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={formData.numero_courrier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numero_courrier: e.target.value,
                    })
                  }
                  placeholder="Numéro du courrier reçu"
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>
                <FileText size={14} className="text-emerald-500" /> Objet{" "}
                <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.objet}
                onChange={(e) =>
                  setFormData({ ...formData, objet: e.target.value })
                }
                placeholder="Objet du courrier"
                className={inputStyle}
              />
            </div>

            {/* Ligne pour Nature et Expéditeur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>Nature</label>
                <Dropdown
                  value={formData.nature}
                  options={[
                    "Ordinaire",
                    "Urgent",
                    "Confidentiel",
                    "Recommandé",
                  ]}
                  onChange={(e) =>
                    setFormData({ ...formData, nature: e.value })
                  }
                  placeholder="Sélectionner"
                  className="w-full border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>Expéditeur</label>
                <Dropdown
                  value={formData.expediteur_id}
                  options={expediteurOptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expediteur_id: e.value,
                      expediteur_nom: "",
                    })
                  }
                  placeholder={
                    loadingExpediteurs
                      ? "Chargement..."
                      : "Sélectionner un expéditeur"
                  }
                  className="w-full border border-slate-200 rounded-xl p-3"
                  filter
                  showClear
                  disabled={loadingExpediteurs}
                />
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center px-3 text-slate-400">
                    ou
                  </div>
                  <InputText
                    value={formData.expediteur_nom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expediteur_nom: e.target.value,
                        expediteur_id: null,
                      })
                    }
                    placeholder="Nouvel expéditeur (nom)"
                    className={`${inputStyle} pl-12`}
                  />
                </div>
              </div>
            </div>

            {/* Ligne pour les dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>
                  <CalendarIcon size={14} className="text-emerald-500" /> Date
                  de réception
                </label>
                <Calendar
                  value={formData.date_reception}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date_reception: e.value as Date,
                    })
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                  inputClassName="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>
                  <CalendarIcon size={14} className="text-emerald-500" /> Date
                  d'enregistrement
                </label>
                <Calendar
                  value={formData.date_enregistrement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date_enregistrement: e.value as Date,
                    })
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                  inputClassName="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Pièces jointes */}
            <div className="space-y-2">
              <label className={labelStyle}>
                <Upload size={14} className="text-emerald-500" /> Pièces jointes
              </label>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                  id="file-upload-input"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleAddFiles(e.target.files);
                      e.target.value = "";
                    }
                  }}
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Upload size={24} className="text-emerald-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    Cliquez pour sélectionner des fichiers
                  </div>
                  <div className="text-xs text-slate-400">
                    ou glissez-déposez-les ici
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    PDF, DOC, DOCX, XLS, XLSX, images (Max 10MB par fichier)
                  </div>
                </label>
              </div>

              <SelectedFilesList />
            </div>
          </div>
        </TabPanel>

        <TabPanel
          header={
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
                activeTab === 1
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${activeTab === 1 ? "bg-blue-500 animate-pulse" : "bg-transparent"}`}
              ></span>
              Courrier Départ
            </div>
          }
        >
          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <Info size={18} className="text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                Enregistrement d'un courrier à envoyer
              </div>
            </div>

            {/* Ligne pour Référence et Numéro Courrier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>
                  <Hash size={14} className="text-emerald-500" /> Référence{" "}
                  <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Ex: DEP-2024-001"
                  className={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>
                  <Hash size={14} className="text-emerald-500" /> Numéro du
                  courrier <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={formData.numero_courrier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numero_courrier: e.target.value,
                    })
                  }
                  placeholder="Numéro du courrier départ"
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>
                <FileText size={14} className="text-emerald-500" /> Objet{" "}
                <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.objet}
                onChange={(e) =>
                  setFormData({ ...formData, objet: e.target.value })
                }
                placeholder="Objet du courrier départ"
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>Nature</label>
                <Dropdown
                  value={formData.nature}
                  options={[
                    "Ordinaire",
                    "Urgent",
                    "Confidentiel",
                    "Recommandé",
                  ]}
                  onChange={(e) =>
                    setFormData({ ...formData, nature: e.value })
                  }
                  placeholder="Sélectionner"
                  className="w-full border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>Destinataire externe</label>
                <Dropdown
                  value={formData.destinataire_externe_id}
                  options={destinataireOptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinataire_externe_id: e.value,
                      destinataire_nom: "",
                    })
                  }
                  placeholder={
                    loadingDestinataires
                      ? "Chargement..."
                      : "Sélectionner un destinataire"
                  }
                  className="w-full border border-slate-200 rounded-xl p-3"
                  filter
                  showClear
                  disabled={loadingDestinataires}
                />
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center px-3 text-slate-400">
                    ou
                  </div>
                  <InputText
                    value={formData.destinataire_nom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinataire_nom: e.target.value,
                        destinataire_externe_id: null,
                      })
                    }
                    placeholder="Nouveau destinataire (nom)"
                    className={`${inputStyle} pl-12`}
                  />
                </div>
              </div>
            </div>

            {/* Ligne pour les dates départ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>
                  <CalendarIcon size={14} className="text-emerald-500" /> Date
                  d'envoi
                </label>
                <Calendar
                  value={formData.date_reception}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date_reception: e.value as Date,
                    })
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                  inputClassName="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>
                  <CalendarIcon size={14} className="text-emerald-500" /> Date
                  d'enregistrement
                </label>
                <Calendar
                  value={formData.date_enregistrement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date_enregistrement: e.value as Date,
                    })
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                  inputClassName="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyle}>Corps / Contenu</label>
              <InputTextarea
                value={formData.corps}
                onChange={(e) =>
                  setFormData({ ...formData, corps: e.target.value })
                }
                rows={6}
                placeholder="Contenu du courrier à envoyer..."
                className={inputStyle}
              />
            </div>

            {/* Pièces jointes */}
            <div className="space-y-2">
              <label className={labelStyle}>
                <Upload size={14} className="text-emerald-500" /> Pièces
                jointes{" "}
              </label>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                  id="file-upload-input-depart"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleAddFiles(e.target.files);
                      e.target.value = "";
                    }
                  }}
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload-input-depart"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Upload size={24} className="text-emerald-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    Cliquez pour sélectionner des fichiers
                  </div>
                  <div className="text-xs text-slate-400">
                    ou glissez-déposez-les ici
                  </div>
                </label>
              </div>
              <SelectedFilesList />
            </div>
          </div>
        </TabPanel>
      </TabView>
      <PreviewUploadFiles
        visible={showPreview}
        onHide={() => setShowPreview(false)}
        files={selectedFiles.map((sf) => ({
          ...sf,
          name: sf.file.name,
        }))}
        onRemoveFile={handleRemoveFile}
        title="Aperçu des pièces jointes"
      />
    </Dialog>
  );
};

export default CourrierForm;
