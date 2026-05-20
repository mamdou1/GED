import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Plus, FileText } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { useEntityMetaFields } from "../../hooks/useMetaFieldOverrides";
import api from "../../api/axios";

interface DocumentPayload {
  type_document_id: number | null;
  values: Record<string, string>;
  piece_values?: Record<string, any>;
  entities?: any[];
  defaultEntityType?: string;
  id?: number;
}

// Configuration des types d'entités
const ENTITY_TYPE_MAP: Record<string, string> = {
  entiteeun: "entitee_un",
  entiteedoux: "entitee_deux",
  entiteetrois: "entitee_trois",
  entitee_un: "entitee_un",
  entitee_deux: "entitee_deux",
  entitee_trois: "entitee_trois",
  EntiteeUn: "entitee_un",
  EntiteeDeux: "entitee_deux",
  EntiteeTrois: "entitee_trois",
  un: "entitee_un",
  deux: "entitee_deux",
  trois: "entitee_trois",
};

const normalizeEntityType = (type: string): string => {
  const mapping: Record<string, string> = {
    entiteeun: "entitee_un",
    entiteedoux: "entitee_deux",
    entiteetrois: "entitee_trois",
    entitee_un: "entitee_un",
    entitee_deux: "entitee_deux",
    entitee_trois: "entitee_trois",
    EntiteeUn: "entitee_un",
    EntiteeDeux: "entitee_deux",
    EntiteeTrois: "entitee_trois",
    un: "entitee_un",
    deux: "entitee_deux",
    trois: "entitee_trois",
  };
  return mapping[type?.toLowerCase()] || "entitee_un";
};

const mapEntityType = (type: string): string => {
  const mapping: Record<string, string> = {
    entiteeUn: "entitee_un",
    entiteeDeux: "entitee_deux",
    entiteeTrois: "entitee_trois",
    EntiteeUn: "entitee_un",
    EntiteeDeux: "entitee_deux",
    EntiteeTrois: "entitee_trois",
    entitee_un: "entitee_un",
    entitee_deux: "entitee_deux",
    entitee_trois: "entitee_trois",
    un: "entitee_un",
    deux: "entitee_deux",
    trois: "entitee_trois",
  };
  return mapping[type] || "entitee_un";
};

// ✅ Fonction pour normaliser la valeur required (peut être boolean, 0/1, "0"/"1")
const normalizeRequired = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1" || value === "true";
  return false;
};

export default function DocumentForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  documentType,
  selectedTypeId,
  editingDoc,
  entitee_un = [],
  entitee_deux = [],
  entitee_trois = [],
  defaultEntityType,
  preselectedEntity,
}: any) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const toast = useRef<Toast>(null);

  const isEntityPreselected =
    preselectedEntity?.entity_id && preselectedEntity?.entity_id > 0;
  const effectiveEntityType = isEntityPreselected
    ? ENTITY_TYPE_MAP[preselectedEntity.entity_type?.toLowerCase()] ||
      preselectedEntity.entity_type
    : defaultEntityType;
  const effectiveEntityId = isEntityPreselected
    ? preselectedEntity.entity_id
    : null;

  const {
    data: fieldsData,
    isLoading: fieldsLoading,
    refetch: refetchFields,
  } = useEntityMetaFields(
    documentType_id || 0,
    effectiveEntityType || "",
    effectiveEntityId || 0,
  );

  // ✅ Normaliser les champs (convertir required en boolean)
  const normalizedFields = (fieldsData || []).map((field: any) => ({
    ...field,
    required: normalizeRequired(field.required),
    hidden: field.hidden === true || field.hidden === 1 || field.hidden === "1",
  }));

  useEffect(() => {
    if (
      visible &&
      documentType_id &&
      effectiveEntityType &&
      effectiveEntityId
    ) {
      refetchFields();
    }
  }, [
    visible,
    documentType_id,
    effectiveEntityType,
    effectiveEntityId,
    refetchFields,
  ]);

  useEffect(() => {
    if (visible && normalizedFields && normalizedFields.length > 0) {
      console.log(`✅ ${normalizedFields.length} champs chargés`);
      console.log(
        "📋 Détail des champs REQUIRED:",
        normalizedFields.map((f: any) => ({
          label: f.label,
          required: f.required,
        })),
      );
    }
  }, [normalizedFields, visible]);

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
      return;
    }

    setValues({});
  }, [visible, editingDoc]);

  useEffect(() => {
    if (selectedTypeId && !editingDoc && !documentType_id) {
      setDocumentType_id(selectedTypeId);
    }
  }, [selectedTypeId, editingDoc, documentType_id]);

  const renderField = (field: any) => {
    const value = values[field.id] || "";
    if (field.hidden) return null;

    switch (field.field_type) {
      case "TEXT":
      case "TEXTAREA":
        return (
          <textarea
            value={value}
            onChange={(e) =>
              setValues({ ...values, [field.id]: e.target.value })
            }
            placeholder={
              field.placeholder || `Entrez ${field.label.toLowerCase()}...`
            }
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            rows={field.field_type === "TEXTAREA" ? 4 : 2}
          />
        );
      case "NUMBER":
        return (
          <InputNumber
            value={value !== "" ? Number(value) : null}
            onValueChange={(e) => {
              setValues({
                ...values,
                [field.id]: e.value !== null ? e.value : "",
              });
            }}
            placeholder={
              field.placeholder || `Entrez ${field.label.toLowerCase()}...`
            }
            className="w-full"
            inputClassName="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
      case "DATE":
        return (
          <Calendar
            value={value ? new Date(value) : null}
            onChange={(e) => {
              const dateValue = e.value
                ? e.value.toISOString().split("T")[0]
                : "";
              setValues({ ...values, [field.id]: dateValue });
            }}
            dateFormat="dd/mm/yy"
            className="w-full"
            inputClassName="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            placeholder="Sélectionner une date"
            showIcon
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center gap-3">
            <InputSwitch
              checked={value === "true" || value === true}
              onChange={(e) => {
                setValues({
                  ...values,
                  [field.id]: e.value ? "true" : "false",
                });
              }}
            />
            <span className="text-sm text-slate-600">{field.label}</span>
          </div>
        );
      case "SELECT":
        const options = Array.isArray(field.options) ? field.options : [];
        return (
          <select
            value={value}
            onChange={(e) =>
              setValues({ ...values, [field.id]: e.target.value })
            }
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          >
            <option value="">Sélectionnez...</option>
            {options.map((opt: any, idx: number) => (
              <option
                key={idx}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        );
      case "FILE":
        return (
          <input
            type="file"
            onChange={(e) =>
              setValues({ ...values, [field.id]: e.target.files?.[0] })
            }
            className="w-full bg-white border border-emerald-100 p-2 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
      default:
        return (
          <InputText
            value={value}
            onChange={(e) =>
              setValues({ ...values, [field.id]: e.target.value })
            }
            placeholder={
              field.placeholder || `Entrez ${field.label.toLowerCase()}...`
            }
            className="w-full bg-white border border-emerald-100 p-3 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        );
    }
  };

  const handleSubmit = async () => {
    if (!documentType_id) {
      toast.current?.show({
        severity: "warn",
        summary: "Type manquant",
        detail: "Veuillez sélectionner un type de document",
      });
      return;
    }

    if (!effectiveEntityType || !effectiveEntityId) {
      toast.current?.show({
        severity: "warn",
        summary: "Entité manquante",
        detail: "Veuillez sélectionner une entité",
      });
      return;
    }

    // ✅ Utiliser normalizedFields pour la validation
    const visibleRequiredFields = normalizedFields.filter(
      (f: any) => f.required === true && f.hidden !== true,
    );
    const missing = visibleRequiredFields.filter((f: any) => {
      const val = values[f.id];
      return val === undefined || val === null || val === "";
    });

    if (missing.length > 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Champs manquants",
        detail: `Veuillez remplir: ${missing.map((f: any) => f.label).join(", ")}`,
      });
      return;
    }

    try {
      const valuesObject: Record<string, string> = {};

      for (const field of normalizedFields) {
        const fieldValue = values[field.id];

        if (
          fieldValue !== undefined &&
          fieldValue !== null &&
          fieldValue !== ""
        ) {
          if (fieldValue instanceof File) {
            continue;
          }
          valuesObject[field.id] = String(fieldValue);
        }
      }

      const payload: DocumentPayload = {
        type_document_id: documentType_id,
        values: valuesObject,
        entities: [
          {
            entity_type: mapEntityType(effectiveEntityType),
            entity_id: Number(effectiveEntityId),
          },
        ],
      };

      if (editingDoc?.id) {
        payload.id = editingDoc.id;
      }

      console.log("📦 Payload envoyé:", JSON.stringify(payload, null, 2));

      const result = await onSubmit(payload);

      // Upload des fichiers
      const fileUploads = [];
      for (const [fieldId, value] of Object.entries(values)) {
        if (value instanceof File) {
          const docId = editingDoc?.id || result?.id;
          if (docId) {
            const formData = new FormData();
            formData.append("file", value);
            formData.append("meta_field_id", fieldId);
            fileUploads.push(
              api.post(`/documents/${docId}/files`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              }),
            );
          }
        }
      }

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
        detail:
          error.response?.data?.message ||
          "Impossible d'enregistrer le document",
      });
    }
  };

  // ✅ Utiliser normalizedFields pour l'affichage
  const visibleFields = normalizedFields.filter((f: any) => !f.hidden);
  const customFieldsCount = visibleFields.filter(
    (f: any) => f.source === "custom",
  ).length;

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
              {editingDoc ? "Modifier le document" : "Nouveau document"}
            </span>
            {isEntityPreselected && (
              <span className="text-xs text-emerald-600 font-medium ml-4 bg-emerald-50 px-3 py-1.5 rounded-full">
                {preselectedEntity?.entity_label}
              </span>
            )}
          </div>
        }
        visible={visible}
        style={{ width: "650px", maxWidth: "90vw" }}
        onHide={onHide}
        className="rounded-3xl overflow-hidden"
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
              onClick={handleSubmit}
              disabled={fieldsLoading}
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
              onChange={(e) => {
                console.log("📌 Changement de type:", e.value);
                setDocumentType_id(e.value);
                setValues({});
              }}
              optionLabel="nom"
              optionValue="id"
              placeholder="Sélectionner..."
              className="w-full bg-white border-emerald-100 rounded-xl shadow-sm"
              filter
              disabled={!!editingDoc}
            />
          </div>

          {/* Champs du formulaire */}
          {fieldsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-sm text-slate-400 mt-2">
                Chargement des champs...
              </p>
            </div>
          ) : visibleFields.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Champs du document
                </div>
                {customFieldsCount > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">
                    {customFieldsCount} personnalisé
                    {customFieldsCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5">
                {visibleFields.map((field: any) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-emerald-900 ml-1 flex items-center gap-2">
                      {field.label}
                      {field.required === true && (
                        <span className="text-red-500 text-sm font-bold ml-0.5">
                          *
                        </span>
                      )}
                      {field.source === "custom" && (
                        <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                          Personnalisé
                        </span>
                      )}
                    </label>
                    {renderField(field)}
                    {field.description && (
                      <p className="text-xs text-slate-400 ml-1">
                        {field.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : documentType_id ? (
            <div className="text-center py-12 bg-emerald-50/20 rounded-xl border border-dashed border-emerald-200">
              <FileText size={48} className="mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-600 text-sm font-medium">
                Aucun champ configuré pour ce type de document
              </p>
            </div>
          ) : (
            <div className="text-center py-12 bg-emerald-50/20 rounded-xl border border-dashed border-emerald-200">
              <FileText size={48} className="mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-600 text-sm font-medium">
                Sélectionnez d'abord un type de document
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
