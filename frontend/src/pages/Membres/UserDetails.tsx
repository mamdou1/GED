import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Hash,
  Calendar,
  X,
  Shield,
  Building2,
  Trash2,
  Edit2,
  Lock,
  ArrowRight,
  Building,
  Layers,
  FolderTree,
} from "lucide-react";
import {
  User,
  AgentEntiteeAccess,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} from "../../interfaces";
import person from "../../assets/person-96.png";
import { revokeAccess } from "../../api/agentEntiteeAccess";
import { BACKEND_URL } from "../../api/axios";
import { confirmDialog } from "primereact/confirmdialog";
import { useState, useEffect, useMemo, useRef } from "react";
import { Toast } from "primereact/toast";

type Props = {
  visible: boolean;
  onHide: () => void;
  user: User | null;
  onEditAccess: (access: AgentEntiteeAccess) => void;
  onRefresh: () => void;
};

export default function UserDetails({
  visible,
  onHide,
  user,
  onEditAccess,
  onRefresh,
}: Props) {
  const [expandedGroups, setExpandedGroups] = useState<number[]>([0, 1, 2]); // ✅ Tous dépliés par défaut
  const [accesses, setAccesses] = useState<AgentEntiteeAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // Charger les accès depuis user.agent_access
  useEffect(() => {
    if (user?.agent_access) {
      console.log("🔄 Mise à jour des accès:", user.agent_access.length);
      setAccesses(user.agent_access);
    } else {
      setAccesses([]);
    }
  }, [user]);

  const formatLastActivity = (date?: string) => {
    if (!date) return "Inconnue";

    const now = new Date();
    const last = new Date(date);
    const diffMs = now.getTime() - last.getTime();

    const diffMin = Math.floor(diffMs / 50010);
    const diffHour = Math.floor(diffMs / 3500100);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHour < 24) return `Il y a ${diffHour} h`;
    if (diffDay < 7) return `Il y a ${diffDay} jour(s)`;

    return (
      last.toLocaleDateString("fr-FR") +
      " à " +
      last.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const isOnline = user?.is_on_line === true;

  // ✅ GROUPER PAR NIVEAU (UN, DEUX, TROIS)
  const groupedByNiveau = useMemo(() => {
    const groups = {
      UN: [] as AgentEntiteeAccess[],
      DEUX: [] as AgentEntiteeAccess[],
      TROIS: [] as AgentEntiteeAccess[],
    };

    accesses.forEach((access: AgentEntiteeAccess) => {
      if (access.entitee_un) {
        groups.UN.push(access);
      } else if (access.entitee_deux) {
        groups.DEUX.push(access);
      } else if (access.entitee_trois) {
        groups.TROIS.push(access);
      }
    });

    console.log("📊 Accès par niveau:", {
      UN: groups.UN.length,
      DEUX: groups.DEUX.length,
      TROIS: groups.TROIS.length,
    });

    return groups;
  }, [accesses]);

  // UserDetails.tsx - AJOUTEZ PLUS DE LOGS
  const handleRevoke = async (id: number) => {
    confirmDialog({
      message: `Voulez-vous révoquer définitivement cet accès ? Cette action est irréversible.`,
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
          console.log(`🔄 Tentative de révocation de l'accès #${id}`);

          await revokeAccess(id);

          console.log(`✅ Accès #${id} révoqué, rafraîchissement...`);
          await onRefresh();
        } catch (err: any) {
          console.error(`❌ Erreur lors de la révocation #${id}:`, err);

          // Afficher une notification d'erreur
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail:
              err.response?.data?.message || "Impossible de révoquer l'accès",
            life: 5001,
          });
        }
      },
    });
  };

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-2">
      <div className="mt-1 bg-emerald-50 p-2 rounded-lg text-emerald-500">
        <Icon size={16} />
      </div>
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <p className="text-sm font-semibold text-emerald-900">
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  );

  if (!user) return null;

  const titreN1 =
    groupedByNiveau.UN[0]?.entitee_un?.titre ||
    "Ministères / Directions Générales";
  const titreN2 =
    groupedByNiveau.DEUX[0]?.entitee_deux?.titre || "Directions / Services";
  const titreN3 =
    groupedByNiveau.TROIS[0]?.entitee_trois?.titre ||
    "Divisions / Sous-services";

  const libelleEntitee =
    user.fonction_details?.entitee_trois?.libelle ||
    user.fonction_details?.entitee_deux?.libelle ||
    user.fonction_details?.entitee_un?.libelle ||
    "Aucune affectation";

  // Fonction pour obtenir l'icône selon le niveau
  const getNiveauIcon = (niveau: string) => {
    switch (niveau) {
      case "UN":
        return <Building size={16} className="text-blue-500" />;
      case "DEUX":
        return <FolderTree size={16} className="text-purple-500" />;
      case "TROIS":
        return <Layers size={16} className="text-emerald-500" />;
      default:
        return <Building2 size={16} />;
    }
  };

  // Fonction pour obtenir le libellé du niveau
  const getNiveauLabel = (niveau: string) => {
    switch (niveau) {
      case "UN":
        return "Ministères / Directions Générales";
      case "DEUX":
        return "Directions / Services";
      case "TROIS":
        return "Divisions / Sous-services";
      default:
        return niveau;
    }
  };

  // Configuration des niveaux pour l'affichage
  const niveauConfig = [
    {
      type: "UN" as const,
      label: "Ministères / Directions Générales",
      icon: <Building size={18} />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
      lightBg: "bg-blue-50",
      lightText: "text-blue-500",
    },
    {
      type: "DEUX" as const,
      label: "Directions / Services",
      icon: <FolderTree size={18} />,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      iconColor: "text-purple-600",
      lightBg: "bg-purple-50",
      lightText: "text-purple-500",
    },
    {
      type: "TROIS" as const,
      label: "Divisions / Sous-services",
      icon: <Layers size={18} />,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-600",
      lightBg: "bg-emerald-50",
      lightText: "text-emerald-500",
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <UserIcon size={20} className="text-emerald-500" />
            <span>Détails du compte</span>
          </div>
        }
        visible={visible}
        style={{ width: "780px" }}
        onHide={onHide}
        draggable={false}
        footer={
          <div className="flex justify-end border-t pt-3">
            <Button
              label="Fermer"
              icon={<X size={18} className="mr-2" />}
              onClick={onHide}
              className="p-button-text text-slate-500 font-bold"
            />
          </div>
        }
      >
        <div className="space-y-6 pt-2">
          {/* Section Profil Header */}
          <div className="flex flex-col items-center pb-4 border-b border-slate-100">
            <div className="relative">
              <img
                src={
                  user.photo_profil
                    ? `${BACKEND_URL}/uploads/profiles/${user.photo_profil}`
                    : person
                }
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover"
                alt={`${user.prenom} ${user.nom}`}
              />
              <div
                className={`absolute -bottom-1 -right-1 text-white p-1.5 rounded-lg shadow-sm ${
                  isOnline ? "bg-green-500" : "bg-slate-400"
                }`}
              >
                <span className="w-2 h-2 block bg-white rounded-full"></span>
              </div>
            </div>
            <h2 className="mt-3 text-lg font-bold text-emerald-900 uppercase tracking-tight">
              {user.prenom} {user.nom}
            </h2>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase mt-1">
              {typeof user.droit === "string"
                ? user.droit
                : user.droit?.libelle}
            </span>
            <div className="flex flex-col items-center mt-2 gap-1">
              {/* Statut */}
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                  isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                ● {isOnline ? "En ligne" : "Hors ligne"}
              </span>

              {/* Dernière activité */}
              <span className="text-[10px] text-slate-400 font-medium">
                Dernière activité : {formatLastActivity(user.last_activity)}
              </span>
            </div>
          </div>

          {/* Grille d'infos principales */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <InfoRow
              icon={Building2}
              label="Affectation Principale"
              value={libelleEntitee}
            />
            <InfoRow
              icon={Briefcase}
              label="Poste / Fonction"
              value={user.fonction_details?.libelle}
            />
            <InfoRow
              icon={Mail}
              label="Email Professionnel"
              value={user.email}
            />
            <InfoRow
              icon={Hash}
              label="Numéro Matricule"
              value={user.num_matricule}
            />
            <InfoRow
              icon={Phone}
              label="Contact Téléphonique"
              value={user.telephone}
            />
            <InfoRow
              icon={Calendar}
              label="Date de création"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                  : "-"
              }
            />
          </div>

          {/* Section des accès en Accordéon - 3 NIVEAUX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                <Lock size={14} className="text-orange-500" />
                Accès Documents (Spécifiques)
              </h3>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">
                {accesses.length || 0} Autorisation(s)
              </span>
            </div>

            {loading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-xs text-slate-400 mt-2">
                  Chargement des accès...
                </p>
              </div>
            ) : accesses.length > 0 ? (
              <Accordion
                activeIndex={expandedGroups}
                onTabChange={(e) => setExpandedGroups(e.index as number[])}
                multiple
                className="custom-accordion"
              >
                {/* NIVEAU 1 - UN */}
                <AccordionTab
                  key="niveau-un"
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Building size={18} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {titreN1}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                              Niveau 1
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {groupedByNiveau.UN.length} accès • Accès direct aux{" "}
                            {titreN1.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-2 p-1">
                    {groupedByNiveau.UN.map((acc: AgentEntiteeAccess) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                            <Building size={16} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {acc.entitee_un?.libelle}
                              </span>
                              {acc.entitee_un?.code && (
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {acc.entitee_un.code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                              <span>Ministère</span>
                              <ArrowRight size={8} />
                              <span className="text-blue-600">
                                Lecture & Gestion
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            icon={<Edit2 size={14} />}
                            className="p-button-text p-button-success p-button-sm p-0 w-8 h-8"
                            onClick={() => onEditAccess(acc)}
                            tooltip="Modifier"
                          />
                          <Button
                            icon={<Trash2 size={14} />}
                            className="p-button-text p-button-danger p-button-sm p-0 w-8 h-8"
                            onClick={() => handleRevoke(acc.id!)}
                            tooltip="Révoquer"
                          />
                        </div>
                      </div>
                    ))}
                    {groupedByNiveau.UN.length === 0 && (
                      <div className="text-center p-4 text-slate-400 text-xs italic">
                        Aucun accès aux ministères
                      </div>
                    )}
                  </div>
                </AccordionTab>

                {/* NIVEAU 2 - DEUX */}
                <AccordionTab
                  key="niveau-deux"
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <FolderTree size={18} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {titreN2}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">
                              Niveau 2
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {groupedByNiveau.DEUX.length} accès • Accès aux{" "}
                            {titreN2.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-2 p-1">
                    {groupedByNiveau.DEUX.map((acc: AgentEntiteeAccess) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                            <FolderTree size={16} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {acc.entitee_deux?.libelle}
                              </span>
                              {acc.entitee_deux?.code && (
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {acc.entitee_deux.code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                              <span>
                                {acc.entitee_deux?.entitee_un?.libelle ||
                                  "Ministère"}
                              </span>
                              <ArrowRight size={8} />
                              <span className="text-purple-600">
                                Lecture & Gestion
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            icon={<Edit2 size={14} />}
                            className="p-button-text p-button-success p-button-sm p-0 w-8 h-8"
                            onClick={() => onEditAccess(acc)}
                            tooltip="Modifier"
                          />
                          <Button
                            icon={<Trash2 size={14} />}
                            className="p-button-text p-button-danger p-button-sm p-0 w-8 h-8"
                            onClick={() => handleRevoke(acc.id!)}
                            tooltip="Révoquer"
                          />
                        </div>
                      </div>
                    ))}
                    {groupedByNiveau.DEUX.length === 0 && (
                      <div className="text-center p-4 text-slate-400 text-xs italic">
                        Aucun accès aux services
                      </div>
                    )}
                  </div>
                </AccordionTab>

                {/* NIVEAU 3 - TROIS */}
                <AccordionTab
                  key="niveau-trois"
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                          <Layers size={18} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {titreN3}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                              Niveau 3
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {groupedByNiveau.TROIS.length} accès • Accès aux{" "}
                            {titreN3.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-2 p-1">
                    {groupedByNiveau.TROIS.map((acc: AgentEntiteeAccess) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Layers size={16} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {acc.entitee_trois?.libelle}
                              </span>
                              {acc.entitee_trois?.code && (
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {acc.entitee_trois.code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                              <span>
                                {acc.entitee_trois?.entitee_deux?.libelle} •{" "}
                                {
                                  acc.entitee_trois?.entitee_deux?.entitee_un
                                    ?.libelle
                                }
                              </span>
                              <ArrowRight size={8} />
                              <span className="text-emerald-600">
                                Lecture & Gestion
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            icon={<Edit2 size={14} />}
                            className="p-button-text p-button-success p-button-sm p-0 w-8 h-8"
                            onClick={() => onEditAccess(acc)}
                            tooltip="Modifier"
                          />
                          <Button
                            icon={<Trash2 size={14} />}
                            className="p-button-text p-button-danger p-button-sm p-0 w-8 h-8"
                            onClick={() => handleRevoke(acc.id!)}
                            tooltip="Révoquer"
                          />
                        </div>
                      </div>
                    ))}
                    {groupedByNiveau.TROIS.length === 0 && (
                      <div className="text-center p-4 text-slate-400 text-xs italic">
                        Aucun accès aux divisions
                      </div>
                    )}
                  </div>
                </AccordionTab>
              </Accordion>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <Lock size={24} className="mx-auto text-slate-200 mb-2" />
                <p className="text-[11px] text-slate-400 font-medium italic">
                  Aucun accès spécifique configuré.
                  <br />
                  L'agent est limité à son entité principale.
                </p>
              </div>
            )}
          </div>
        </div>

        <style>{`
        .custom-accordion .p-accordion-header {
          margin-bottom: 8px !important;
        }
        .custom-accordion .p-accordion-header-link {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          padding: 16px !important;
          transition: all 0.2s;
          text-decoration: none !important;
        }
        .custom-accordion .p-accordion-header-link:hover {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
        }
        .custom-accordion .p-accordion-content {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-top: none !important;
          border-bottom-left-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
          padding: 16px !important;
        }
      `}</style>
      </Dialog>
    </>
  );
}
