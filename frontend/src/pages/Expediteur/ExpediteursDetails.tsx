// src/pages/expediteurs/ExpediteursDetails.tsx
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  X,
  Edit,
} from "lucide-react";
import { Expediteur } from "../../interfaces/expediteur";

interface ExpediteursDetailsProps {
  visible: boolean;
  onHide: () => void;
  expediteur: Expediteur | null;
  onEdit?: () => void;
}

const ExpediteursDetails: React.FC<ExpediteursDetailsProps> = ({
  visible,
  onHide,
  expediteur,
  onEdit,
}) => {
  if (!expediteur) return null;

  const isPersonne = expediteur.type === "PERSONNE";
  const displayName = isPersonne
    ? `${expediteur.nom || ""} ${expediteur.prenom || ""}`.trim()
    : expediteur.raison_sociale || "-";

  const formatDate = (date?: string) => {
    if (!date) return "Non définie";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | null;
  }) => (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-800 mt-0.5 break-all">
          {value || (
            <span className="text-slate-400 italic">Non renseigné</span>
          )}
        </p>
      </div>
    </div>
  );

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
          <div
            className={`p-3 rounded-xl ${isPersonne ? "bg-blue-100" : "bg-emerald-100"}`}
          >
            {isPersonne ? (
              <User size={22} className="text-blue-600" />
            ) : (
              <Building2 size={22} className="text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Tag
                value={isPersonne ? "Personne physique" : "Structure"}
                severity={isPersonne ? "info" : "success"}
                className="text-xs px-2 py-0.5 rounded-md"
              />
              <span className="text-xs text-slate-400 font-mono">
                ID: #{expediteur.idexpediteur}
              </span>
            </div>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "550px", maxWidth: "90vw" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl overflow-hidden shadow-2xl"
      footer={footer}
    >
      <div className="space-y-5 p-1">
        {/* Informations de contact */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail size={14} className="text-emerald-500" />
            Coordonnées
          </h3>
          <div className="space-y-2">
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={expediteur.email}
            />
            <InfoRow
              icon={<Phone size={16} />}
              label="Téléphone"
              value={expediteur.telephone}
            />
          </div>
        </div>

        <Divider className="!my-2" />

        {/* Adresse */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-emerald-500" />
            Localisation
          </h3>
          <InfoRow
            icon={<MapPin size={16} />}
            label="Adresse"
            value={expediteur.adresse}
          />
        </div>

        <Divider className="!my-2" />

        {/* Métadonnées */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hash size={14} className="text-emerald-500" />
            Informations système
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Crée le
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {formatDate(expediteur.createdAt)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Modifié le
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {formatDate(expediteur.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Si c'est une personne, afficher nom/prénom détaillé */}
        {isPersonne && (
          <>
            <Divider className="!my-2" />
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-emerald-500" />
                Identité
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Nom
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-1">
                    {expediteur.nom || "-"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Prénom
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-1">
                    {expediteur.prenom || "-"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Si c'est une structure, afficher raison sociale */}
        {!isPersonne && (
          <>
            <Divider className="!my-2" />
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} className="text-emerald-500" />
                Informations légales
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Raison sociale
                </p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {expediteur.raison_sociale || "-"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default ExpediteursDetails;
