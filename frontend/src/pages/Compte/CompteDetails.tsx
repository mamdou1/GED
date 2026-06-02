// src/pages/Compte/CompteDetails.tsx
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Calendar, CreditCard, Edit, User, Users, X } from "lucide-react";
import { Compte } from "../../interfaces";

interface CompteDetailsProps {
  visible: boolean;
  onHide: () => void;
  compte: Compte | null;
  onEdit?: () => void;
  onRefresh?: () => void;
}

export default function CompteDetails({
  visible,
  onHide,
  compte,
  onEdit,
}: CompteDetailsProps) {
  if (!compte) return null;

  const getClientDisplayName = (client: any): string => {
    if (!client) return "-";
    if (client.raison_sociale) return client.raison_sociale;
    return `${client.prenom || ""} ${client.nom || ""}`.trim() || "-";
  };

  const getCompteLabel = (): string => {
    const firstValue = compte.values?.find((value) => value.value)?.value;
    return firstValue || `Compte #${compte.id}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Non definie";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const footer = (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
      {onEdit && (
        <Button
          label="Modifier"
          icon={<Edit size={16} className="mr-2" />}
          onClick={() => {
            onHide();
            onEdit();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-2 rounded-xl font-semibold"
        />
      )}
      <Button
        label="Fermer"
        icon={<X size={16} className="mr-2" />}
        onClick={onHide}
        className="p-button-text text-slate-500 font-semibold hover:bg-slate-100"
      />
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 p-2">
          <div className="p-3 rounded-xl bg-emerald-100">
            <CreditCard size={22} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {getCompteLabel()}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Tag
                value={compte.type_compte?.nom || "-"}
                severity="info"
                className="text-xs px-2 py-0.5 rounded-md"
              />
              <span className="text-xs text-slate-400 font-mono">
                ID: #{compte.id}
              </span>
            </div>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "620px", maxWidth: "92vw" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl overflow-hidden shadow-2xl"
      footer={footer}
    >
      <div className="space-y-5 p-1">
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={14} className="text-emerald-500" />
            Metadonnees du compte
          </h3>
          {compte.values && compte.values.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {compte.values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100"
                >
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <CreditCard size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {value.metaField?.label || `Champ #${value.meta_field_id}`}
                    </p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5 break-all">
                      {value.value || (
                        <span className="text-slate-400 italic">
                          Non renseigne
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Aucune valeur de metadonnee n'est renseignee.
            </div>
          )}
        </div>

        <Divider className="!my-2" />

        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-emerald-500" />
            Titulaire du compte
          </h3>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <User size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {getClientDisplayName(compte.client)}
                </p>
                {compte.client?.num_matricule && (
                  <p className="text-xs text-slate-500">
                    {compte.client.num_matricule}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Divider className="!my-2" />

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Calendar size={12} /> Cree le
            </p>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {formatDate(compte.createdAt)}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Calendar size={12} /> Modifie le
            </p>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {formatDate(compte.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
