import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import {
  Save,
  Plus,
  Settings,
  Trash2,
  Pencil,
  Hash,
  List,
  X,
  PlusCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { deleteMetaField } from "../../api/metaField";
import { Chips } from "primereact/chips";

interface MetaField {
  id: number | string | null;
  label: string;
  type: string;
  required: boolean;
  options?: string[]; // Pour les champs de type select
}

interface DocumentTypeMetaFormProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (fields: any[]) => void;
  type: any;
}

export default function DocumentTypeMetaForm({
  visible,
  onHide,
  onSubmit,
  type,
}: DocumentTypeMetaFormProps) {
  const empty: MetaField = {
    id: null,
    label: "",
    type: "text",
    required: false,
    options: [],
  };

  const [data, setData] = useState<MetaField>(empty);
  const [fields, setFields] = useState<MetaField[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [tempOption, setTempOption] = useState<string>("");
  const toast = useRef<Toast>(null);

  const typesOptions = [
    { label: "Texte", value: "text" },
    { label: "Nombre", value: "number" },
    { label: "Date", value: "date" },
    { label: "Fichier", value: "file" },
    { label: "Liste déroulante", value: "select" },
  ];

  useEffect(() => {
    if (visible && type?.metaFields) {
      const existingFields = type.metaFields.map((f: any) => ({
        id: f.id,
        label: f.label,
        type: f.field_type || "text",
        required: f.required,
        options: f.options || [],
      }));
      setFields(existingFields);
    } else {
      setFields([]);
    }
    setData(empty);
    setIsEditingMode(false);
  }, [visible, type]);

  const handleAddOption = () => {
    if (!tempOption.trim()) return;

    setData({
      ...data,
      options: [...(data.options || []), tempOption.trim()],
    });
    setTempOption("");
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(data.options || [])];
    newOptions.splice(index, 1);
    setData({ ...data, options: newOptions });
  };

  const handleAddOrUpdateField = () => {
    if (!data.label) return;

    // Validation pour le type select
    if (
      data.type === "select" &&
      (!data.options || data.options.length === 0)
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Veuillez ajouter au moins une option pour la liste déroulante",
        life: 3000,
      });
      return;
    }

    if (isEditingMode) {
      setFields(
        fields.map((f) => (f.id === data.id && data.id !== null ? data : f)),
      );
      setIsEditingMode(false);
    } else {
      setFields([...fields, { ...data, id: "temp-" + Date.now() }]);
    }
    setData(empty);
    setTempOption("");
  };

  const editField = (field: MetaField) => {
    setData({ ...field, options: field.options || [] });
    setIsEditingMode(true);
  };

  const removeField = async (id: any) => {
    if (id && !String(id).startsWith("temp-")) {
      confirmDialog({
        message: "Voulez-vous vraiment supprimer ce champ ?",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          try {
            await deleteMetaField(id);
            setFields(fields.filter((f) => f.id !== id));
            toast.current?.show({
              severity: "success",
              summary: "Champ supprimé",
            });
          } catch (e) {
            console.error(e);
          }
        },
      });
    } else {
      setFields(fields.filter((f) => f.id !== id));
    }
  };

  const saveAll = () => {
    const payload = fields.map((f) => ({
      id: String(f.id).startsWith("temp-") ? undefined : f.id,
      label: f.label,
      name: f.label,
      field_type: f.type,
      required: f.required,
      options: f.type === "select" ? f.options : undefined, // Envoyer les options uniquement pour select
    }));
    onSubmit(payload);
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Champs Personnalisés
              </h3>
              <p className="text-xs text-slate-400 font-medium italic">
                {type?.nom}
              </p>
            </div>
          </div>
        }
        visible={visible}
        style={{ width: 800 }}
        onHide={onHide}
        className="rounded-[2rem] overflow-hidden"
        footer={
          <div className="flex justify-end gap-3 p-4 bg-slate-50/50">
            <Button
              label="Fermer"
              onClick={onHide}
              className="p-button-text text-slate-500 font-bold"
            />
            <Button
              label="Enregistrer la structure"
              icon={<Save size={18} className="mr-2" />}
              onClick={saveAll}
              className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all border-none"
            />
          </div>
        }
      >
        <div className="space-y-8 pt-4">
          <div
            className={`p-6 rounded-3xl border-2 transition-all ${
              isEditingMode
                ? "bg-amber-50/50 border-amber-200"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              {isEditingMode
                ? "Modification du champ"
                : "Nouveau champ de donnée"}
              {isEditingMode && (
                <button
                  onClick={() => {
                    setData(empty);
                    setIsEditingMode(false);
                    setTempOption("");
                  }}
                  className="text-amber-600 hover:underline text-xs"
                >
                  Annuler
                </button>
              )}
            </h4>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7">
                <InputText
                  placeholder="Libellé du champ"
                  className="w-full p-3.5 border-slate-200 rounded-xl shadow-sm focus:border-emerald-500"
                  value={data.label}
                  onChange={(e) => setData({ ...data, label: e.target.value })}
                />
              </div>
              <div className="col-span-5">
                <Dropdown
                  options={typesOptions}
                  value={data.type}
                  onChange={(e) =>
                    setData({
                      ...data,
                      type: e.value,
                      options: e.value === "select" ? [] : undefined,
                    })
                  }
                  className="w-full border-slate-200 rounded-xl shadow-sm"
                />
              </div>

              {/* Section pour les options du select */}
              {data.type === "select" && (
                <div className="col-span-12 mt-4">
                  <label className="text-xs font-bold text-slate-500 mb-2 block">
                    Options de la liste déroulante
                  </label>
                  <div className="flex gap-2 mb-3">
                    <InputText
                      placeholder="Ajouter une option (ex: Option 1)"
                      className="flex-1 p-3 border-slate-200 rounded-xl"
                      value={tempOption}
                      onChange={(e) => setTempOption(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddOption();
                        }
                      }}
                    />
                    <Button
                      icon={<PlusCircle size={18} />}
                      onClick={handleAddOption}
                      className="bg-emerald-600 text-white px-4 rounded-xl hover:bg-emerald-700"
                      tooltip="Ajouter une option"
                    />
                  </div>

                  {/* Liste des options */}
                  {data.options && data.options.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                      <div className="flex flex-wrap gap-2">
                        {data.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm"
                          >
                            <span className="text-slate-700">{option}</span>
                            <button
                              onClick={() => handleRemoveOption(index)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!data.options || data.options.length === 0) && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Veuillez ajouter au moins une option
                    </p>
                  )}
                </div>
              )}

              <div className="col-span-12 flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Obligatoire
                  </span>
                  <InputSwitch
                    checked={data.required}
                    onChange={(e) => setData({ ...data, required: e.value })}
                  />
                </div>
                <Button
                  label={isEditingMode ? "Mettre à jour" : "Ajouter au modèle"}
                  icon={isEditingMode ? <Save size={18} /> : <Plus size={18} />}
                  onClick={handleAddOrUpdateField}
                  disabled={
                    !data.label ||
                    (data.type === "select" &&
                      (!data.options || data.options.length === 0))
                  }
                  className={`${
                    isEditingMode ? "bg-amber-500" : "bg-emerald-800"
                  } text-white px-6 py-3 rounded-xl border-none font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Champs activés ({fields.length})
            </h4>
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {fields.map((f) => (
                <div
                  key={f.id}
                  className="group flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      {f.type === "select" ? (
                        <List size={18} />
                      ) : (
                        <Hash size={18} />
                      )}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-700">
                        {f.label}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                          {f.type === "select" ? "Liste déroulante" : f.type}
                        </span>
                        {f.required && (
                          <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded uppercase">
                            Obligatoire
                          </span>
                        )}
                        {f.type === "select" &&
                          f.options &&
                          f.options.length > 0 && (
                            <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded">
                              {f.options.length} option(s)
                            </span>
                          )}
                      </div>
                      {f.type === "select" &&
                        f.options &&
                        f.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {f.options.slice(0, 3).map((opt, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                              >
                                {opt}
                              </span>
                            ))}
                            {f.options.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{f.options.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => editField(f)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => removeField(f.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <List size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun champ personnalisé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
