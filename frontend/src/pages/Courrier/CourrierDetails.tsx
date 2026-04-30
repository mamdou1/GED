import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../../api/axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { differenceInDays, parseISO, isAfter } from "date-fns";
import {
  FileText,
  Clock,
  User,
  Send,
  X,
  Upload,
  Info,
  History,
  Activity,
  FilePlus,
  CheckCircle,
  XCircle,
  UserPlus,
  Building2,
  Eye,
  AlertCircle,
  Trash2,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  usePiecesJointes,
  useAddPiecesJointes,
  useDeletePieceJointe,
  useDownloadPieceJointe,
} from "../../hooks/useCourriers";
import { toast } from "react-hot-toast";

interface CourrierDetailsProps {
  visible: boolean;
  onHide: () => void;
  courrier: any;
  onRefresh?: () => void;
}

const CourrierDetails: React.FC<CourrierDetailsProps> = ({
  visible,
  onHide,
  courrier,
  onRefresh,
}) => {
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Hooks pour les pièces jointes
  const {
    data: piecesJointes = [],
    refetch: refetchPieces,
    isLoading: loadingFiles,
  } = usePiecesJointes(courrier?.idcourrier);
  const addPiecesMutation = useAddPiecesJointes();
  const deletePieceMutation = useDeletePieceJointe();
  const downloadPieceMutation = useDownloadPieceJointe();

  // Recharger les pièces jointes quand le modal s'ouvre
  useEffect(() => {
    if (visible && courrier?.id) {
      refetchPieces();
    }
  }, [visible, courrier?.id, refetchPieces]);

  if (!courrier) return null;

  const getStatutSeverity = (statut: string) => {
    const s = (statut || "").toUpperCase();
    if (s.includes("TRAITE")) return "success";
    if (s.includes("EN_COURS") || s.includes("ATTRIBUÉ")) return "warning";
    if (s.includes("REJETÉ")) return "danger";
    return "info";
  };

  // ✅ Fonction pour vérifier si un traitement est en retard
  const isTraitementEnRetard = (
    dateLimite: string,
    dateTraitement?: string,
  ) => {
    if (!dateLimite) return false;

    const limite = parseISO(dateLimite);
    const traitement = dateTraitement ? parseISO(dateTraitement) : new Date();

    if (!dateTraitement && isAfter(new Date(), limite)) return true;
    return isAfter(traitement, limite);
  };

  // ✅ Fonction pour obtenir les informations de délai pour un attributaire spécifique
  const getDelaiForAttribution = (attribution: any) => {
    if (!attribution.date_limite_traitement) return null;

    const limite = parseISO(attribution.date_limite_traitement);
    const dateTraitement =
      attribution.date_traitement_effectif || courrier.date_traitement;
    const estTraite =
      attribution.est_traite ||
      (dateTraitement && !isAfter(parseISO(dateTraitement), limite));

    const maintenant = new Date();
    const diff = differenceInDays(limite, maintenant);

    if (estTraite && dateTraitement) {
      const traitementDate = parseISO(dateTraitement);
      if (isAfter(traitementDate, limite)) {
        const retard = differenceInDays(traitementDate, limite);
        return {
          text: `Traitement en retard de ${retard}j`,
          severity: "danger" as const,
          isLate: true,
        };
      }
      return {
        text: "Traité dans les délais",
        severity: "success" as const,
        isLate: false,
      };
    }

    if (diff < 0) {
      return {
        text: `En retard de ${Math.abs(diff)}j`,
        severity: "danger" as const,
        isLate: true,
      };
    }
    if (diff <= 2) {
      return {
        text: `${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`,
        severity: "warning" as const,
        isLate: false,
      };
    }
    return {
      text: `${diff} jours restants`,
      severity: "success" as const,
      isLate: false,
    };
  };

  // ✅ Délai global du courrier
  const delaiInfo = (() => {
    if (courrier.date_limite_traitement) {
      const limite = parseISO(courrier.date_limite_traitement);
      const diff = differenceInDays(limite, new Date());
      const isLate = isTraitementEnRetard(
        courrier.date_limite_traitement,
        courrier.date_traitement,
      );

      if (isLate)
        return {
          text: `🔴 En retard de ${Math.abs(diff)}j`,
          severity: "danger" as const,
          isLate: true,
        };
      if (diff < 0)
        return {
          text: `⚠️ Délai dépassé (${Math.abs(diff)}j)`,
          severity: "danger" as const,
          isLate: true,
        };
      if (diff <= 2)
        return {
          text: `⏰ ${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`,
          severity: "warning" as const,
          isLate: false,
        };
      return {
        text: `✅ ${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`,
        severity: "success" as const,
        isLate: false,
      };
    }

    const attributionActive = courrier.attributions?.find(
      (a: any) => a.est_active !== false,
    );
    if (attributionActive?.date_limite_traitement) {
      const limite = parseISO(attributionActive.date_limite_traitement);
      const diff = differenceInDays(limite, new Date());
      const isLate = isTraitementEnRetard(
        attributionActive.date_limite_traitement,
        attributionActive.date_traitement_effectif,
      );

      if (isLate)
        return {
          text: `🔴 En retard de ${Math.abs(diff)}j`,
          severity: "danger" as const,
          isLate: true,
        };
      if (diff < 0)
        return {
          text: `⚠️ Délai dépassé (${Math.abs(diff)}j)`,
          severity: "danger" as const,
          isLate: true,
        };
      if (diff <= 2)
        return {
          text: `⏰ ${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`,
          severity: "warning" as const,
          isLate: false,
        };
      return {
        text: `✅ ${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`,
        severity: "success" as const,
        isLate: false,
      };
    }

    return null;
  })();

  const formatDate = (date: string) => {
    if (!date) return "Non définie";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Upload de fichiers
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      await addPiecesMutation.mutateAsync({
        id: courrier.idcourrier || courrier.id,
        files: Array.from(files),
      });
      toast.success(`${files.length} fichier(s) uploadé(s) avec succès`);
      await refetchPieces();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Erreur upload:", error);
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // ✅ Confirmation et suppression d'un fichier
  const confirmDeleteFile = (fileId: number, fileName: string) => {
    confirmDialog({
      message: `Voulez-vous vraiment supprimer le fichier "${fileName}" ?`,
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Oui, supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deletePieceMutation.mutateAsync({
            courrierId: courrier.idcourrier || courrier.id,
            fileId: fileId,
          });
          toast.success("Fichier supprimé avec succès");
          await refetchPieces();
          if (onRefresh) onRefresh();
        } catch (error: any) {
          console.error("Erreur suppression:", error);
          toast.error(error.message || "Erreur lors de la suppression");
        }
      },
    });
  };

  // ✅ Téléchargement d'un fichier
  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      await downloadPieceMutation.mutateAsync({ fileId, fileName });
    } catch (error: any) {
      console.error("Erreur téléchargement:", error);
      toast.error(error.message || "Erreur lors du téléchargement");
    }
  };

  // ✅ Aperçu du fichier
  const openFilePreview = async (pj: any) => {
    const isImage =
      pj.type_fichier?.startsWith("image/") ||
      pj.nom_fichier?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
    const isPDF =
      pj.type_fichier === "application/pdf" || pj.nom_fichier?.endsWith(".pdf");

    if (isImage || isPDF) {
      const url = pj.fichier_url?.startsWith("http")
        ? pj.fichier_url
        : `${BACKEND_URL}${pj.fichier_url}`;
      setPreviewFile({
        url,
        name: pj.nom_fichier,
        type: isImage ? "image" : "pdf",
      });
    } else {
      await handleDownloadFile(pj.idpiece_jointe, pj.nom_fichier);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
      <Button
        label="Fermer"
        icon={<X size={18} className="mr-2" />}
        onClick={onHide}
        className="p-button-text text-slate-400 font-bold hover:text-slate-600"
      />
    </div>
  );

  return (
    <>
      <ConfirmDialog />

      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FileText size={18} className="text-emerald-600" />
            </div>
            <span>Détails du courrier</span>
          </div>
        }
        visible={visible}
        style={{ width: "950px", maxHeight: "90vh" }}
        onHide={onHide}
        draggable={false}
        className="rounded-[2.5rem] overflow-hidden shadow-2xl"
        footer={footer}
      >
        <div className="pt-4 space-y-6 max-h-[80vh] overflow-y-auto px-1">
          {/* En-tête rapide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Type</div>
              <Tag
                value={courrier.type === "ARRIVE" ? "Arrivé" : "Départ"}
                severity={courrier.type === "ARRIVE" ? "success" : "info"}
                className="mt-1"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Statut</div>
              <Tag
                value={courrier.statut || "En attente"}
                severity={getStatutSeverity(courrier.statut)}
                className="mt-1"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Référence</div>
              <div className="font-mono font-bold text-emerald-700 text-sm mt-1">
                {courrier.reference}
              </div>
            </div>

            {delaiInfo && (
              <div
                className={`bg-white border rounded-xl p-4 ${
                  delaiInfo.isLate
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200"
                }`}
              >
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} />
                  Date limite / Délai
                </div>
                <div className="mt-1">
                  <Tag
                    value={delaiInfo.text}
                    severity={delaiInfo.severity}
                    className="font-medium"
                  />
                </div>
                {courrier.date_limite_traitement && (
                  <div className="text-xs text-slate-500 mt-2">
                    À traiter avant le:{" "}
                    {formatDate(courrier.date_limite_traitement)}
                  </div>
                )}
              </div>
            )}
          </div>

          <Divider />

          {/* Informations sur l'expéditeur/destinataire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courrier.type === "ARRIVE" ? (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <User size={14} className="text-emerald-500" /> Expéditeur
                </label>
                <p className="text-slate-700 font-medium">
                  {courrier.expediteur_details?.nom ||
                    courrier.expediteur ||
                    "Non spécifié"}
                </p>
                {courrier.expediteur_details?.adresse && (
                  <p className="text-xs text-slate-500 mt-1">
                    {courrier.expediteur_details.adresse}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Send size={14} className="text-emerald-500" /> Destinataire
                </label>
                <p className="text-slate-700 font-medium">
                  {courrier.destinataire_externe?.nom ||
                    courrier.destinataire ||
                    "Non spécifié"}
                </p>
                {courrier.destinataire_externe?.adresse && (
                  <p className="text-xs text-slate-500 mt-1">
                    {courrier.destinataire_externe.adresse}
                  </p>
                )}
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Clock size={14} className="text-emerald-500" /> Dates
              </label>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-500">Création:</span>{" "}
                  {formatDate(courrier.date_creation)}
                </p>
                <p>
                  <span className="text-slate-500">Réception:</span>{" "}
                  {formatDate(courrier.date_reception)}
                </p>
                {courrier.date_attribution && (
                  <p>
                    <span className="text-slate-500">Attribution:</span>{" "}
                    {formatDate(courrier.date_attribution)}
                  </p>
                )}
                {courrier.date_traitement && (
                  <p>
                    <span className="text-slate-500">Traitement:</span>{" "}
                    {formatDate(courrier.date_traitement)}
                  </p>
                )}
                {courrier.date_limite_traitement && (
                  <p
                    className={`font-medium ${isTraitementEnRetard(courrier.date_limite_traitement, courrier.date_traitement) ? "text-red-600" : "text-amber-600"}`}
                  >
                    <span className="text-slate-500">📅 Date limite:</span>{" "}
                    {formatDate(courrier.date_limite_traitement)}
                    {isTraitementEnRetard(
                      courrier.date_limite_traitement,
                      courrier.date_traitement,
                    ) && (
                      <span className="ml-2 text-red-600 text-xs font-bold">
                        ⚠️ RETARD
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Objet */}
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <FileText size={14} className="text-emerald-500" /> Objet
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
              {courrier.objet}
            </div>
          </div>

          {/* Corps */}
          {courrier.corps && (
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Info size={14} className="text-emerald-500" /> Contenu /
                Message
              </label>
              <div className="p-5 bg-white border border-slate-200 rounded-xl prose text-sm max-h-64 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: courrier.corps }} />
              </div>
            </div>
          )}

          {/* ==================== PIÈCES JOINTES ==================== */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Upload size={14} className="text-emerald-500" />
                Pièces jointes ({piecesJointes.length})
              </label>

              <div className="relative">
                <Button
                  label={
                    uploading ? "Upload en cours..." : "Ajouter des fichiers"
                  }
                  icon={
                    uploading ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Upload size={16} className="mr-2" />
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 px-4"
                  disabled={uploading}
                  onClick={() =>
                    document.getElementById("file-upload-input")?.click()
                  }
                />
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                />
              </div>
            </div>

            {loadingFiles ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
              </div>
            ) : piecesJointes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {piecesJointes.map((pj: any) => {
                  const isImage =
                    pj.type_fichier?.startsWith("image/") ||
                    pj.nom_fichier?.match(
                      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i,
                    );
                  const isPDF =
                    pj.type_fichier === "application/pdf" ||
                    pj.nom_fichier?.endsWith(".pdf");

                  return (
                    <div
                      key={pj.idpiece_jointe}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 hover:bg-white transition group"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => openFilePreview(pj)}
                      >
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          {isImage ? "🖼️" : isPDF ? "📑" : "📄"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate max-w-[180px]">
                            {pj.nom_fichier}
                          </p>
                          <p className="text-xs text-slate-400">
                            {pj.date_ajout
                              ? new Date(pj.date_ajout).toLocaleDateString(
                                  "fr-FR",
                                )
                              : "Date inconnue"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {(isImage || isPDF) && (
                          <Button
                            icon={<Eye size={16} />}
                            className="p-button-text p-button-rounded text-slate-500 hover:text-emerald-600"
                            onClick={() => openFilePreview(pj)}
                            title="Aperçu"
                          />
                        )}
                        <Button
                          icon={<Download size={16} />}
                          className="p-button-text p-button-rounded text-slate-500 hover:text-emerald-600"
                          onClick={() =>
                            handleDownloadFile(
                              pj.idpiece_jointe,
                              pj.nom_fichier,
                            )
                          }
                          title="Télécharger"
                        />
                        <Button
                          icon={<Trash2 size={16} />}
                          className="p-button-text p-button-rounded text-red-500 hover:text-red-700"
                          onClick={() =>
                            confirmDeleteFile(pj.idpiece_jointe, pj.nom_fichier)
                          }
                          title="Supprimer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">Aucune pièce jointe</p>
                <p className="text-slate-300 text-xs mt-1">
                  Cliquez sur "Ajouter des fichiers" pour en ajouter
                </p>
              </div>
            )}
          </div>

          {/* ==================== TRACABILITÉ COMPLÈTE ==================== */}
          <div className="mt-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <History size={14} className="text-emerald-500" /> Traçabilité
              complète
            </label>

            <div className="space-y-4">
              {/* Audit */}
              {/* {courrier.audit && courrier.audit.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Activity size={14} className="text-emerald-600" />
                      Journal des actions ({courrier.audit.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {courrier.audit.map((audit: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-white transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {audit.action === "CREATION" && (
                              <FilePlus size={14} className="text-green-600" />
                            )}
                            {audit.action === "VALIDATION" && (
                              <CheckCircle
                                size={14}
                                className="text-emerald-600"
                              />
                            )}
                            {audit.action === "REJET" && (
                              <XCircle size={14} className="text-red-600" />
                            )}
                            {audit.action === "ATTRIBUTION" && (
                              <UserPlus size={14} className="text-blue-600" />
                            )}
                            {audit.action === "ATTRIBUTION_ENTITE" && (
                              <Building2
                                size={14}
                                className="text-purple-600"
                              />
                            )}
                            {audit.action === "TRAITEMENT" && (
                              <CheckCircle
                                size={14}
                                className="text-teal-600"
                              />
                            )}
                            {audit.action === "TRANSFERT" && (
                              <RefreshCw
                                size={14}
                                className="text-orange-600"
                              />
                            )}
                            {audit.action === "AJOUT_PIECE_JOINTE" && (
                              <Upload size={14} className="text-emerald-600" />
                            )}
                            {audit.action === "SUPPRESSION_PIECE_JOINTE" && (
                              <Trash2 size={14} className="text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <span className="text-sm font-semibold text-slate-700">
                                {audit.action}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(
                                  audit.createdAt || audit.created_at,
                                ).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {audit.details}
                            </p>
                            {audit.agent && (
                              <p className="text-xs text-slate-400 mt-1">
                                Par: {audit.agent.nom} {audit.agent.prenom}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Attributions */}
              {courrier.attributions && courrier.attributions.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <UserPlus size={14} className="text-blue-600" />
                      Historique des attributions (
                      {courrier.attributions.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {courrier.attributions.map((attrib: any, index: number) => {
                      const delaiAttrib = getDelaiForAttribution(attrib);
                      return (
                        <div
                          key={index}
                          className="p-3 hover:bg-white transition"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <span className="text-sm font-medium text-slate-700">
                              Attribué à: {attrib.attribue_a?.nom}{" "}
                              {attrib.attribue_a?.prenom || ""}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(attrib.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {attrib.date_limite_traitement && (
                            <div
                              className={`mt-2 p-2 rounded-lg ${
                                delaiAttrib?.isLate
                                  ? "bg-red-50 border border-red-200"
                                  : "bg-white border border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-center flex-wrap gap-2">
                                <span className="text-xs font-medium text-slate-600">
                                  ⏰ Date limite:{" "}
                                  {formatDate(attrib.date_limite_traitement)}
                                </span>
                                {delaiAttrib && (
                                  <Tag
                                    value={delaiAttrib.text}
                                    severity={delaiAttrib.severity}
                                    className="text-xs"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {attrib.date_traitement_effectif && (
                            <p className="text-xs text-slate-500 mt-2">
                              ✅ Traité le:{" "}
                              {formatDate(attrib.date_traitement_effectif)}
                            </p>
                          )}

                          {attrib.instructions_copiees && (
                            <p className="text-xs text-slate-500 mt-1">
                              📝 Instructions: {attrib.instructions_copiees}
                            </p>
                          )}
                          {attrib.commentaire && (
                            <p className="text-xs text-slate-400 mt-1">
                              💬 Commentaire: {attrib.commentaire}
                            </p>
                          )}
                          {attrib.attribue_par && (
                            <p className="text-xs text-slate-400 mt-1">
                              Attribué par: {attrib.attribue_par.nom}{" "}
                              {attrib.attribue_par.prenom}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Traitements */}
              {courrier.historique_traitements &&
                courrier.historique_traitements.length > 0 && (
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle size={14} className="text-teal-600" />
                        Historique des traitements (
                        {courrier.historique_traitements.length})
                      </h4>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {courrier.historique_traitements.map(
                        (traitement: any, index: number) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-white transition"
                          >
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                {traitement.action}{" "}
                                {traitement.nouveau_statut &&
                                  `→ ${traitement.nouveau_statut}`}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(
                                  traitement.createdAt,
                                ).toLocaleString()}
                              </span>
                            </div>
                            {traitement.motif && (
                              <p className="text-xs text-slate-500 mt-1">
                                📝 {traitement.motif}
                              </p>
                            )}
                            {traitement.agent && (
                              <p className="text-xs text-slate-400 mt-1">
                                Par: {traitement.agent.nom}{" "}
                                {traitement.agent.prenom}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {(!courrier.audit || courrier.audit.length === 0) &&
                (!courrier.attributions ||
                  courrier.attributions.length === 0) &&
                (!courrier.historique_traitements ||
                  courrier.historique_traitements.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Aucune trace d'activité pour ce courrier
                  </div>
                )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal d'aperçu des fichiers */}
      <Dialog
        visible={!!previewFile}
        onHide={() => setPreviewFile(null)}
        header={
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              {previewFile?.type === "image" ? "🖼️" : "📑"}
            </div>
            <span className="text-slate-800 font-bold truncate max-w-[400px]">
              {previewFile?.name || "Aperçu"}
            </span>
          </div>
        }
        style={{ width: "80vw", maxWidth: "900px" }}
        className="rounded-2xl overflow-hidden"
        footer={
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              label="Télécharger"
              icon={<Download size={16} className="mr-2" />}
              onClick={() => {
                if (previewFile) {
                  const link = document.createElement("a");
                  link.href = previewFile.url;
                  link.download = previewFile.name;
                  link.click();
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            />
            <Button
              label="Fermer"
              icon={<X size={16} className="mr-2" />}
              onClick={() => setPreviewFile(null)}
              className="p-button-text"
            />
          </div>
        }
      >
        <div className="p-4">
          {previewFile?.type === "image" && (
            <img
              src={previewFile.url}
              alt="Aperçu"
              className="w-full h-auto rounded-xl max-h-[70vh] object-contain"
            />
          )}
          {previewFile?.type === "pdf" && (
            <iframe
              src={previewFile.url}
              className="w-full h-[70vh] rounded-xl"
              title="PDF Viewer"
            />
          )}
        </div>
      </Dialog>
    </>
  );
};

export default CourrierDetails;
