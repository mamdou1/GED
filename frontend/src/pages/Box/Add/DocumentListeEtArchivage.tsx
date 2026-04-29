import React, { useState, useRef } from "react";
import { FileStack, ArrowRightLeft } from "lucide-react";
import { Toast } from "primereact/toast";
import DocumentListe from "./DocumentListe";
import DocumentArchivage from "./DocumentArchivage";

interface SelectedDocument {
  documentId: number;
  typeDocumentId: number;
  documentRef: string;
}

const DocumentListeEtArchivage: React.FC = () => {
  const [selectedDocuments, setSelectedDocuments] = useState<
    SelectedDocument[]
  >([]);
  const toast = useRef<Toast>(null);

  const handleDocumentsChange = (documents: SelectedDocument[]) => {
    setSelectedDocuments(documents);
  };

  const handleDocumentsArchived = () => {
    // Réinitialiser la sélection après archivage réussi
    setSelectedDocuments([]);
    toast.current?.show({
      severity: "success",
      summary: "Terminé",
      detail: "Les documents ont été archivés avec succès",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Toast ref={toast} />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Archivage des Documents
            </h1>
            <p className="text-sm text-slate-500">
              Sélectionnez les documents à gauche, choisissez la destination à
              droite
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal : deux colonnes */}
      <div className="flex-1 flex overflow-hidden p-5">
        {/* Colonne gauche : Liste des documents */}
        <div className="w-1/2 border-r border-slate-200 bg-white overflow-hidden">
          <DocumentListe
            selectedDocuments={selectedDocuments}
            onDocumentsChange={handleDocumentsChange}
          />
        </div>

        {/* Colonne droite : Filtres et archivage */}
        <div className="w-1/2 bg-white overflow-hidden p-5">
          <DocumentArchivage
            selectedDocuments={selectedDocuments}
            onDocumentsArchived={handleDocumentsArchived}
          />
        </div>
      </div>

      {/* Footer : Résumé */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              <span className="font-bold text-emerald-600">
                {selectedDocuments.length}
              </span>{" "}
              document(s) sélectionné(s)
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Site → Salle → Rayon → Travée → Box
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentListeEtArchivage;
