// src/pages/Client/CompteItem.tsx
import React from "react";
import {
  Banknote,
  ChevronRight,
  ChevronDown,
  FileStack,
  Plus,
  Pencil,
  Check,
  CloudDownload,
  Trash2,
  FileText,
  Trash2 as TrashIcon,
} from "lucide-react";
import { Compte, TypeDocument, Client } from "../../interfaces/index";
import { useTypeDocumentsByCompte } from "../../hooks/useComptes";
import Pagination from "../../components/layout/Pagination";

interface CompteItemProps {
  compte: Compte;
  client: Client;
  expandedCompte: number | null;
  onToggleCompte: (compteId: number) => void;
  expandedType: number | null;
  onToggleType: (typeId: number) => void;
  allDocuments: any[];
  metaFieldsByType: Record<number, any[]>;
  getCurrentPageForType: (typeId: number) => number;
  handlePageChange: (typeId: number, page: number) => void;
  itemsPerPageDocs: number;
  onNewDocument: (type: TypeDocument, client: Client) => void;
  onEditDocument: (doc: any) => void;
  onCheckPieces: (doc: any) => void;
  onUploadFiles: (doc: any) => void;
  onDeleteDocument: (id: number) => void;
  onViewDocument: (doc: any) => void;
  onEditCompte?: (compte: Compte) => void;
  onDeleteCompte?: (compte: Compte) => void;
}

export default function CompteItem({
  compte,
  client,
  expandedCompte,
  onToggleCompte,
  expandedType,
  onToggleType,
  allDocuments,
  metaFieldsByType,
  getCurrentPageForType,
  handlePageChange,
  itemsPerPageDocs,
  onNewDocument,
  onEditDocument,
  onCheckPieces,
  onUploadFiles,
  onDeleteDocument,
  onViewDocument,
  onEditCompte,
  onDeleteCompte,
}: CompteItemProps) {
  const isCompteExpanded = expandedCompte === compte.id;
  const { data: compteTypes = [] } = useTypeDocumentsByCompte(compte.id);

  // ✅ Métadonnées du type de compte
  const typeCompteMetaFields = compte.type_compte?.metaFields || [];

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all ${
        isCompteExpanded
          ? "border-blue-400 ring-1 ring-blue-200"
          : "border-slate-100"
      }`}
    >
      {/* ✅ HEADER COMPTE - UNIQUEMENT LES MÉTADONNÉES SUR UNE LIGNE */}
      <div className="flex items-center">
        <div
          onClick={() => onToggleCompte(compte.id)}
          className={`flex-1 flex items-center justify-between p-4 transition-all cursor-pointer ${
            isCompteExpanded ? "bg-blue-50/50" : "hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icône */}
            <div
              className={`p-1.5 rounded-lg flex-shrink-0 ${
                isCompteExpanded
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Banknote size={16} />
            </div>

            {/* ✅ UNIQUEMENT LES META VALUES SUR UNE SEULE LIGNE */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden flex-wrap">
              {typeCompteMetaFields.length > 0 ? (
                typeCompteMetaFields.map((field: any) => {
                  // Chercher la valeur dans values (tableau d'objets avec metaField)
                  const valueObj = compte.values?.find(
                    (v: any) =>
                      v.meta_field_id === field.id ||
                      v.metaField?.id === field.id,
                  );
                  const value = valueObj?.value;

                  if (!value) return null;

                  return (
                    <span
                      key={field.id}
                      className="text-xs text-slate-600 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                      title={field.label}
                    >
                      {field.label}:{" "}
                      <span className="font-semibold text-slate-800">
                        {value}
                      </span>
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Aucune métadonnée
                </span>
              )}

              {/* ✅ Si aucune métadonnée n'a de valeur */}
              {typeCompteMetaFields.length > 0 &&
                !typeCompteMetaFields.some((field: any) => {
                  const valueObj = compte.values?.find(
                    (v: any) =>
                      v.meta_field_id === field.id ||
                      v.metaField?.id === field.id,
                  );
                  return valueObj?.value;
                }) && (
                  <span className="text-xs text-slate-400 italic">
                    Métadonnées non renseignées
                  </span>
                )}
            </div>
          </div>

          {/* Chevron */}
          {isCompteExpanded ? (
            <ChevronDown
              size={16}
              className="text-blue-500 flex-shrink-0 ml-2"
            />
          ) : (
            <ChevronRight
              size={16}
              className="text-slate-400 flex-shrink-0 ml-2"
            />
          )}
        </div>

        {/* ✅ Boutons d'action sur le compte */}
        {onEditCompte && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCompte(compte);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
            title="Modifier le compte"
          >
            <Pencil size={16} />
          </button>
        )}
        {onDeleteCompte && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCompte(compte);
            }}
            className="p-2 mr-2 text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
            title="Supprimer le compte"
          >
            <TrashIcon size={16} />
          </button>
        )}
      </div>

      {/* TYPES DE DOCUMENTS DU COMPTE */}
      {isCompteExpanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/30 space-y-3">
          {compteTypes.length > 0 ? (
            compteTypes.map((type: TypeDocument) => {
              const isTypeExpanded = expandedType === type.id;
              const typeDocs = allDocuments.filter(
                (d: any) => d.type_document_id === type.id,
              );
              const currentPageForType = getCurrentPageForType(type.id);
              const paginatedDocs = typeDocs.slice(
                (currentPageForType - 1) * itemsPerPageDocs,
                currentPageForType * itemsPerPageDocs,
              );

              return (
                <div
                  key={type.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    isTypeExpanded ? "border-emerald-400" : "border-slate-100"
                  }`}
                >
                  {/* HEADER TYPE */}
                  <div
                    onClick={() => onToggleType(type.id)}
                    className={`w-full flex items-center justify-between p-4 transition-all cursor-pointer ${
                      isTypeExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isTypeExpanded
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <FileStack size={16} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              isTypeExpanded
                                ? "text-emerald-700"
                                : "text-slate-700"
                            }`}
                          >
                            {type.nom}
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            {type.code}
                          </span>
                          {type.conserne && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              {type.conserne === "Personne physique"
                                ? "👤 PP"
                                : "🏢 PM"}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {typeDocs.length} document(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNewDocument(type, client);
                        }}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Nouveau document"
                      >
                        <Plus size={14} />
                      </button>
                      {isTypeExpanded ? (
                        <ChevronDown size={16} className="text-emerald-500" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* TABLEAU DES DOCUMENTS */}
                  {isTypeExpanded && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                      {typeDocs.length > 0 ? (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-emerald-50/30 border-b border-emerald-50">
                                  <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                                    Réf.
                                  </th>
                                  {(metaFieldsByType[type.id] || []).map(
                                    (m) => (
                                      <th
                                        key={m.id}
                                        className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                                      >
                                        {m.label}
                                      </th>
                                    ),
                                  )}
                                  <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-emerald-50">
                                {paginatedDocs.map((doc) => (
                                  <tr
                                    key={doc.id}
                                    onClick={() => onViewDocument(doc)}
                                    className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                                  >
                                    <td className="p-3">
                                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                                        #{String(doc.id).padStart(3, "0")}
                                      </span>
                                    </td>
                                    {(metaFieldsByType[type.id] || []).map(
                                      (m) => {
                                        const value = doc.values?.find(
                                          (v: any) => v.metaField?.id === m.id,
                                        )?.value;
                                        return (
                                          <td
                                            key={m.id}
                                            className="p-3 text-sm text-emerald-900 font-medium"
                                          >
                                            {value || (
                                              <span className="text-emerald-200">
                                                ---
                                              </span>
                                            )}
                                          </td>
                                        );
                                      },
                                    )}
                                    <td className="p-3">
                                      <div
                                        className="flex justify-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          onClick={() => onEditDocument(doc)}
                                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                          title="Modifier"
                                        >
                                          <Pencil size={18} />
                                        </button>
                                        <button
                                          onClick={() => onCheckPieces(doc)}
                                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                          title="Pièces disponibles"
                                        >
                                          <Check size={18} />
                                        </button>
                                        <button
                                          onClick={() => onUploadFiles(doc)}
                                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                          title="Charger des fichiers"
                                        >
                                          <CloudDownload size={18} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            onDeleteDocument(doc.id)
                                          }
                                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {typeDocs.length > itemsPerPageDocs && (
                            <div className="mt-4 flex justify-center">
                              <Pagination
                                currentPage={currentPageForType}
                                itemsPerPage={itemsPerPageDocs}
                                totalItems={typeDocs.length}
                                onPageChange={(page) =>
                                  handlePageChange(type.id, page)
                                }
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <FileText
                            size={32}
                            className="mx-auto text-slate-300 mb-2"
                          />
                          <p className="text-sm text-slate-400 italic">
                            Aucun document pour ce type
                          </p>
                          <button
                            onClick={() => onNewDocument(type, client)}
                            className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                          >
                            <Plus size={14} className="inline mr-1" />
                            Créer le premier document
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <FileStack size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400 italic">
                Aucun type de document associé à ce compte
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
