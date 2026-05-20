import {
  LayoutDashboard,
  FileText,
  Layers,
  ChevronFirst,
  ChevronLast,
  Search,
  MoreVertical,
  UserRound,
  FolderPen,
  ChevronDown,
  Lock,
  ShieldCheck,
  Split,
  TableOfContents,
  GitFork,
  Landmark,
  History,
  Database,
  Pyramid,
  Archive,
  Warehouse,
  WavesLadder,
  LibraryBig,
  MapPinned,
  GitMerge,
  Building2,
  FileStack,
  Briefcase,
  Settings2,
  Send,
  Users,
  Plus,
} from "lucide-react";

import logo from "../../assets/SOLUGED.png";
import profil from "../../assets/homme.jpg";
import { Link, useLocation } from "react-router-dom";
import { createContext, useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProps, SidebarContextType } from "../../interfaces/composant";
import { useAuth } from "../../context/AuthContext";
import { getAllEntiteeUn, getEntiteeUnTitre } from "../../api/entiteeUn";
import { getAllEntiteeDeux, getEntiteeDeuxTitre } from "../../api/entiteeDeux";
import {
  getAllEntiteeTrois,
  getEntiteeTroisTitre,
} from "../../api/entiteeTrois";
import { getTypeDocuments } from "../../api/typeDocument";
import { TypeDocument, User } from "../../interfaces";
import { BACKEND_URL } from "../../api/axios";

export const SidebarContext = createContext<SidebarContextType>({
  expended: true,
  treeOpen: {},
  toggleTree: () => {},
});

export default function Sidebar({ children }: SidebarProps) {
  const [expended, setExpended] = useState(true);
  const location = useLocation();
  const { user, can } = useAuth();

  const [treeOpen, setTreeOpen] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("sidebar-tree");
    return saved ? JSON.parse(saved) : {};
  });

  // ✅ QUERY POUR LES TYPES DE DOCUMENTS
  const { data: docTypes = [] } = useQuery({
    queryKey: ["typeDocuments"],
    queryFn: async () => {
      const res = await getTypeDocuments();
      return res.typeDocument || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // ✅ QUERY POUR LES ENTITÉES UN
  const { data: entiteeUn = [] } = useQuery({
    queryKey: ["entiteeUn"],
    queryFn: async () => {
      const res = await getAllEntiteeUn();
      return Array.isArray(res) ? res : res.entiteeUn || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // ✅ QUERY POUR LES ENTITÉES DEUX
  const { data: entiteeDeux = [] } = useQuery({
    queryKey: ["entiteeDeux"],
    queryFn: async () => {
      const res = await getAllEntiteeDeux();
      return Array.isArray(res) ? res : res.entiteeDeux || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // ✅ QUERY POUR LES ENTITÉES TROIS
  const { data: entiteeTrois = [] } = useQuery({
    queryKey: ["entiteeTrois"],
    queryFn: async () => {
      const res = await getAllEntiteeTrois();
      return Array.isArray(res) ? res : res.entiteeTrois || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // ✅ QUERY POUR LES TITRES DYNAMIQUES
  const { data: dynamicTitles = { titre1: "", titre2: "", titre3: "" } } =
    useQuery({
      queryKey: ["entiteeTitres"],
      queryFn: async () => {
        const [t1, t2, t3] = await Promise.all([
          getEntiteeUnTitre(),
          getEntiteeDeuxTitre(),
          getEntiteeTroisTitre(),
        ]);
        return {
          titre1: t1.titre || "",
          titre2: t2.titre || "",
          titre3: t3.titre || "",
        };
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

  // ✅ Fonction identique à DocumentTypeEntitee
  const isUserAdmin = (user: User | null): boolean => {
    if (!user) return false;

    const droitLibelle =
      typeof user.droit === "object" ? user.droit?.libelle : user.droit;

    if (!droitLibelle) return false;

    const libelle = droitLibelle.toString().toLowerCase();
    return (
      libelle.includes("admin") ||
      libelle.includes("administrateur") ||
      libelle === "admin" ||
      libelle === "administrateur"
    );
  };

  const hasAccessToDocument = (typeDoc: TypeDocument): boolean => {
    // ADMIN voit tout
    if (isUserAdmin(user)) return true;

    // NON-ADMIN : vérifier les accès STRICTS
    const userEntityIds = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    // Entité de la fonction
    if (user?.fonction_details?.entitee_un?.id) {
      userEntityIds.un.add(user.fonction_details.entitee_un.id);
    }
    if (user?.fonction_details?.entitee_deux?.id) {
      userEntityIds.deux.add(user.fonction_details.entitee_deux.id);
    }
    if (user?.fonction_details?.entitee_trois?.id) {
      userEntityIds.trois.add(user.fonction_details.entitee_trois.id);
    }

    // Entités des agent_access
    user?.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) userEntityIds.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id)
        userEntityIds.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id)
        userEntityIds.trois.add(access.entitee_trois.id);
    });

    // 🔴 CORRECTION : VÉRIFICATION STRICTE PAR NIVEAU

    // 1. Si le document est lié à une entitee_trois
    if (typeDoc.entitee_trois_id) {
      // ✅ Seulement si l'utilisateur a ACCÈS DIRECT à CETTE entitee_trois
      return userEntityIds.trois.has(typeDoc.entitee_trois_id);
    }

    // 2. Si le document est lié à une entitee_deux (et PAS à une entitee_trois)
    if (typeDoc.entitee_deux_id && !typeDoc.entitee_trois_id) {
      // ✅ Seulement si l'utilisateur a ACCÈS DIRECT à CETTE entitee_deux
      return userEntityIds.deux.has(typeDoc.entitee_deux_id);
    }

    // 3. Si le document est lié à une entitee_un (et PAS à entitee_deux/trois)
    if (
      typeDoc.entitee_un_id &&
      !typeDoc.entitee_deux_id &&
      !typeDoc.entitee_trois_id
    ) {
      // ✅ Seulement si l'utilisateur a ACCÈS DIRECT à CETTE entitee_un
      return userEntityIds.un.has(typeDoc.entitee_un_id);
    }

    // 4. Document non assigné
    if (
      !typeDoc.entitee_un_id &&
      !typeDoc.entitee_deux_id &&
      !typeDoc.entitee_trois_id
    ) {
      return false; // Seuls les admins voient les non assignés
    }

    return false;
  };

  // ✅ Filtrer les documents accessibles
  const accessibleDocTypes = useMemo(() => {
    const filtered = docTypes.filter((doc) => hasAccessToDocument(doc));
    return filtered;
  }, [docTypes, user]);

  const toggleTree = (label: string) => {
    setTreeOpen((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem("sidebar-tree", JSON.stringify(next));
      return next;
    });
  };

  // =============================================
  // MÉTHODES UTILITAIRES POUR LES CAS NON-ADMIN
  // =============================================

  // 1. Récupérer les IDs des entités accessibles par l'utilisateur
  const getUserAccessibleEntityIds = (user: User | null) => {
    if (!user)
      return {
        un: new Set<number>(),
        deux: new Set<number>(),
        trois: new Set<number>(),
      };

    const ids = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    // Entité de la fonction
    if (user.fonction_details?.entitee_un?.id) {
      ids.un.add(user.fonction_details.entitee_un.id);
    }
    if (user.fonction_details?.entitee_deux?.id) {
      ids.deux.add(user.fonction_details.entitee_deux.id);
    }
    if (user.fonction_details?.entitee_trois?.id) {
      ids.trois.add(user.fonction_details.entitee_trois.id);
    }

    // Entités des agent_access
    user.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) ids.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id) ids.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id) ids.trois.add(access.entitee_trois.id);
    });

    return ids;
  };

  // 2. Compter le nombre total de niveaux accessibles
  const getUserAccessibleNiveauxCount = (user: User | null) => {
    const ids = getUserAccessibleEntityIds(user);
    return ids.un.size + ids.deux.size + ids.trois.size;
  };

  // 3. Vérifier si l'utilisateur a des accès supplémentaires (agent_access)
  const hasAdditionalAccess = (user: User | null): boolean => {
    return (user?.agent_access?.length ?? 0) > 0;
  };

  // 4. Récupérer le type d'entité de la fonction de l'utilisateur
  const getUserFonctionEntityType = (
    user: User | null,
  ): "un" | "deux" | "trois" | null => {
    if (user?.fonction_details?.entitee_trois) return "trois";
    if (user?.fonction_details?.entitee_deux) return "deux";
    if (user?.fonction_details?.entitee_un) return "un";
    return null;
  };

  // 5. Récupérer l'ID de l'entité de la fonction
  const getUserFonctionEntityId = (user: User | null): number | null => {
    return (
      user?.fonction_details?.entitee_trois?.id ||
      user?.fonction_details?.entitee_deux?.id ||
      user?.fonction_details?.entitee_un?.id ||
      null
    );
  };

  // 6. Récupérer les types de documents accessibles pour un niveau donné
  const getAccessibleTypesForNiveau = (
    user: User | null,
    niveau: "un" | "deux" | "trois",
    docTypes: TypeDocument[],
  ) => {
    const ids = getUserAccessibleEntityIds(user);
    const targetSet = ids[niveau];

    return docTypes.filter((doc) => {
      if (niveau === "un")
        return doc.entitee_un_id && targetSet.has(doc.entitee_un_id);
      if (niveau === "deux")
        return doc.entitee_deux_id && targetSet.has(doc.entitee_deux_id);
      if (niveau === "trois")
        return doc.entitee_trois_id && targetSet.has(doc.entitee_trois_id);
      return false;
    });
  };

  // 7. Récupérer les types de documents de la fonction de l'utilisateur
  const getUserFonctionTypes = (
    user: User | null,
    docTypes: TypeDocument[],
  ) => {
    const entityType = getUserFonctionEntityType(user);
    const entityId = getUserFonctionEntityId(user);

    if (!entityType || !entityId) return [];

    return docTypes.filter((doc) => {
      if (entityType === "un") return doc.entitee_un_id === entityId;
      if (entityType === "deux") return doc.entitee_deux_id === entityId;
      if (entityType === "trois") return doc.entitee_trois_id === entityId;
      return false;
    });
  };

  return (
    <aside className="h-screen sticky top-0">
      <nav
        className={`h-full flex flex-col bg-emerald-950 border-r border-emerald-900 shadow-2xl transition-all duration-300 ${
          expended ? "w-76" : "w-20"
        }`}
      >
        {/* Header - Logo et Toggle */}
        <div className="flex items-center justify-between p-4 h-20 bg-emerald-950">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expended ? "w-full" : "w-0"
            }`}
          >
            {/* brightness-0 invert permet de rendre ton logo blanc pur pour le fond sombre */}
            <img
              src={logo}
              alt="Logo"
              className="w-full h-20 brightness-0 invert p-2"
            />
          </div>

          <button
            onClick={() => setExpended((v) => !v)}
            className="p-2 rounded-lg bg-emerald-800 text-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
          >
            {expended ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 mt-4 custom-scrollbar">
          <SidebarContext.Provider value={{ expended, treeOpen, toggleTree }}>
            <ul className="space-y-1">
              {can("statistique", "access") && (
                <SidebarLink
                  icon={LayoutDashboard}
                  text="Tableau de bord"
                  to="/"
                  active={location.pathname === "/"}
                />
              )}
              {!can("statistique", "access") && (
                <SidebarLink
                  icon={LayoutDashboard}
                  text="Tableau de bord"
                  to="/welcome"
                  active={location.pathname === "/welcome"}
                />
              )}

              <div
                className={`my-4 border-t border-emerald-800/50 mx-2 ${
                  !expended && "hidden"
                }`}
              />

              {/* ================= ORGANIGRAMME ================= */}

              {(can("entiteeUn", "access") ||
                can("entiteeDeux", "access") ||
                can("fonction", "access") ||
                can("entiteeTrois", "access")) && (
                <SidebarTree label="Organigrame" icon={GitFork}>
                  {/* Condition : Affiché seulement si titre1 existe */}
                  {dynamicTitles.titre1 &&
                    dynamicTitles.titre1.trim() !== "" && (
                      <SidebarLink
                        icon={Landmark}
                        text={dynamicTitles.titre1}
                        to="/entiteeUn"
                        active={location.pathname.startsWith("/entiteeUn")}
                      />
                    )}

                  {/* Condition : Affiché seulement si titre2 existe */}
                  {dynamicTitles.titre2 &&
                    dynamicTitles.titre2.trim() !== "" && (
                      <SidebarLink
                        icon={Split}
                        text={dynamicTitles.titre2}
                        to="/entiteeDeux"
                        active={location.pathname.startsWith("/entiteeDeux")}
                      />
                    )}

                  {/* Condition : Affiché seulement si titre3 existe */}
                  {dynamicTitles.titre3 &&
                    dynamicTitles.titre3.trim() !== "" && (
                      <SidebarLink
                        icon={TableOfContents}
                        text={dynamicTitles.titre3}
                        to="/entiteeTrois"
                        active={location.pathname.startsWith("/entiteeTrois")}
                      />
                    )}
                </SidebarTree>
              )}

              {/* ================= GESTION ================= */}
              {(can("type", "access") ||
                can("pieces", "access") ||
                can("documentType", "access") ||
                can("document", "access")) && (
                <SidebarTree label="Gestion" icon={FolderPen}>
                  {can("pieces", "access") && (
                    <SidebarLink
                      icon={FolderPen}
                      text="Type de pièces"
                      to="/pieces"
                      active={location.pathname.startsWith("/pieces")}
                    />
                  )}
                  {can("documentType", "access") && (
                    <SidebarLink
                      icon={Database}
                      text="DocumentType"
                      to="/dossierType"
                      active={location.pathname.startsWith("/dossierType")}
                    />
                  )}
                  {/*Remplacer la partie "Documents" dans le return*/}
                  {can("document", "access") && (
                    <SidebarTree
                      label="Documents"
                      icon={FileText}
                      badge={
                        <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {isUserAdmin(user)
                            ? entiteeUn.length +
                              entiteeDeux.length +
                              entiteeTrois.length
                            : getUserAccessibleNiveauxCount(user)}
                        </span>
                      }
                    >
                      {isUserAdmin(user) ? (
                        /* ===== CAS ADMIN ===== */
                        <>
                          {entiteeUn.length > 0 &&
                            dynamicTitles.titre1 &&
                            dynamicTitles.titre1.trim() !== "" && (
                              <SidebarLink
                                icon={Building2}
                                text={dynamicTitles.titre1 || "Niveau 1"}
                                to={`/document?entitee=un`}
                                active={
                                  location.pathname === "/document" &&
                                  new URLSearchParams(location.search).get(
                                    "entitee",
                                  ) === "un"
                                }
                                suffix={
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-2">
                                    {entiteeUn.length}
                                  </span>
                                }
                              />
                            )}

                          {entiteeDeux.length > 0 &&
                            dynamicTitles.titre2 &&
                            dynamicTitles.titre2.trim() !== "" && (
                              <SidebarLink
                                icon={Layers}
                                text={dynamicTitles.titre2 || "Niveau 2"}
                                to={`/document?entitee=deux`}
                                active={
                                  location.pathname === "/document" &&
                                  new URLSearchParams(location.search).get(
                                    "entitee",
                                  ) === "deux"
                                }
                                suffix={
                                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full ml-2">
                                    {entiteeDeux.length}
                                  </span>
                                }
                              />
                            )}

                          {entiteeTrois.length > 0 &&
                            dynamicTitles.titre3 &&
                            dynamicTitles.titre3.trim() !== "" && (
                              <SidebarLink
                                icon={GitMerge}
                                text={dynamicTitles.titre3 || "Niveau 3"}
                                to={`/document?entitee=trois`}
                                active={
                                  location.pathname === "/document" &&
                                  new URLSearchParams(location.search).get(
                                    "entitee",
                                  ) === "trois"
                                }
                                suffix={
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-2">
                                    {entiteeTrois.length}
                                  </span>
                                }
                              />
                            )}
                        </>
                      ) : (
                        /* ===== CAS NON-ADMIN ===== */
                        <>
                          {(() => {
                            const ids = getUserAccessibleEntityIds(user);
                            const hasUnAccess = ids.un.size > 0;
                            const hasDeuxAccess = ids.deux.size > 0;
                            const hasTroisAccess = ids.trois.size > 0;

                            // Cas 2.1 : L'utilisateur a des accès supplémentaires
                            if (hasAdditionalAccess(user)) {
                              return (
                                <>
                                  {hasUnAccess &&
                                    dynamicTitles.titre1 &&
                                    dynamicTitles.titre1.trim() !== "" && (
                                      <SidebarLink
                                        icon={Building2}
                                        text={
                                          dynamicTitles.titre1 || "Niveau 1"
                                        }
                                        to={`/document?entitee=un&niveaux=un`}
                                        active={
                                          location.pathname === "/document" &&
                                          new URLSearchParams(
                                            location.search,
                                          ).get("entitee") === "un"
                                        }
                                        suffix={
                                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-2">
                                            {ids.un.size}
                                          </span>
                                        }
                                      />
                                    )}

                                  {hasDeuxAccess &&
                                    dynamicTitles.titre2 &&
                                    dynamicTitles.titre2.trim() !== "" && (
                                      <SidebarLink
                                        icon={Layers}
                                        text={
                                          dynamicTitles.titre2 || "Niveau 2"
                                        }
                                        to={`/document?entitee=deux&niveaux=deux`}
                                        active={
                                          location.pathname === "/document" &&
                                          new URLSearchParams(
                                            location.search,
                                          ).get("entitee") === "deux"
                                        }
                                        suffix={
                                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full ml-2">
                                            {ids.deux.size}
                                          </span>
                                        }
                                      />
                                    )}

                                  {hasTroisAccess &&
                                    dynamicTitles.titre3 &&
                                    dynamicTitles.titre3.trim() !== "" && (
                                      <SidebarLink
                                        icon={GitMerge}
                                        text={
                                          dynamicTitles.titre3 || "Niveau 3"
                                        }
                                        to={`/document?entitee=trois&niveaux=trois`}
                                        active={
                                          location.pathname === "/document" &&
                                          new URLSearchParams(
                                            location.search,
                                          ).get("entitee") === "trois"
                                        }
                                        suffix={
                                          <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-2">
                                            {ids.trois.size}
                                          </span>
                                        }
                                      />
                                    )}
                                </>
                              );
                            }
                            // Cas 2.2 : Aucun accès supplémentaire
                            else {
                              const fonctionEntityType =
                                getUserFonctionEntityType(user);
                              const fonctionTypes = getUserFonctionTypes(
                                user,
                                docTypes,
                              );

                              if (fonctionTypes.length === 0) {
                                return (
                                  <div className="px-4 py-3 text-xs text-slate-400 italic bg-slate-50/50 rounded-lg mx-2 my-1">
                                    Aucun document disponible pour votre
                                    fonction
                                  </div>
                                );
                              }

                              // ✅ SIMPLE LIEN VERS /document (sans paramètre)
                              return (
                                <SidebarLink
                                  icon={FileStack}
                                  text="Type de document / Dossier"
                                  to="/document"
                                  active={location.pathname === "/document"}
                                  suffix={
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-2">
                                      {fonctionTypes.length}
                                    </span>
                                  }
                                />
                              );
                            }
                          })()}
                        </>
                      )}
                    </SidebarTree>
                  )}
                </SidebarTree>
              )}
              {/* ================= COURRIERS ================= */}
              {(can("Expediteur", "read") ||
                can("mesCourrier", "update") ||
                can("courrier", "create") ||
                can("destinataire_externe", "access") ||
                can("courrier", "access")) && (
                <SidebarTree label="Courriers" icon={Send}>
                  {can("courrier", "access") && (
                    <SidebarLink
                      icon={FileText}
                      text="Tous les courriers"
                      to="/courrier"
                      active={location.pathname === "/courrier"}
                    />
                  )}

                  {can("mesCourrier", "update") && (
                    <SidebarLink
                      icon={Users}
                      text="Mes courriers attribués"
                      to="/courrier/mes-attribues"
                      active={location.pathname === "/courrier/mes-attribues"}
                    />
                  )}

                  {can("courrier", "create") && (
                    <SidebarLink
                      icon={Plus}
                      text="Nouveau courrier"
                      to="/courrier/nouveau"
                      active={location.pathname === "/courrier/nouveau"}
                    />
                  )}

                  {/* ✅ Sous-menu PARAMÈTRES COURRIER */}
                  {(can("expediteur", "access") ||
                    can("destinataire_externe", "access")) && (
                    <SidebarTree label="Paramètres courrier" icon={Settings2}>
                      {can("expediteur", "access") && (
                        <SidebarLink
                          icon={Building2}
                          text="Expéditeurs"
                          to="/courrier/expediteur"
                          active={location.pathname === "/courrier/expediteur"}
                        />
                      )}

                      {can("destinataire_externe", "access") && (
                        <SidebarLink
                          icon={Send}
                          text="Destinataires externes"
                          to="/courrier/destinataire"
                          active={
                            location.pathname === "/courrier/destinataire"
                          }
                        />
                      )}
                    </SidebarTree>
                  )}
                </SidebarTree>
              )}

              {/* ================= ARCHIVAGE ================= */}
              {(can("box", "access") ||
                can("trave", "access") ||
                can("rayon", "access") ||
                can("salle", "access") ||
                can("site", "access")) && (
                <SidebarTree label="Archivage" icon={Layers}>
                  {can("box", "access") && (
                    <SidebarLink
                      icon={Archive}
                      text="Outils de conservation"
                      to="/box"
                      active={location.pathname.startsWith("/box")}
                    />
                  )}
                  {can("trave", "access") && (
                    <SidebarLink
                      icon={LibraryBig}
                      text="Travé"
                      to="/trave"
                      active={location.pathname.startsWith("/trave")}
                    />
                  )}
                  {can("rayon", "access") && (
                    <SidebarLink
                      icon={WavesLadder}
                      text="Rayon"
                      to="/rayon"
                      active={location.pathname.startsWith("/rayon")}
                    />
                  )}
                  {can("salle", "access") && (
                    <SidebarLink
                      icon={Warehouse}
                      text="Salle"
                      to="/salle"
                      active={location.pathname.startsWith("/salle")}
                    />
                  )}

                  {can("site", "access") && (
                    <SidebarLink
                      icon={MapPinned}
                      text="Site"
                      to="/site"
                      active={location.pathname.startsWith("/site")}
                    />
                  )}
                </SidebarTree>
              )}

              {/* ================= SECURITE ================= */}
              {(can("agent", "access") ||
                can("droit", "access") ||
                can("historique", "access")) && (
                <SidebarTree label="Sécurité" icon={Lock}>
                  {can("agent", "access") && (
                    <SidebarLink
                      icon={UserRound}
                      text="Agent"
                      to="/agents"
                      active={location.pathname.startsWith("/agents")}
                    />
                  )}
                  {can("droit", "access") && (
                    <SidebarLink
                      icon={ShieldCheck}
                      text="Profil"
                      to="/profils"
                      active={location.pathname.startsWith("/profils")}
                    />
                  )}
                  {can("historique", "access") && (
                    <SidebarLink
                      icon={History}
                      text="Historique"
                      to="/historique"
                      active={location.pathname.startsWith("/historique")}
                    />
                  )}
                </SidebarTree>
              )}
              {(can("entiteeUn", "access") ||
                can("entiteeDeux", "access") ||
                can("entiteeTrois", "access") ||
                can("fonction", "access")) && (
                <SidebarTree label="Paramétrage" icon={Settings2}>
                  <SidebarLink
                    icon={Pyramid}
                    text="Configuration"
                    to="/organigrame"
                    active={location.pathname.startsWith("/organigrame")}
                  />

                  {can("fonction", "access") && (
                    <SidebarLink
                      icon={Briefcase}
                      text="Fonction"
                      to="/fonction"
                      active={location.pathname.startsWith("/fonction")}
                    />
                  )}
                </SidebarTree>
              )}

              {can("document", "read") && (
                <SidebarLink
                  icon={Search}
                  text="Recherche"
                  to="/recherche"
                  active={location.pathname.startsWith("/recherche")}
                />
              )}
            </ul>
          </SidebarContext.Provider>
        </div>

        {/* Footer - Profil Utilisateur */}
        <div className="p-4 bg-emerald-900/40 backdrop-blur-sm border-t border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.photo_profil ? (
                <img
                  src={`${BACKEND_URL}/uploads/profiles/${user.photo_profil}`}
                  alt="Profil"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-sm"
                />
              ) : (
                /* ✅ On utilise l'image 'profil' importée dans une balise img */
                <img
                  src={profil}
                  alt="Par défaut"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-sm"
                />
              )}
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                expended ? "w-40 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <p className="text-sm font-bold text-white truncate uppercase tracking-wider">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-emerald-300 truncate">{user?.email}</p>
            </div>
            {expended && (
              <MoreVertical
                size={18}
                className="text-emerald-400 cursor-pointer hover:text-white"
              />
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({ icon: Icon, text, to, active }: any) {
  const { expended } = useContext(SidebarContext);

  const handleClick = () => {
    // Stocker dans localStorage ou sessionStorage que l'utilisateur a cliqué
    sessionStorage.setItem("sidebar_navigation", "true");
  };

  return (
    <Link to={to} className="block group" onClick={handleClick}>
      <li
        className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 relative
        ${
          active
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]"
            : "text-emerald-200 hover:bg-emerald-800/60 hover:text-white"
        }`}
      >
        <Icon
          size={22}
          className={`flex-shrink-0 ${
            active
              ? "text-white"
              : "text-emerald-400 group-hover:text-emerald-200"
          }`}
        />

        <span
          className={`whitespace-nowrap transition-all duration-300 font-medium ${
            expended ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          {text}
        </span>

        {!expended && (
          <div className="absolute left-full rounded-md px-3 py-1.5 ml-6 bg-emerald-700 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 shadow-xl border border-emerald-500">
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}

function SidebarTree({ label, icon: Icon, children }: any) {
  const { expended, treeOpen, toggleTree } = useContext(SidebarContext);
  const open = treeOpen[label] || false;

  return (
    <li className="list-none">
      <button
        onClick={() => toggleTree(label)}
        className={`flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-emerald-200 hover:bg-emerald-800/40
          ${!expended && "justify-center"}
        `}
      >
        <Icon size={22} className="flex-shrink-0 text-emerald-400" />
        {expended && (
          <>
            <span className="ml-3 font-medium">{label}</span>
            <span
              className={`ml-auto transition-transform duration-300 ${
                open ? "rotate-180 text-white" : "text-emerald-600"
              }`}
            >
              <ChevronDown size={16} />
            </span>
          </>
        )}
      </button>

      {open && expended && (
        <ul className="ml-6 mt-1 space-y-1 border-l border-emerald-800/50 pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
          {children}
        </ul>
      )}
    </li>
  );
}
