import { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import {
  FileUp,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  X,
  FileSearch,
  Folders,
  ChevronDown,
  Folder,
  ChevronUp,
  CloudUpload,
  Layers,
  Archive,
  Hash,
  Calendar as CalendarIcon,
  Type,
  Save,
  Plus,
  Trash2,
  Pencil,
  CheckSquare,
  Info,
} from "lucide-react";
import type {
  Document,
  Pieces,
  PieceMetaField,
  ModeChargement,
  PieceRecord,
} from "../../interfaces";
import api from "../../api/axios";
import { getPieceMetaFields } from "../../api/pieceMetaField";
import {
  getPieceValuesByDocument,
  uploadPieceFile,
} from "../../api/pieceValue";
import { confirmDialog } from "primereact/confirmdialog";
import { Checkbox } from "primereact/checkbox";
import FileItem from "../../components/documents/FileItem";

type Props = {
  visible: boolean;
  onHide: () => void;
  document: Document | null;
  onSuccess?: () => void;
};

interface DocumentFile {
  id: number;
  fichier: string;
  original_name: string;
  new_file_name?: string;
  created_at?: string;
  createdAt?: string;
}

export default function DocumentUploadPieces({
  visible,
  onHide,
  document,
  onSuccess,
}: Props) {
  const toast = useRef<Toast>(null);
  const [uploadMode, setUploadMode] = useState<ModeChargement>("INDIVIDUEL");

  // État pour LOT_UNIQUE
  const [lotFiles, setLotFiles] = useState<any[]>([]);
  const [selectedLotFile, setSelectedLotFile] = useState<File | null>(null);

  // État pour les pièces et leurs métadonnées
  const [piecesState, setPiecesState] = useState<any[]>([]);
  const [expandedDivisions, setExpandedDivisions] = useState<
    Record<string, boolean>
  >({});
  const [expandedPieces, setExpandedPieces] = useState<Record<number, boolean>>(
    {},
  );

  // État pour les métadonnées des pièces
  const [pieceMetaFields, setPieceMetaFields] = useState<
    Record<number, PieceMetaField[]>
  >({});
  const [pieceRecords, setPieceRecords] = useState<
    Record<number, PieceRecord[]>
  >({});
  const [loadingMeta, setLoadingMeta] = useState<Record<number, boolean>>({});
  const [initialMetaLoaded, setInitialMetaLoaded] = useState(false);

  // État pour le formulaire d'ajout
  const [showForm, setShowForm] = useState<Record<number, boolean>>({});
  const [editingRecord, setEditingRecord] = useState<
    Record<number, PieceRecord | null>
  >({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formFiles, setFormFiles] = useState<Record<string, File | null>>({});

  // État pour les fichiers (pièces sans métadonnées)
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});
  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [pieceFiles, setPieceFiles] = useState<Record<number, any[]>>({});

  // Visionneuse (un seul état pour gérer tous les aperçus)
  const [viewer, setViewer] = useState<{
    visible: boolean;
    url: string | null;
    isPreview?: boolean; // pour savoir si c'est une prévisualisation avant upload
    file?: File | null; // pour stocker le fichier à uploader
    pieceId?: number | null;
    fieldId?: number | null;
  }>({ visible: false, url: null, isPreview: false });

  const [lotPiecesSelection, setLotPiecesSelection] = useState<number[]>([]);
  const [showLotPieceSelector, setShowLotPieceSelector] = useState(false);

  // Fonction pour supprimer un fichier de pièce simple
  const [deletingFiles, setDeletingFiles] = useState<Set<number>>(new Set());

  /* ================= CHARGEMENT INITIAL ================= */
  useEffect(() => {
    if (!document) {
      setPiecesState([]);
      return;
    }

    const dossierPieces = document.pieces || [];
    const merged = dossierPieces.map((p: any) => ({
      ...p,
      disponible: p.DocumentPieces?.disponible ?? true,
    }));

    setPiecesState(merged);

    if (!initialMetaLoaded) {
      loadAllPiecesMetaFields(merged);
      setInitialMetaLoaded(true);
    }
  }, [document]);

  /* ================= CHARGEMENT DES MÉTADONNÉES ================= */
  const loadAllPiecesMetaFields = async (pieces: any[]) => {
    if (!document) return;

    const promises = pieces.map(async (piece) => {
      try {
        const fields = await getPieceMetaFields(piece.id.toString());
        if (fields.length > 0) {
          setPieceMetaFields((prev) => ({ ...prev, [piece.id]: fields }));
        }
      } catch (error) {
        console.error(
          `Erreur chargement métadonnées pièce ${piece.id}:`,
          error,
        );
      }
    });

    await Promise.all(promises);
    await loadAllPieceRecords();
  };

  /* ================= CHARGEMENT DES ENREGISTREMENTS ================= */

  const loadAllPieceRecords = async () => {
    if (!document) return;

    try {
      const values = await getPieceValuesByDocument(document.id);
      console.log("📦 Valeurs brutes:", values);

      const recordsByPiece: Record<number, Record<number, PieceRecord>> = {};

      values.forEach((value) => {
        const pieceId = value.piece_id;
        const rowId = value.row_id || value.id;

        if (!recordsByPiece[pieceId]) {
          recordsByPiece[pieceId] = {};
        }

        if (!recordsByPiece[pieceId][rowId]) {
          recordsByPiece[pieceId][rowId] = {
            id: rowId,
            rowId: rowId,
            valueIds: {}, // ✅ Stocker les IDs des valeurs par champ
            values: {},
            files: [],
            createdAt: value.createdAt,
          };
        }

        // Stocker l'ID de la valeur pour ce champ
        recordsByPiece[pieceId][rowId].valueIds[value.piece_meta_field_id] =
          value.id;
        recordsByPiece[pieceId][rowId].values[value.piece_meta_field_id] =
          value.value;

        if (value.file) {
          recordsByPiece[pieceId][rowId].files?.push(value.file);
        }
      });

      const finalRecords: Record<number, PieceRecord[]> = {};
      Object.keys(recordsByPiece).forEach((pieceId) => {
        finalRecords[parseInt(pieceId)] = Object.values(
          recordsByPiece[parseInt(pieceId)],
        );
      });

      console.log("✅ Enregistrements groupés par row_id:", finalRecords);
      setPieceRecords(finalRecords);
    } catch (error) {
      console.error("Erreur chargement enregistrements:", error);
    }
  };

  /* ================= CHARGEMENT DES FICHIERS LOT ================= */
  const loadLotUniqueFiles = async () => {
    if (!document) return;
    try {
      const { data } = await api.get(
        `/documents/${document.id}/lot-unique/files`,
      );
      setLotFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement fichiers lot:", error);
    }
  };

  /* ================= COMPOSANT DE SELECTION DES PIECES LOT_UNIQUE ================= */
  const LotPieceSelector = ({
    pieces,
    selectedPieces,
    onTogglePiece,
    onClose,
    onConfirm,
  }: {
    pieces: any[];
    selectedPieces: number[];
    onTogglePiece: (pieceId: number) => void;
    onClose: () => void;
    onConfirm: () => void;
  }) => {
    const [expandedDivisions, setExpandedDivisions] = useState<
      Record<string, boolean>
    >({});

    const toggleDivision = (division: string) => {
      setExpandedDivisions((prev) => ({
        ...prev,
        [division]: !prev[division],
      }));
    };

    // Grouper uniquement les pièces filtrées
    const groupedPieces = pieces.reduce((acc: any, item: any) => {
      const divisionObj = item.division || item.piece?.division;
      const divLibelle = divisionObj?.libelle || "AUTRES PIECES";

      if (!acc[divLibelle]) {
        acc[divLibelle] = [];
      }
      acc[divLibelle].push(item);
      return acc;
    }, {});

    // Vérifier s'il y a des pièces à afficher
    const hasPieces = Object.keys(groupedPieces).length > 0;

    return (
      <div className="bg-white rounded-xl border border-emerald-200 p-4 mb-4">
        <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
          <CheckSquare size={16} />
          Voulez-vous associer des pièces à ce lot ?
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Cochez les pièces qui sont incluses dans ce document.
          {pieces.length === 0 && (
            <span className="block mt-2 text-amber-600 font-medium">
              ℹ️ Toutes les pièces sont déjà disponibles pour ce document.
            </span>
          )}
        </p>

        {hasPieces ? (
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2">
            {Object.entries(groupedPieces).map(
              ([division, pieces]: [string, any]) => {
                const isExpanded = expandedDivisions[division] ?? true;

                return (
                  <div
                    key={division}
                    className="mb-2 border border-slate-100 rounded-lg overflow-hidden"
                  >
                    <div
                      onClick={() => toggleDivision(division)}
                      className="bg-slate-50 p-2 flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-xs font-bold uppercase text-slate-600">
                        {division}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="p-2 space-y-2">
                        {pieces.map((p: any) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 p-1"
                          >
                            <Checkbox
                              checked={selectedPieces.includes(p.id)}
                              onChange={() => onTogglePiece(p.id)}
                              className="border border-emerald-400"
                            />
                            <span className="text-sm">{p.libelle}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">
              Aucune pièce non disponible
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Annuler"
            onClick={onClose}
            className="bg-slate-100 text-slate-600 border-none text-sm py-2 px-4"
          />
          <Button
            label="Confirmer la sélection"
            onClick={onConfirm}
            className="bg-emerald-600 text-white border-none text-sm py-2 px-4"
            disabled={!hasPieces} // Désactiver s'il n'y a pas de pièces
          />
        </div>
      </div>
    );
  };

  const toggleLotPieceSelection = (pieceId: number) => {
    setLotPiecesSelection((prev) =>
      prev.includes(pieceId)
        ? prev.filter((id) => id !== pieceId)
        : [...prev, pieceId],
    );
  };

  /* ================= DÉTECTION DU MODE ================= */
  const detectUploadMode = async () => {
    if (!document) return;

    try {
      const { data } = await api.get(
        `/documents/${document.id}/lot-unique/files`,
      );
      if (data?.length > 0) {
        setUploadMode("LOT_UNIQUE");
        setLotFiles(data);
      }
    } catch (error) {
      console.error("Erreur détection mode:", error);
    }
  };

  useEffect(() => {
    if (visible && document) {
      detectUploadMode();
    }
  }, [visible, document]);

  useEffect(() => {
    if (uploadMode === "LOT_UNIQUE") loadLotUniqueFiles();
  }, [uploadMode]);

  /* ================= GESTION DU FORMULAIRE ================= */
  const handleNewRecord = (pieceId: number) => {
    setShowForm((prev) => ({ ...prev, [pieceId]: true }));
    setEditingRecord((prev) => ({ ...prev, [pieceId]: null }));

    const initialValues: Record<string, any> = {};
    const fields = pieceMetaFields[pieceId] || [];
    fields.forEach((field) => {
      const key = `${pieceId}_${field.id}`;
      initialValues[key] = "";
    });
    setFormValues(initialValues);
    setFormFiles({});
  };

  const handleEditRecord = (pieceId: number, record: PieceRecord) => {
    try {
      setShowForm((prev) => ({ ...prev, [pieceId]: true }));
      setEditingRecord((prev) => ({ ...prev, [pieceId]: record }));

      const values: Record<string, any> = {};
      const fields = pieceMetaFields[pieceId] || [];
      fields.forEach((field) => {
        const key = `${pieceId}_${field.id}`;
        values[key] = record.values[field.id] || "";
      });
      setFormValues(values);
      setFormFiles({});

      toast.current?.show({
        severity: "success",
        summary: "Édition",
        detail: "Formulaire prêt pour la modification",
        life: 2000,
      });
    } catch (error) {
      console.error("Erreur édition:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les données pour l'édition",
      });
    }
  };

  const handleDeleteRecord = async (pieceId: number, record: PieceRecord) => {
    if (!document) return;

    confirmDialog({
      message: `Voulez-vous supprimer définitivement cet enregistrement ? Cette action est irréversible et supprimera toutes les valeurs associées.`,
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",

      // Personnalisation des labels
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",

      // Styling des boutons
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",

      // Style du dialogue
      style: { width: "450px" },

      accept: async () => {
        try {
          const fields = pieceMetaFields[pieceId] || [];

          // Supprimer toutes les valeurs de cette ligne
          for (const field of fields) {
            const valueId = record.valueIds?.[field.id];
            if (valueId) {
              await api.delete(`/piece-values/${valueId}`);
            }
          }

          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Enregistrement supprimé avec succès",
            life: 3000,
          });

          await loadAllPieceRecords();
        } catch (error) {
          console.error("Erreur suppression:", error);
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail:
              "Impossible de supprimer l'enregistrement car il contient des pièces associées",
          });
        }
      },
      reject: () => {
        toast.current?.show({
          severity: "info",
          summary: "Annulé",
          detail: "Suppression annulée",
          life: 2000,
        });
      },
    });
  };

  const handleCancelForm = (pieceId: number) => {
    setShowForm((prev) => ({ ...prev, [pieceId]: false }));
    setEditingRecord((prev) => ({ ...prev, [pieceId]: null }));
    setFormValues({});
    setFormFiles({});
  };

  const handleFormValueChange = (
    pieceId: number,
    fieldId: number,
    value: string,
  ) => {
    const key = `${pieceId}_${fieldId}`;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormFileSelect = (
    pieceId: number,
    fieldId: number,
    file: File | null,
  ) => {
    const key = `${pieceId}_${fieldId}`;
    setFormFiles((prev) => ({ ...prev, [key]: file }));

    // Ouvrir la prévisualisation dans la colonne droite
    if (file) {
      setViewer({
        visible: true,
        url: URL.createObjectURL(file),
        isPreview: true,
        file: file,
        pieceId: pieceId,
        fieldId: fieldId,
      });
    }
  };

  const handleSaveRecord = async (pieceId: number) => {
    if (!document) return;

    const fields = pieceMetaFields[pieceId] || [];
    const editing = editingRecord[pieceId];
    let success = true;

    const rowId = editing?.rowId || Math.floor(Math.random() * 1000000); // Nombre aléatoire entre 0 et 1 million

    for (const field of fields) {
      const key = `${pieceId}_${field.id}`;
      const value = formValues[key];
      const file = formFiles[key];

      if (value && field.field_type !== "file") {
        try {
          // ✅ Pour les champs texte, on garde number | undefined car on utilise valueId directement
          const valueId = editing?.valueIds?.[field.id];

          if (valueId) {
            console.log(
              `📝 Mise à jour valeur existante pour field ${field.id} avec ID ${valueId}`,
            );
            await api.put(`/piece-values/${valueId}`, { value });
          } else {
            console.log(
              `➕ Création nouvelle valeur pour field ${field.id} avec row_id ${rowId}`,
            );
            const { data } = await api.post(
              `/documents/${document.id}/piece-values`,
              {
                piece_id: pieceId,
                piece_meta_field_id: field.id,
                value,
                row_id: rowId,
              },
            );

            if (editing) {
              if (!editing.valueIds) editing.valueIds = {};
              editing.valueIds[field.id] = data.id;
            }
          }
        } catch (error) {
          console.error("Erreur sauvegarde valeur:", error);
          success = false;
        }
      }

      if (file && field.field_type === "file") {
        try {
          // Récupérer l'ID existant
          let valueId = editing?.valueIds?.[field.id];

          if (!valueId) {
            // Créer d'abord l'enregistrement de valeur
            const { data } = await api.post(
              `/documents/${document.id}/piece-values`,
              {
                piece_id: pieceId,
                piece_meta_field_id: field.id,
                value: null,
                row_id: rowId,
              },
            );

            // data.id est toujours défini
            valueId = data.id;

            // Mettre à jour le state local avec vérification
            if (editing && valueId !== undefined) {
              if (!editing.valueIds) editing.valueIds = {};
              editing.valueIds[field.id] = valueId; // ✅ Maintenant TypeScript sait que valueId est number
            }
          }

          // ✅ Vérification avant upload
          if (valueId) {
            await uploadPieceFile(document.id, pieceId, valueId, file);
            console.log(`✅ Fichier uploadé pour valueId: ${valueId}`);
          } else {
            console.error("❌ Impossible d'uploader: valueId est undefined");
            success = false;
          }
        } catch (error) {
          console.error("❌ Erreur upload fichier:", error);
          success = false;
        }
      }
    }

    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: editing ? "Enregistrement modifié" : "Enregistrement créé",
      });

      await loadAllPieceRecords();
      handleCancelForm(pieceId);
      if (onSuccess) onSuccess();
    }
  };

  const handleConfirmPreviewUpload = async () => {
    if (!viewer.file || !viewer.pieceId || !viewer.fieldId) return;

    const { pieceId, fieldId, file } = viewer;

    // Fermer la prévisualisation
    setViewer({ visible: false, url: null, isPreview: false });

    // Mettre à jour formFiles avec le fichier
    const key = `${pieceId}_${fieldId}`;
    setFormFiles((prev) => ({ ...prev, [key]: file }));

    // Sauvegarder l'enregistrement
    await handleSaveRecord(pieceId);
  };

  const handleCancelPreview = () => {
    if (viewer.url && viewer.isPreview) {
      URL.revokeObjectURL(viewer.url); // Nettoyer l'URL
    }
    setViewer({ visible: false, url: null, isPreview: false });
  };

  /* ================= GESTION DES FICHIERS (pièces sans métadonnées) ================= */
  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    pieceId: string,
  ) => {
    const files = e.target.files?.[0];
    if (!files) return;
    setSelectedFiles((prev) => ({ ...prev, [pieceId]: files }));
    setPreviewOpen({ [pieceId]: true });

    // Ouvrir la prévisualisation dans la colonne droite
    setViewer({
      visible: true,
      url: URL.createObjectURL(files),
      isPreview: true,
      file: files,
    });
  };

  const handleSelectLotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (!files) return;

    setSelectedLotFile(files);
    setPreviewOpen({ LOT_UNIQUE: true });

    // Réinitialiser la sélection
    setLotPiecesSelection([]);
    setShowLotPieceSelector(true);

    // Ouvrir la prévisualisation
    setViewer({
      visible: true,
      url: URL.createObjectURL(files),
      isPreview: true,
      file: files,
    });
  };

  const handleSimpleUpload = async (pieceId: string) => {
    if (!document) return;

    const file = selectedFiles[pieceId];
    if (!file) return;

    const typeId = document.type_document_id;
    const formData = new FormData();
    formData.append("files", file);

    try {
      await api.post(
        `/documents/${document.id}/document-type/${typeId}/piece/${pieceId}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      await loadSimplePieceFiles(Number(pieceId));

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Fichier enregistré",
      });

      setPreviewOpen((prev) => ({ ...prev, [pieceId]: false }));
      setUploaded((prev) => ({ ...prev, [pieceId]: true }));

      // ✅ Ne fermer la prévisualisation qu'APRÈS l'upload réussi
      handleCancelPreview();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l’envoi",
      });
    }
  };

  // const loadSimplePieceFiles = async (pieceId: number) => {
  //   if (!document) return;

  //   try {
  //     const { data } = await api.get(
  //       `/documents/${document.id}/piece/${pieceId}/files`,
  //     );

  //     setPieceFiles((prev) => ({
  //       ...prev,
  //       [pieceId]: Array.isArray(data) ? data : [],
  //     }));

  //     setUploaded((prev) => ({
  //       ...prev,
  //       [pieceId]: Array.isArray(data) && data.length > 0,
  //     }));
  //   } catch (error) {
  //     console.error("Erreur chargement fichiers pièce:", error);
  //   }
  // };

  // Fonction pour charger les fichiers d'une pièce simple
  const loadSimplePieceFiles = async (pieceId: number) => {
    if (!document) return;

    try {
      const { data } = await api.get<DocumentFile[]>(
        `/documents/${document.id}/piece/${pieceId}/files`,
      );

      setPieceFiles((prev) => ({
        ...prev,
        [pieceId]: data,
      }));

      setUploaded((prev) => ({
        ...prev,
        [pieceId]: data.length > 0,
      }));
    } catch (error) {
      console.error("Erreur chargement fichiers pièce:", error);
    }
  };

  const refreshSimpleFiles = async (pieceId: number) => {
    await loadSimplePieceFiles(pieceId);
    if (onSuccess) onSuccess();
  };

  const refreshLotFiles = async () => {
    await loadLotUniqueFiles();
    if (onSuccess) onSuccess();
  };

  const refreshMetaFiles = async () => {
    await loadAllPieceRecords();
    if (onSuccess) onSuccess();
  };

  const handleUploadLotFile = async () => {
    if (!document || !selectedLotFile) return;

    const formData = new FormData();
    formData.append("files", selectedLotFile);
    formData.append("upload_mode", "LOT_UNIQUE");

    if (lotPiecesSelection.length > 0) {
      formData.append("piece_ids", JSON.stringify(lotPiecesSelection));
    }

    try {
      await api.post(
        `/documents/${document.id}/document-type/${document.type_document_id}/lot-unique/files-with-pieces`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail:
          lotPiecesSelection.length > 0
            ? `Dossier enregistré et ${lotPiecesSelection.length} pièce(s) marquée(s) comme disponible(s)`
            : "Dossier complet enregistré",
      });

      // ✅ Recharger les données du document pour mettre à jour les disponibilités
      if (onSuccess) {
        await onSuccess(); // Si onSuccess recharge le document
      }

      await loadLotUniqueFiles();
      setSelectedLotFile(null);
      setLotPiecesSelection([]);
      setShowLotPieceSelector(false);
      handleCancelPreview();
    } catch (error) {
      console.error("Erreur upload lot:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l’envoi du dossier",
      });
    }
  };

  /* ================= TOGGLE PIÈCE ================= */
  const togglePiece = async (pieceId: number) => {
    const willExpand = !expandedPieces[pieceId];
    setExpandedPieces((prev) => ({
      ...prev,
      [pieceId]: willExpand,
    }));

    if (willExpand) {
      const hasMetaFields = pieceMetaFields[pieceId]?.length > 0;

      if (!hasMetaFields && !pieceFiles[pieceId]) {
        await loadSimplePieceFiles(pieceId);
      }
    }
  };

  const toggleDivision = (division: string) => {
    setExpandedDivisions((prev) => ({
      ...prev,
      [division]: !prev[division],
    }));
  };

  /* ================= RENDU ================= */
  if (!document) return null;

  const groupedPieces = piecesState.reduce((acc: any, item: any) => {
    const divisionObj = item.division || item.piece?.division;
    const divLibelle = divisionObj?.libelle || "AUTRES PIECES";

    if (!acc[divLibelle]) {
      acc[divLibelle] = [];
    }
    acc[divLibelle].push(item);
    return acc;
  }, {});

  const renderFormField = (pieceId: number, field: PieceMetaField) => {
    const key = `${pieceId}_${field.id}`;
    const value = formValues[key] || "";
    const file = formFiles[key];

    switch (field.field_type) {
      case "date":
        return (
          <Calendar
            value={value ? new Date(value) : null}
            onChange={(e) =>
              handleFormValueChange(
                pieceId,
                field.id,
                e.value?.toISOString().split("T")[0] || "",
              )
            }
            dateFormat="dd/mm/yy"
            className="w-full p-2 border border-slate-200 rounded-lg"
            placeholder="Sélectionner une date"
            showIcon
          />
        );

      case "file":
        return (
          <div className="space-y-2">
            <input
              type="file"
              id={`form-file-${pieceId}-${field.id}`}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) =>
                handleFormFileSelect(
                  pieceId,
                  field.id,
                  e.target.files?.[0] || null,
                )
              }
            />
            <div className="flex items-center gap-2">
              <label
                htmlFor={`form-file-${pieceId}-${field.id}`}
                className="flex-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-lg text-sm font-medium transition-colors text-center border border-emerald-200"
              >
                {file ? file.name : "Choisir un fichier"}
              </label>
            </div>
          </div>
        );

      case "number":
        return (
          <InputText
            type="number"
            value={value}
            onChange={(e) =>
              handleFormValueChange(pieceId, field.id, e.target.value)
            }
            className="w-full p-2 border border-slate-200 rounded-lg"
            placeholder={`Saisir ${field.label.toLowerCase()}`}
          />
        );

      default:
        return (
          <InputText
            value={value}
            onChange={(e) =>
              handleFormValueChange(pieceId, field.id, e.target.value)
            }
            className="w-full p-2 border border-slate-200 rounded-lg"
            placeholder={`Saisir ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={() => {
          handleCancelPreview();
          onHide();
        }}
        style={{ width: "95vw", maxWidth: "1400px" }}
        header={false}
        showHeader={false}
        className="rounded-3xl overflow-hidden border-none shadow-2xl"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-6 pt-10 -mx-6 -mt-6 mb-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Dépôt des Justificatifs</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 mt-1">
                <span>Document #{document.id}</span>
                <span className="h-1 w-1 rounded-full bg-emerald-300"></span>
                <span className="uppercase font-bold">
                  {uploadMode === "LOT_UNIQUE"
                    ? "📦 LOT UNIQUE"
                    : "📄 PAR PIÈCE"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              handleCancelPreview();
              onHide();
            }}
            className="hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="flex flex-1 overflow-hidden p-2 gap-6 h-[calc(100vh-200px)]">
          {/* COLONNE GAUCHE */}
          <div className="w-2/5 h-full overflow-y-auto pr-2 custom-scrollbar">
            {/* SÉLECTEUR DE MODE */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">
                Mode de chargement
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadMode("INDIVIDUEL")}
                  className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all ${
                    uploadMode === "INDIVIDUEL"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  📄 Par pièce
                </button>
                <button
                  onClick={() => setUploadMode("LOT_UNIQUE")}
                  className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all ${
                    uploadMode === "LOT_UNIQUE"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  📦 Dossier complet
                </button>
              </div>
            </div>

            {/* MODE LOT UNIQUE */}
            {uploadMode === "LOT_UNIQUE" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Archive size={18} className="text-emerald-600" />
                    Upload du dossier complet
                  </h3>
                  {/* <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <Info size={18} className="text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      Vous pouvez uploader un dossier complet au format PDF. Si
                      les pièces associées à ce document sont déjà connues, vous
                      aurez la possibilité de les lier à ce dossier pour les
                      marquer comme disponibles.
                    </div>
                  </div> */}

                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <Info size={18} className="text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      Vous pouvez uploader un dossier complet au format PDF,
                      jusqu'à 70 Mo.
                    </div>
                  </div>

                  <input
                    type="file"
                    id="lot-unique-upload"
                    hidden
                    accept=".pdf"
                    onChange={handleSelectLotFile}
                  />
                  <label
                    htmlFor="lot-unique-upload"
                    className="block p-6 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-all text-center"
                  >
                    <CloudUpload
                      className="mx-auto text-emerald-500 mb-2"
                      size={32}
                    />
                    <p className="text-sm font-medium text-emerald-700">
                      {selectedLotFile
                        ? selectedLotFile.name
                        : "Sélectionner le PDF du dossier"}
                    </p>
                  </label>
                </div>
                {/* ✅ NOUVEAU : Sélecteur de pièces pour LOT_UNIQUE */}
                {showLotPieceSelector && selectedLotFile && (
                  <LotPieceSelector
                    pieces={piecesState}
                    selectedPieces={lotPiecesSelection}
                    onTogglePiece={toggleLotPieceSelection}
                    onClose={() => {
                      setShowLotPieceSelector(false);
                      setLotPiecesSelection([]);
                    }}
                    onConfirm={() => {
                      setShowLotPieceSelector(false);
                      // Les pièces sont déjà dans lotPiecesSelection
                    }}
                  />
                )}
                {/*Dans la section MODE LOT UNIQUE, remplacer l'affichage des
                fichiers*/}
                {lotFiles.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 mb-3">
                      Fichiers uploadés ({lotFiles.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {lotFiles.map((f: DocumentFile) => (
                        <FileItem
                          key={f.id}
                          file={f}
                          documentId={document.id}
                          pieceId={null}
                          fileType="document"
                          onDeleteSuccess={() => refreshLotFiles()}
                          onView={(url) =>
                            setViewer({ visible: true, url, isPreview: false })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE INDIVIDUEL */}
            {uploadMode === "INDIVIDUEL" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Folders size={18} className="text-emerald-600" />
                  Pièces à fournir
                </h3>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <Info size={18} className="text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    Vous pouvez uploader un dossier complet au format PDF,
                    jusqu'à 70 Mo. Si les pièces associées à ce document sont
                    déjà connues, vous aurez la possibilité de les lier à ce
                    dossier pour les marquer comme disponibles.
                  </div>
                </div>

                {Object.entries(groupedPieces).map(
                  ([division, pieces]: [string, any]) => {
                    const isExpanded = expandedDivisions[division] ?? true;

                    return (
                      <div
                        key={division}
                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                      >
                        <div
                          onClick={() => toggleDivision(division)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Folder size={18} className="text-emerald-500" />
                            <span className="text-sm font-bold text-slate-700 uppercase">
                              {division}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                              {pieces.length}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="p-2 space-y-1">
                            {pieces
                              .filter((p: any) => p.disponible !== false)
                              .map((p: any) => {
                                const hasMetaFields =
                                  pieceMetaFields[p.id]?.length > 0;
                                const records = pieceRecords[p.id] || [];
                                const showFormForPiece = showForm[p.id];

                                return (
                                  <div
                                    key={p.id}
                                    className="border-b border-slate-100 last:border-0"
                                  >
                                    <div
                                      onClick={() => togglePiece(p.id)}
                                      className={`cursor-pointer p-3 rounded-xl transition-all flex items-center justify-between ${
                                        expandedPieces[p.id]
                                          ? "bg-emerald-50"
                                          : "hover:bg-slate-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {loadingMeta[p.id] ? (
                                          <div className="h-4 w-4 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
                                        ) : hasMetaFields ? (
                                          <Layers
                                            size={16}
                                            className="text-emerald-500"
                                          />
                                        ) : (
                                          <FileText
                                            size={16}
                                            className="text-slate-400"
                                          />
                                        )}
                                        <span className="text-sm font-medium text-slate-700">
                                          {p.libelle}
                                        </span>
                                        {hasMetaFields &&
                                          records.length > 0 && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">
                                              {records.length}
                                            </span>
                                          )}
                                      </div>
                                      <ChevronDown
                                        size={16}
                                        className={`transition-transform ${
                                          expandedPieces[p.id]
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      />
                                    </div>

                                    {expandedPieces[p.id] && (
                                      <div className="p-4 bg-slate-50 rounded-xl mb-2 mx-2">
                                        {hasMetaFields ? (
                                          <div className="space-y-4">
                                            {records.length > 0 && (
                                              <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                                                <div className="overflow-x-auto">
                                                  <table
                                                    className="w-full text-sm"
                                                    style={{
                                                      minWidth: "800px",
                                                    }}
                                                  >
                                                    <thead className="bg-slate-100">
                                                      <tr>
                                                        {pieceMetaFields[
                                                          p.id
                                                        ].map((field) => (
                                                          <th
                                                            key={field.id}
                                                            className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap"
                                                          >
                                                            {field.label}
                                                          </th>
                                                        ))}
                                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                                                          Fichiers
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                                                          Actions
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                      {records.map((record) => (
                                                        <tr
                                                          key={record.id}
                                                          className="hover:bg-emerald-50/30 transition-colors"
                                                        >
                                                          {pieceMetaFields[
                                                            p.id
                                                          ].map((field) => (
                                                            <td
                                                              key={field.id}
                                                              className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap"
                                                            >
                                                              {/* Dans le tableau des enregistrements (records), modifier la colonne "Fichiers" */}
                                                              {field.field_type ===
                                                              "file" ? (
                                                                record.files &&
                                                                record.files
                                                                  .length >
                                                                  0 ? (
                                                                  <div className="space-y-1">
                                                                    {record.files.map(
                                                                      (f) => (
                                                                        <FileItem
                                                                          key={
                                                                            f.id
                                                                          }
                                                                          file={
                                                                            f
                                                                          }
                                                                          documentId={
                                                                            document.id
                                                                          }
                                                                          pieceId={
                                                                            p.id
                                                                          }
                                                                          fileType="piece" // 🔥 Fichier dans pieces_fichiers
                                                                          onDeleteSuccess={() =>
                                                                            refreshMetaFiles()
                                                                          }
                                                                          onView={(
                                                                            url,
                                                                          ) =>
                                                                            setViewer(
                                                                              {
                                                                                visible: true,
                                                                                url,
                                                                                isPreview: false,
                                                                              },
                                                                            )
                                                                          }
                                                                        />
                                                                      ),
                                                                    )}
                                                                  </div>
                                                                ) : (
                                                                  <span className="text-slate-300">
                                                                    -
                                                                  </span>
                                                                )
                                                              ) : (
                                                                record.values[
                                                                  field.id
                                                                ] || (
                                                                  <span className="text-slate-300">
                                                                    -
                                                                  </span>
                                                                )
                                                              )}
                                                            </td>
                                                          ))}
                                                          <td className="px-4 py-3 text-center text-sm text-slate-600 whitespace-nowrap">
                                                            {record.files &&
                                                            record.files
                                                              .length > 0 ? (
                                                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                                                                <FileText
                                                                  size={12}
                                                                />
                                                                {
                                                                  record.files
                                                                    .length
                                                                }{" "}
                                                                fichier(s)
                                                              </span>
                                                            ) : (
                                                              <span className="text-slate-300">
                                                                -
                                                              </span>
                                                            )}
                                                          </td>
                                                          <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-2">
                                                              <button
                                                                onClick={() =>
                                                                  handleEditRecord(
                                                                    p.id,
                                                                    record,
                                                                  )
                                                                }
                                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title="Modifier"
                                                              >
                                                                <Pencil
                                                                  size={16}
                                                                />
                                                              </button>
                                                              <button
                                                                onClick={() =>
                                                                  handleDeleteRecord(
                                                                    p.id,
                                                                    record,
                                                                  )
                                                                }
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Supprimer"
                                                              >
                                                                <Trash2
                                                                  size={16}
                                                                />
                                                              </button>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            )}

                                            {!showFormForPiece && (
                                              <div className="flex justify-end">
                                                <Button
                                                  label="Nouvel enregistrement"
                                                  icon={<Plus size={14} />}
                                                  onClick={() =>
                                                    handleNewRecord(p.id)
                                                  }
                                                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-2 py-2 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
                                                />
                                              </div>
                                            )}

                                            {showFormForPiece && (
                                              <div className="bg-white p-4 rounded-lg border border-emerald-200 space-y-4">
                                                <h4 className="text-sm font-bold text-slate-700">
                                                  {editingRecord[p.id]
                                                    ? "Modifier"
                                                    : "Nouvel"}{" "}
                                                  enregistrement
                                                </h4>

                                                {pieceMetaFields[p.id].map(
                                                  (field) => (
                                                    <div
                                                      key={field.id}
                                                      className="space-y-1"
                                                    >
                                                      <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                        {field.field_type ===
                                                          "date" && (
                                                          <CalendarIcon
                                                            size={12}
                                                          />
                                                        )}
                                                        {field.field_type ===
                                                          "file" && (
                                                          <FileText size={12} />
                                                        )}
                                                        {field.field_type ===
                                                          "number" && (
                                                          <Hash size={12} />
                                                        )}
                                                        {field.field_type ===
                                                          "text" && (
                                                          <Type size={12} />
                                                        )}
                                                        {field.label}
                                                        {field.required && (
                                                          <span className="text-red-500">
                                                            *
                                                          </span>
                                                        )}
                                                      </label>
                                                      {renderFormField(
                                                        p.id,
                                                        field,
                                                      )}
                                                    </div>
                                                  ),
                                                )}

                                                <div className="flex justify-end gap-2 pt-2">
                                                  <Button
                                                    label="Annuler"
                                                    onClick={() =>
                                                      handleCancelForm(p.id)
                                                    }
                                                    className="bg-slate-100 text-slate-600 border-none text-sm py-2 px-4"
                                                  />
                                                  <Button
                                                    label="Enregistrer"
                                                    icon={<Save size={14} />}
                                                    onClick={() =>
                                                      handleSaveRecord(p.id)
                                                    }
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-2 py-2 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                {uploaded[p.id] ||
                                                pieceFiles[p.id]?.length > 0 ? (
                                                  <CheckCircle2
                                                    size={16}
                                                    className="text-emerald-500"
                                                  />
                                                ) : (
                                                  <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                                                )}
                                                <span className="text-sm font-medium text-slate-600">
                                                  Fichier justificatif
                                                </span>
                                              </div>

                                              <div
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  id={`file-simple-${p.id}`}
                                                  type="file"
                                                  accept=".pdf"
                                                  hidden
                                                  onChange={(e) =>
                                                    handleSelectFile(
                                                      e,
                                                      p.id.toString(),
                                                    )
                                                  }
                                                />
                                                <label
                                                  htmlFor={`file-simple-${p.id}`}
                                                  className="cursor-pointer bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                                                >
                                                  <FileText size={16} />
                                                  <span className="text-xs font-medium">
                                                    {uploaded[p.id]
                                                      ? "Choisir encore"
                                                      : "Choisir"}
                                                  </span>
                                                </label>
                                              </div>
                                            </div>
                                            {/*
                                            Dans la partie où vous affichez
                                            les fichiers pour les pièces sans
                                            métadonnées
                                            */}
                                            {pieceFiles[p.id]?.length > 0 && (
                                              <div className="mt-3 space-y-2">
                                                {pieceFiles[p.id].map(
                                                  (f: DocumentFile) => (
                                                    <FileItem
                                                      key={f.id}
                                                      file={f}
                                                      documentId={document.id}
                                                      pieceId={p.id}
                                                      fileType="document"
                                                      onDeleteSuccess={() =>
                                                        refreshSimpleFiles(p.id)
                                                      }
                                                      onView={(url) =>
                                                        setViewer({
                                                          visible: true,
                                                          url,
                                                          isPreview: false,
                                                        })
                                                      }
                                                    />
                                                  ),
                                                )}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* COLONNE DROITE - APERÇU (comme dans l'ancienne version) */}
          <div className="flex-1 h-full bg-slate-100 rounded-[40px] border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            {viewer.visible && viewer.url ? (
              viewer.isPreview ? (
                // Mode prévisualisation avant upload
                <div className="flex-1 flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
                    <div>
                      <h3 className="font-bold flex items-center gap-2">
                        <CloudUpload size={20} />
                        Validation du document
                      </h3>
                      <p className="text-xs text-emerald-100 mt-1 uppercase font-bold">
                        Mode :{" "}
                        {uploadMode === "LOT_UNIQUE"
                          ? "📦 LOT UNIQUE"
                          : "📄 PIÈCE INDIVIDUELLE"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        label="Annuler"
                        onClick={handleCancelPreview}
                        className="p-button-text text-white font-bold"
                      />
                      <Button
                        label="Confirmer & Envoyer"
                        icon="pi pi-check"
                        className="bg-white text-emerald-600 border-none rounded-2xl px-6 font-black"
                        onClick={() => {
                          if (uploadMode === "LOT_UNIQUE") {
                            handleUploadLotFile();
                          } else if (viewer.pieceId && viewer.fieldId) {
                            handleConfirmPreviewUpload();
                          } else {
                            const id = Object.keys(previewOpen).find(
                              (k) => previewOpen[k],
                            );
                            if (id) handleSimpleUpload(id);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-slate-800">
                    <iframe
                      src={viewer.url}
                      className="w-full h-full rounded-2xl shadow-2xl border-none"
                      title="Aperçu avant upload"
                    />
                  </div>
                </div>
              ) : (
                // Mode consultation des fichiers existants
                <div className="flex-1 flex flex-col">
                  <div className="p-4 flex justify-between items-center border-b border-slate-200 bg-white">
                    <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Eye size={16} className="text-emerald-600" />
                      Consultation archive
                    </span>
                    <Button
                      icon="pi pi-times"
                      rounded
                      text
                      onClick={handleCancelPreview}
                    />
                  </div>
                  <iframe
                    src={viewer.url}
                    className="flex-1 w-full border-none"
                    title="Visionneuse"
                  />
                </div>
              )
            ) : (
              // Mode par défaut
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FileSearch size={64} className="text-slate-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-400">
                  {uploadMode === "LOT_UNIQUE"
                    ? "Sélectionnez un dossier"
                    : "Sélectionnez un fichier"}
                </h4>
                <p className="max-w-xs text-slate-400 mt-2">
                  {uploadMode === "LOT_UNIQUE"
                    ? "Chargez le dossier complet PDF"
                    : "Sélectionnez une pièce pour charger son justificatif"}
                </p>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
