import { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Eye, FileText, FileSearch } from "lucide-react";
import api, { BACKEND_URL } from "../../api/axios";

type Props = {
  visible: boolean;
  onHide: () => void;
  document: any | null; // Reçoit l'objet document sélectionné
};

export default function DocumentPiece({ visible, onHide, document }: Props) {
  const toast = useRef<Toast>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // Charger les fichiers associés au document [cite: 374, 405]
  const loadFiles = async () => {
    if (!document?.id) return;
    try {
      const { data } = await api.get(`/documents/${document.id}/files`);
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement fichiers", err);
    }
  };

  useEffect(() => {
    if (visible && document) loadFiles();
  }, [visible, document]);

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        setViewerUrl(null); // Vide le visualiseur pour la prochaine fois
        onHide();
      }}
      style={{ width: "90vw", maxWidth: "1200px" }}
      header={`Pièces jointes - Document #${document?.id}`}
      className="rounded-3xl"
    >
      <Toast ref={toast} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Liste des fichiers à gauche */}
        <div className="lg:col-span-4 border-r pr-4">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4">
            Fichiers enregistrés
          </h3>
          <div className="space-y-2">
            {files.length > 0 ? (
              files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm font-medium truncate flex-1">
                    {f.filename}
                  </span>
                  <Button
                    icon={<Eye size={16} />}
                    onClick={() =>
                      setViewerUrl(`${BACKEND_URL}/${f.path}`)
                    }
                    className="p-button-text p-button-rounded"
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-20" />
                <p>Aucun fichier joint</p>
              </div>
            )}
          </div>
        </div>

        {/* Visualiseur à droite */}
        <div className="lg:col-span-8 bg-slate-100 rounded-2xl flex items-center justify-center">
          {viewerUrl ? (
            <iframe
              src={viewerUrl}
              className="w-full h-full rounded-2xl border-none"
              title="Viewer"
            />
          ) : (
            <div className="text-center text-slate-400">
              <FileSearch size={48} className="mx-auto mb-2 opacity-20" />
              <p>Sélectionnez un fichier pour l'aperçu</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
