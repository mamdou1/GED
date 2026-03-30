// frontend/src/components/documents/FileItem.tsx
import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Eye, Trash2, FileText, Image, File } from "lucide-react";
import api from "../../api/axios";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

interface FileItemProps {
  file: {
    id: number;
    fichier: string;
    original_name: string;
    new_file_name?: string;
    created_at?: string;
    createdAt?: string;
  };
  documentId: number;
  pieceId?: number | null;
  fileType?: "document" | "piece";
  onDeleteSuccess?: () => void; // 🔥 Changé : callback après suppression réussie
  onView?: (url: string) => void;
}

const FileItem = ({
  file,
  documentId,
  pieceId,
  fileType = "document",
  onDeleteSuccess,
  onView,
}: FileItemProps) => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const isDeletingRef = useRef<boolean>(false);
  const toast = useRef<Toast>(null);

  const getFileIcon = () => {
    const ext = file.original_name?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText size={20} className="text-red-500" />;
    if (["jpg", "jpeg", "png", "gif"].includes(ext || ""))
      return <Image size={20} className="text-green-500" />;
    return <File size={20} className="text-blue-500" />;
  };

  const handleDelete = () => {
    if (isDeletingRef.current) {
      console.log(`⚠️ Suppression déjà en cours pour ${file.id}`);
      return;
    }

    confirmDialog({
      message: `Voulez-vous vraiment supprimer le fichier "${file.original_name}" ?`,
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        if (isDeletingRef.current) return;

        isDeletingRef.current = true;
        setDeleting(true);

        try {
          let url: string;

          if (fileType === "piece") {
            // Fichier dans pieces_fichiers
            url = `/documents/${documentId}/pieces/${pieceId}/files/${file.id}`;
          } else {
            // Fichier dans document_fichiers
            url = `/documents/${documentId}/files/${file.id}`;
          }

          console.log("🗑️ Suppression du fichier:", { url, fileId: file.id });
          await api.delete(url);

          // 🔥 Un seul appel API, puis on notifie le parent
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }

          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Fichier supprimé avec succès",
            life: 3000,
          });
        } catch (error: any) {
          console.error("Erreur lors de la suppression:", error);
          // Si 404, le fichier n'existe plus, on notifie quand même pour rafraîchir
          if (error.response?.status === 404 && onDeleteSuccess) {
            onDeleteSuccess();
          }

          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de supprimer le fichier",
          });
        } finally {
          isDeletingRef.current = false;
          setDeleting(false);
        }
      },
    });
  };

  const handleView = () => {
    const fileUrl = `http://localhost:5001/${file.fichier}`;
    if (onView) {
      onView(fileUrl);
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-slate-50 rounded-lg">{getFileIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {file.original_name}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(file.created_at || file.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            icon={<Eye size={16} />}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            tooltip="Visualiser"
            tooltipOptions={{ position: "top" }}
            onClick={handleView}
            disabled={deleting}
          />
          <Button
            icon={<Trash2 size={16} />}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            tooltip="Supprimer"
            tooltipOptions={{ position: "top" }}
            onClick={handleDelete}
            loading={deleting}
            disabled={deleting}
          />
        </div>
      </div>
    </>
  );
};

export default FileItem;
