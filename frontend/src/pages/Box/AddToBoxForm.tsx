import React, { useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Archive } from "lucide-react";
import { Toast } from "primereact/toast";
import DocumentArchivage from "./Add/DocumentArchivage";

interface AddToBoxFormProps {
  documentId: number;
  typeDocumentId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

const AddToBoxForm: React.FC<AddToBoxFormProps> = ({
  documentId,
  typeDocumentId,
  onSuccess,
  onClose,
}) => {
  const toast = useRef<Toast>(null);

  // Transformer le document unique en tableau pour DocumentArchivage
  const selectedDocuments = [
    {
      documentId: documentId,
      typeDocumentId: typeDocumentId,
      documentRef: `#${String(documentId).padStart(3, "0")}`,
    },
  ];

  // Callback après archivage réussi
  const handleDocumentsArchived = () => {
    toast.current?.show({
      severity: "success",
      summary: "Succès",
      detail: "Document archivé avec succès",
    });
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <Toast ref={toast} />

      {/* Si onClose est fourni, on affiche dans un Dialog */}
      {onClose ? (
        <Dialog
          visible={true}
          onHide={onClose}
          header={
            <div className="flex items-center gap-2">
              <Archive size={20} className="text-emerald-600" />
              <span className="text-lg font-bold">Archiver le document</span>
            </div>
          }
          style={{ width: "600px" }}
          className="rounded-3xl"
          modal
          closable
        >
          <DocumentArchivage
            selectedDocuments={selectedDocuments}
            onDocumentsArchived={handleDocumentsArchived}
          />
        </Dialog>
      ) : (
        // Si pas de onClose, on affiche directement sans Dialog
        <div className="p-4 bg-white rounded-lg shadow h-full">
          <DocumentArchivage
            selectedDocuments={selectedDocuments}
            onDocumentsArchived={handleDocumentsArchived}
          />
        </div>
      )}
    </>
  );
};

export default AddToBoxForm;
