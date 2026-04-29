// src/pages/courriers/DestinatairesExternesPage.tsx
import React, { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import { Building2, Send, Search, Plus, Pencil, Trash2, X, Save, User, XCircle, RefreshCw } from "lucide-react";
import { useDestinatairesExternes, useCreateDestinataireExterne, useUpdateDestinataireExterne, useDeleteDestinataireExterne } from "../../hooks/destinataireExterne";
import { DestinataireExterne } from "../../interfaces/destinataireExterne";
import { Dropdown } from "primereact/dropdown";

const DestinatairesExternesPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { data: destinataires = [], isLoading, error, refetch } = useDestinatairesExternes();
  const createMutation = useCreateDestinataireExterne();
  const updateMutation = useUpdateDestinataireExterne();
  const deleteMutation = useDeleteDestinataireExterne();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingDestinataire, setEditingDestinataire] = useState<DestinataireExterne | null>(null);
  const [formData, setFormData] = useState({
    type: "STRUCTURE" as "PERSONNE" | "STRUCTURE",
    nom: "",
    prenom: "",
    raison_sociale: "",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const typeOptions = [
    { label: "Personne physique", value: "PERSONNE" },
    { label: "Structure (Société, Ministère...)", value: "STRUCTURE" },
  ];

  const openNew = () => {
    setEditingDestinataire(null);
    setFormData({ type: "STRUCTURE", nom: "", prenom: "", raison_sociale: "", email: "", telephone: "", adresse: "" });
    setDialogVisible(true);
  };

  const openEdit = (destinataire: DestinataireExterne) => {
    setEditingDestinataire(destinataire);
    setFormData({
      type: destinataire.type || "STRUCTURE",
      nom: destinataire.nom || "",
      prenom: destinataire.prenom || "",
      raison_sociale: destinataire.raison_sociale || "",
      email: destinataire.email || "",
      telephone: destinataire.telephone || "",
      adresse: destinataire.adresse || "",
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (formData.type === "PERSONNE") {
      if (!formData.nom.trim()) {
        toast.current?.show({ severity: "warn", summary: "Champ requis", detail: "Le nom est obligatoire" });
        return;
      }
    } else {
      if (!formData.raison_sociale.trim()) {
        toast.current?.show({ severity: "warn", summary: "Champ requis", detail: "La raison sociale est obligatoire" });
        return;
      }
    }

    try {
      const payload = {
        type: formData.type,
        nom: formData.type === "PERSONNE" ? formData.nom : null,
        prenom: formData.type === "PERSONNE" ? (formData.prenom || null) : null,
        raison_sociale: formData.type === "STRUCTURE" ? formData.raison_sociale : null,
        email: formData.email || null,
        telephone: formData.telephone || null,
        adresse: formData.adresse || null,
      };

      if (editingDestinataire) {
        await updateMutation.mutateAsync({ id: editingDestinataire.iddestinataire_externe, data: payload });
        toast.current?.show({ severity: "success", summary: "Succès", detail: "Destinataire modifié avec succès" });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({ severity: "success", summary: "Succès", detail: "Destinataire créé avec succès" });
      }
      setDialogVisible(false);
      refetch();
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Erreur", detail: error.response?.data?.message || error.message });
    }
  };

  const handleDelete = (id: number, nom: string) => {
    confirmDialog({
      message: `Supprimer "${nom}" ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({ severity: "success", summary: "Supprimé", detail: "Destinataire supprimé avec succès" });
          refetch();
        } catch (error: any) {
          toast.current?.show({ severity: "error", summary: "Erreur", detail: error.response?.data?.message || error.message });
        }
      },
    });
  };

  const nomBodyTemplate = (rowData: DestinataireExterne) => {
    if (rowData.type === "PERSONNE") {
      return `${rowData.nom || ""} ${rowData.prenom || ""}`.trim() || "-";
    }
    return rowData.raison_sociale || "-";
  };

  const typeBodyTemplate = (rowData: DestinataireExterne) => {
    if (rowData.type === "PERSONNE") {
      return <Tag value="Personne" severity="info" className="px-3 py-1 rounded-lg" />;
    }
    return <Tag value="Structure" severity="success" className="px-3 py-1 rounded-lg" />;
  };

  const actionBodyTemplate = (rowData: DestinataireExterne) => {
    const displayName = rowData.type === "PERSONNE" 
      ? `${rowData.nom || ""} ${rowData.prenom || ""}`.trim() 
      : rowData.raison_sociale || "";
    return (
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => openEdit(rowData)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all" title="Modifier">
          <Pencil size={20} />
        </button>
        <button onClick={() => handleDelete(rowData.iddestinataire_externe, displayName || "cet élément")} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all" title="Supprimer">
          <Trash2 size={20} />
        </button>
      </div>
    );
  };

  const filteredData = React.useMemo(() => {
    return destinataires.filter((d: DestinataireExterne) =>
      `${d.nom || ""} ${d.prenom || ""} ${d.raison_sociale || ""} ${d.email || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [destinataires, query]);

  const paginated = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 text-center px-6">
          <XCircle size={72} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Erreur de chargement</h2>
          <p className="text-slate-600 mb-8 max-w-md">{error.message || "Impossible de charger les destinataires."}</p>
          <Button label="Réessayer" icon={<RefreshCw size={20} className="mr-2" />} onClick={() => refetch()} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3" />
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Send size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion des Destinataires Externes</h1>
            <p className="text-slate-500 font-medium">Personnes ou structures qui reçoivent des courriers</p>
          </div>
        </div>
        <Button label="Nouveau destinataire" icon={<Plus size={20} className="mr-2" />} onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all" />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <InputText className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Rechercher par nom, email..." value={query} onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Nom / Raison sociale</th>
              <th className="px-6 py-4">Téléphone</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length > 0 ? (
              paginated.map((d: DestinataireExterne) => (
                <tr key={d.iddestinataire_externe} className="hover:bg-emerald-50/30 transition-all group">
                  <td className="px-6 py-4"><span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{d.iddestinataire_externe}</span></td>
                  <td className="px-6 py-4">{typeBodyTemplate(d)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{nomBodyTemplate(d)}</td>
                  <td className="px-6 py-4 text-slate-600">{d.telephone || "-"}</td>
                  <td className="px-6 py-4 text-slate-600">{d.email || "-"}</td>
                  <td className="px-6 py-4">{actionBodyTemplate(d)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500">Aucun destinataire externe trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Button label="Précédent" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-button-text" />
        <span className="text-slate-600">Page {currentPage} sur {Math.ceil(filteredData.length / itemsPerPage)}</span>
        <Button label="Suivant" onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredData.length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)} className="p-button-text" />
      </div>

      <Dialog
        header={<div className="flex items-center gap-2"><div className="bg-emerald-100 p-2 rounded-lg">{formData.type === "PERSONNE" ? <User size={18} className="text-emerald-600" /> : <Building2 size={18} className="text-emerald-600" />}</div><span className="text-slate-800 font-bold">{editingDestinataire ? "Modifier le destinataire" : "Nouveau destinataire"}</span></div>}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "600px" }}
        footer={<div className="flex justify-end gap-3 pt-6 border-t border-slate-100"><Button label="Annuler" icon={<X size={18} className="mr-2" />} onClick={() => setDialogVisible(false)} className="p-button-text text-slate-400 font-bold" /><Button label="Enregistrer" icon={<Save size={18} className="mr-2" />} onClick={handleSubmit} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700" /></div>}
      >
        <div className="space-y-4 pt-2">
          <div><label className="text-sm font-semibold text-slate-700">Type *</label><Dropdown value={formData.type} options={typeOptions} onChange={(e) => setFormData({ ...formData, type: e.value })} className="w-full mt-1" placeholder="Sélectionner le type" /></div>
          {formData.type === "PERSONNE" ? (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-slate-700">Nom *</label><InputText value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Nom" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Prénom</label><InputText value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Prénom" /></div>
            </div>
          ) : (
            <div><label className="text-sm font-semibold text-slate-700">Raison sociale *</label><InputText value={formData.raison_sociale} onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: Ministère des Finances, Société X..." /></div>
          )}
          <div><label className="text-sm font-semibold text-slate-700">Adresse</label><InputText value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Adresse complète" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-semibold text-slate-700">Téléphone</label><InputText value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Téléphone" /></div><div><label className="text-sm font-semibold text-slate-700">Email</label><InputText value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Email" type="email" /></div></div>
        </div>
      </Dialog>
    </Layout>
  );
};

export default DestinatairesExternesPage;