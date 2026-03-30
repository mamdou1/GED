import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DocumentTypeForm from "./DocumentTypeForm";
import DocumentTypeDetails from "./DocumentTypeDetails";
import DocumentTypeMetaForm from "./DocumentTypeMetaForm";
import { confirmDialog } from "primereact/confirmdialog";
import DocumentTypeAffectationForm from "./DocumentTypeAffectationForm";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Database,
  Settings,
  Search,
  Layers,
  FilePlus,
  SplinePointer,
  XCircle,
} from "lucide-react";
import {
  getTypeDocuments,
  createTypeDocument,
  updateTypeDocument,
  deleteTypeDocument,
  addPiecesToTypeDocument,
} from "../../api/typeDocument";
import {
  TypeDocument,
  AddPiecesToTypeDocumentPayload,
  Pieces,
} from "../../interfaces";
import { createMetaField, updateMetaField } from "../../api/metaField";
import Pagination from "../../components/layout/Pagination";
import TypeDocumentAjoutPieces from "./TypeDocumentAjoutPieces";
import { getPieces } from "../../api/pieces";
import { Dropdown } from "primereact/dropdown";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getAllEntiteeDeux } from "../../api/entiteeDeux";
import { getAllEntiteeTrois } from "../../api/entiteeTrois";
import DocumentTypeAffectAndForm from "./DocumentTypeAffectAndForm";

export default function DocumentTypePage() {
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [pieces, setPieces] = useState<Pieces[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [affectationFormVisible, setAffectationFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useRef<Toast>(null);
  const [formPiecesVisible, setFormPiecesVisible] = useState(false);
  const [selectedTypeDoc, setSelectedTypeDoc] = useState<string | null>(null);
  const [optionsEntites, setOptionsEntites] = useState<
    { label: string; value: any }[]
  >([]);

  const [rawE1, setRawE1] = useState<any[]>([]);
  const [rawE2, setRawE2] = useState<any[]>([]);
  const [rawE3, setRawE3] = useState<any[]>([]);

  const load = async () => {
    try {
      const [resTy, resP, resE1, resE2, resE3] = await Promise.all([
        getTypeDocuments(),
        getPieces(),
        getAllEntiteeUn(),
        getAllEntiteeDeux(),
        getAllEntiteeTrois(),
      ]);

      const typesData = resTy.typeDocument || resTy;
      setTypes(Array.isArray(typesData) ? typesData : []);
      setPieces(Array.isArray(resP) ? resP : []);

      // --- CORRECTION ICI ---
      // On extrait le tableau de chaque objet de réponse
      const dataE1 = Array.isArray(resE1) ? resE1 : resE1.entiteeUn || [];
      const dataE2 = Array.isArray(resE2) ? resE2 : resE2.entiteeDeux || [];
      const dataE3 = Array.isArray(resE3) ? resE3 : resE3.entiteeTrois || [];

      setRawE1(dataE1);
      setRawE2(dataE2);
      setRawE3(dataE3);

      const allOptions = [
        { label: "Tous les profils", value: null },
        ...dataE1.map((x: any) => ({
          label: `🏢 ${x.libelle}`, // E1 (Direction)
          value: String(x.id), // On garde l'ID pur ici ou on préfixe
        })),
        ...dataE2.map((x: any) => ({
          label: `📂 ${x.libelle}`, // E2 (Service)
          value: `E2-${x.id}`, // CLÉ UNIQUE
        })),
        ...dataE3.map((x: any) => ({
          label: `📄 ${x.libelle}`, // E3 (Bureau/Section)
          value: `E3-${x.id}`, // CLÉ UNIQUE
        })),
      ];
      setOptionsEntites(allOptions);
      // ----------------------
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les données",
      });
    }
  };
  useEffect(() => {
    load();
  }, []);

  /* ================= ACTIONS ================= */

  const onCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const onEdit = (row: any) => {
    setEditing(row);
    setFormVisible(true);
  };

  // const handleSubmit = async (payload: any) => {
  //   try {
  //     if (editing?.id) {
  //       await updateTypeDocument(editing.id, payload);
  //       toast.current?.show({ severity: "success", summary: "Mis à jour" });
  //     } else {
  //       await createTypeDocument(payload);
  //       toast.current?.show({ severity: "success", summary: "Créé" });
  //     }
  //     // RECHARGE COMPLÈTE pour récupérer les libellés et jointures
  //     await load();
  //     setFormVisible(false); // Fermer le formulaire
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async (formData: { code: string; nom: string }) => {
    try {
      if (editing?.id) {
        await updateTypeDocument(editing.id, formData);
        toast.current?.show({ severity: "success", summary: "Mis à jour" });
      } else {
        // Construction du payload enrichi
        let payload: any = { ...formData };

        // Si un filtre est actif, on FORCE l'affectation au nouveau document
        if (selectedTypeDoc) {
          const cleanId = Number(
            selectedTypeDoc.replace("E2-", "").replace("E3-", ""),
          );

          const n1 = rawE1.find(
            (x) => x.id === cleanId && !selectedTypeDoc.includes("E"),
          );
          const n2 = rawE2.find(
            (x) => x.id === cleanId && selectedTypeDoc.includes("E2"),
          );
          const n3 = rawE3.find(
            (x) => x.id === cleanId && selectedTypeDoc.includes("E3"),
          );

          if (n1) {
            payload.entitee_un_id = n1.id;
          } else if (n2) {
            payload.entitee_un_id = n2.entitee_un_id;
            payload.entitee_deux_id = n2.id;
          } else if (n3) {
            const parentN2 = rawE2.find((x) => x.id === n3.entitee_deux_id);
            payload.entitee_un_id = parentN2?.entitee_un_id;
            payload.entitee_deux_id = n3.entitee_deux_id;
            payload.entitee_trois_id = n3.id;
          }
        }

        // APPEL API avec le payload complet (code, nom + les IDs d'entités)
        await createTypeDocument(payload);
        toast.current?.show({
          severity: "success",
          summary: "Créé avec succès",
          detail: payload.entitee_un_id
            ? "Affectation automatique réussie"
            : "Document générique créé",
        });
      }

      await load();
      setFormVisible(false);
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Erreur" });
    }
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce type de document définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle", // Icône plus neutre, ou gardez pi-exclamation-triangle

      // --- Personnalisation des labels ---
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",

      // --- Styling des boutons ---
      // Ajout de classes de mise en page (flexbox) et de style
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",

      // --- Style du dialogue lui-même (optionnel) ---
      style: { width: "450px" },
      accept: async () => {
        await deleteTypeDocument(id);
        setTypes((s) => s.filter((x) => String(x.id) !== String(id)));
        toast.current?.show({ severity: "success", summary: "Supprimé" });
      },
    });
  };

  const handleMetaSubmit = async (fieldsPayload: any[]) => {
    if (!selected?.id) return;

    try {
      for (const field of fieldsPayload) {
        if (field.id) {
          // Si le champ a un ID, c'est une modification -> PUT
          await updateMetaField(field.id, field);
        } else {
          // Si pas d'ID, c'est un nouveau -> POST
          await createMetaField(selected.id, field);
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Mise à jour réussie",
      });
      load(); // Recharger les types pour voir les changements
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur lors de la mise à jour",
      });
    }
  };

  const onAddPieces = async (
    typeId: string,
    payload: AddPiecesToTypeDocumentPayload,
  ) => {
    try {
      await addPiecesToTypeDocument(typeId, payload);

      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Pièces ajoutées avec succès",
      });

      // 🔄 Recharger la liste complète
      load();

      setFormPiecesVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur ajout pièces",
      });
    }
  };

  const handleAffectationSubmit = async (payload: any) => {
    try {
      if (selected?.id) {
        await updateTypeDocument(selected.id, payload);
        toast.current?.show({
          severity: "success",
          summary: "Affectation mise à jour",
        });
        await load();
        setAffectationFormVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleMultipleAffectation = async (typeIds: string[]) => {
    try {
      if (!selectedTypeDoc) return;

      let structureData: any = {
        entitee_un_id: null,
        entitee_deux_id: null,
        entitee_trois_id: null,
      };

      // On sépare le préfixe de l'ID (ex: "E2-5" -> prefix="E2", id="5")
      const [prefix, rawId] = selectedTypeDoc.split("-");
      const targetId = Number(rawId);

      if (prefix === "E1") {
        const n1 = rawE1.find((x) => x.id === targetId);
        if (n1) structureData.entitee_un_id = n1.id;
      } else if (prefix === "E2") {
        const n2 = rawE2.find((x) => x.id === targetId);
        if (n2) {
          structureData.entitee_un_id = n2.entitee_un_id;
          structureData.entitee_deux_id = n2.id;
        }
      } else if (prefix === "E3") {
        const n3 = rawE3.find((x) => x.id === targetId);
        if (n3) {
          const parentN2 = rawE2.find((x) => x.id === n3.entitee_deux_id);
          structureData.entitee_un_id = parentN2?.entitee_un_id;
          structureData.entitee_deux_id = n3.entitee_deux_id;
          structureData.entitee_trois_id = n3.id;
        }
      }

      // Appel API avec le payload enfin complet
      await Promise.all(
        typeIds.map((id) => updateTypeDocument(id, structureData)),
      );

      toast.current?.show({
        severity: "success",
        summary: "Affectation réussie",
      });
      await load();
    } catch (error) {
      console.error("Erreur affectation:", error);
    }
  };

  const filtered = types.filter((t) => {
    const searchText = query.toLowerCase();
    const matchesSearch =
      t.code.toLowerCase().includes(searchText) ||
      t.nom.toLowerCase().includes(searchText);

    if (!selectedTypeDoc) return matchesSearch;

    // On compare selon le format choisi (ex: "E2-5" ou juste "5")
    const e1Id = String(t.entitee_un_id || (t.entitee_un as any)?.id);
    const e2Id = `E2-${t.entitee_deux_id || (t.entitee_deux as any)?.id}`;
    const e3Id = `E3-${t.entitee_trois_id || (t.entitee_trois as any)?.id}`;

    const matchesTypeDoc =
      selectedTypeDoc === e1Id ||
      selectedTypeDoc === e2Id ||
      selectedTypeDoc === e3Id;

    return matchesSearch && matchesTypeDoc;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            {/* Changement : Gradient Emerald */}
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-800 text-white rounded-3xl shadow-xl shadow-emerald-100">
              <Database size={28} />
            </div>
            Types de Documents
          </h1>
          <p className="text-slate-500 text-base mt-2 ml-1 font-medium italic">
            Structurez vos archives et définissez vos métadonnées sur mesure.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            label="Ajouter Type"
            icon={<Plus size={20} className="mr-2" />}
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-4 rounded-2xl shadow-lg transition-all font-bold"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par code ou nom de document..."
            value={query}
          />
        </div>

        <div className="w-64">
          <Dropdown
            value={selectedTypeDoc}
            onChange={(e) => {
              setSelectedTypeDoc(e.value);
              setCurrentPage(1); // Très important : revenir à la page 1 quand on filtre
            }}
            options={optionsEntites} // Utilise le state chargé
            placeholder="Filtrer par type de structure"
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
            showClear
            filter
          />
        </div>

        {(query || selectedTypeDoc) && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedTypeDoc(null);
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
          >
            <XCircle size={18} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Code
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Libellé du Type
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Structure
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Métadonnées
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((t) => (
              <tr
                key={t.id}
                onClick={() => {
                  setSelected(t);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer group hover:bg-emerald-50/30 transition-all"
              >
                <td className="p-6">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 uppercase">
                    {t.code}
                  </span>
                </td>
                <td className="p-6">
                  <div className="font-bold text-slate-800 text-lg">
                    {t.nom}
                  </div>
                </td>
                <td className="p-6 text-slate-600 font-medium">
                  {t.entitee_trois?.libelle
                    ? t.entitee_trois.libelle
                    : t.entitee_deux?.libelle
                      ? t.entitee_deux.libelle
                      : t.entitee_un?.libelle
                        ? t.entitee_un.libelle
                        : "Non assigné"}
                </td>
                <td className="p-6">
                  {/* Changement : Badge Emerald */}
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black">
                    {t.metaFields?.length || 0} CHAMPS
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button
                      title="Ajouter des pièces"
                      onClick={(e) => {
                        setSelected(t);
                        setFormPiecesVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <FilePlus size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setSelected(t);
                        setAffectationFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <SplinePointer size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        onEdit(t);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        setSelected(t);
                        setMetaVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(String(t.id));
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
      />

      <DocumentTypeDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        type={selected}
      />

      <DocumentTypeMetaForm
        visible={metaVisible}
        onHide={() => setMetaVisible(false)}
        onSubmit={handleMetaSubmit}
        //refresh={load}
        type={selected}
      />

      <TypeDocumentAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={onAddPieces}
        initial={selected}
        title={"Ajouter des pièces au dossier"}
        pieces={pieces}
      />

      {/* NOUVEAU Formulaire d'affectation (Ouvert par SplinePointer) */}
      <DocumentTypeAffectationForm
        visible={affectationFormVisible}
        onHide={() => setAffectationFormVisible(false)}
        onSubmit={handleAffectationSubmit}
        initial={selected}
        title={`Affectation : ${selected?.nom}`}
      />

      <DocumentTypeAffectAndForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmitSingle={handleSubmit} // Ta fonction existante
        onSubmitMultiple={handleMultipleAffectation} // Celle qu'on a créée avant
        types={types}
        initial={editing}
        isFiltered={!!selectedTypeDoc}
        structureLabel={
          optionsEntites.find((o) => o.value === selectedTypeDoc)?.label || ""
        }
      />
    </Layout>
  );
}
