import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getTotalAgents,
  getTotalTypesDocument,
  getTotalDocuments,
  getAgentsByEntiteeUn,
  getAgentsByEntiteeDeux,
  getAgentsByEntiteeTrois,
  getAgentsByStructure,
  getDocumentsByType,
  getDocumentsByMonth,
  getDocumentsByStructure,
} from "../../api/statistiques.api";
import Layout from "../../components/layout/Layoutt";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Exercice } from "../../interfaces";
import { getExercices } from "../../api/exercice";
import { Toast } from "primereact/toast";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getAllEntiteeDeux } from "../../api/entiteeDeux";
import { getAllEntiteeTrois } from "../../api/entiteeTrois";
import { EntiteeDeux, EntiteeUn, EntiteeTrois } from "../../interfaces";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  ArrowUpRight,
  Users,
  FileText,
  FolderTree,
  Building2,
  Layers,
  GitMerge,
  Database,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  const [totalAgents, setTotalAgents] = useState<number>(0);
  const [totalTypesDocument, setTotalTypesDocument] = useState<number>(0);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);

  const [agentsByEntiteeUn, setAgentsByEntiteeUn] = useState([]);
  const [agentsByEntiteeDeux, setAgentsByEntiteeDeux] = useState([]);
  const [agentsByEntiteeTrois, setAgentsByEntiteeTrois] = useState([]);
  const [agentsByStructure, setAgentsByStructure] = useState([]);

  const [documentsByType, setDocumentsByType] = useState([]);
  const [documentsByMonth, setDocumentsByMonth] = useState([]);
  const [documentsByStructure, setDocumentsByStructure] = useState([]);

  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);

  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<Exercice | null>(
    null,
  );
  const [options, setOptions] = useState({
    n1: [] as EntiteeUn[],
    n2: [] as EntiteeDeux[],
    n3: [] as EntiteeTrois[],
  });

  // Utiliser useRef pour le flag isMounted
  const isMounted = useRef(true);

  const loadStats = useCallback(async () => {
    setLoading(true);

    try {
      // Totaux
      const [agents, types, docs, ent1, ent2, ent3] = await Promise.all([
        getTotalAgents(),
        getTotalTypesDocument(),
        getTotalDocuments(),
        getAllEntiteeUn(),
        getAllEntiteeDeux(),
        getAllEntiteeTrois(),
      ]);

      // Vérifier si le composant est toujours monté
      if (isMounted.current) {
        setTotalAgents(agents.total);
        setTotalTypesDocument(types.total);
        setTotalDocuments(docs.total);
        setAllEntiteeUn(Array.isArray(ent1) ? ent1 : []);
        setAllEntiteeDeux(Array.isArray(ent2) ? ent2 : []);
        setAllEntiteeTrois(Array.isArray(ent3) ? ent3 : []);
      }

      // Agents par structure
      const [agentsUn, agentsDeux, agentsTrois, agentsStruct] =
        await Promise.all([
          getAgentsByEntiteeUn(),
          getAgentsByEntiteeDeux(),
          getAgentsByEntiteeTrois(),
          getAgentsByStructure(),
        ]);

      if (isMounted.current) {
        setAgentsByEntiteeUn(agentsUn);
        setAgentsByEntiteeDeux(agentsDeux);
        setAgentsByEntiteeTrois(agentsTrois);
        setAgentsByStructure(agentsStruct);
      }

      // Documents
      const [docsType, docsMonth, docsStruct] = await Promise.all([
        getDocumentsByType(),
        getDocumentsByMonth(),
        getDocumentsByStructure(),
      ]);

      if (isMounted.current) {
        setDocumentsByType(docsType);
        setDocumentsByMonth(docsMonth);
        setDocumentsByStructure(docsStruct);
      }

      if (isMounted.current) {
        setOptions({
          n1: Array.isArray(ent1) ? ent1 : [],
          n2: Array.isArray(ent2) ? ent2 : [],
          n3: Array.isArray(ent3) ? ent3 : [],
        });
      }
    } catch (error: any) {
      if (isMounted.current) {
        toast?.current?.show({
          severity: "error",
          summary: "Erreur",
          detail:
            error?.response?.data?.message ||
            "Erreur lors du chargement des statistiques",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []); // Dépendances vides car utilise des setters stables

  const affichage = useCallback(async () => {
    try {
      const data = await getExercices();
      if (isMounted.current) {
        setExercices(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      if (isMounted.current) {
        toast?.current?.show({
          severity: "error",
          summary: "Erreur",
          detail:
            err?.response?.data?.message || "Veuillez saisir un exercice.",
        });
      }
    }
  }, []);

  // useEffect pour initialiser le flag isMounted
  useEffect(() => {
    isMounted.current = true;

    // Fonction de nettoyage
    return () => {
      isMounted.current = false;
    };
  }, []);

  // useEffect pour charger les données
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([loadStats(), affichage()]);
    };

    fetchData();
  }, [loadStats, affichage]); // Dépendances des callbacks

  // Composant Card pour les totaux
  const TotalCard = ({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    bgColor,
  }: any) => (
    <div
      className={` ${bgColor} rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bgClass}`}>
          <Icon size={24} className={colorClass} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Total
        </span>
      </div>
      <h2 className="text-sm font-bold text-slate-500 mb-1">{title}</h2>
      <p className="text-3xl font-black text-slate-800">
        {value.toLocaleString()}
      </p>
    </div>
  );

  // Composant Card pour les listes
  const ListCard = ({
    title,
    data,
    icon: Icon,
    colorClass,
    bgClass,
    valueLabel = "Nombre",
    bgColor,
  }: any) => (
    <div
      className={`${bgColor} bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300 h-full`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl ${bgClass}`}>
            <Icon size={24} className={colorClass} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Statistiques
          </span>
        </div>

        <h2 className="text-lg font-extrabold text-slate-800 mb-4 tracking-tight">
          {title}
        </h2>

        {data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-400 text-sm italic">
              Aucune donnée trouvée.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-emerald-100 hover:bg-emerald-50/50 transition-all cursor-default"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                    {item.libelle ||
                      item.typeNom ||
                      item.structureLibelle ||
                      item.moisLibelle ||
                      "N/A"}
                  </span>
                  {item.code && (
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {item.code}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-700">
                    {item.nombre || item.total || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase italic">
          Total:{" "}
          {data.reduce(
            (acc: number, item: any) => acc + (item.nombre || item.total || 0),
            0,
          )}
        </span>
        <ArrowUpRight size={14} className="text-slate-300" />
      </div>
    </div>
  );

  // ✅ Vérifier si les titres existent pour chaque niveau
  const titreN1Existe = options.n1.length > 0 && options.n1[0]?.titre;
  const titreN2Existe = options.n2.length > 0 && options.n2[0]?.titre;
  const titreN3Existe = options.n3.length > 0 && options.n3[0]?.titre;

  return (
    <Layout>
      <Toast ref={toast} />

      {/* HEADER DU DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={20} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">
              Reporting System
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Tableau de <span className="text-emerald-600">Bord</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Visualisation consolidée des statistiques de la plateforme
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 text-slate-400 border-r border-slate-100">
            <Calendar size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Exercice
            </span>
          </div>
          <Dropdown
            value={selectedExercice}
            options={exercices}
            optionLabel="annee"
            onChange={(e) => setSelectedExercice(e.value)}
            className="border-none w-44 focus:ring-0 text-sm font-bold"
            placeholder="Sélectionner..."
          />
          <button
            className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
            title="Ajouter un exercice"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* TOTAUX - 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <TotalCard
          title="Total Agents"
          value={totalAgents}
          icon={Users}
          colorClass="text-blue-600"
          bgClass="bg-blue-200"
          bgColor="bg-blue-50"
        />
        <TotalCard
          title="Types de documents"
          value={totalTypesDocument}
          icon={FolderTree}
          colorClass="text-purple-600"
          bgClass="bg-purple-100"
          bgColor="bg-purple-50"
        />
        <TotalCard
          title="Documents archivés"
          value={totalDocuments}
          icon={FileText}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* AGENTS PAR STRUCTURE - 3 CARDS */}
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Users size={20} className="text-emerald-600" />
        Répartition des agents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {titreN1Existe && (
          <ListCard
            title={`Agents par ${allEntiteeUn[0]?.titre || "Niveau 1"}`}
            data={agentsByEntiteeUn}
            icon={Building2}
            colorClass="text-blue-600"
            bgClass="bg-blue-100"
            valueLabel="Agents"
            bgColor="bg-blue-50"
          />
        )}
        {titreN2Existe && (
          <ListCard
            title={`Agents par ${allEntiteeDeux[0]?.titre || "Niveau 2"}`}
            data={agentsByEntiteeDeux}
            icon={Layers}
            colorClass="text-purple-600"
            bgClass="bg-purple-100"
            valueLabel="Agents"
            bgColor="bg-purple-50"
          />
        )}
        {titreN3Existe && (
          <ListCard
            title={`Agents par ${allEntiteeTrois[0]?.titre || "Niveau 3"}`}
            data={agentsByEntiteeTrois}
            icon={GitMerge}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-100"
            valueLabel="Agents"
            bgColor="bg-emerald-50"
          />
        )}
        <ListCard
          title="Agents par structure"
          data={agentsByStructure}
          icon={Users}
          colorClass="text-amber-600"
          bgClass="bg-amber-100"
          valueLabel="Agents"
          bgColor="bg-amber-50"
        />
      </div>

      {/* DOCUMENTS - 3 CARDS */}
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-emerald-600" />
        Statistiques documentaires
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ListCard
          title="Documents par type"
          data={documentsByType}
          icon={FolderTree}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
          valueLabel="Documents"
        />
        <ListCard
          title="Documents par mois"
          data={documentsByMonth}
          icon={Clock}
          colorClass="text-purple-600"
          bgClass="bg-purple-100"
          valueLabel="Documents"
        />
        <ListCard
          title="Documents par structure"
          data={documentsByStructure}
          icon={Database}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          valueLabel="Documents"
        />
      </div>

      {/* OPTIONNEL : Bouton d'export */}
      {/* <div className="mt-10 bg-emerald-700 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-emerald-200">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-bold">Prêt pour l'export ?</h3>
            <p className="text-emerald-100 opacity-80 mt-1 font-medium">
              Générez un rapport PDF détaillé de l'exercice en cours.
            </p>
          </div>
          <Button
            label="Exporter les statistiques"
            icon="pi pi-file-pdf"
            className="bg-white text-emerald-700 border-none px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all"
          />
        </div>*/}
      {/* Cercles de décoration en arrière-plan */}
      {/* <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
      </div>  */}
    </Layout>
  );
}
