// src/components/common/PreviewUploadFiles.tsx
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Carousel } from "primereact/carousel";
import { Tag } from "primereact/tag";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Image,
  FileText,
  File,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Info,
  FileImage,
  Archive,
  Sheet,
} from "lucide-react";

interface PreviewFile {
  file: File;
  id: string;
  previewUrl?: string;
  size: string;
  type: string;
  name: string;
}

interface PreviewUploadFilesProps {
  visible: boolean;
  onHide: () => void;
  files: PreviewFile[];
  onRemoveFile?: (fileId: string) => void;
  title?: string;
}

const PreviewUploadFiles: React.FC<PreviewUploadFilesProps> = ({
  visible,
  onHide,
  files,
  onRemoveFile,
  title = "Aperçu des fichiers",
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const currentFile = files[selectedFileIndex];

  // Réinitialiser l'état quand le modal s'ouvre ou change de fichier
  useEffect(() => {
    if (visible) {
      setZoomLevel(1);
      setRotation(0);
      setShowInfo(false);
    }
  }, [visible, selectedFileIndex]);

  // Obtenir l'icône du fichier
  const getFileIcon = (fileType: string, size = 48) => {
    if (fileType.startsWith("image/")) {
      return <Image size={size} className="text-emerald-500" />;
    }

    if (fileType === "application/pdf") {
      return <FileText size={size} className="text-red-500" />;
    }

    if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText size={size} className="text-blue-500" />;
    }

    if (fileType.includes("excel") || fileType.includes("sheet")) {
      return <FileText size={size} className="text-green-600" />;
    }

    if (
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("7z")
    ) {
      return <Archive size={size} className="text-amber-500" />;
    }

    return <File size={size} className="text-slate-500" />;
  };

  // Obtenir la couleur de fond selon le type
  const getFileBgColor = (fileType: string) => {
    if (fileType.startsWith("image/"))
      return "bg-emerald-50 border-emerald-200";
    if (fileType === "application/pdf") return "bg-red-50 border-red-200";
    if (fileType.includes("word")) return "bg-blue-50 border-blue-200";
    if (fileType.includes("excel")) return "bg-green-50 border-green-200";
    return "bg-slate-50 border-slate-200";
  };

  // Télécharger le fichier
  const handleDownload = () => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile.file);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Supprimer le fichier
  const handleRemove = () => {
    if (currentFile && onRemoveFile) {
      onRemoveFile(currentFile.id);
      if (selectedFileIndex >= files.length - 1 && selectedFileIndex > 0) {
        setSelectedFileIndex(selectedFileIndex - 1);
      }
    }
  };

  // Zoom avant
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.25);
    }
  };

  // Zoom arrière
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(zoomLevel - 0.25);
    }
  };

  // Rotation
  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  // Réinitialiser le zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  // Format de la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Template pour le carousel des miniatures
  const thumbnailTemplate = (file: PreviewFile, index: number) => {
    const isActive = index === selectedFileIndex;
    return (
      <div
        key={file.id}
        className={`cursor-pointer p-1 rounded-lg transition-all ${
          isActive
            ? "ring-2 ring-emerald-500 bg-emerald-50"
            : "hover:bg-slate-100"
        }`}
        onClick={() => setSelectedFileIndex(index)}
      >
        <div className="w-16 h-16 flex items-center justify-center">
          {file.previewUrl ? (
            <img
              src={file.previewUrl}
              alt={file.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg">
              {getFileIcon(file.type, 24)}
            </div>
          )}
        </div>
        <p className="text-[10px] text-center truncate w-16 mt-1 text-slate-500">
          {file.name.length > 12
            ? file.name.substring(0, 10) + "..."
            : file.name}
        </p>
      </div>
    );
  };

  // Rendu du contenu principal
  const renderPreviewContent = () => {
    if (!currentFile) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <File size={64} className="mb-4 opacity-50" />
          <p>Aucun fichier sélectionné</p>
        </div>
      );
    }

    const isImage = currentFile.type.startsWith("image/");
    const isPDF = currentFile.type === "application/pdf";

    if (isImage && currentFile.previewUrl) {
      return (
        <div
          className="flex items-center justify-center min-h-[400px] bg-slate-100 rounded-xl overflow-auto"
          style={{ minHeight: "400px" }}
        >
          <img
            src={currentFile.previewUrl}
            alt={currentFile.name}
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "500px",
              objectFit: "contain",
            }}
            className="rounded-lg"
          />
        </div>
      );
    }

    if (isPDF && currentFile.previewUrl) {
      return (
        <div className="h-[500px] rounded-xl overflow-hidden border border-slate-200">
          <iframe
            src={currentFile.previewUrl}
            title={currentFile.name}
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      );
    }

    // Pour les autres types de fichiers
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 ${getFileBgColor(currentFile.type)}`}
        style={{ minHeight: "400px" }}
      >
        {getFileIcon(currentFile.type, 80)}
        <p className="text-lg font-semibold text-slate-700 mt-4 text-center">
          {currentFile.name}
        </p>
        <div className="flex gap-4 mt-4">
          <Tag
            value={currentFile.type.split("/")[1]?.toUpperCase() || "FICHIER"}
            severity="info"
            className="text-xs"
          />
          <Tag
            value={currentFile.size}
            severity="secondary"
            className="text-xs"
          />
        </div>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Aperçu non disponible pour ce type de fichier
        </p>
        <Button
          label="Télécharger le fichier"
          icon={<Download size={16} className="mr-2" />}
          onClick={handleDownload}
          className="mt-6 bg-emerald-600 text-white"
        />
      </div>
    );
  };

  // Navigation précédente
  const previousFile = () => {
    if (selectedFileIndex > 0) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  // Navigation suivante
  const nextFile = () => {
    if (selectedFileIndex < files.length - 1) {
      setSelectedFileIndex(selectedFileIndex + 1);
    }
  };

  const footer = (
    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
      <div className="flex gap-2">
        <Button
          icon={<Download size={16} />}
          onClick={handleDownload}
          disabled={!currentFile}
          className="p-button-outlined p-button-secondary"
          tooltip="Télécharger le fichier"
          tooltipOptions={{ position: "top" }}
        />
        {onRemoveFile && (
          <Button
            icon={<Trash2 size={16} />}
            onClick={handleRemove}
            disabled={!currentFile}
            className="p-button-outlined p-button-danger"
            tooltip="Supprimer le fichier"
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          icon={<Info size={16} />}
          onClick={() => setShowInfo(!showInfo)}
          className={`p-button-text ${showInfo ? "text-emerald-600" : "text-slate-400"}`}
          tooltip="Informations du fichier"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          label="Fermer"
          icon={<X size={16} className="mr-2" />}
          onClick={onHide}
          className="p-button-text text-slate-500"
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FileImage size={18} className="text-emerald-600" />
            </div>
            <span className="font-bold text-slate-800">{title}</span>
            <Tag
              value={`${files.length} fichier(s)`}
              severity="info"
              className="ml-2"
            />
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "90vw", maxWidth: "1000px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl overflow-hidden shadow-2xl"
      footer={footer}
      maximizable
    >
      <div className="space-y-4">
        {/* Informations du fichier */}
        {showInfo && currentFile && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Info size={14} className="text-emerald-500" />
              Informations du fichier
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Nom :</span>
                <p className="font-medium text-slate-700 break-all">
                  {currentFile.name}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Taille :</span>
                <p className="font-medium text-slate-700">{currentFile.size}</p>
              </div>
              <div>
                <span className="text-slate-500">Type :</span>
                <p className="font-medium text-slate-700">
                  {currentFile.type || "Non spécifié"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Dernière modification :</span>
                <p className="font-medium text-slate-700">
                  {currentFile.file.lastModified
                    ? new Date(currentFile.file.lastModified).toLocaleString()
                    : "Non disponible"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contrôles de zoom (uniquement pour les images) */}
        {currentFile?.type.startsWith("image/") && (
          <div className="flex justify-center gap-2 pb-2">
            <Button
              icon={<ZoomOut size={14} />}
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-button-outlined p-button-rounded p-button-sm"
              tooltip="Zoom arrière"
              tooltipOptions={{ position: "top" }}
            />
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded-lg">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              icon={<ZoomIn size={14} />}
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-button-outlined p-button-rounded p-button-sm"
              tooltip="Zoom avant"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              icon={<RotateCw size={14} />}
              onClick={handleRotate}
              className="p-button-outlined p-button-rounded p-button-sm"
              tooltip="Rotation 90°"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              label="Réinitialiser"
              onClick={handleResetZoom}
              className="p-button-text p-button-sm text-slate-500"
              disabled={zoomLevel === 1 && rotation === 0}
            />
          </div>
        )}

        {/* Zone de prévisualisation */}
        <div className="relative">
          {/* Navigation précédente */}
          {files.length > 1 && selectedFileIndex > 0 && (
            <button
              onClick={previousFile}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              style={{ backdropFilter: "blur(4px)" }}
            >
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
          )}

          {renderPreviewContent()}

          {/* Navigation suivante */}
          {files.length > 1 && selectedFileIndex < files.length - 1 && (
            <button
              onClick={nextFile}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              style={{ backdropFilter: "blur(4px)" }}
            >
              <ChevronRight size={24} className="text-slate-600" />
            </button>
          )}
        </div>

        {/* Miniatures */}
        {files.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">
              {files.length} fichier(s) - Navigation rapide
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {files.map((file, index) => thumbnailTemplate(file, index))}
            </div>
          </div>
        )}

        {/* Indicateur de progression */}
        {files.length > 1 && (
          <div className="text-center text-xs text-slate-400">
            {selectedFileIndex + 1} / {files.length}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default PreviewUploadFiles;
