// components/DomentType/EntityFieldManager.tsx
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
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
  Eye,
  EyeOff,
  Undo,
  FilePlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  useEntityMetaFields,
  useSetFieldOverride,
  useRemoveFieldOverride,
  useAddCustomField,
  useDeleteCustomField,
  useToggleCustomFieldHide,
  useUpdateCustomField,
} from "../../hooks/useMetaFieldOverrides";

interface Field {
  id: number;
  name: string;
  label: string;
  field_type: string;
  required: boolean;
  position: number;
  options?: string[];
  placeholder?: string;
  description?: string;
  source: "base" | "custom";
  is_overridden?: boolean;
  hidden?: boolean;
  original?: {
    label: string;
    required: boolean;
    position: number;
  };
}

interface EntityFieldManagerProps {
  visible: boolean;
  onHide: () => void;
  typeDocumentId: number;
  entityType: string;
  entityId: number;
  typeDocumentName?: string;
  entityName?: string;
  onRefresh?: () => void;
}

const fieldTypes = [
  { label: "Texte", value: "TEXT" },
  { label: "Nombre", value: "NUMBER" },
  { label: "Date", value: "DATE" },
  { label: "Fichier", value: "FILE" },
  { label: "Liste déroulante", value: "SELECT" },
  { label: "Texte long", value: "TEXTAREA" },
  { label: "Email", value: "EMAIL" },
  { label: "Téléphone", value: "PHONE" },
  { label: "Oui/Non", value: "BOOLEAN" },
];

const CustomHeader = ({ typeDocumentName, typeDocumentId, entityType, entityName, entityId }: any) => (
  <div className="flex items-center justify-between w-full pr-8">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-dgcc12 text-dgcc3">
        <Settings size={22} />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-800 leading-none">
          Gestion des champs
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {typeDocumentName || `Type #${typeDocumentId}`} • {entityType} : {entityName || `#${entityId}`}
        </p>
      </div>
    </div>
  </div>
);

export default function EntityFieldManager({
  visible,
  onHide,
  typeDocumentId,
  entityType,
  entityId,
  typeDocumentName,
  entityName,
  onRefresh,
}: EntityFieldManagerProps) {
  const toast = useRef<Toast>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    field_type: "TEXT",
    required: false,
    options: [] as string[],
    placeholder: "",
    description: "",
  });
  const [tempOption, setTempOption] = useState("");
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [editForm, setEditForm] = useState({
    label_override: "",
    required_override: false,
    hidden: false,
  });

  const { data: fieldsData, isLoading, refetch } = useEntityMetaFields(
    typeDocumentId,
    entityType,
    entityId
  );
  const { mutate: setOverride } = useSetFieldOverride();
  const { mutate: removeOverride } = useRemoveFieldOverride();
  const { mutate: addCustomField } = useAddCustomField();
  const { mutate: deleteCustomField } = useDeleteCustomField();
  const { mutate: toggleHide } = useToggleCustomFieldHide();
  const { mutate: updateCustomField } = useUpdateCustomField();

  useEffect(() => {
    if (fieldsData) {
      setFields(fieldsData);
    }
  }, [fieldsData]);

  useEffect(() => {
    if (visible && typeDocumentId && entityId && entityId !== 0) {
      refetch();
    }
  }, [visible, typeDocumentId, entityId, entityType]);

  // ==================== AJOUTER UN CHAMP PERSONNALISÉ ====================
  const handleAddOption = () => {
    if (!tempOption.trim()) return;
    setNewField({
      ...newField,
      options: [...newField.options, tempOption.trim()],
    });
    setTempOption("");
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...newField.options];
    newOptions.splice(index, 1);
    setNewField({ ...newField, options: newOptions });
  };

  const handleAddCustomField = async () => {
    if (!newField.label) {
      toast.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Le libellé du champ est requis",
      });
      return;
    }

    if (newField.field_type === "SELECT" && newField.options.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Veuillez ajouter au moins une option",
      });
      return;
    }

    const technicalName = newField.name || newField.label.toLowerCase().replace(/[^a-z0-9]/g, "_");

    addCustomField({
      typeId: typeDocumentId,
      entityType,
      entityId,
      fieldData: {
        name: technicalName,
        label: newField.label,
        field_type: newField.field_type,
        required: newField.required,
        position: fields.length,
        options: newField.field_type === "SELECT" ? newField.options : null,
        placeholder: newField.placeholder,
        description: newField.description,
      },
    }, {
      onSuccess: () => {
        setShowAddForm(false);
        setNewField({
          name: "",
          label: "",
          field_type: "TEXT",
          required: false,
          options: [],
          placeholder: "",
          description: "",
        });
        setTempOption("");
        refetch();
        onRefresh?.();
      },
    });
  };

  const handleDeleteCustomField = (fieldId: number, fieldName: string) => {
    confirmDialog({
      message: `Voulez-vous vraiment supprimer le champ "${fieldName}" ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        deleteCustomField({
          typeId: typeDocumentId,
          entityType,
          entityId,
          fieldId,
        }, {
          onSuccess: () => {
            refetch();
            onRefresh?.();
          },
        });
      },
    });
  };

  // ==================== PERSONNALISER UN CHAMP ====================
  const handleEditOverride = (field: Field) => {
    setEditingField(field);
    setEditForm({
      label_override: field.label,
      required_override: field.required,
      hidden: field.hidden || false,
    });
  };

  const handleSaveOverride = () => {
    if (!editingField) return;
    
    if (editingField.source === "custom") {
      const updateData: any = {};
      if (editForm.label_override !== editingField.label) {
        updateData.label = editForm.label_override;
      }
      if (editForm.required_override !== editingField.required) {
        updateData.required = editForm.required_override;
      }
      if (editForm.hidden !== editingField.hidden) {
        updateData.hidden = editForm.hidden;
      }
      
      if (Object.keys(updateData).length > 0) {
        updateCustomField({
          typeId: typeDocumentId,
          entityType,
          entityId,
          fieldId: editingField.id,
          fieldData: updateData,
        }, {
          onSuccess: () => {
            setEditingField(null);
            refetch();
            onRefresh?.();
          },
        });
      } else {
        setEditingField(null);
      }
    } else {
      setOverride({
        typeId: typeDocumentId,
        metaFieldId: editingField.id,
        entityType,
        entityId,
        overrideData: {
          label_override: editForm.label_override !== editingField.label ? editForm.label_override : null,
          required_override: editForm.required_override !== editingField.required ? editForm.required_override : null,
          hidden: editForm.hidden,
        },
      }, {
        onSuccess: () => {
          setEditingField(null);
          refetch();
          onRefresh?.();
        },
      });
    }
  };

  const handleRemoveOverride = (field: Field) => {
    if (field.source === "custom") {
      toast.current?.show({
        severity: "info",
        summary: "Information",
        detail: "Les champs personnalisés n'ont pas de configuration d'origine",
      });
      return;
    }
    
    confirmDialog({
      message: `Réinitialiser le champ "${field.label}" à sa configuration d'origine ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        removeOverride({
          typeId: typeDocumentId,
          metaFieldId: field.id,
          entityType,
          entityId,
        }, {
          onSuccess: () => {
            refetch();
            onRefresh?.();
          },
        });
      },
    });
  };

  const handleToggleHide = (field: Field) => {
    const newHidden = !field.hidden;
    toggleHide({
      typeId: typeDocumentId,
      entityType,
      entityId,
      fieldId: field.id,
      hidden: newHidden,
    }, {
      onSuccess: () => {
        refetch();
        onRefresh?.();
      },
    });
  };

  const getFieldTypeLabel = (type: string) => {
    const found = fieldTypes.find((ft) => ft.value === type);
    return found?.label || type;
  };

  const customFields = fields.filter((f) => f.source === "custom");

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: "850px" }}
        header={<CustomHeader typeDocumentName={typeDocumentName} typeDocumentId={typeDocumentId} entityType={entityType} entityName={entityName} entityId={entityId} />}
        className="rounded-3xl overflow-hidden"
        draggable={false}
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        footer={
          <div className="flex justify-end gap-3 p-4 bg-slate-50/50">
            <Button
              label="Fermer"
              onClick={onHide}
              className="p-button-text text-slate-500 font-bold"
            />
          </div>
        }
      >
        <div className="mt-4 px-2">
          <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="custom-tabview-field">
            {/* Onglet 1 : Personnaliser les champs */}
            <TabPanel header="Personnaliser les champs" leftIcon={<Settings size={18} className="mr-2" />}>
              <div className="py-6">
                <div className="space-y-4 max-h-[55vh] overflow-y-auto p-1">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dgcc3 mx-auto"></div>
                    </div>
                  ) : fields.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
                      <Settings size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">Aucun champ disponible</p>
                    </div>
                  ) : (
                    fields.map((field) => (
                      <div
                        key={field.id}
                        className={`group flex justify-between items-center p-4 rounded-2xl border transition-all ${
                          field.is_overridden || field.hidden
                            ? "bg-amber-50/50 border-amber-200"
                            : field.source === "custom"
                              ? "bg-purple-50/30 border-purple-100"
                              : "bg-white border-slate-100 hover:border-purple-200"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                            {field.field_type === "SELECT" ? <List size={18} /> : <Hash size={18} />}
                          </div>
                          <div>
                            <div className="text-base font-bold text-slate-700">
                              {field.label}
                              {field.hidden && <span className="ml-2 text-xs text-red-500">(Masqué)</span>}
                              {field.source === "custom" && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Personnalisé</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                                {getFieldTypeLabel(field.field_type)}
                              </span>
                              {field.required && (
                                <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded uppercase">Obligatoire</span>
                              )}
                              {field.is_overridden && (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Personnalisé</span>
                              )}
                            </div>
                            {field.is_overridden && field.original?.label && (
                              <div className="text-xs text-amber-600 mt-1">Original : {field.original.label}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditOverride(field)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Personnaliser">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleToggleHide(field)} className={`p-2 rounded-lg ${field.hidden ? "text-emerald-600 hover:bg-emerald-50" : "text-amber-600 hover:bg-amber-50"}`} title={field.hidden ? "Rendre visible" : "Masquer"}>
                            {field.hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          {field.is_overridden && (
                            <button onClick={() => handleRemoveOverride(field)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Réinitialiser">
                              <Undo size={18} />
                            </button>
                          )}
                          {field.source === "custom" && (
                            <button onClick={() => handleDeleteCustomField(field.id, field.label)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabPanel>

            {/* Onglet 2 : Ajouter des champs */}
            <TabPanel header="Ajouter des champs" leftIcon={<FilePlus size={18} className="mr-2" />}>
              <div className="py-6">
                <div className="space-y-4 max-h-[55vh] overflow-y-auto p-1">
                  {customFields.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Vos champs personnalisés ({customFields.length})
                      </h4>
                      {customFields.map((field) => (
                        <div key={field.id} className="group flex justify-between items-center p-4 bg-purple-50/30 border border-purple-100 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                              {field.field_type === "SELECT" ? <List size={18} /> : <Hash size={18} />}
                            </div>
                            <div>
                              <div className="text-base font-bold text-slate-700">{field.label}</div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                                  {getFieldTypeLabel(field.field_type)}
                                </span>
                                {field.required && <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded uppercase">Obligatoire</span>}
                                <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded">Personnalisé</span>
                              </div>
                              {field.options && field.options.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {field.options.slice(0, 3).map((opt, idx) => (
                                    <span key={idx} className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border">{opt}</span>
                                  ))}
                                  {field.options.length > 3 && <span className="text-[10px] text-slate-400">+{field.options.length - 3}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteCustomField(field.id, field.label)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100" title="Supprimer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddForm ? (
                    <Button
                      label="Nouveau champ personnalisé"
                      icon={<Plus size={18} className="mr-2" />}
                      onClick={() => setShowAddForm(true)}
                      className="w-full border-dashed border-2 border-purple-300 text-purple-600 bg-transparent hover:bg-purple-50 py-3 rounded-xl"
                    />
                  ) : (
                    <div className="p-6 rounded-3xl border-2 border-purple-200 bg-purple-50/30">
                      <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Nouveau champ personnalisé</h4>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-7">
                          <InputText
                            placeholder="Libellé du champ"
                            className="w-full p-3.5 border-slate-200 rounded-xl"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                          />
                        </div>
                        <div className="col-span-5">
                          <Dropdown
                            options={fieldTypes}
                            value={newField.field_type}
                            onChange={(e) => setNewField({ ...newField, field_type: e.value, options: e.value === "SELECT" ? [] : [] })}
                            className="w-full border-slate-200 rounded-xl"
                          />
                        </div>
                        {newField.field_type === "SELECT" && (
                          <div className="col-span-12 mt-4">
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Options</label>
                            <div className="flex gap-2 mb-3">
                              <InputText
                                placeholder="Ajouter une option"
                                className="flex-1 p-3 border-slate-200 rounded-xl"
                                value={tempOption}
                                onChange={(e) => setTempOption(e.target.value)}
                                onKeyPress={(e) => { if (e.key === "Enter") handleAddOption(); }}
                              />
                              <Button icon={<PlusCircle size={18} />} onClick={handleAddOption} className="bg-emerald-600 text-white px-4 rounded-xl" />
                            </div>
                            {newField.options.length > 0 && (
                              <div className="bg-white rounded-xl border p-3">
                                <div className="flex flex-wrap gap-2">
                                  {newField.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm">
                                      <span>{opt}</span>
                                      <button onClick={() => handleRemoveOption(idx)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="col-span-12 mt-2">
                          <InputText
                            placeholder="Placeholder (optionnel)"
                            className="w-full p-3.5 border-slate-200 rounded-xl"
                            value={newField.placeholder}
                            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                          />
                        </div>
                        <div className="col-span-12 flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border">
                            <span className="text-xs font-bold text-slate-500 uppercase">Obligatoire</span>
                            <InputSwitch checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.value })} />
                          </div>
                          <div className="flex gap-2">
                            <Button label="Annuler" icon={<X size={18} />} onClick={() => setShowAddForm(false)} className="p-button-text text-slate-500" />
                            <Button label="Ajouter" icon={<Plus size={18} className="mr-2" />} onClick={handleAddCustomField} className="bg-purple-600 text-white px-6 py-3 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            .custom-tabview-field .p-tabview-nav {
              border: none !important;
              background: transparent !important;
              display: flex;
              gap: 10px;
              margin-bottom: 1rem;
              padding: 0;
              list-style: none;
            }
            .custom-tabview-field .p-tabview-nav li .p-tabview-nav-link {
              border-radius: 12px !important;
              border: 1px solid #e2e8f0 !important;
              background: #f8fafc !important;
              transition: all 0.2s;
              padding: 12px 20px !important;
              text-decoration: none !important;
              color: #64748b !important;
              font-weight: 700;
            }
            .custom-tabview-field .p-tabview-nav li.p-highlight .p-tabview-nav-link {
              background: #1e293b !important;
              color: white !important;
              border-color: #1e293b !important;
              box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
            }
            .custom-tabview-field .p-tabview-panels {
              background: transparent !important;
              padding: 0 !important;
            }
          `,
        }} />
      </Dialog>

      {/* Modal de personnalisation */}
      <Dialog
        header={`Personnaliser : ${editingField?.label || ""}`}
        visible={!!editingField}
        onHide={() => setEditingField(null)}
        style={{ width: 450 }}
        className="rounded-2xl"
      >
        {editingField && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Label personnalisé</label>
              <InputText
                value={editForm.label_override}
                onChange={(e) => setEditForm({ ...editForm, label_override: e.target.value })}
                className="w-full p-3 border-slate-200 rounded-xl"
                placeholder={editingField.original?.label || editingField.label}
              />
              {editingField.original?.label && <p className="text-xs text-slate-400 mt-1">Original : {editingField.original.label}</p>}
            </div>
            
            {editingField.source !== "custom" && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border">
                <span className="text-xs font-bold text-slate-500 uppercase">Champ obligatoire</span>
                <InputSwitch checked={editForm.required_override} onChange={(e) => setEditForm({ ...editForm, required_override: e.value })} />
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button label="Annuler" onClick={() => setEditingField(null)} className="p-button-text text-slate-500" />
              <Button label="Enregistrer" icon={<Save size={18} className="mr-2" />} onClick={handleSaveOverride} className="bg-emerald-600 text-white px-6 py-2 rounded-xl" />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}