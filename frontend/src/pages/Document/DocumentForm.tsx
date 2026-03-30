import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Layers, Tag, Plus } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { getMetaById } from "../../api/metaField";
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
  const [values, setValues] = useState<any>({});
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<MetaField[]>([]);
  const toast = useRef<Toast>(null);

  // Charger les données du document à éditer
  useEffect(() => {
    if (visible && editingDoc) {
      console.log("📝 Mode édition - Document:", editingDoc);

      // 1. Définir le type de document
      setDocumentType_id(editingDoc.type_document_id);

      // 2. Charger les valeurs existantes
      const initialValues: Record<string, any> = {};
      if (editingDoc.values) {
        editingDoc.values.forEach((v: any) => {
          initialValues[v.meta_field_id] = v.value;
        });
      }
      setValues(initialValues);
    }
  }, [visible, editingDoc]);

  // Effet pour initialiser le type sélectionné depuis les props
  useEffect(() => {
    if (selectedTypeId && !editingDoc) {
      setDocumentType_id(selectedTypeId);
    }
  }, [selectedTypeId, editingDoc]);

  // Effet pour charger les méta-données quand le type change
  useEffect(() => {
    if (documentType_id) {
      getMetaById(String(documentType_id)).then((res) => {
        console.log("🔍 Données brutes de l'API:", res);

        // ✅ Convertir les données pour qu'elles correspondent à l'interface MetaField
        const formattedFields: MetaField[] = res.map((field: any) => ({
          id: field.id,
          label: field.label,
          name: field.name,
          type: field.field_type, // 🔥 Convertir field_type en type
          required: field.required,
          options: field.options || [], // ✅ Les options sont bien conservées
          type_document_id: field.type_document_id,
          createdAt: field.createdAt,
        }));

        console.log("📋 Champs formatés:", formattedFields);
        setMetaFields(formattedFields);

        if (!editingDoc) {
          setValues({});
        }
      });
    } else {
      setMetaFields([]);
      setValues({});
    }
  }, [documentType_id, editingDoc]);

  // Fonction pour rendre le champ approprié selon le type
  const renderField = (field: MetaField) => {
    const value = values[field.id] || "";
    const fieldType = field.type;

    switch (fieldType) {
      case "select":
        // 🔥 Champ select avec Dropdown
        const options = field.options || [];

        if (options.length === 0) {
          return (
            <div className="text-amber-600 text-sm p-3 bg-amber-50 rounded-xl border border-amber-200">
              ⚠️ Aucune option configurée pour ce champ
            </div>
          );
        }

        const selectOptions = options.map((opt) => ({
          label: opt,
          value: opt,
        }));

        return (
          <Dropdown
            value={value || null}
            options={selectOptions}
            onChange={(e) => {
              setValues({
                ...values,
                [field.id]: e.value,
              });
            }}
            placeholder={`Sélectionnez ${field.label.toLowerCase()}`}
            className="w-full bg-white border border-emerald-100 rounded-xl shadow-sm"
            panelClassName="rounded-xl"
            showClear
            filter={options.length > 5}
          />
        );

      case "date":
        return (
          <Calendar
            value={value ? new Date(value) : null}
            onChange={(e) => {
              setValues({
                ...values,
                [field.id]: e.value ? e.value.toISOString().split("T")[0] : "",
              });
            }}
            dateFormat="dd/mm/yy"
            className="w-full"
            inputClassName="w-full bg-white border border-emerald-100 p-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            placeholder="Sélectionner une date"
            showIcon
          />
        );

      case "number":
        return (
          <InputNumber
            value={value ? Number(value) : null}
            onValueChange={(e) => {
              setValues({
                ...values,
                [field.id]: e.value,
              });
            }}
            className="w-full"
            inputClassName="w-full bg-white border border-emerald-100 p-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            placeholder={`Saisir ${field.label.toLowerCase()}`}
            useGrouping={false}
          />
        );

      case "file":
        return (
          <input
            type="file"
            className="w-full bg-white border border-emerald-100 p-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm text-emerald-950"
            onChange={(e) =>
              setValues({
                ...values,
                [field.id]: e.target.files?.[0],
              })
            }
            accept=".pdf,.jpg,.jpeg,.png"
          />
        );

      case "text":
      default:
        return (
          <InputText
            type="text"
            value={value}
            onChange={(e) =>
              setValues({
                ...values,
                [field.id]: e.target.value,
              })
            }
            className="w-full bg-white border border-emerald-100 p-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            placeholder={`Entrez ${field.label.toLowerCase()}...`}
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
      // ✅ Construire le payload avec le bon format (objet, pas tableau)
      const valuesObject: Record<string, string> = {};

      // Parcourir tous les metaFields pour créer l'objet
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
      refresh();
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.message || "Impossible d’enregistrer le document",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3 text-emerald-950">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Plus size={18} />
            </div>
            <span className="font-black tracking-tight">
              {editingDoc ? "Modifier l'archive" : "Nouvelle Archive"}
            </span>
          </div>
        }
        visible={visible}
        style={{ width: "600px" }}
        onHide={onHide}
        footer={
          <div className="flex justify-end gap-3 p-4 bg-emerald-50/30">
            <Button
              label="Annuler"
              onClick={onHide}
              className="p-button-text text-emerald-600 font-bold"
            />
            <Button
              label={editingDoc ? "Modifier" : "Enregistrer"}
              icon={<Save size={18} className="mr-2" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
              onClick={handleSubmit}
            />
          </div>
        }
      >
        <div className="space-y-6 pt-4">
          <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 block">
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

          {metaFields.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest ml-1">
                Champs requis
              </p>
              <div className="grid grid-cols-1 gap-4">
                {metaFields.map((f: MetaField) => (
                  <div key={f.id} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-emerald-900 ml-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>{" "}
                      {f.label}{" "}
                      {f.required && <span className="text-red-500">*</span>}
                      {f.type === "select" &&
                        f.options &&
                        f.options.length > 0 && (
                          <span className="text-[10px] text-emerald-500 ml-1">
                            ({f.options.length} options)
                          </span>
                        )}
                    </label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
