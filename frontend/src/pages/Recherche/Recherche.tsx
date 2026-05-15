import { useEffect, useRef, useState, useMemo } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import {
  Search,
  Layers,
  FileText,
  Building2,
  GitMerge,
  Eye,
  CloudDownload,
  MapPin,
  Archive,
  Info,
  Box,
  FolderTree,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getAllFieldsForEntity } from "../../api/metaField";
import { getDocuments } from "../../api/document";
import { getTypeDocuments } from "../../api/typeDocument";
import Pagination from "../../components/layout/Pagination";
import { useAuth } from "../../context/AuthContext";
import {
  TypeDocument,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  User,
} from "../../interfaces";
import {
  getAllEntiteeUn,
  getEntiteeUnTitre,
  getTypesOfEntiteeUn,
} from "../../api/entiteeUn";
import {
  getAllEntiteeDeux,
  getEntiteeDeuxTitre,
  getTypesOfEntiteeDeux,
} from "../../api/entiteeDeux";
import {
  getAllEntiteeTrois,
  getEntiteeTroisTitre,
  getTypesOfEntiteeTrois,
} from "../../api/entiteeTrois";
import DocumentDetails from "../Document/DocumentDetails";
import RechercheUploadPieces from "./RechercheUploadPieces";
import { Badge } from "primereact/badge";
import {
  useSites,
  useSalles,
  useRayons,
  useTraves,
  useBoxes,
} from "../../hooks/useArchivageQueries";

type NiveauType = "un" | "deux" | "trois";

// =============================================
// LocationModal (inchangé)
// =============================================
function LocationModal({ visible, onHide, doc }: any) {
  const { data: allSites = [] } = useSites();
  const { data: allSalles = [] } = useSalles();
  const { data: allRayons = [] } = useRayons();
  const { data: allTraves = [] } = useTraves();
  const { data: allBoxes = [] } = useBoxes();
  if (!doc) return null;

  const getDocumentLocation = () => {
    const boxId = doc.box_id;
    if (!boxId) return null;
    const box = allBoxes.find((b) => Number(b.id) === Number(boxId));
    if (!box) return null;
    const result: any = {
      box: box.libelle,
      boxCode: box.code_box,
      capaciteMax: Number(box.capacite_max) || 0,
      currentCount: Number(box.current_count) || 0,
      status: box.status || "",
      typeDocument: box.typeDocument?.nom || null,
    };
    if (!box.trave_id) return result;
    const trave = allTraves.find((t) => Number(t.id) === Number(box.trave_id));
    if (!trave) return result;
    result.trave = trave.code;
    if (!trave.rayon_id) return result;
    const rayon = allRayons.find((r) => Number(r.id) === Number(trave.rayon_id));
    if (!rayon) return result;
    result.rayon = rayon.code;
    if (!rayon.salle_id) return result;
    const salle = allSalles.find((s) => Number(s.id) === Number(rayon.salle_id));
    if (!salle) return result;
    result.salle = salle.libelle;
    if (!salle.site_id) return result;
    const site = allSites.find((s) => Number(s.id) === Number(salle.site_id));
    if (!site) return result;
    result.site = site.nom;
    return result;
  };

  const location = getDocumentLocation();
  const isArchived = location !== null;
  const ratio = location?.capaciteMax
    ? (location.currentCount / location.capaciteMax) * 100
    : 0;
  const isFull = ratio >= 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIBRE":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: <CheckCircle size={16} />,
        };
      case "OCCUPE":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          icon: <AlertCircle size={16} />,
        };
      case "PLIEN":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <XCircle size={16} />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          icon: <Info size={16} />,
        };
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-emerald-600" />
          <span className="font-black text-emerald-900">Emplacement du document</span>
        </div>
      }
      visible={visible}
      onHide={onHide}
      className="w-full max-w-md rounded-2xl"
      modal
    >
      <div className="space-y-4 pt-2">
        <div className="bg-emerald-50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase">Document</p>
              <p className="font-bold text-emerald-900">#{String(doc.id).padStart(4, "0")}</p>
            </div>
            <Badge value={doc.typeDocument?.nom || "Non classé"} severity="info" />
          </div>
        </div>

        {!isArchived ? (
          <div className="text-center py-8">
            <Archive size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Document non archivé</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">📍 Localisation physique</p>
            {location.site && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Building2 size={16} /></div>
                <div><p className="text-[10px] text-slate-400 uppercase">Site</p><p className="font-bold text-slate-700">{location.site}</p></div>
              </div>
            )}
            {location.salle && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><FolderTree size={16} /></div>
                <div><p className="text-[10px] text-slate-400 uppercase">Salle</p><p className="font-bold text-slate-700">{location.salle}</p></div>
              </div>
            )}
            {location.rayon && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Layers size={16} /></div>
                <div><p className="text-[10px] text-slate-400 uppercase">Rayon</p><p className="font-bold text-slate-700">{location.rayon}</p></div>
              </div>
            )}
            {location.trave && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><GitMerge size={16} /></div>
                <div><p className="text-[10px] text-slate-400 uppercase">Travée</p><p className="font-bold text-slate-700">{location.trave}</p></div>
              </div>
            )}
            <div className="border-t border-emerald-100 pt-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                <div className="p-2 bg-emerald-200 rounded-lg text-emerald-700"><Box size={16} /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-emerald-500 uppercase">Box</p>
                      <p className="font-bold text-emerald-900">{location.box}</p>
                      <p className="text-xs text-emerald-600 font-mono">{location.boxCode}</p>
                    </div>
                    {location.typeDocument && <Badge value={location.typeDocument} severity="info" className="text-xs" />}
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-600">Occupation</span>
                      <span className="font-bold text-emerald-800">{location.currentCount}/{location.capaciteMax}</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-500" : "bg-emerald-600"}`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(location.status).bg} ${getStatusColor(location.status).text}`}>
                      {getStatusColor(location.status).icon}
                      {location.status === "LIBRE" && "Libre"}
                      {location.status === "OCCUPE" && "Occupé"}
                      {location.status === "PLIEN" && "Plein"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

// =============================================
// LocationBadge (inchangé)
// =============================================
function LocationBadge({ doc, onClick }: { doc: any; onClick: () => void }) {
  const { data: allBoxes = [] } = useBoxes();
  const { data: allTraves = [] } = useTraves();
  const { data: allRayons = [] } = useRayons();
  const { data: allSalles = [] } = useSalles();
  const { data: allSites = [] } = useSites();
  if (!doc.box_id) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs">
        <Archive size={12} /> Non archivé
      </span>
    );
  }
  const getCompactPath = () => {
    const box = allBoxes.find((b) => Number(b.id) === Number(doc.box_id));
    if (!box) return `Box #${doc.box_id}`;
    let path = box.libelle;
    if (box.trave_id) {
      const trave = allTraves.find((t) => Number(t.id) === Number(box.trave_id));
      if (trave) {
        path = `${trave.code} → ${path}`;
        if (trave.rayon_id) {
          const rayon = allRayons.find((r) => Number(r.id) === Number(trave.rayon_id));
          if (rayon?.salle_id) {
            const salle = allSalles.find((s) => Number(s.id) === Number(rayon.salle_id));
            if (salle?.site_id) {
              const site = allSites.find((s) => Number(s.id) === Number(salle.site_id));
              if (site) path = `${site.nom} → ${path}`;
            }
          }
        }
      }
    }
    return path;
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition-all max-w-[200px] truncate"
      title="Voir l'emplacement détaillé"
    >
      <MapPin size={12} className="flex-shrink-0" />
      <span className="truncate">{getCompactPath()}</span>
    </button>
  );
}

// =============================================
// Composant principal Recherche (corrigé)
// =============================================
export default function Recherche() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<any[]>([]);

  const [entiteeUn, setEntiteeUn] = useState<EntiteeUn[]>([]);
  const [entiteeDeux, setEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [entiteeTrois, setEntiteeTrois] = useState<EntiteeTrois[]>([]);

  const [selectedNiveau, setSelectedNiveau] = useState<NiveauType | null>(null);
  const [selectedEntitee, setSelectedEntitee] = useState<number | null>(null);
  const [filteredTypesByEntitee, setFilteredTypesByEntitee] = useState<
    TypeDocument[]
  >([]);

  const [selected, setSelected] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedForLocation, setSelectedForLocation] = useState<any>(null);

  const [titres, setTitres] = useState({
    niveau1: "",
    niveau2: "",
    niveau3: "",
  });

  const [selectedFields, setSelectedFields] = useState<number[]>([]);
  const [searchValues, setSearchValues] = useState<{ [key: number]: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useRef<Toast>(null);

  // ========== Fonctions d'accès (inchangées) ==========
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
    if (user.fonction_details?.entitee_un?.id)
      ids.un.add(user.fonction_details.entitee_un.id);
    if (user.fonction_details?.entitee_deux?.id)
      ids.deux.add(user.fonction_details.entitee_deux.id);
    if (user.fonction_details?.entitee_trois?.id)
      ids.trois.add(user.fonction_details.entitee_trois.id);
    user.agent_access?.forEach((access: any) => {
      if (access.entitee_un?.id) ids.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id) ids.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id) ids.trois.add(access.entitee_trois.id);
    });
    return ids;
  };

  const hasAdditionalAccess = (user: User | null): boolean =>
    (user?.agent_access?.length ?? 0) > 0;

  const getUserFonctionEntityType = (
    user: User | null,
  ): "un" | "deux" | "trois" | null => {
    if (user?.fonction_details?.entitee_trois) return "trois";
    if (user?.fonction_details?.entitee_deux) return "deux";
    if (user?.fonction_details?.entitee_un) return "un";
    return null;
  };

  const getUserFonctionEntityId = (user: User | null): number | null => {
    return (
      user?.fonction_details?.entitee_trois?.id ||
      user?.fonction_details?.entitee_deux?.id ||
      user?.fonction_details?.entitee_un?.id ||
      null
    );
  };

  const getUserFonctionTypes = (
    user: User | null,
    allTypes: TypeDocument[],
  ) => {
    const entityType = getUserFonctionEntityType(user);
    const entityId = getUserFonctionEntityId(user);
    if (!entityType || !entityId) return [];
    return allTypes.filter((typeDoc) => {
      if (entityType === "un") return typeDoc.entitee_un_id === entityId;
      if (entityType === "deux") return typeDoc.entitee_deux_id === entityId;
      if (entityType === "trois") return typeDoc.entitee_trois_id === entityId;
      return false;
    });
  };

  const filteredTypes = useMemo(() => {
    if (isUserAdmin(user)) return types;
    const accessibleIds = getUserAccessibleEntityIds(user);
    if (hasAdditionalAccess(user)) {
      return types.filter((typeDoc) => {
        if (
          typeDoc.entitee_un_id &&
          accessibleIds.un.has(typeDoc.entitee_un_id)
        )
          return true;
        if (
          typeDoc.entitee_deux_id &&
          accessibleIds.deux.has(typeDoc.entitee_deux_id)
        )
          return true;
        if (
          typeDoc.entitee_trois_id &&
          accessibleIds.trois.has(typeDoc.entitee_trois_id)
        )
          return true;
        return false;
      });
    }
    const fonctionId = getUserFonctionEntityId(user);
    const fonctionType = getUserFonctionEntityType(user);
    if (!fonctionId || !fonctionType) return [];
    return types.filter((typeDoc) => {
      if (fonctionType === "un") return typeDoc.entitee_un_id === fonctionId;
      if (fonctionType === "deux")
        return typeDoc.entitee_deux_id === fonctionId;
      if (fonctionType === "trois")
        return typeDoc.entitee_trois_id === fonctionId;
      return false;
    });
  }, [types, user]);

  // Charger les titres et les entités
  useEffect(() => {
    const loadTitresEtEntites = async () => {
      try {
        const [t1, t2, t3, e1, e2, e3] = await Promise.all([
          getEntiteeUnTitre(),
          getEntiteeDeuxTitre(),
          getEntiteeTroisTitre(),
          getAllEntiteeUn(),
          getAllEntiteeDeux(),
          getAllEntiteeTrois(),
        ]);
        setTitres({
          niveau1: t1.titre || "",
          niveau2: t2.titre || "",
          niveau3: t3.titre || "",
        });
        setEntiteeUn(Array.isArray(e1) ? e1 : []);
        setEntiteeDeux(Array.isArray(e2) ? e2 : []);
        setEntiteeTrois(Array.isArray(e3) ? e3 : []);
      } catch (error) {
        console.error("❌ Erreur chargement titres:", error);
      }
    };
    loadTitresEtEntites();
  }, []);

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      const [resDocs, resTypes] = await Promise.all([
        getDocuments(),
        getTypeDocuments(),
      ]);
      setDocs(resDocs);
      setTypes(resTypes.typeDocument);
    };
    loadData();
  }, []);

  // Options niveau
  const niveauOptions = useMemo(() => {
    const options: { label: string; value: NiveauType }[] = [];
    if (isUserAdmin(user)) {
      if (titres.niveau1) options.push({ label: titres.niveau1, value: "un" });
      if (titres.niveau2) options.push({ label: titres.niveau2, value: "deux" });
      if (titres.niveau3)
        options.push({ label: titres.niveau3, value: "trois" });
      return options;
    }
    const ids = getUserAccessibleEntityIds(user);
    if (ids.un.size > 0 && titres.niveau1)
      options.push({ label: titres.niveau1, value: "un" });
    if (ids.deux.size > 0 && titres.niveau2)
      options.push({ label: titres.niveau2, value: "deux" });
    if (ids.trois.size > 0 && titres.niveau3)
      options.push({ label: titres.niveau3, value: "trois" });
    return options;
  }, [titres, user]);

  // Options entité
  const entiteeOptions = useMemo(() => {
    if (!selectedNiveau) return [];
    let entites: any[] = [];
    if (selectedNiveau === "un") entites = entiteeUn;
    if (selectedNiveau === "deux") entites = entiteeDeux;
    if (selectedNiveau === "trois") entites = entiteeTrois;
    if (!isUserAdmin(user)) {
      const ids = getUserAccessibleEntityIds(user);
      const targetSet = ids[selectedNiveau as keyof typeof ids];
      entites = entites.filter((e) => targetSet.has(e.id));
    }
    return entites.map((e) => ({
      label: e.libelle,
      value: e.id,
      code: e.code,
    }));
  }, [selectedNiveau, entiteeUn, entiteeDeux, entiteeTrois, user]);

  // Filtrer les types
  useEffect(() => {
    if (!selectedEntitee || !selectedNiveau) {
      setFilteredTypesByEntitee([]);
      return;
    }
    const filtered = types.filter((typeDoc) => {
      if (selectedNiveau === "un")
        return typeDoc.entitee_un_id === selectedEntitee;
      if (selectedNiveau === "deux")
        return typeDoc.entitee_deux_id === selectedEntitee;
      if (selectedNiveau === "trois")
        return typeDoc.entitee_trois_id === selectedEntitee;
      return false;
    });
    setFilteredTypesByEntitee(filtered);
  }, [selectedEntitee, selectedNiveau, types]);

  // ✅ Métadonnées avec getAllFieldsForEntity
  useEffect(() => {
    const loadMetaFieldsForType = async () => {
      if (!documentType_id || !selectedNiveau || !selectedEntitee) {
        setMetaFields([]);
        return;
      }
      setLoading(true);
      try {
        const entityTypeMap: Record<NiveauType, string> = {
          un: "EntiteeUn",
          deux: "EntiteeDeux",
          trois: "EntiteeTrois",
        };
        const fields = await getAllFieldsForEntity(
          documentType_id,
          entityTypeMap[selectedNiveau],
          selectedEntitee
        );
        setMetaFields(fields.filter((f: any) => !f.hidden));
        setSelectedFields([]);
        setSearchValues({});
      } catch (error) {
        console.error("Erreur chargement méta-champs:", error);
        setMetaFields([]);
      } finally {
        setLoading(false);
      }
    };
    loadMetaFieldsForType();
  }, [documentType_id, selectedNiveau, selectedEntitee]);

  const toggleField = (id: number) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const filtered = docs.filter((d) => {
    const matchType = documentType_id
      ? d.typeDocument?.id === documentType_id
      : true;
    if (!matchType) return false;
    return selectedFields.every((fieldId) => {
      const searchValue = searchValues[fieldId]?.toLowerCase() || "";
      if (!searchValue) return true;
      const docValue =
        d.values?.find((v: any) => v.metaField?.id === fieldId)?.value || "";
      return String(docValue).toLowerCase().includes(searchValue);
    });
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSearchInterface = () => {
    if (!hasAdditionalAccess(user) && !isUserAdmin(user)) {
      const fonctionTypes = getUserFonctionTypes(user, types);
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              Types de documents de votre structure
            </label>
            <Dropdown
              value={documentType_id}
              options={fonctionTypes}
              onChange={(e) => setDocumentType_id(e.value)}
              optionLabel="nom"
              optionValue="id"
              placeholder="Sélectionner un type de document"
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
              filter
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              Niveau structure
            </label>
            <Dropdown
              value={selectedNiveau}
              options={niveauOptions}
              onChange={(e) => {
                setSelectedNiveau(e.value);
                setSelectedEntitee(null);
                setDocumentType_id(null);
                setFilteredTypesByEntitee([]);
              }}
              placeholder="Sélectionner un niveau"
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              {selectedNiveau
                ? niveauOptions.find((n) => n.value === selectedNiveau)?.label
                : "Structure"}
            </label>
            <Dropdown
              value={selectedEntitee}
              options={entiteeOptions}
              onChange={(e) => {
                setSelectedEntitee(e.value);
                setDocumentType_id(null);
              }}
              disabled={!selectedNiveau || entiteeOptions.length === 0}
              placeholder={
                !selectedNiveau
                  ? "Choisissez d'abord un niveau"
                  : entiteeOptions.length === 0
                  ? "Aucune structure accessible"
                  : "Sélectionner une structure"
              }
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
              optionLabel="label"
              optionValue="value"
              filter
            />
          </div>
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              Type de document
            </label>
            <Dropdown
              value={documentType_id}
              options={filteredTypesByEntitee}
              onChange={(e) => setDocumentType_id(e.value)}
              disabled={
                !selectedEntitee ||
                filteredTypesByEntitee.length === 0 ||
                loadingTypes
              }
              placeholder={
                !selectedEntitee
                  ? "Choisissez d'abord une structure"
                  : filteredTypesByEntitee.length === 0
                    ? "Aucun type disponible"
                    : "Sélectionner un type"
              }
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
              optionLabel="nom"
              optionValue="id"
              filter
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <div className="mb-8">
        <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
            <Search size={24} />
          </div>
          Recherche Avancée
        </h1>
      </div>

      {getSearchInterface()}

      {documentType_id && metaFields.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm mb-6">
          <p className="text-sm font-bold text-emerald-800 mb-3">
            Critères de recherche ({metaFields.length}) :
          </p>
          <div className="flex flex-wrap gap-4">
            {metaFields.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100"
              >
                <Checkbox
                  onChange={() => toggleField(m.id)}
                  checked={selectedFields.includes(m.id)}
                />
                <label className="text-sm text-emerald-900 font-medium">
                  {m.label}
                  {m.source === "custom" && (
                    <span className="ml-1 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                      Personnalisé
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metaFields
            .filter((m) => selectedFields.includes(m.id))
            .map((m) => (
              <div key={m.id} className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
                  size={16}
                />
                <input
                  placeholder={`Rechercher par ${m.label}...`}
                  value={searchValues[m.id] || ""}
                  onChange={(e) =>
                    setSearchValues({ ...searchValues, [m.id]: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-100 rounded-xl shadow-sm outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>
            ))}
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/30 border-b border-emerald-50">
                <th className="p-5 text-[11px] font-black text-emerald-800 uppercase w-20">
                  Réf.
                </th>
                {metaFields.map((m) => (
                  <th
                    key={m.id}
                    className="p-5 text-[11px] font-black text-emerald-800 uppercase"
                  >
                    {m.label}
                  </th>
                ))}
                <th className="p-5 text-[11px] font-black text-emerald-800 uppercase w-48">
                  Emplacement
                </th>
                <th className="p-5 text-[11px] font-black text-emerald-800 uppercase w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {documentType_id && paginated.length > 0 ? (
                paginated.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => {
                      setSelected(d);
                      setDetailsVisible(true);
                    }}
                    className="cursor-pointer hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="p-5">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">
                        #{String(d.id).padStart(3, "0")}
                      </span>
                    </td>
                    {metaFields.map((m) => {
                      const value = d.values?.find(
                        (v: any) => v.metaField?.id === m.id
                      )?.value;
                      return (
                        <td
                          key={m.id}
                          className="p-5 text-sm text-emerald-900 font-medium"
                        >
                          {value || <span className="text-emerald-200">---</span>}
                        </td>
                      );
                    })}
                    <td className="p-5">
                      <LocationBadge
                        doc={d}
                        onClick={() => {
                          setSelectedForLocation(d);
                          setLocationModalVisible(true);
                        }}
                      />
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelected(d);
                            setDetailsVisible(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            setSelected(d);
                            setAjoutVisible(true);
                            e.stopPropagation();
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Chargement des fichiers"
                        >
                          <CloudDownload size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : documentType_id ? (
                <tr>
                  <td colSpan={metaFields.length + 3} className="p-20 text-center">
                    <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-4 text-emerald-200">
                      <FileText size={48} />
                    </div>
                    <p className="text-emerald-800 font-bold text-lg">
                      Aucun document trouvé
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {!documentType_id && (
          <div className="p-20 text-center">
            <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-4 text-emerald-200">
              <FileText size={48} />
            </div>
            <p className="text-emerald-800 font-bold text-lg">
              {!hasAdditionalAccess(user) && !isUserAdmin(user)
                ? "Sélectionnez un type de document"
                : "Sélectionnez un niveau, une structure et un type de document"}
            </p>
          </div>
        )}
      </div>

      {filtered.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      )}

      <DocumentDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        doc={selected}
        onRefresh={() => {
          getDocuments().then(setDocs);
        }}
      />
      <RechercheUploadPieces
        visible={ajoutVisible}
        onHide={() => setAjoutVisible(false)}
        document={selected}
        onSuccess={() => {
          getDocuments().then(setDocs);
        }}
      />
      <LocationModal
        visible={locationModalVisible}
        onHide={() => {
          setLocationModalVisible(false);
          setSelectedForLocation(null);
        }}
        doc={selectedForLocation}
      />
    </Layout>
  );
}