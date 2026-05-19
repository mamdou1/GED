import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import {
  X,
  Hash,
  Settings2,
  ShieldCheck,
  ListChecks,
  Info,
  Layers,
  GitMerge,
  Building2,
  FileTypeCorner,
} from "lucide-react";
import { Button } from "primereact/button";

import DocumentTypeMetaListe from "./DocumentTypeMetaListe";
import DocumentTypePieceListe from "./DocumentTypePieceListe";
import TypeDocumentAjoutPieces from "./TypeDocumentAjoutPieces";
import { getPieces } from "../../api/pieces";
import { addPiecesToTypeDocument } from "../../api/typeDocument";
import { Pieces } from "../../interfaces";

export default function DocumentTypeDetails({ visible, onHide, type }: any) {
  const [formPiecesVisible, setFormPiecesVisible] = useState(false);
  const [allPieces, setAllPieces] = useState<Pieces[]>([]);

  // ✅ AJOUTER DES LOGS POUR DEBUG
  useEffect(() => {
    if (visible && type) {
      console.log("🔍 DocumentTypeDetails - type reçu:", type);
      console.log("🔍 entitee_un:", type.entitee_un);
      console.log("🔍 entitee_deux:", type.entitee_deux);
      console.log("🔍 entitee_trois:", type.entitee_trois);
    }
  }, [visible, type]);

  useEffect(() => {
    if (visible) {
      getPieces().then((res) => setAllPieces(Array.isArray(res) ? res : []));
    }
  }, [visible]);

  if (!type) return null;

  // ✅ CORRECTION : Utiliser les bons noms de champs du backend
  // Le backend retourne : entitee_un, entitee_deux, entitee_trois (qui sont des tableaux)
  const entitesUn = type.entitee_un || [];
  const entitesDeux = type.entitee_deux || [];
  const entitesTrois = type.entitee_trois || [];

  console.log("📊 entitesUn:", entitesUn);
  console.log("📊 entitesDeux:", entitesDeux);
  console.log("📊 entitesTrois:", entitesTrois);

  const tabHeaderTemplate = (context: any) => ({
    className: `flex items-center cursor-pointer select-none px-6 py-4 border-b-2 font-black text-[11px] uppercase tracking-widest transition-all duration-500 rounded-t-2xl
      ${
        context.active
          ? "border-emerald-500 text-emerald-700 bg-emerald-50/40 shadow-[0_-4px_12px_-5px_rgba(16,185,129,0.1)]"
          : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
      }`,
  });

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      showHeader={false}
      style={{ width: "680px" }}
      className="rounded-[3rem] overflow-hidden shadow-2xl border-none"
      contentClassName="p-0 bg-slate-50/30 backdrop-blur-sm"
    >
      <div className="relative">
        {/* HEADER : Design Immersif */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-900 p-10 overflow-hidden">
          {/* Cercles de décoration subtils */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

          <button
            onClick={onHide}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 z-10"
          >
            <X size={20} />
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-emerald-200 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
              <Info size={12} className="text-emerald-400" />
              Fiche Technique Document
            </div>

            <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-6">
              {type.nom}
            </h2>

            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 shadow-inner">
                <div className="p-1.5 bg-emerald-400/20 rounded-lg">
                  <Hash size={14} className="text-emerald-300" />
                </div>
                <span className="text-white text-sm tracking-wider">
                  {type.code}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 shadow-inner">
                <div className="p-1.5 bg-emerald-400/20 rounded-lg">
                  <FileTypeCorner size={14} className="text-emerald-300" />
                </div>
                <span className="text-white text-sm font-bold tracking-wider">
                  {type.cote}
                </span>
              </div>
            </div>

            {/* ✅ CORRECTION : Utiliser les bons noms de champs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {/* Affichage des Entités Niveau 1 */}
              {entitesUn.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full">
                  {entitesUn.map((e: any) => (
                    <div
                      key={e.id}
                      className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-inner"
                    >
                      <Building2 size={12} className="text-emerald-300" />
                      <span className="text-white text-[11px] font-bold uppercase tracking-tight">
                        {e.libelle}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Affichage des Entités Niveau 2 */}
              {entitesDeux.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full">
                  {entitesDeux.map((e: any) => (
                    <div
                      key={e.id}
                      className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-inner"
                    >
                      <Layers size={12} className="text-blue-300" />
                      <span className="text-white text-[11px] font-bold uppercase tracking-tight">
                        {e.libelle}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Affichage des Entités Niveau 3 */}
              {entitesTrois.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full">
                  {entitesTrois.map((e: any) => (
                    <div
                      key={e.id}
                      className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-inner"
                    >
                      <GitMerge size={12} className="text-orange-300" />
                      <span className="text-white text-[11px] font-bold uppercase tracking-tight">
                        {e.libelle}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cas transversal : aucun entité associée */}
              {entitesUn.length === 0 && entitesDeux.length === 0 && entitesTrois.length === 0 && (
                <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="text-white/60 text-[11px] font-bold uppercase tracking-widest italic">
                    Document Transversal
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BODY : Layout épuré */}
        <div className="p-8 -mt-6 bg-white rounded-t-[2.5rem] relative z-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
          <TabView
            pt={{
              navContainer: { className: "border-b border-slate-100 mb-6" },
              nav: { className: "flex gap-4 bg-transparent border-none" },
              panelContainer: { className: "p-0" },
            }}
          >
            <TabPanel
              header="Métadonnées"
              leftIcon={
                <ShieldCheck size={18} className="mr-3 text-emerald-500" />
              }
              pt={{
                headerAction: ({ context }: any) => ({
                  className: `
                  flex items-center cursor-pointer select-none px-5 py-3 border-b-2 font-bold text-sm transition-all duration-300 rounded-t-xl
                  ${
                    context.active
                      ? "border-emerald-500 text-emerald-700 bg-emerald-100 shadow-[0_-4px_12px_-5px_rgba(16,185,129,0.1)]"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                  }
                `,
                }),
              }}
            >
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DocumentTypeMetaListe metaFields={type.metaFields} />
              </div>
            </TabPanel>

            <TabPanel
              header="Pièces Jointes"
              leftIcon={
                <ListChecks size={18} className="mr-3 text-emerald-500" />
              }
              pt={{
                headerAction: ({ context }: any) => ({
                  className: `
                  flex items-center cursor-pointer select-none px-5 py-3 border-b-2 font-bold text-sm transition-all duration-300 rounded-t-xl
                  ${
                    context.active
                      ? "border-emerald-500 text-emerald-700 bg-emerald-100 shadow-[0_-4px_12px_-5px_rgba(16,185,129,0.1)]"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                  }
                `,
                }),
              }}
            >
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DocumentTypePieceListe
                  pieces={type.pieces || []}
                  onAdd={() => setFormPiecesVisible(true)}
                />
              </div>
            </TabPanel>
          </TabView>

          {/* FOOTER : Actions & Infos */}
          <div className="mt-10 space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors duration-300 group">
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:text-emerald-600 transition-colors">
                <Settings2 size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                  Information Système
                </p>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  Ce type de document utilise une configuration stricte. Les
                  pièces rattachées seront obligatoires lors de toute nouvelle
                  soumission pour <b>{type.nom}</b>.
                </p>
              </div>
            </div>

            <Button
              label="Fermer la vue détaillée"
              onClick={onHide}
              className="w-full py-5 bg-slate-900 hover:bg-emerald-950 text-white font-black text-sm uppercase tracking-[0.2em] rounded-[1.5rem] transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-emerald-100 border-none outline-none"
            />
          </div>
        </div>
      </div>

      <TypeDocumentAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={async (id, payload) => {
          await addPiecesToTypeDocument(id, payload);
          setFormPiecesVisible(false);
        }}
        initial={type}
        pieces={allPieces}
      />
    </Dialog>
  );
}