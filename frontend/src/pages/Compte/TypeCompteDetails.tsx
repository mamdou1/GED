import React from "react";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import {
  Building2,
  Calendar,
  FileText,
  Folder,
  Hash,
  Info,
  X,
} from "lucide-react";
import type {
  TypeCompte,
  TypeCompteMetaField,
  TypeDocument,
  Client,
} from "../../interfaces";
import { useTypesWithConserne } from "../../hooks/useTypeDocuments";
import { useClients } from "../../hooks/useClients";

interface TypeCompteDetailsProps {
  visible: boolean;
  typeCompte: TypeCompte | null;
  onHide: () => void;
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFieldTypeLabel = (fieldType: string): string => {
  const labels: Record<string, string> = {
    TEXT: "Texte",
    TEXTAREA: "Zone de texte",
    NUMBER: "Nombre",
    DATE: "Date",
    BOOLEAN: "Booléen",
    SELECT: "Liste déroulante",
    FILE: "Fichier",
  };
  return labels[fieldType.toUpperCase()] || fieldType;
};

const getFieldTypeBadgeColor = (
  fieldType: string,
): "success" | "info" | "warning" | "danger" | "secondary" => {
  const colors: Record<
    string,
    "success" | "info" | "warning" | "danger" | "secondary"
  > = {
    TEXT: "info",
    TEXTAREA: "info",
    NUMBER: "success",
    DATE: "warning",
    BOOLEAN: "danger",
    SELECT: "secondary",
    FILE: "warning",
  };
  return colors[fieldType.toUpperCase()] || "secondary";
};

export default function TypeCompteDetails({
  visible,
  typeCompte,
  onHide,
}: TypeCompteDetailsProps) {
  const { data: typesWithConserneData } = useTypesWithConserne({ limit: 200 });
  const typesWithConserne: TypeDocument[] = Array.isArray(typesWithConserneData)
    ? typesWithConserneData
    : typesWithConserneData?.data || [];

  const { data: clientsData } = useClients();
  const clients: Client[] = Array.isArray(clientsData)
    ? clientsData
    : clientsData?.data || [];

  if (!typeCompte) return null;

  const metaFields = typeCompte.metaFields || [];
  const comptes = typeCompte.comptes || [];

  const associatedTypes = typesWithConserne.filter(
    (t) => t.type_compte_id === typeCompte.id,
  );

  const formatClientName = (client?: Client | null) => {
    if (!client) return "Client inconnu";
    // Personne physique
    if (client.prenom || client.nom) {
      const parts = [];
      if (client.prenom) parts.push(client.prenom);
      if (client.nom) parts.push(client.nom);
      return parts.join(" ");
    }

    // Personne morale
    if (client.raison_sociale) {
      return client.sigle
        ? `${client.raison_sociale} (${client.sigle})`
        : client.raison_sociale;
    }

    return "Client inconnu";
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {typeCompte.nom}
            </h2>
            <p className="text-xs text-slate-400">ID #{typeCompte.id}</p>
          </div>
        </div>
      }
      modal
      style={{ width: "95vw", maxWidth: "900px" }}
      className="rounded-2xl"
      contentClassName="p-0"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Infos Générales */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-6 border-b border-emerald-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Comptes Associés
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {comptes.length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Champs Métadonnées
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {metaFields.length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                <Calendar size={12} className="inline mr-1" />
                Créé
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {formatDate(typeCompte.createdAt)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Mis à Jour
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {formatDate(typeCompte.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Champs Métadonnées */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800">
              Champs de Métadonnées
            </h3>
            <Tag
              value={metaFields.length}
              severity="info"
              className="ml-auto rounded-full"
            />
          </div>

          {metaFields.length > 0 ? (
            <div className="space-y-3">
              {metaFields.map((field: TypeCompteMetaField, index: number) => (
                <div
                  key={field.id}
                  className="bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          {index + 1}
                        </span>
                        <h4 className="font-semibold text-slate-800">
                          {field.label}
                        </h4>
                      </div>

                      <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Type:</span>
                          <br />
                          <Tag
                            value={getFieldTypeLabel(field.field_type)}
                            severity={getFieldTypeBadgeColor(field.field_type)}
                            className="mt-1 text-xs rounded"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400">Obligatoire:</span>
                          <br />
                          <Tag
                            value={field.required ? "Oui" : "Non"}
                            severity={field.required ? "danger" : "success"}
                            className="mt-1 text-xs rounded"
                          />
                        </div>
                        {field.position !== null &&
                          field.position !== undefined && (
                            <div>
                              <span className="text-slate-400">Position:</span>
                              <br />
                              <Tag
                                value={`#${field.position}`}
                                className="mt-1 text-xs rounded bg-slate-200"
                              />
                            </div>
                          )}
                      </div>

                      {field.options && field.options.length > 0 && (
                        <div className="ml-8 mt-3">
                          <p className="text-xs font-semibold text-slate-600 mb-2">
                            Options disponibles:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(field.options) &&
                              field.options.map((option: any, idx: number) => {
                                const optionValue =
                                  typeof option === "string"
                                    ? option
                                    : option.label || option.value;
                                return (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium"
                                  >
                                    {optionValue}
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Info size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                Aucun champ de métadonnée défini
              </p>
            </div>
          )}
        </div>

        {/* Comptes Associés */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash size={20} className="text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800">
              Comptes Associés
            </h3>
            <Tag
              value={comptes.length}
              severity="success"
              className="ml-auto rounded-full"
            />
          </div>

          {comptes.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comptes.map((compte: any) => (
                <div
                  key={compte.id}
                  className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      Compte #{compte.id}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatClientName(
                        compte.client ||
                          clients.find((c) => c.id === compte.client_id),
                      )}
                    </p>
                  </div>
                  <Tag
                    value={formatDate(compte.createdAt)}
                    className="text-xs rounded bg-slate-200"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
              <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                Aucun compte associé à ce type
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Types de documents associés */}
      <div className="p-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Folder size={20} className="text-yellow-500" />
          <h3 className="text-lg font-bold text-slate-800">
            Types de documents associés
          </h3>
          <Tag
            value={associatedTypes.length}
            severity="info"
            className="ml-auto rounded-full"
          />
        </div>

        {associatedTypes.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {associatedTypes.map((t: TypeDocument) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200 hover:bg-slate-100 transition-all"
              >
                <div>
                  <p className="font-semibold text-slate-800">{t.nom}</p>
                  <p className="text-xs text-slate-500">Code: {t.code}</p>
                </div>
                <Tag
                  value={t.conserne || "-"}
                  className="text-xs rounded bg-slate-200"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">
              Aucun type de document associé à ce type de compte
            </p>
          </div>
        )}
      </div>

      <Divider />

      <div className="p-4 bg-slate-50 flex justify-end">
        <Button
          label="Fermer"
          icon={<X size={16} className="mr-2" />}
          onClick={onHide}
          className="p-button-secondary rounded-lg"
        />
      </div>
    </Dialog>
  );
}
