import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import BoxDetails from "./BoxDetails";
import BoxForm from "./BoxForm";
import BoxAffectationForm from "./BoxAffectationForm";
import type { Box } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import { Dialog } from "primereact/dialog";
// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useBoxes,
  useCreateBox,
  useUpdateBox,
  useDeleteBox,
} from "../../hooks/useBoxes";
import {
  Archive,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Hash,
  BoxIcon,
  AlertCircle,
  Building2,
  Layers,
  GitMerge,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle,
  PackageOpen,
  SplinePointer,
  Columns, // ✅ Pour la modale BoxListeEtAffectation
} from "lucide-react";
import { Badge } from "primereact/badge";

// ✅ IMPORTER LES COMPOSANTS
import DocumentListeEtArchivage from "./Add/DocumentListeEtArchivage";
import BoxListeEtAffectation from "./Classement/BoxListeEtAffectation";

export default function BoxPage() {
  // ✅ ÉTAPE 4: Remplacer useState par useQuery
  const { data: allBoxes = [], isLoading, error, refetch } = useBoxes();

  // ✅ ÉTAPE 5: Remplacer les mutations
  const createMutation = useCreateBox();
  const updateMutation = useUpdateBox();
  const deleteMutation = useDeleteBox();

  // Garder les états UI
  const [selected, setSelected] = useState<Box | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Box> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ ÉTATS POUR LES MODALES
  const [archivageVisible, setArchivageVisible] = useState(false);
  const [affectationVisible, setAffectationVisible] = useState(false);
  const [affectationTraveeVisible, setAffectationTraveeVisible] =
    useState(false); // ✅ Nouvel état pour BoxListeEtAffectation

  // ✅ ÉTAPE 6: Modifier handleAction (pour BoxForm)
  const handleAction = async (payload: any) => {
    try {
      if (editing?.id) {
        await updateMutation.mutateAsync({
          id: String(editing.id),
          data: payload,
        });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Box mis à jour",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Box créé",
        });
      }
      setFormVisible(false);
      setEditing(null);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "L'opération a échoué",
      });
    }
  };

  // ✅ Handler pour BoxAffectationForm (structure)
  const handleAffectationSubmit = async (payload: any) => {
    try {
      await updateMutation.mutateAsync({
        id: String(selected?.id),
        data: payload,
      });

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Affectation du box mise à jour avec succès",
      });

      setAffectationVisible(false);
      setSelected(null);
      refetch();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l'affectation du box",
      });
    }
  };

  // ✅ Callback après affectation à une travée réussie
  const handleAffectationTraveeSuccess = () => {
    setAffectationTraveeVisible(false);
    toast.current?.show({
      severity: "success",
      summary: "Succès",
      detail: "Les box ont été affectés à la travée avec succès",
    });
    refetch();
  };

  // ✅ ÉTAPE 7: Modifier handleDelete
  const handleDelete = (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce box définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Box supprimé avec succès",
          });
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Suppression impossible",
          });
        }
      },
    });
  };

  // ✅ Callback appelé après un archivage réussi
  const handleArchivageSuccess = () => {
    setArchivageVisible(false);
    toast.current?.show({
      severity: "success",
      summary: "Archivage terminé",
      detail: "Les documents ont été archivés avec succès",
    });
  };

  // ✅ ÉTAPE 8: Filtrer et paginer (inchangé)
  const filtered = allBoxes.filter((b) =>
    `${b.code_box} ${b.libelle}`.toLowerCase().includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Fonctions helpers (inchangées)
  const getNiveauIcon = (type: string) => {
    switch (type) {
      case "un":
        return <Building2 size={14} className="text-blue-500" />;
      case "deux":
        return <Layers size={14} className="text-purple-500" />;
      case "trois":
        return <GitMerge size={14} className="text-emerald-500" />;
      default:
        return <Briefcase size={14} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIBRE":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            🟢 Libre
          </span>
        );
      case "OCCUPE":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            🟠 Occupé
          </span>
        );
      case "PLIEN":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            🔴 Plein
          </span>
        );
      case "RESERVER":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            🔵 Réservé
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">
            Inconnu
          </span>
        );
    }
  };

  const getEntiteeLibelle = (box: Box): string => {
    if (box.entitee_trois) return box.entitee_trois.libelle;
    if (box.entitee_deux) return box.entitee_deux.libelle;
    if (box.entitee_un) return box.entitee_un.libelle;
    return "Non assigné";
  };

  const getEntiteeType = (box: Box): string => {
    if (box.entitee_trois) return "trois";
    if (box.entitee_deux) return "deux";
    if (box.entitee_un) return "un";
    return "";
  };

  // ✅ ÉTAPE 9: Gérer les états de chargement/erreur
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600 p-8">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p>Erreur de chargement: {error.message}</p>
          <Button
            label="Réessayer"
            onClick={() => window.location.reload()}
            className="mt-4"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg">
            <Archive size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Boxes d' <span className="text-emerald-600">Archivage</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion de la capacité et du contenu
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* ✅ Bouton "Affecter à une travée" avec icône Building2 */}
          <Button
            label="Affecter à une travée"
            icon={<Building2 size={20} className="mr-2" />}
            className="bg-purple-500 hover:bg-purple-600 text-white border-none px-6 py-3 rounded-xl shadow-purple-200 shadow-lg transition-all"
            onClick={() => setAffectationTraveeVisible(true)}
          />
          {/* Bouton "Ajouter au Box" */}
          <Button
            label="Ajouter Document au Box"
            icon={<PackageOpen size={20} className="mr-2" />}
            className="bg-amber-500 hover:bg-amber-600 text-white border-none px-6 py-3 rounded-xl shadow-amber-200 shadow-lg transition-all"
            onClick={() => setArchivageVisible(true)}
          />
          {/* Bouton "Nouveau Box" */}
          <Button
            label="Nouveau Box"
            icon={<Plus size={20} className="mr-2" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-emerald-200 shadow-lg"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          />
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
            placeholder="Rechercher un box..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-50/30 border-b border-emerald-50">
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Code
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Libellé
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Structure
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Type de document
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Travée
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Statut
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Capacité
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {paginated.length > 0 ? (
              paginated.map((box) => {
                const ratio =
                  (Number(box.current_count) / Number(box.capacite_max)) * 100;
                const isFull = ratio >= 100;
                const entiteeType = getEntiteeType(box);

                return (
                  <tr
                    key={box.id}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelected(box);
                      setDetailsVisible(true);
                    }}
                  >
                    <td className="p-5">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 font-mono">
                        {box.code_box}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-slate-800">
                        {box.libelle}
                      </div>
                    </td>
                    <td className="p-5">
                      {getEntiteeLibelle(box) !== "Non assigné" ? (
                        <div className="flex items-center gap-2">
                          {getNiveauIcon(entiteeType)}
                          <span className="text-sm text-slate-600">
                            {getEntiteeLibelle(box)}
                          </span>
                          {entiteeType && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                entiteeType === "un"
                                  ? "bg-blue-100 text-blue-700"
                                  : entiteeType === "deux"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              N
                              {entiteeType === "un"
                                ? "1"
                                : entiteeType === "deux"
                                  ? "2"
                                  : "3"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      {box.typeDocument ? (
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {box.typeDocument.nom}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          Aucun type
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      {box.trave ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {box.trave.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          Non assignée
                        </span>
                      )}
                    </td>
                    <td className="p-5">{getStatusBadge(box.status)}</td>
                    <td className="p-5">
                      <div className="space-y-2 min-w-[120px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-700">
                            {box.current_count || 0}/{box.capacite_max || 0}
                          </span>
                          {isFull ? (
                            <XCircle size={14} className="text-red-500" />
                          ) : (
                            <CheckCircle
                              size={14}
                              className="text-emerald-500"
                            />
                          )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isFull
                                ? "bg-red-500"
                                : ratio > 80
                                  ? "bg-orange-400"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div
                        className="flex justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* ✅ Bouton Affectation structure (SplinePointer) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(box);
                            setAffectationVisible(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Affecter à une structure"
                        >
                          <SplinePointer size={18} />
                        </button>

                        {/* ✅ Bouton Voir détails */}
                        <button
                          onClick={() => {
                            setSelected(box);
                            setDetailsVisible(true);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Voir le contenu"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Bouton Modifier */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(box);
                            setFormVisible(true);
                          }}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Bouton Supprimer */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(String(box.id));
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">
                  <Archive size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400">Aucune box trouvée.</p>
                  {query && (
                    <p className="text-sm text-slate-400 mt-2">
                      Essayez de modifier votre recherche.
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ✅ MODALE POUR L'ARCHIVAGE DE DOCUMENTS */}
      <Dialog
        visible={archivageVisible}
        onHide={() => setArchivageVisible(false)}
        header={
          <div className="flex items-center gap-2">
            <PackageOpen size={24} className="text-emerald-600" />
            <span className="text-xl font-bold">Archiver des documents</span>
          </div>
        }
        style={{ width: "90vw", height: "85vh" }}
        maximizable
        contentStyle={{ padding: 0, height: "calc(85vh - 120px)" }}
        breakpoints={{ "960px": "95vw", "640px": "100vw" }}
        draggable={false}
        resizable={false}
      >
        <DocumentListeEtArchivage />
      </Dialog>

      {/* ✅ MODALE POUR L'AFFECTATION DES BOX À UNE TRAVÉE */}
      <Dialog
        visible={affectationTraveeVisible}
        onHide={() => setAffectationTraveeVisible(false)}
        header={
          <div className="flex items-center gap-2">
            <Building2 size={24} className="text-purple-600" />
            <span className="text-xl font-bold">
              Affecter des box à une travée
            </span>
          </div>
        }
        style={{ width: "90vw", height: "85vh" }}
        maximizable
        contentStyle={{ padding: 0, height: "calc(85vh - 120px)" }}
        breakpoints={{ "960px": "95vw", "640px": "100vw" }}
        draggable={false}
        resizable={false}
      >
        <BoxListeEtAffectation />
      </Dialog>

      {/* ✅ MODALE POUR L'AFFECTATION DE STRUCTURE (BoxAffectationForm) */}
      <BoxAffectationForm
        visible={affectationVisible}
        onHide={() => {
          setAffectationVisible(false);
          setSelected(null);
        }}
        box={selected}
        onSubmit={handleAffectationSubmit}
      />

      {/* Modals existantes */}
      <BoxForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmit={handleAction}
        refresh={() => {}}
        initial={editing || {}}
      />
      <BoxDetails
        visible={detailsVisible}
        onHide={() => {
          setDetailsVisible(false);
          setSelected(null);
        }}
        boxId={selected?.id}
        onUpdate={() => refetch()}
      />
    </Layout>
  );
}
