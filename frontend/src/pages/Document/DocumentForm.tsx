import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Layers, Tag, Plus } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { uploadDocumentFile } from "../../api/ulpoald";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MetaField } from "../../interfaces";

// ✅ Définir le type correctement
interface DocumentPayload {
  type_document_id: number | null;
  values: Record<string, string>;
  id?: number;
}

export default function DocumentForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  documentType,
  selectedTypeId,
  editingDoc,
}: any) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<MetaField[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // Charger les données du document à éditer
  useEffect(() => {
    if (!visible) return;
    if (editingDoc) {
      setDocumentType_id(editingDoc.type_document_id);
      const initialValues: Record<string, any> = {};
      editingDoc.values?.forEach((v: any) => {
        initialValues[v.meta_field_id] = v.value;
      });
      editingDoc.customFieldValues?.forEach((v: any) => {
        initialValues[v.entity_custom_field_id] = v.value;
      });
      setValues(initialValues);
    } else {
      setValues({});
    }
  }, [visible, editingDoc]);

  useEffect(() => {
    if (selectedTypeId && !editingDoc) setDocumentType_id(selectedTypeId);
  }, [selectedTypeId, editingDoc]);

  useEffect(() => {
    // Seulement en mode création
    if (!visible || editingDoc) return;

    // Vérifier qu'une entité a été pré-sélectionnée
    if (
      preselectedEntity &&
      preselectedEntity.entity_type &&
      preselectedEntity.entity_id
    ) {
      console.log("✅ Entité pré-sélectionnée :", preselectedEntity);

      // Si vous voulez juste stocker l'information, ce useEffect suffit.
      // handleSubmit utilisera ensuite :
      // - effectiveEntityType
      // - effectiveEntityId
    }
  }, [visible, preselectedEntity, editingDoc]);

  useEffect(() => {
    if (documentType_id) loadEntityMetaFields(documentType_id);
  }, [documentType_id, effectiveEntityType, effectiveEntityId]);

  const renderField = (field: MetaField) => {
    const value = values[field.id] || "";
    if (field.hidden) return null;

    switch (field.field_type) {
      case "TEXT":
      case "TEXTAREA":
        return (
          <textarea
            value={value}
            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
            placeholder={field.placeholder || `Entrez ${field.label.toLowerCase()}...`}
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            rows={field.field_type === "TEXTAREA" ? 4 : 2}
          />
        );
      case "NUMBER":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
            placeholder={field.placeholder || `Entrez ${field.label.toLowerCase()}...`}
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
      case "DATE":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center gap-3">
            <InputSwitch
              checked={value === "true" || value === true}
              onChange={(e) => setValues({ ...values, [field.id]: e.value })}
            />
            <span className="text-sm text-slate-600">{field.label}</span>
          </div>
        );
      case "SELECT":
        const options = Array.isArray(field.options) ? field.options : [];
        return (
          <select
            value={value}
            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          >
            <option value="">Sélectionnez...</option>
            {options.map((opt: any) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      case "FILE":
        return (
          <input
            type="file"
            onChange={(e) => setValues({ ...values, [field.id]: e.target.files?.[0] })}
            className="w-full bg-white border border-emerald-100 p-2 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
            placeholder={field.placeholder || `Entrez ${field.label.toLowerCase()}...`}
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
    }
  };

  const handleSubmit = async () => {
    // Vérifie que tous les champs required ont une valeur
    const missing = metaFields.filter((f) => f.required && !values[f.id]);

    if (missing.length > 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Champs manquants",
        detail: "Veuillez remplir tous les champs obligatoires !",
      });
      return;
    }
    try {
      const valuesObject: Record<string, string> = {};
      for (const field of metaFields) {
        const fieldValue = values[field.id];

        // Ne pas inclure les fichiers dans le payload JSON
        if (fieldValue && !(fieldValue instanceof File)) {
          valuesObject[field.id] = fieldValue.toString();
        }
      }

      // ✅ Le payload a maintenant la structure attendue par le backend
      const payload: DocumentPayload = {
        type_document_id: documentType_id,
        values: valuesObject,
      };

      // ✅ Ajouter l'id si on est en mode édition
      if (editingDoc?.id) {
        payload.id = editingDoc.id;
      }

      console.log("📦 Payload envoyé:", payload);

      const result = await onSubmit(payload);
      console.log("✅ Document sauvegardé:", result);

      // Uploader les fichiers séparément
      const fileUploads = [];
      for (const [fieldId, value] of Object.entries(values)) {
        if (value instanceof File) {
          const docId = editingDoc?.id || result?.id;
          if (docId) {
            fileUploads.push(uploadDocumentFile(String(docId), fieldId, value));
          }
        }
      }

      // Attendre que tous les fichiers soient uploadés
      if (fileUploads.length > 0) {
        await Promise.all(fileUploads);
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: editingDoc
          ? "Document modifié avec succès !"
          : "Document créé avec succès !",
      });

      onHide();
      refresh?.();
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.message || "Impossible d’enregistrer le document",
      });
    }
  };

  const getEntityLabel = () => {
    if (!effectiveEntityType || !effectiveEntityId) return null;
    const entities = entityData[effectiveEntityType] || [];
    const entity = entities.find((e: any) => e.id === effectiveEntityId);
    return entity?.libelle || preselectedEntity?.entity_label || null;
  };

  // Récupérer l'icône de l'entité
  const EntityIcon = effectiveEntityType
    ? ENTITY_CONFIG[effectiveEntityType]?.icon
    : null;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3 text-emerald-950">
            <div className="p-2 bg-emerald-600 rounded-lg text-white"><Plus size={18} /></div>
            <span className="font-black tracking-tight">{editingDoc ? "Modifier le document" : "Nouveau document"}</span>
            {isEntityPreselected && (
              <p className="text-xs text-emerald-600 mt-1 font-medium ml-12">Pour : {preselectedEntity?.entity_label}</p>
            )}
          </div>
        }
        visible={visible}
        style={{ width: "600px", maxWidth: "90vw" }}
        onHide={onHide}
        className="rounded-3xl overflow-hidden"
        footer={
          <div className="flex justify-end gap-3 p-4 bg-emerald-50/30">
            <Button label="Annuler" onClick={onHide} className="p-button-text text-emerald-600 font-bold" />
            <Button
              label={editingDoc ? "Modifier" : "Enregistrer"}
              icon={<Save size={18} className="mr-2" />}
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
            />
          </div>
        }
      >
        <div className="space-y-6 pt-4 px-1">
          {/* Type de dossier */}
          <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 block flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              Type de dossier
            </label>
            <Dropdown
              value={documentType_id}
              options={documentType}
              onChange={(e) => setDocumentType_id(e.value)}
              optionLabel="nom"
              optionValue="id"
              placeholder="Sélectionner..."
              className="w-full bg-white border-emerald-100 rounded-xl shadow-sm"
              filter
              disabled={!!editingDoc}
            />
          </div>

          {/* Champs du formulaire avec défilement unique */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-sm text-slate-400 mt-2">Chargement des champs...</p>
            </div>
          ) : metaFields.filter(f => !f.hidden).length > 0 ? (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Champs du document ({metaFields.length})
              </p>
              <div className="grid grid-cols-1 gap-4">
                {metaFields.map(field => {
                  if (field.hidden) return null;
                  return (
                    <div key={field.id} className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-emerald-900 ml-1 flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-500 text-xs">*</span>}
                        {field.source === "custom" && (
                          <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">Personnalisé</span>
                        )}
                      </label>
                      {renderField(field)}
                      {field.description && <p className="text-xs text-slate-400 ml-1">{field.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : documentType_id ? (
            <div className="text-center py-12 bg-emerald-50/20 rounded-xl border border-dashed border-emerald-200">
              <FileText size={48} className="mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-600 text-sm">Aucun champ configuré pour ce type de document</p>
              <p className="text-xs text-emerald-400 mt-1">Vous pouvez ajouter des champs personnalisés depuis la gestion des champs</p>
            </div>
          ) : (
            <div className="text-center py-12 bg-emerald-50/20 rounded-xl border border-dashed border-emerald-200">
              <FileText size={48} className="mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-600 text-sm">Sélectionnez d'abord un type de document</p>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}