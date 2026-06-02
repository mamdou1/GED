// src/pages/Compte/CompteForm.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Building2, CreditCard, Plus, Save, Settings2, Users, X } from "lucide-react";
import { useCreateCompte, useUpdateCompte } from "../../hooks/useComptes";
import { useTypeComptes } from "../../hooks/useTypeComptes";
import { useTypeCompteMetaFields } from "../../hooks/useTypeCompteMetafield";
import { useClients } from "../../hooks/useClients";
import {
  Client,
  Compte,
  TypeCompteMetaField,
} from "../../interfaces";
import TypeCompteForm from "./TypeCompteForm";
import TypeCompteMetafieldForm from "./TypeCompteMetafieldForm";

interface CompteFormProps {
  visible: boolean;
  onHide: () => void;
  compte?: Compte | null;
  preselectedClient?: Client | null;
  onSuccess: () => void;
}

const isRequired = (value: any) =>
  value === true || value === 1 || value === "1" || value === "true";

const normalizeFieldType = (fieldType?: string) =>
  (fieldType || "TEXT").toUpperCase();

export default function CompteForm({
  visible,
  onHide,
  compte,
  preselectedClient,
  onSuccess,
}: CompteFormProps) {
  const toast = useRef<Toast>(null);
  const createMutation = useCreateCompte();
  const updateMutation = useUpdateCompte();
  const { data: typesData, refetch: refetchTypes } = useTypeComptes();
  const { data: clientsData } = useClients();

  const [formData, setFormData] = useState({
    type_compte_id: null as number | null,
    client_id: null as number | null,
  });
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [typeCompteVisible, setTypeCompteVisible] = useState(false);
  const [metaFieldVisible, setMetaFieldVisible] = useState(false);

  const { data: metaFieldsData, isLoading: fieldsLoading } =
    useTypeCompteMetaFields(formData.type_compte_id || undefined);

  const types = typesData?.data || [];
  const clients = clientsData?.data || [];
  const metaFields = useMemo(() => {
    const fields =
      metaFieldsData?.data ||
      types.find((t: any) => t.id === formData.type_compte_id)?.metaFields ||
      [];

    return [...fields].sort(
      (a: TypeCompteMetaField, b: TypeCompteMetaField) =>
        (a.position || 0) - (b.position || 0),
    );
  }, [formData.type_compte_id, metaFieldsData?.data, types]);

  const selectedTypeCompte =
    types.find((type: any) => type.id === formData.type_compte_id) || null;

  useEffect(() => {
    if (compte) {
      const initialValues: Record<string, any> = {};
      compte.values?.forEach((value) => {
        initialValues[String(value.meta_field_id)] = value.value || "";
      });

      setFormData({
        type_compte_id: compte.type_compte_id || null,
        client_id: compte.client_id || null,
      });
      setValues(initialValues);
      return;
    }

    setFormData({
      type_compte_id: null,
      client_id: preselectedClient?.id || null,
    });
    setValues({});
  }, [compte, preselectedClient, visible]);

  useEffect(() => {
    if (!formData.type_compte_id) {
      setValues({});
      return;
    }

    setValues((current) => {
      const allowedIds = new Set(metaFields.map((field) => String(field.id)));
      return Object.fromEntries(
        Object.entries(current).filter(([key]) => allowedIds.has(key)),
      );
    });
  }, [formData.type_compte_id, metaFields]);

  const typeOptions = types.map((type: any) => ({
    label: type.nom,
    value: type.id,
  }));

  const getClientDisplayName = (client: any): string => {
    if (!client) return "";
    if (client.raison_sociale) return client.raison_sociale;
    return `${client.prenom || ""} ${client.nom || ""}`.trim();
  };

  const clientOptions = clients.map((client: any) => ({
    label: getClientDisplayName(client),
    value: client.id,
  }));

  const setFieldValue = (fieldId: number, value: any) => {
    setValues((current) => ({ ...current, [fieldId]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.type_compte_id) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Le type de compte est obligatoire",
      });
      return false;
    }

    if (!formData.client_id) {
      toast.current?.show({
        severity: "warn",
        summary: "Champ requis",
        detail: "Le client est obligatoire",
      });
      return false;
    }

    const missingField = metaFields.find(
      (field) => isRequired(field.required) && !values[String(field.id)],
    );

    if (missingField) {
      toast.current?.show({
        severity: "warn",
        summary: "Metadonnee requise",
        detail: `${missingField.label} est obligatoire`,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        type_compte_id: formData.type_compte_id!,
        client_id: formData.client_id!,
        values,
      };

      if (compte) {
        await updateMutation.mutateAsync({ id: compte.id, data: payload });
        toast.current?.show({
          severity: "success",
          summary: "Succes",
          detail: "Compte modifie avec succes",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succes",
          detail: "Compte cree avec succes",
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

  const renderField = (field: TypeCompteMetaField) => {
    const value = values[String(field.id)] || "";
    const fieldType = normalizeFieldType(field.field_type);
    const commonClass =
      "w-full bg-slate-50 border border-slate-200 rounded-xl";

    if (fieldType === "SELECT") {
      const options = Array.isArray(field.options) ? field.options : [];
      return (
        <Dropdown
          value={value || null}
          options={options.map((option: any) =>
            typeof option === "object"
              ? option
              : { label: String(option), value: String(option) },
          )}
          onChange={(e) => setFieldValue(field.id, e.value)}
          placeholder={`Selectionner ${field.label}`}
          className={commonClass}
          showClear
        />
      );
    }

    if (fieldType === "TEXTAREA") {
      return (
        <textarea
          value={value}
          onChange={(e) => setFieldValue(field.id, e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          rows={3}
        />
      );
    }

    if (fieldType === "BOOLEAN") {
      return (
        <Dropdown
          value={value || null}
          options={[
            { label: "Oui", value: "true" },
            { label: "Non", value: "false" },
          ]}
          onChange={(e) => setFieldValue(field.id, e.value)}
          placeholder="Selectionner"
          className={commonClass}
          showClear
        />
      );
    }

    return (
      <InputText
        type={
          fieldType === "NUMBER" ? "number" : fieldType === "DATE" ? "date" : "text"
        }
        value={value}
        onChange={(e) => setFieldValue(field.id, e.target.value)}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
      />
    );
  };

  const labelClass =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CreditCard size={18} className="text-emerald-600" />
            </div>
            <span>{compte ? "Modifier le compte" : "Nouveau compte"}</span>
          </div>
        }
        visible={visible}
        style={{ width: "700px", maxWidth: "92vw" }}
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
          <div className="space-y-2">
            <label className={labelClass}>
              <Building2 size={14} className="text-emerald-500" /> Type de
              compte *
            </label>
            <div className="flex gap-4">
              <Dropdown
                value={formData.type_compte_id}
                options={typeOptions}
                onChange={(e) =>
                  setFormData({ ...formData, type_compte_id: e.value })
                }
                placeholder="Selectionner un type"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl"
                showClear
                filter
              />
              <Button
                type="button"
                title="Creer un type de compte"
                onClick={() => setTypeCompteVisible(true)}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-full text-white w-12 h-12 flex items-center justify-center"
              >
                <Plus size={18} />
              </Button>
              <Button
                type="button"
                title="Gerer les metadonnees"
                onClick={() => setMetaFieldVisible(true)}
                disabled={!formData.type_compte_id}
                className="bg-slate-700 hover:bg-slate-800 rounded-full text-white w-12 h-12 flex items-center justify-center disabled:opacity-40"
              >
                <Settings2 size={18} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              <Users size={14} className="text-emerald-500" /> Client *
            </label>
            <Dropdown
              value={formData.client_id}
              options={clientOptions}
              onChange={(e) => setFormData({ ...formData, client_id: e.value })}
              placeholder="Selectionner un client"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl"
              showClear
              filter
              disabled={!!preselectedClient}
            />
          </div>

          {formData.type_compte_id && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Metadonnees du compte
                </h3>
                {fieldsLoading && (
                  <span className="text-xs text-slate-400">Chargement...</span>
                )}
              </div>

              {metaFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Aucun champ de metadonnees n'est configure pour ce type de
                  compte.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metaFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className={labelClass}>
                        {field.label}
                        {isRequired(field.required) && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>

      <TypeCompteForm
        visible={typeCompteVisible}
        onHide={() => setTypeCompteVisible(false)}
        refresh={refetchTypes}
      />

      <TypeCompteMetafieldForm
        visible={metaFieldVisible}
        onHide={() => setMetaFieldVisible(false)}
        typeCompte={selectedTypeCompte}
        onChanged={() => {
          refetchTypes();
        }}
      />
    </>
  );
}
