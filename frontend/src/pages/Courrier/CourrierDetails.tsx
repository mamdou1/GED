import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { differenceInDays, parseISO } from "date-fns";
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
  RefreshCw,
  Briefcase,
} from "lucide-react";

interface CourrierDetailsProps {
  visible: boolean;
  onHide: () => void;
  courrier: any;
}

const CourrierDetails: React.FC<CourrierDetailsProps> = ({
  visible,
  onHide,
  courrier,
}) => {
  if (!courrier) return null;

  const getStatutSeverity = (statut: string) => {
    const s = (statut || "").toUpperCase();
    if (s.includes("TRAITE")) return "success";
    if (s.includes("EN_COURS") || s.includes("ATTRIBUÉ")) return "warning";
    if (s.includes("REJETÉ")) return "danger";
    return "info";
  };

  const delaiInfo = (() => {
    if (!courrier.date_limite_traitement) return null;
    const limite = parseISO(courrier.date_limite_traitement);
    const diff = differenceInDays(limite, new Date());
    if (diff < 0)
      return {
        text: `Retard de ${Math.abs(diff)}j`,
        severity: "danger" as const,
      };
    if (diff <= 2)
      return {
        text: `${diff} jour${diff > 1 ? "s" : ""}`,
        severity: "warning" as const,
      };
    return {
      text: `${diff} jour${diff > 1 ? "s" : ""}`,
      severity: "success" as const,
    };
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

  // ✅ Fonction pour obtenir le nom d'affichage de l'expéditeur
  const getExpediteurDisplayName = (): string => {
    const details = courrier.expediteur_details;
    if (!details) return courrier.expediteur || "Non spécifié";

    // ✅ Si type PERSONNE → prénom + nom
    if (details.type === "PERSONNE") {
      const parts = [details.prenom, details.nom].filter(Boolean);
      return parts.length > 0 ? parts.join(" ") : "Non spécifié";
    }

    // ✅ Si type STRUCTURE → raison_sociale
    if (details.type === "STRUCTURE") {
      return details.raison_sociale || "Non spécifié";
    }

    // Fallback
    return (
      details.raison_sociale ||
      details.nom ||
      courrier.expediteur ||
      "Non spécifié"
    );
  };

  // ✅ Fonction pour obtenir le type d'expéditeur avec icône
  const getExpediteurType = () => {
    const details = courrier.expediteur_details;
    if (!details) return null;

    if (details.type === "PERSONNE") {
      return {
        label: "Personne",
        icon: <User size={14} className="text-blue-500" />,
        severity: "info" as const,
      };
    }
    if (details.type === "STRUCTURE") {
      return {
        label: "Structure",
        icon: <Building2 size={14} className="text-purple-500" />,
        severity: "success" as const,
      };
    }
    return null;
  };

  const expediteurType = getExpediteurType();

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
      style={{ width: "920px", maxHeight: "90vh" }}
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
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Délai</div>
              <Tag
                value={delaiInfo.text}
                severity={delaiInfo.severity}
                className="mt-1"
              />
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
              {/* ✅ Affichage du nom selon le type */}
              <div className="flex items-center gap-2 mb-1">
                <p className="text-slate-700 font-bold text-lg">
                  {getExpediteurDisplayName()}
                </p>
                {expediteurType && (
                  <Tag
                    value={expediteurType.label}
                    severity={expediteurType.severity}
                    className="text-xs"
                  />
                )}
              </div>
              {/* Contact */}
              {courrier.expediteur_details && (
                <div className="space-y-1 mt-3 text-xs text-slate-500">
                  {courrier.expediteur_details.email && (
                    <p className="flex items-center gap-1">
                      ✉️ {courrier.expediteur_details.email}
                    </p>
                  )}
                  {courrier.expediteur_details.telephone && (
                    <p className="flex items-center gap-1">
                      📞 {courrier.expediteur_details.telephone}
                    </p>
                  )}
                  {courrier.expediteur_details.adresse && (
                    <p className="flex items-center gap-1">
                      📍 {courrier.expediteur_details.adresse}
                    </p>
                  )}
                </div>
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
              <Info size={14} className="text-emerald-500" /> Contenu / Message
            </label>
            <div className="p-5 bg-white border border-slate-200 rounded-xl prose text-sm max-h-64 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: courrier.corps }} />
            </div>
          </div>
        )}
        {/* ==================== TRACABILITÉ COMPLÈTE ==================== */}
        <div className="mt-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
            <History size={14} className="text-emerald-500" /> Traçabilité
            complète
          </label>

          <div className="space-y-4">
            {/* Audit (toutes les actions) */}
            {courrier.audit && courrier.audit.length > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Activity size={14} className="text-emerald-600" />
                    Journal des actions ({courrier.audit.length})
                  </h4>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {courrier.audit.map((audit: any, index: number) => (
                    <div key={index} className="p-3 hover:bg-white transition">
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
                            <Building2 size={14} className="text-purple-600" />
                          )}
                          {audit.action === "TRAITEMENT" && (
                            <CheckCircle size={14} className="text-teal-600" />
                          )}
                          {audit.action === "TRANSFERT" && (
                            <RefreshCw size={14} className="text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <span className="text-sm font-semibold text-slate-700">
                              {audit.action}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(audit.createdAt).toLocaleString()}
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
            )}

            {/* Historique des attributions */}
            {courrier.attributions && courrier.attributions.length > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserPlus size={14} className="text-blue-600" />
                    Historique des attributions ({courrier.attributions.length})
                  </h4>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {courrier.attributions.map((attrib: any, index: number) => (
                    <div key={index} className="p-3 hover:bg-white transition">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          Attribué à: {attrib.attribue_a_agent?.nom}{" "}
                          {attrib.attribue_a_agent?.prenom}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(attrib.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {attrib.date_limite_traitement && (
                        <p className="text-xs text-slate-500 mt-1">
                          ⏰ Date limite:{" "}
                          {new Date(
                            attrib.date_limite_traitement,
                          ).toLocaleString()}
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
                  ))}
                </div>
              </div>
            )}

            {/* Historique des traitements */}
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
                              {new Date(traitement.createdAt).toLocaleString()}
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
              (!courrier.attributions || courrier.attributions.length === 0) &&
              (!courrier.historique_traitements ||
                courrier.historique_traitements.length === 0) && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aucune trace d'activité pour ce courrier
                </div>
              )}
          </div>
        </div>

        {/* Pièces jointes */}
        {courrier.pieces_jointes && courrier.pieces_jointes.length > 0 && (
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Upload size={14} className="text-emerald-500" /> Pièces jointes (
              {courrier.pieces_jointes.length})
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courrier.pieces_jointes.map((pj: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 hover:bg-white transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      📄
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[220px]">
                        {pj.nom_fichier}
                      </p>
                      <p className="text-xs text-slate-400">Pièce jointe</p>
                    </div>
                  </div>
                  <Button
                    icon="pi pi-download"
                    className="p-button-text p-button-rounded"
                    onClick={() => window.open(pj.fichier_url, "_blank")}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default CourrierDetails;
