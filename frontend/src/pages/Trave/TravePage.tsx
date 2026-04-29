import { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import TraveDetails from "./TraveDetails";
import TraveForm from "./TraveForm";
import type { Trave } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  Layers,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Hash,
  Archive,
  WavesLadder,
  XCircle,
  CheckCircle,
} from "lucide-react";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useTraves,
  useCreateTrave,
  useUpdateTrave,
  useDeleteTrave,
} from "../../hooks/useTraves";

export default function TravePage() {
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer useState par useTraves
  const { data: allTrave = [], isLoading, error, refetch } = useTraves();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateTrave();
  const updateMutation = useUpdateTrave();
  const deleteMutation = useDeleteTrave();

  // États UI (inchangés)
  const [selected, setSelected] = useState<Trave | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Trave> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ PLUS BESOIN DE fetchTraves() NI DE useEffect !

  // ✅ ÉTAPE 3: Remplacer handleAction
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
          detail: "Travée mise à jour",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Travée créée",
        });
      }
      setFormVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "L'opération a échoué",
      });
    }
  };

  // ✅ ÉTAPE 4: Remplacer handleDelete
  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer cette travée définitivement ? Cette action est irréversible.",
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
            detail: "Travée supprimée",
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

  // Filtrage et pagination (inchangés)
  const filtered = allTrave.filter((e) =>
    `${e.code} ${e.rayon?.code || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ ÉTAPE 5: Gérer les états de chargement/erreur
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

      {/* Header Section (inchangé) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <WavesLadder size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Travées
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Gestion des emplacements de stockage
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle travée"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search Bar (inchangé) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl outline-none"
            placeholder="Rechercher par code ou code rayon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section (inchangé) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Rayon / Emplacement</th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Statut
              </th>
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                Capacité
              </th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((e) => {
              const ratio =
                (Number(e.current_count) / Number(e.capacite_max)) * 100;
              const isFull = ratio >= 100;

              return (
                <tr
                  key={e.id}
                  className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
                  onClick={() => {
                    setSelected(e);
                    setDetailsVisible(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-100 flex items-center gap-1 w-fit">
                      <Hash size={12} /> {e.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-blue-500" />
                      {e.rayon?.code || "Non assignée"}
                    </div>
                  </td>
                  <td className="p-5">{getStatusBadge(e.status)}</td>
                  <td className="p-5">
                    <div className="space-y-2 min-w-[120px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-700">
                          {e.current_count || 0}/{e.capacite_max || 0}
                        </span>
                        {isFull ? (
                          <XCircle size={14} className="text-red-500" />
                        ) : (
                          <CheckCircle size={14} className="text-emerald-500" />
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
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(e);
                          setDetailsVisible(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(e);
                          setFormVisible(true);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(String(e.id))}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <WavesLadder size={48} className="mx-auto text-slate-200 mb-4" />
            Aucune travée trouvée.
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals (inchangés) */}
      <TraveForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        refresh={() => {}} // ✅ PLUS BESOIN de refresh !
        initial={editing || {}}
      />

      <TraveDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        trave={selected}
      />
    </Layout>
  );
}
