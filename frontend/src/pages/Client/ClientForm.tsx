// src/pages/clients/ClientForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import {
  Users,
  User,
  Building2,
  Save,
  X,
  Hash,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Globe,
  Briefcase,
  Heart,
  FileText,
} from "lucide-react";
import { useCreateClient, useUpdateClient } from "../../hooks/useClients";
import { Client } from "../../interfaces/client";

interface ClientFormProps {
  visible: boolean;
  onHide: () => void;
  client?: Client | null;
  onSuccess: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  visible,
  onHide,
  client,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [formData, setFormData] = useState({
    type: "PERSONNE" as "PERSONNE" | "STRUCTURE",
    nom: "",
    prenom: "",
    raison_sociale: "",
    sigle: "",
    num_matricule: "",
    email: "",
    telephone: "",
    adresse: "",
    // Champs pour personne physique
    lieu_naissance: "",
    nationalite: "",
    profession: "",
    statut_matrimonial: "",
    date_naissance: null as Date | null,
    nif: "",
    // Champs pour personne morale
    numero_registre_commerce: "",
  });
  const [loading, setLoading] = useState(false);

  const typeOptions = [
    { label: "Personne physique", value: "PERSONNE" },
    { label: "Personne morale (Structure)", value: "STRUCTURE" },
  ];

  useEffect(() => {
    if (client) {
      const isPersonnePhysique = !client.raison_sociale;
      setFormData({
        type: isPersonnePhysique ? "PERSONNE" : "STRUCTURE",
        nom: client.nom || "",
        prenom: client.prenom || "",
        raison_sociale: client.raison_sociale || "",
        sigle: client.sigle || "",
        num_matricule: client.num_matricule || "",
        email: client.email || "",
        telephone: client.telephone || "",
        adresse: client.adresse || "",
        lieu_naissance: client.lieu_naissance || "",
        nationalite: client.nationalite || "",
        profession: client.profession || "",
        statut_matrimonial: client.statut_matrimonial || "",
        date_naissance: client.date_naissance
          ? new Date(client.date_naissance)
          : null,
        nif: client.nif || "",
        numero_registre_commerce: client.numero_registre_commerce || "",
      });
    } else {
      setFormData({
        type: "PERSONNE",
        nom: "",
        prenom: "",
        raison_sociale: "",
        sigle: "",
        num_matricule: "",
        email: "",
        telephone: "",
        adresse: "",
        lieu_naissance: "",
        nationalite: "",
        profession: "",
        statut_matrimonial: "",
        date_naissance: null,
        nif: "",
        numero_registre_commerce: "",
      });
    }
  }, [client, visible]);

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
      if (!formData.prenom.trim()) {
        toast.current?.show({
          severity: "warn",
          summary: "Champ requis",
          detail: "Le prénom est obligatoire",
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
      // ✅ Le champ conserne est déterminé automatiquement par le type
      const conserne =
        formData.type === "PERSONNE" ? "Personne physique" : "Personne morale";

      const payload: any = {
        nom: formData.type === "PERSONNE" ? formData.nom : null,
        prenom: formData.type === "PERSONNE" ? formData.prenom : null,
        raison_sociale:
          formData.type === "STRUCTURE" ? formData.raison_sociale : null,
        sigle: formData.sigle || null,
        num_matricule: formData.num_matricule || null,
        email: formData.email || null,
        telephone: formData.telephone || null,
        adresse: formData.adresse || null,
        conserne, // ✅ Rempli automatiquement
      };

      // Ajouter les champs spécifiques selon le type
      if (formData.type === "PERSONNE") {
        payload.lieu_naissance = formData.lieu_naissance || null;
        payload.nationalite = formData.nationalite || null;
        payload.profession = formData.profession || null;
        payload.statut_matrimonial = formData.statut_matrimonial || null;
        payload.date_naissance = formData.date_naissance || null;
        payload.nif = formData.nif || null;
      } else {
        payload.numero_registre_commerce =
          formData.numero_registre_commerce || null;
        payload.nif = formData.nif || null;
      }

      if (client) {
        await updateMutation.mutateAsync({ id: client.id, data: payload });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Client modifié avec succès",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Client créé avec succès",
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
            <span>{client ? "Modifier le client" : "Nouveau client"}</span>
          </div>
        }
        visible={visible}
        style={{ width: "700px", maxWidth: "90vw" }}
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
          {/* Type de client - C'est ce qui détermine conserne */}
          <div className="space-y-2">
            <label className={labelClass}>Type de client *</label>
            <Dropdown
              value={formData.type}
              options={typeOptions}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
              className="w-full border border-slate-200 rounded-xl"
              placeholder="Sélectionner le type"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Le type sélectionné détermine si le client est une{" "}
              <strong>personne physique</strong> ou une{" "}
              <strong>personne morale</strong>.
            </p>
          </div>

          {/* Numéro de matricule (Commun aux deux types) */}
          <div className="space-y-2">
            <label className={labelClass}>
              <Hash size={14} className="text-emerald-500" /> Numéro de
              matricule
            </label>
            <InputText
              value={formData.num_matricule}
              onChange={(e) =>
                setFormData({ ...formData, num_matricule: e.target.value })
              }
              className={inputClass}
              placeholder="Numéro de matricule"
            />
          </div>

          {/* Champs selon le type */}
          {formData.type === "PERSONNE" ? (
            <>
              {/* Identité */}
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
                  <label className={labelClass}>Prénom *</label>
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

              {/* Date et lieu de naissance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>
                    <CalendarIcon size={14} className="text-emerald-500" /> Date
                    de naissance
                  </label>
                  <Calendar
                    value={formData.date_naissance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_naissance: e.value as Date,
                      })
                    }
                    dateFormat="dd/mm/yy"
                    className="w-full border border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Date de naissance"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>
                    <MapPin size={14} className="text-emerald-500" /> Lieu de
                    naissance
                  </label>
                  <InputText
                    value={formData.lieu_naissance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lieu_naissance: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Lieu de naissance"
                  />
                </div>
              </div>

              {/* Nationalité et profession */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>
                    <Globe size={14} className="text-emerald-500" /> Nationalité
                  </label>
                  <InputText
                    value={formData.nationalite}
                    onChange={(e) =>
                      setFormData({ ...formData, nationalite: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Nationalité"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>
                    <Briefcase size={14} className="text-emerald-500" />{" "}
                    Profession
                  </label>
                  <InputText
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Profession"
                  />
                </div>
              </div>

              {/* Statut matrimonial et NIF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>
                    <Heart size={14} className="text-emerald-500" /> Statut
                    matrimonial
                  </label>
                  <InputText
                    value={formData.statut_matrimonial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statut_matrimonial: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Célibataire, marié(e), etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>
                    <FileText size={14} className="text-emerald-500" /> NIF
                  </label>
                  <InputText
                    value={formData.nif}
                    onChange={(e) =>
                      setFormData({ ...formData, nif: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Numéro d'identification fiscal"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Raison sociale et sigle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Raison sociale *</label>
                  <InputText
                    value={formData.raison_sociale}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        raison_sociale: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Ex: Entreprise X, Ministère..."
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Sigle</label>
                  <InputText
                    value={formData.sigle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sigle: e.target.value.toUpperCase(),
                      })
                    }
                    className={inputClass}
                    placeholder="Ex: SARL, SA, SAS..."
                  />
                </div>
              </div>

              {/* Numéro de registre de commerce et NIF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>
                    <FileText size={14} className="text-emerald-500" /> Numéro
                    de registre de commerce
                  </label>
                  <InputText
                    value={formData.numero_registre_commerce}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numero_registre_commerce: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="N° RCCM"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>
                    <FileText size={14} className="text-emerald-500" /> NIF
                  </label>
                  <InputText
                    value={formData.nif}
                    onChange={(e) =>
                      setFormData({ ...formData, nif: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Numéro d'identification fiscal"
                  />
                </div>
              </div>
            </>
          )}

          {/* Coordonnées communes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>
                <Phone size={14} className="text-emerald-500" /> Téléphone
              </label>
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
              <label className={labelClass}>
                <Mail size={14} className="text-emerald-500" /> Email
              </label>
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

          {/* Adresse */}
          <div className="space-y-2">
            <label className={labelClass}>
              <MapPin size={14} className="text-emerald-500" /> Adresse
            </label>
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
        </div>
      </Dialog>
    </>
  );
};

export default ClientForm;
