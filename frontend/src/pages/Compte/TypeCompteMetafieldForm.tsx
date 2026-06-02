// src/pages/Compte/TypeCompteMetafieldForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { Pencil, Plus, Save, Settings2, Trash2, X } from "lucide-react";
import {
  useCreateTypeCompteMetaField,
  useDeleteTypeCompteMetaField,
  useTypeCompteMetaFields,
  useUpdateTypeCompteMetaField,
} from "../../hooks/useTypeCompteMetafield";
import {
  TypeCompte,
  TypeCompteMetaField,
  TypeCompteMetaFieldCreatePayload,
} from "../../interfaces";

interface Props {
  visible: boolean;
  onHide: () => void;
  typeCompte: TypeCompte | null;
  onChanged?: () => void;
}

const fieldTypeOptions = [
  { label: "Texte", value: "TEXT" },
  { label: "Zone de texte", value: "TEXTAREA" },
  { label: "Nombre", value: "NUMBER" },
  { label: "Date", value: "DATE" },
  { label: "Oui / Non", value: "BOOLEAN" },
  { label: "Liste", value: "SELECT" },
];

const emptyForm: TypeCompteMetaFieldCreatePayload = {
  name: "",
  label: "",
  field_type: "TEXT",
  required: false,
  options: null,
  position: null,
};

export default function TypeCompteMetafieldForm({
  visible,
  onHide,
  typeCompte,
  onChanged,
}: Props) {
  const toast = useRef<Toast>(null);
  const typeId = typeCompte?.id;
  const { data, isLoading, refetch } = useTypeCompteMetaFields(typeId);
  const createMutation = useCreateTypeCompteMetaField();
  const updateMutation = useUpdateTypeCompteMetaField();
  const deleteMutation = useDeleteTypeCompteMetaField();

  const [editingField, setEditingField] = useState<TypeCompteMetaField | null>(
    null,
  );
  const [form, setForm] = useState<TypeCompteMetaFieldCreatePayload>(emptyForm);
  // État local pour stocker la saisie brute des options au format texte sans casser le render
  const [rawOptionsText, setRawOptionsText] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fields = data?.data || [];
  const isMutating = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!visible) return;
    setEditingField(null);
    setForm(emptyForm);
    setRawOptionsText("");
  }, [visible, typeId]);

  const buildNameFromLabel = (label: string) =>
    label
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const parseOptions = (rawOptions: any) => {
    if (form.field_type !== "SELECT") return null;
    if (Array.isArray(rawOptions)) return rawOptions;

    return String(rawOptions || "")
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);
  };

  const handleEdit = (field: TypeCompteMetaField) => {
    setEditingField(field);

    // Formater proprement les options existantes pour le textarea d'édition
    let optionsText = "";
    if (Array.isArray(field.options)) {
      optionsText = field.options
        .map((opt: any) => (typeof opt === "object" ? opt.value : opt))
        .join("\n");
    } else if (typeof field.options === "string") {
      optionsText = field.options;
    }

    setRawOptionsText(optionsText);
    setForm({
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      required:
        field.required === true ||
        field.required === 1 ||
        field.required === "1" ||
        field.required === "true",
      options: field.options || null,
      position: field.position || null,
    });
  };

  const handleSubmit = async () => {
    if (!typeId) return;
    if (!form.label.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Le libellé est obligatoire",
      });
      return;
    }

    const payload = {
      ...form,
      name: form.name?.trim() || buildNameFromLabel(form.label),
      label: form.label.trim(),
      options: parseOptions(
        form.field_type === "SELECT" ? rawOptionsText : null,
      ),
      position: form.position ? Number(form.position) : null,
    };

    try {
      if (editingField) {
        await updateMutation.mutateAsync({
          id: editingField.id,
          typeId,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync({ typeId, data: payload });
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Métadonnée enregistrée avec succès",
      });
      setEditingField(null);
      setForm(emptyForm);
      setRawOptionsText("");
      await refetch();
      onChanged?.();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || error.message,
      });
    }
  };

  const handleDelete = async (field: TypeCompteMetaField) => {
    if (!typeId) return;
    setDeletingId(field.id);

    try {
      await deleteMutation.mutateAsync({ id: field.id, typeId });
      toast.current?.show({
        severity: "success",
        summary: "Supprimé",
        detail: "Métadonnée supprimée",
      });
      await refetch();
      onChanged?.();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.response?.data?.message || error.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Settings2 size={18} className="text-emerald-600" />
            </div>
            <span>Métadonnées — {typeCompte?.nom || "Type de compte"}</span>
          </div>
        }
        visible={visible}
        style={{ width: "800px", maxWidth: "94vw" }}
        onHide={onHide}
        draggable={false}
        className="rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6 pt-2">
          {/* Section de gauche : Liste des champs configurés */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Champs configurés
            </h3>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 p-4">
                <i className="pi pi-spin pi-spinner text-emerald-600"></i>
                Chargement des champs...
              </div>
            ) : fields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Aucun champ configuré pour ce type de compte.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                      editingField?.id === field.id
                        ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        {field.label}
                        {field.required && (
                          <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                            Requis
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        <code className="bg-slate-50 px-1 rounded text-slate-600">
                          {field.name}
                        </code>{" "}
                        ·{" "}
                        {fieldTypeOptions.find(
                          (t) => t.value === field.field_type,
                        )?.label || field.field_type}{" "}
                        {field.position !== null && ` · Pos. ${field.position}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isMutating || deletingId !== null}
                        onClick={() => handleEdit(field)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={isMutating || deletingId !== null}
                        onClick={() => handleDelete(field)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                        title="Supprimer"
                      >
                        {deletingId === field.id ? (
                          <i
                            className="pi pi-spin pi-spinner text-red-600 text-sm"
                            style={{ width: 16, height: 16 }}
                          ></i>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section de droite : Formulaire */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4 h-fit">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200/60 pb-2">
              {editingField ? "Modifier le champ" : "Nouveau champ"}
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Libellé <span className="text-red-500">*</span>
              </label>
              <InputText
                disabled={isMutating}
                value={form.label}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  // On ne force le name technique que si l'utilisateur ne l'a pas déjà personnalisé manuellement
                  const shouldUpdateName =
                    !form.name || form.name === buildNameFromLabel(form.label);
                  setForm({
                    ...form,
                    label: newLabel,
                    name: shouldUpdateName
                      ? buildNameFromLabel(newLabel)
                      : form.name,
                  });
                }}
                placeholder="Ex: Numéro de Siret"
                className="w-full p-inputtext-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nom technique
              </label>
              <InputText
                disabled={isMutating}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: numero_de_siret"
                className="w-full p-inputtext-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Type de composant
              </label>
              <Dropdown
                disabled={isMutating}
                value={form.field_type}
                options={fieldTypeOptions}
                onChange={(e) => setForm({ ...form, field_type: e.value })}
                className="w-full p-inputtext-sm"
              />
            </div>

            {form.field_type === "SELECT" && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Options de la liste</span>
                  <span className="text-slate-400 font-normal lowercase">
                    (une par ligne)
                  </span>
                </label>
                <textarea
                  disabled={isMutating}
                  value={rawOptionsText}
                  onChange={(e) => setRawOptionsText(e.target.value)}
                  placeholder="Option A&#10;Option B&#10;Option C"
                  className="w-full min-h-[92px] rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            )}

            <div className="flex items-center justify-between bg-white border border-slate-200/60 rounded-xl p-2.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Rendre ce champ obligatoire
              </span>
              <InputSwitch
                disabled={isMutating}
                checked={!!form.required}
                onChange={(e) => setForm({ ...form, required: e.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ordre d'affichage (Position)
              </label>
              <InputText
                disabled={isMutating}
                type="number"
                min="0"
                value={form.position ? String(form.position) : ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    position: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="Ex: 1"
                className="w-full p-inputtext-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
              {editingField && (
                <Button
                  type="button"
                  disabled={isMutating}
                  label="Annuler"
                  icon="pi pi-times"
                  onClick={() => {
                    setEditingField(null);
                    setForm(emptyForm);
                    setRawOptionsText("");
                  }}
                  className="p-button-text p-button-sm text-slate-600"
                />
              )}
              <Button
                type="button"
                loading={isMutating}
                label={editingField ? "Enregistrer" : "Ajouter"}
                icon={editingField ? "pi pi-check" : "pi pi-plus"}
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 border-none text-sm px-4 py-2"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
