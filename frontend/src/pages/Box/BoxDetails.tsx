import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import {
  getBoxById,
  getDocumentsByBox,
  retireDocumentFromBox,
   // À ajouter dans ton API
} from "../../api/box";
import { updateDocument, deleteDocument } from "../../api/document"; // À créer
import { Box } from "../../interfaces";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {
  FileText,
  MinusCircle,
  Info,
  Hash,
  Inbox,
  Building2,
  Layers,
  GitMerge,
  Briefcase,
  MapPin,
  FolderTree,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Toast } from "primereact/toast";
import { Badge } from "primereact/badge";
import DocumentDetails from "../Document/DocumentDetails";
import DocumentForm from "../Document/DocumentForm";

export default function BoxDetails({ visible, onHide, boxId, onUpdate }: any) {
  const [box, setBox] = useState<Box | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  
  // États pour le modal de consultation du document
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // États pour la modification du document
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  // Charger les types de documents pour le formulaire
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const { getTypeDocuments } = await import("../../api/typeDocument");
        const res = await getTypeDocuments();
        setDocumentTypes(res.typeDocument);
      } catch (error) {
        console.error("Erreur chargement types:", error);
      }
    };
    loadTypes();
  }, []);

  const loadData = useCallback(async () => {
    if (!boxId) return;
    setLoading(true);
    try {
      const [b, docs] = await Promise.all([
        getBoxById(boxId),
        getDocumentsByBox(boxId),
      ]);
      setBox(b);
      setDocuments(docs);
    } catch (error) {
      console.error("❌ Erreur chargement données box:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les données du box",
      });
    } finally {
      setLoading(false);
    }
  }, [boxId]);

  useEffect(() => {
    if (visible && boxId) {
      loadData();
    }
  }, [visible, boxId, loadData]);

  const handleRetire = (docId: string) => {
    confirmDialog({
      message: "Retirer ce document du box ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await retireDocumentFromBox(boxId, docId);
          await loadData();
          if (onUpdate) onUpdate();
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Document retiré avec succès",
          });
        } catch (err) {
          console.error("❌ Erreur retrait document:", err);
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Erreur lors du retrait du document",
          });
        }
      },
    });
  };

  // Fonction pour supprimer un document
  const handleDeleteDocument = (doc: any) => {
    confirmDialog({
      message: `Supprimer définitivement le document #${String(doc.id).padStart(4, "0")} ?`,
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          // Si le document est dans un box, le retirer d'abord
          if (doc.box_id) {
            await retireDocumentFromBox(boxId, doc.id);
          }
          // Puis supprimer le document
          await deleteDocument(doc.id);
          await loadData();
          if (onUpdate) onUpdate();
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Document supprimé avec succès",
          });
        } catch (err) {
          console.error("❌ Erreur suppression:", err);
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Erreur lors de la suppression du document",
          });
        }
      },
    });
  };

  // Fonction pour ouvrir le modal de modification
  const handleEditDocument = (doc: any) => {
    setEditingDocument(doc);
    setShowEditModal(true);
  };

  // Fonction pour sauvegarder la modification
  const handleUpdateDocument = async (payload: any) => {
    try {
      await updateDocument(payload.id, payload);
      await loadData();
      if (onUpdate) onUpdate();
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document modifié avec succès",
      });
      setShowEditModal(false);
      setEditingDocument(null);
    } catch (err) {
      console.error("❌ Erreur modification:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Erreur lors de la modification du document",
      });
      throw err;
    }
  };

  // Fonction pour ouvrir le modal de consultation du document
  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  // Fonction pour fermer le modal document
  const handleCloseDocumentModal = useCallback(() => {
    setShowDocumentModal(false);
    setTimeout(() => {
      setSelectedDocument(null);
    }, 300);
  }, []);

  // Fonction après mise à jour du document (archivage/désarchivage)
  const handleDocumentUpdate = useCallback(() => {
    loadData();
    if (onUpdate) onUpdate();
  }, [loadData, onUpdate]);

  // Fonction pour obtenir l'icône selon le niveau
  const getNiveauIcon = (type: string) => {
    switch (type) {
      case "un":
        return <Building2 size={16} className="text-blue-500" />;
      case "deux":
        return <Layers size={16} className="text-purple-500" />;
      case "trois":
        return <GitMerge size={16} className="text-emerald-500" />;
      default:
        return <FolderTree size={16} className="text-slate-400" />;
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* Modal des détails du box */}
      <Dialog
        visible={visible}
        onHide={onHide}
        header={
          <div className="flex items-center gap-2">
            <Info className="text-emerald-600" size={20} />
            <span className="font-bold text-emerald-900">Contenu du Box</span>
          </div>
        }
        className="w-full max-w-4xl rounded-3xl"
        modal
        draggable={false}
        closable={!loading}
      >
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : box ? (
          <div className="space-y-6 pt-2">
            {/* En-tête du box */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    {box.libelle}
                    {box.typeDocument && (
                      <Badge
                        value={box.typeDocument.nom}
                        severity="info"
                        className="ml-2 text-xs"
                      />
                    )}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-emerald-100">
                    <p className="font-mono text-sm flex items-center gap-1">
                      <Hash size={14} /> {box.code_box}
                    </p>
                    {box.trave && (
                      <p className="text-sm flex items-center gap-1">
                        <MapPin size={14} /> {box.trave.code}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">
                    {box.current_count || 0} / {box.capacite_max || 0}
                  </span>
                  <p className="text-[10px] uppercase opacity-60 font-bold tracking-wider">
                    Documents
                  </p>
                </div>
              </div>

              {/* Informations structurelles */}
              {(box.entitee_un || box.entitee_deux || box.entitee_trois) && (
                <div className="mt-4 pt-4 border-t border-emerald-600/30 grid grid-cols-3 gap-4">
                  {box.entitee_un && (
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-300" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          Niveau 1
                        </p>
                        <p className="text-sm font-bold">
                          {box.entitee_un.libelle}
                        </p>
                      </div>
                    </div>
                  )}
                  {box.entitee_deux && (
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-emerald-300" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          Niveau 2
                        </p>
                        <p className="text-sm font-bold">
                          {box.entitee_deux.libelle}
                        </p>
                      </div>
                    </div>
                  )}
                  {box.entitee_trois && (
                    <div className="flex items-center gap-2">
                      <GitMerge size={16} className="text-emerald-300" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          Niveau 3
                        </p>
                        <p className="text-sm font-bold">
                          {box.entitee_trois.libelle}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Liste des documents */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500" />
                  Documents ({documents.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Référence</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Structure</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-emerald-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4 font-bold text-slate-700">
                            <div className="flex items-center gap-3">
                              <FileText
                                size={18}
                                className="text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0"
                              />
                              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                #{String(doc.id).padStart(4, "0")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600">
                                {doc.typeDocument?.nom || "Archive standard"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {doc.typeDocument?.entitee_trois && (
                                <>
                                  {getNiveauIcon("trois")}
                                  <span className="text-xs text-slate-600">
                                    {doc.typeDocument.entitee_trois.libelle}
                                  </span>
                                </>
                              )}
                              {!doc.typeDocument?.entitee_trois &&
                                doc.typeDocument?.entitee_deux && (
                                  <>
                                    {getNiveauIcon("deux")}
                                    <span className="text-xs text-slate-600">
                                      {doc.typeDocument.entitee_deux.libelle}
                                    </span>
                                  </>
                                )}
                              {!doc.typeDocument?.entitee_trois &&
                                !doc.typeDocument?.entitee_deux &&
                                doc.typeDocument?.entitee_un && (
                                  <>
                                    {getNiveauIcon("un")}
                                    <span className="text-xs text-slate-600">
                                      {doc.typeDocument.entitee_un.libelle}
                                    </span>
                                  </>
                                )}
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              {/* Bouton pour consulter le document */}
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Consulter le document"
                                type="button"
                              >
                                <Eye size={18} />
                              </button>
                              
                              {/* Bouton pour modifier le document */}
                              <button
                                onClick={() => handleEditDocument(doc)}
                                className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                title="Modifier le document"
                                type="button"
                              >
                                <Pencil size={18} />
                              </button>
                              
                              {/* Bouton pour supprimer le document */}
                              <button
                                onClick={() => handleDeleteDocument(doc)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Supprimer le document"
                                type="button"
                              >
                                <Trash2 size={18} />
                              </button>
                              
                              {/* Bouton pour retirer le document */}
                              <button
                                onClick={() => handleRetire(doc.id)}
                                className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                                title="Retirer du box"
                                type="button"
                              >
                                <MinusCircle size={18} />
                              </button>
                            </div>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <Inbox size={48} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">
                            Ce box ne contient aucun document pour le moment.
                          </p>
                          <p className="text-xs mt-1 text-slate-300">
                            La capacité disponible est de{" "}
                            {Number(box.current_count) || 0}/
                            {Number(box.capacite_max) || 0} documents.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pied de page avec résumé */}
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Info size={14} />
                <span>
                  Dernière mise à jour :{" "}
                  {box.updatedAt
                    ? new Date(box.updatedAt).toLocaleString("fr-FR")
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-600">
                  {box.current_count || 0}/{box.capacite_max || 0}
                </span>
                <span className="text-slate-400">documents</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Info size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400">Box introuvable</p>
          </div>
        )}
      </Dialog>

      {/* Modal de consultation du document */}
      {showDocumentModal && selectedDocument && (
        <DocumentDetails
          visible={showDocumentModal}
          onHide={handleCloseDocumentModal}
          doc={selectedDocument}
          onRefresh={handleDocumentUpdate}
        />
      )}

      {/* Modal de modification du document */}
      {showEditModal && editingDocument && (
        <DocumentForm
          visible={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingDocument(null);
          }}
          onSubmit={handleUpdateDocument}
          refresh={loadData}
          documentType={documentTypes}
          selectedTypeId={editingDocument.type_document_id}
          editingDoc={editingDocument}
        />
      )}
    </>
  );
}