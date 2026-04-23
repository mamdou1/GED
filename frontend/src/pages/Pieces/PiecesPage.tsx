import { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import PiecesForm from "./PiecesForm";
import PiecesDetails from "./PiecesDetails";
import type { Pieces } from "../../interfaces";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Pencil,
  FileStack,
  Trash2,
  Settings,
  XCircle,
} from "lucide-react";
import { confirmDialog } from "primereact/confirmdialog";
import PiecesMetaForm from "./PiecesMetaForm";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  usePieces,
  useCreatePiece,
  useUpdatePiece,
  useDeletePiece,
} from "../../hooks/usePieces";

export default function PiecesPage() {
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer useState par usePieces
  const { data: allPieces = [], isLoading, error, refetch } = usePieces();

  console.log("🔍 isLoading:", isLoading);
  console.log("🔍 error:", error);
  console.log("🔍 allPieces:", allPieces);
  console.log("🔍 allPieces length:", allPieces.length);

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreatePiece();
  const updateMutation = useUpdatePiece();
  const deleteMutation = useDeletePiece();

  // États UI (inchangés)
  const [selected, setSelected] = useState<Pieces | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Pieces> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [metaVisible, setMetaVisible] = useState(false);

  // ✅ PLUS BESOIN DE affichage() NI DE useEffect !

  // ✅ ÉTAPE 3: Remplacer onCreate
  const onCreate = async (payload: Partial<Pieces>) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Pièce créée avec succès",
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur création",
      });
    }
  };

  // ✅ ÉTAPE 4: Remplacer onEdit
  const onEdit = async (payload: Partial<Pieces>) => {
    if (!editing || !editing.id) return;
    try {
      await updateMutation.mutateAsync({
        id: String(editing.id),
        data: payload,
      });
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Pièce mise à jour avec succès.",
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          err?.response?.data?.message || "Erreur lors de la modification",
      });
    }
  };

  // ✅ ÉTAPE 5: Remplacer handleDelete
  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer cette pièce définitivement ? Cette action est irréversible.",
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
            detail: "Pièce supprimée",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Suppression impossible",
          });
        }
      },
    });
  };

  // Filtrage et pagination (inchangés)
  const filteredData = allPieces.filter((p) => {
    return `${p.code_pieces} ${p.libelle}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  const paginated = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ ÉTAPE 6: Gérer les états de chargement/erreur
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
          <XCircle size={48} className="mx-auto mb-4" />
          <p>Erreur de chargement: {error.message}</p>
          <Button
            label="Réessayer"
            onClick={() => refetch()}
            className="mt-4"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header (inchangé) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <FileStack size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Types de Pièces
            </h1>
            <p className="text-slate-500 font-medium">
              Référentiel des pièces justificatives de liquidation
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle pièce"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-emerald-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Recherche et Filtre (inchangé) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Tableau (inchangé) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code Référence</th>
              <th className="px-6 py-4">Désignation du type de pièce</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((n) => (
              <tr
                key={n.id}
                onClick={() => {
                  setSelected(n);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono font-bold text-xs border border-emerald-100">
                    {n.code_pieces}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-slate-300 group-hover:text-emerald-400 transition-colors"
                    />
                    {n.libelle}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(n);
                        setDetailsVisible(true);
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      title="Voir détails"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(n);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      title="Modifier"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        setSelected(n);
                        setMetaVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(String(n.id)!);
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

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals (inchangés) */}
      <PiecesForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        refresh={() => {}} // ✅ PLUS BESOIN de refresh !
        initial={editing || {}}
        title={
          editing
            ? "Modifier le type de pièce"
            : "Ajouter un nouveau type de pièce"
        }
      />

      <PiecesDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        pieces={selected}
      />

      <PiecesMetaForm
        visible={metaVisible}
        onHide={() => setMetaVisible(false)}
        piece={selected}
        refresh={() => refetch()} // ✅ Utiliser refetch
      />
    </Layout>
  );
}
