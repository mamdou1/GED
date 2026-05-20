import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { differenceInDays, parseISO, isAfter } from "date-fns";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {
  FileText,
  Clock,
  User,
  Send,
  X,
  Upload,
  Info,
  History,
  CheckCircle,
  UserPlus,
  Eye,
  Trash2,
  Loader2,
  Hash,
  Download,
  Calendar,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import {
  usePiecesJointes,
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

  const courrierId = courrier?.idcourrier || courrier?.id;

  const {
    data: piecesJointes = [],
    refetch: refetchPieces,
    isLoading: loadingFiles,
  } = usePiecesJointes(courrierId);
  const deletePieceMutation = useDeletePieceJointe();
  const downloadPieceMutation = useDownloadPieceJointe();

  useEffect(() => {
    if (visible && courrierId) {
      refetchPieces();
    }
  }, [visible, courrierId, refetchPieces]);

  if (!courrier) return null;

  console.log("📦 Courrier reçu:", courrier);

  const getStatutSeverity = (statut: string) => {
    const s = (statut || "").toUpperCase();
    if (s.includes("TRAITE")) return "success";
    if (s.includes("EN_COURS") || s.includes("ATTRIBUE")) return "warning";
    if (s.includes("REJETE")) return "danger";
    return "info";
  };

  const isTraitementEnRetard = (
    dateLimite: string,
    dateTraitement?: string,
  ) => {
    if (!dateLimite) return false;
    const limite = parseISO(dateLimite);
    const traitement = dateTraitement ? parseISO(dateTraitement) : new Date();
    return isAfter(traitement, limite);
  };

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
          text: `En retard de ${retard}j`,
          severity: "danger" as const,
          isLate: true,
        };
      }
      return {
        text: "Dans les délais",
        severity: "success" as const,
        isLate: false,
      };
    }

    if (diff < 0)
      return {
        text: `En retard de ${Math.abs(diff)}j`,
        severity: "danger" as const,
        isLate: true,
      };
    if (diff <= 2)
      return {
        text: `${diff}j restant(s)`,
        severity: "warning" as const,
        isLate: false,
      };
    return {
      text: `${diff}j restants`,
      severity: "success" as const,
      isLate: false,
    };
  };

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
          text: `En retard de ${Math.abs(diff)}j`,
          severity: "danger" as const,
          isLate: true,
          icon: <AlertTriangle size={14} />,
        };
      if (diff < 0)
        return {
          text: `Délai dépassé (${Math.abs(diff)}j)`,
          severity: "danger" as const,
          isLate: true,
          icon: <AlertTriangle size={14} />,
        };
      if (diff <= 2)
        return {
          text: `${diff}j restant(s)`,
          severity: "warning" as const,
          isLate: false,
          icon: <Clock size={14} />,
        };
      return {
        text: `${diff}j restants`,
        severity: "success" as const,
        isLate: false,
        icon: <CheckCircle size={14} />,
      };
    }
    return null;
  })();

  const formatDate = (date: string, includeTime = true) => {
    if (!date) return "Non définie";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const confirmDeleteFile = (fileId: number, fileName: string) => {
    confirmDialog({
      message: `Voulez-vous vraiment supprimer le fichier "${fileName}" ?`,
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-sm",
      rejectClassName: "p-button-text p-button-secondary p-button-sm",
      accept: async () => {
        try {
          await deletePieceMutation.mutateAsync({ courrierId, fileId });
          toast.success("Fichier supprimé avec succès");
          await refetchPieces();
          if (onRefresh) onRefresh();
        } catch (error: any) {
          toast.error(error.message || "Erreur lors de la suppression");
        }
      },
    });
  };

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      await downloadPieceMutation.mutateAsync({ fileId, fileName });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du téléchargement");
    }
  };

  const openFilePreview = async (pj: any) => {
    const isImage =
      pj.type_fichier?.startsWith("image/") ||
      pj.nom_fichier?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPDF =
      pj.type_fichier === "application/pdf" || pj.nom_fichier?.endsWith(".pdf");

    if (isImage || isPDF) {
      const url = pj.fichier_url?.startsWith("http")
        ? pj.fichier_url
        : `http://localhost:5001${pj.fichier_url}`;
      setPreviewFile({
        url,
        name: pj.nom_fichier,
        type: isImage ? "image" : "pdf",
      });
    } else {
      await handleDownloadFile(pj.idpiece_jointe, pj.nom_fichier);
    }
  };

  const getExpediteurNom = () =>
    courrier.expediteur_details?.nom || courrier.expediteur || "Non spécifié";
  const getExpediteurAdresse = () =>
    courrier.expediteur_details?.adresse || null;
  const getDestinataireNom = () =>
    courrier.destinataire_externe?.nom ||
    courrier.destinataire ||
    "Non spécifié";
  const getDestinataireAdresse = () =>
    courrier.destinataire_externe?.adresse || null;

  return (
    <>
      <ConfirmDialog />

      <Dialog
        header={
          <div className="flex items-center gap-3 text-slate-800 font-bold p-3">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <FileText size={22} className="text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                Détails du Courrier
              </span>
              <span className="text-sm font-mono text-slate-500 font-normal mt-0.5">
                Référence: {courrier.reference || courrierId}
              </span>
            </div>
          </div>
        }
        visible={visible}
        style={{ width: "1150px" }}
        onHide={onHide}
        draggable={false}
        className="rounded-2xl overflow-hidden shadow-2xl border border-slate-100"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-white border-t border-slate-100">
            <Button
              label="Fermer"
              icon={<X size={18} className="mr-2" />}
              onClick={onHide}
              className="p-button-outlined p-button-secondary font-semibold text-base px-5 py-2.5 hover:bg-slate-100 transition-colors"
            />
          </div>
        }
        contentClassName="p-0 bg-white"
        maximizable={false}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 h-[calc(85vh-130px)] overflow-hidden">
          {/* ================= PANNEAU PRINCIPAL GAUCHE (2/3) ================= */}
          <div className="lg:col-span-2 p-6 overflow-y-auto space-y-6 bg-white">
            {/* Badges d'état rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Type
                </span>
                <Tag
                  value={courrier.type === "ARRIVE" ? "Arrivé" : "Départ"}
                  severity={courrier.type === "ARRIVE" ? "success" : "info"}
                  className="w-max text-sm px-3 py-1 rounded-lg font-bold"
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Statut
                </span>
                <Tag
                  value={courrier.statut || "En attente"}
                  severity={getStatutSeverity(courrier.statut)}
                  className="w-max text-sm px-3 py-1 rounded-lg font-bold"
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Hash size={14} /> Référence
                </span>
                <div className="font-mono font-bold text-slate-800 text-base truncate">
                  {courrier.reference || "N/A"}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Hash size={14} /> N° Courrier
                </span>
                <div className="font-mono font-bold text-emerald-700 text-base truncate">
                  {courrier.numero_courrier || "Non défini"}
                </div>
              </div>
            </div>

            {/* Acteurs & Dates Clés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Acteur (Expéditeur ou Destinataire) */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                {courrier.type === "ARRIVE" ? (
                  <>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <User size={16} className="text-emerald-600" /> Expéditeur
                    </span>
                    <p className="text-slate-800 font-semibold text-base">
                      {getExpediteurNom()}
                    </p>
                    {getExpediteurAdresse() && (
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        {getExpediteurAdresse()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Send size={16} className="text-emerald-600" />{" "}
                      Destinataire
                    </span>
                    <p className="text-slate-800 font-semibold text-base">
                      {getDestinataireNom()}
                    </p>
                    {getDestinataireAdresse() && (
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        {getDestinataireAdresse()}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Dates Principales */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-emerald-600" /> Dates Clés
                </span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Création</span>
                    <span className="text-slate-800 font-semibold">
                      {formatDate(courrier.date_creation, false)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Réception</span>
                    <span className="text-slate-800 font-semibold">
                      {formatDate(courrier.date_reception, false)}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 mt-1">
                    <span className="text-slate-500">Enregistrement : </span>
                    <span className="text-emerald-700 font-bold font-mono">
                      {formatDate(courrier.date_enregistrement)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Objet du courrier */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Info size={16} className="text-emerald-600" /> Objet du
                Courrier
              </span>
              <div className="text-slate-800 font-semibold text-base leading-relaxed">
                {courrier.objet}
              </div>
            </div>

            {/* Contenu / Corps */}
            {courrier.corps && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-emerald-600" /> Contenu /
                  Message
                </span>
                <div className="p-5 bg-white rounded-xl border border-slate-100 max-h-80 overflow-y-auto text-sm text-slate-700 prose prose-slate max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: courrier.corps }} />
                </div>
              </div>
            )}
          </div>

          {/* ================= PANNEAU SECONDAIRE DROIT (1/3) ================= */}
          <div className="p-6 bg-white overflow-y-auto space-y-6">
            {/* Bloc Délais d'alerte globale */}
            {delaiInfo && (
              <div
                className={`p-5 rounded-xl border ${
                  delaiInfo.isLate
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block mb-3 opacity-80">
                  ⚠️ Alerte de traitement
                </span>
                <div className="flex items-center gap-2 font-bold text-base">
                  <Tag
                    severity={delaiInfo.severity}
                    value={delaiInfo.text}
                    icon={delaiInfo.icon}
                    className="px-3 py-1.5 rounded-lg text-sm"
                  />
                </div>
                {courrier.date_limite_traitement && (
                  <span className="text-sm text-slate-600 block mt-3 font-medium">
                    📅 Échéance finale :{" "}
                    {formatDate(courrier.date_limite_traitement, false)}
                  </span>
                )}
              </div>
            )}

            {/* Pièces jointes */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Paperclip size={16} className="text-emerald-600" /> Pièces
                Jointes ({piecesJointes.length})
              </span>

              {loadingFiles ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    size={28}
                    className="animate-spin text-emerald-600"
                  />
                </div>
              ) : piecesJointes.length > 0 ? (
                <div className="space-y-3">
                  {piecesJointes.map((pj: any) => {
                    const isImage =
                      pj.type_fichier?.startsWith("image/") ||
                      pj.nom_fichier?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    const isPDF =
                      pj.type_fichier === "application/pdf" ||
                      pj.nom_fichier?.endsWith(".pdf");

                    return (
                      <div
                        key={pj.idpiece_jointe}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200 group"
                      >
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => openFilePreview(pj)}
                        >
                          <div className="w-10 h-10 shrink-0 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-lg shadow-sm">
                            {isImage ? "🖼️" : isPDF ? "📑" : "📄"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-semibold text-slate-700 truncate"
                              title={pj.nom_fichier}
                            >
                              {pj.nom_fichier}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {pj.date_ajout
                                ? formatDate(pj.date_ajout, false)
                                : "Date inconnue"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                          {(isImage || isPDF) && (
                            <Button
                              icon={<Eye size={16} />}
                              className="p-button-text p-button-rounded p-button-secondary text-slate-500 hover:text-emerald-600 !p-2"
                              onClick={() => openFilePreview(pj)}
                              title="Aperçu"
                            />
                          )}
                          <Button
                            icon={<Download size={16} />}
                            className="p-button-text p-button-rounded p-button-secondary text-slate-500 hover:text-emerald-600 !p-2"
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
                            className="p-button-text p-button-rounded p-button-danger text-slate-500 hover:text-red-600 !p-2"
                            onClick={() =>
                              confirmDeleteFile(
                                pj.idpiece_jointe,
                                pj.nom_fichier,
                              )
                            }
                            title="Supprimer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                  <Paperclip size={32} className="mx-auto mb-2 opacity-40" />
                  Aucun fichier joint
                </div>
              )}
            </div>

            <Divider className="!my-3" />

            {/* Traçabilité / Historique */}
            <div className="space-y-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-emerald-600" /> Flux &
                Traçabilité
              </span>

              {/* Bloc Attributions */}
              {courrier.attributions && courrier.attributions.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-600" />{" "}
                    Attributions ({courrier.attributions.length})
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {courrier.attributions.map((attrib: any, index: number) => {
                      const delaiAttrib = getDelaiForAttribution(attrib);
                      return (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800 text-sm">
                              À : {attrib.attribue_a?.nom}{" "}
                              {attrib.attribue_a?.prenom || ""}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {formatDate(attrib.createdAt)}
                            </span>
                          </div>
                          {attrib.instructions_copiees && (
                            <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100 text-sm mb-2">
                              <span className="font-semibold text-slate-500">
                                Instructions :
                              </span>{" "}
                              {attrib.instructions_copiees}
                            </p>
                          )}
                          {delaiAttrib && (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 mt-2">
                              <span className="text-slate-500 font-mono">
                                ⏰ Limite:{" "}
                                {formatDate(
                                  attrib.date_limite_traitement,
                                  false,
                                )}
                              </span>
                              <Tag
                                value={delaiAttrib.text}
                                severity={delaiAttrib.severity}
                                className="text-[11px] px-2 py-0.5 rounded-md font-semibold"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bloc Traitements Réels */}
              {courrier.historique_traitements &&
                courrier.historique_traitements.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-600" />{" "}
                      Traitements ({courrier.historique_traitements.length})
                    </div>
                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-4 max-h-60 overflow-y-auto pr-2">
                      {courrier.historique_traitements.map(
                        (traitement: any, index: number) => {
                          const agentFullName =
                            `${traitement?.agent?.nom || ""} ${traitement?.agent?.prenom || ""}`.trim();
                          return (
                            <div key={index} className="relative">
                              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />

                              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                                <span>
                                  {formatDate(
                                    traitement.createdAt ||
                                      traitement.date_action,
                                  )}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1 flex-wrap">
                                {traitement.action}
                                {traitement.nouveau_statut && (
                                  <>
                                    <ArrowRight
                                      size={12}
                                      className="text-slate-400"
                                    />{" "}
                                    <span className="text-emerald-700 font-bold">
                                      {traitement.nouveau_statut}
                                    </span>
                                  </>
                                )}
                              </p>
                              {traitement.motif && (
                                <div className="border rounded-xl">
                                  <p className="text-slate-600  text-sm mt-1.5 bg-slate-50 p-2 rounded-lg flex items-start gap-1.5">
                                    <MessageSquare
                                      size={18}
                                      className="mt-0.5 flex-shrink-0 text-emerald-700 font-bold"
                                    />
                                    <span>{traitement.motif}</span>
                                  </p>
                                </div>
                              )}
                              {agentFullName && (
                                <span className="text-xs text-slate-500 block mt-1.5 font-medium">
                                  👤 Par : {agentFullName}
                                </span>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

              {/* Fallback si vide */}
              {(!courrier.attributions || courrier.attributions.length === 0) &&
                (!courrier.historique_traitements ||
                  courrier.historique_traitements.length === 0) && (
                  <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl">
                    <History size={24} className="mx-auto mb-2 opacity-40" />
                    Aucun flux enregistré
                  </div>
                )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal d'aperçu des fichiers */}
      {previewFile && (
        <Dialog
          header={
            <div className="flex items-center gap-2 p-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                {previewFile.type === "image" ? "🖼️" : "📑"}
              </div>
              <span className="font-semibold text-slate-800 truncate max-w-md">
                {previewFile.name}
              </span>
            </div>
          }
          visible={!!previewFile}
          style={{ width: "90vw", maxWidth: "1000px" }}
          onHide={() => setPreviewFile(null)}
          className="rounded-xl overflow-hidden"
          maximizable
        >
          <div className="w-full h-full bg-slate-900 flex items-center justify-center p-3">
            {previewFile.type === "image" ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-full object-contain rounded-lg mt-3"
              />
            ) : (
              <iframe
                src={previewFile.url}
                title={previewFile.name}
                className="w-full h-[75vh] border-0 rounded-lg bg-white"
              />
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CourrierDetails;
