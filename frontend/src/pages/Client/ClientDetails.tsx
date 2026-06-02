// src/pages/clients/ClientDetails.tsx
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  X,
  Edit,
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  Shield,
  Globe,
  Heart,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Client } from "../../interfaces/client";

interface ClientDetailsProps {
  visible: boolean;
  onHide: () => void;
  client: Client | null;
  onEdit?: () => void;
  onRefresh?: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  visible,
  onHide,
  client,
  onEdit,
  onRefresh,
}) => {
  if (!client) return null;

  const isPersonnePhysique = !client.raison_sociale;
  const displayName = isPersonnePhysique
    ? `${client.prenom || ""} ${client.nom || ""}`.trim()
    : client.raison_sociale || "-";

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

  const formatDateNaissance = (date?: string | null) => {
    if (!date) return "Non définie";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  const getConserneBadge = (conserne: string | null) => {
    if (!conserne) {
      return <span className="text-slate-400 italic">Non spécifié</span>;
    }
    return conserne === "Personne physique" ? (
      <Tag
        value="👤 Personne physique"
        severity="info"
        className="text-xs px-2 py-0.5 rounded-md"
      />
    ) : (
      <Tag
        value="🏢 Personne morale"
        severity="success"
        className="text-xs px-2 py-0.5 rounded-md"
      />
    );
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
          <div
            className={`p-3 rounded-xl ${isPersonnePhysique ? "bg-blue-100" : "bg-emerald-100"}`}
          >
            {isPersonnePhysique ? (
              <User size={22} className="text-blue-600" />
            ) : (
              <Building2 size={22} className="text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Tag
                value={
                  isPersonnePhysique ? "Personne physique" : "Personne morale"
                }
                severity={isPersonnePhysique ? "info" : "success"}
                className="text-xs px-2 py-0.5 rounded-md"
              />
              {client.sigle && (
                <Tag
                  value={client.sigle}
                  severity="secondary"
                  className="text-xs px-2 py-0.5 rounded-md"
                />
              )}
              <span className="text-xs text-slate-400 font-mono">
                Matricule: {client.num_matricule}
              </span>
            </div>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "650px", maxWidth: "90vw" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl overflow-hidden shadow-2xl"
      footer={footer}
    >
      <div className="space-y-5 p-1 max-h-[65vh] overflow-y-auto pr-2">
        {/* ============================================ */}
        {/* IDENTITÉ (spécifique au type) */}
        {/* ============================================ */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-emerald-500" />
            Identité
          </h3>

          {isPersonnePhysique ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <InfoRow
                  icon={<User size={16} />}
                  label="Nom"
                  value={client.nom}
                />
                <InfoRow
                  icon={<User size={16} />}
                  label="Prénom"
                  value={client.prenom}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InfoRow
                  icon={<CalendarIcon size={16} />}
                  label="Date de naissance"
                  value={formatDateNaissance(client.date_naissance)}
                />
                <InfoRow
                  icon={<MapPin size={16} />}
                  label="Lieu de naissance"
                  value={client.lieu_naissance}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InfoRow
                  icon={<Globe size={16} />}
                  label="Nationalité"
                  value={client.nationalite}
                />
                <InfoRow
                  icon={<Briefcase size={16} />}
                  label="Profession"
                  value={client.profession}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InfoRow
                  icon={<Heart size={16} />}
                  label="Statut matrimonial"
                  value={client.statut_matrimonial}
                />
                <InfoRow
                  icon={<FileText size={16} />}
                  label="NIF"
                  value={client.nif}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <InfoRow
                icon={<Building2 size={16} />}
                label="Raison sociale"
                value={client.raison_sociale}
              />
              {client.sigle && (
                <InfoRow
                  icon={<Hash size={16} />}
                  label="Sigle"
                  value={client.sigle}
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <InfoRow
                  icon={<FileText size={16} />}
                  label="N° RCCM"
                  value={client.numero_registre_commerce}
                />
                <InfoRow
                  icon={<FileText size={16} />}
                  label="NIF"
                  value={client.nif}
                />
              </div>
            </div>
          )}
        </div>

        <Divider className="!my-2" />

        {/* ============================================ */}
        {/* COORDONNÉES */}
        {/* ============================================ */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail size={14} className="text-emerald-500" />
            Coordonnées
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={client.email}
            />
            <InfoRow
              icon={<Phone size={16} />}
              label="Téléphone"
              value={client.telephone}
            />
          </div>
          <InfoRow
            icon={<MapPin size={16} />}
            label="Adresse"
            value={client.adresse}
          />
        </div>

        <Divider className="!my-2" />

        {/* ============================================ */}
        {/* TYPE DE CONCERNÉ */}
        {/* ============================================ */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Briefcase size={14} className="text-emerald-500" />
            Type de concerné
          </h3>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Concerne
            </p>
            <div>{getConserneBadge(client.conserne)}</div>
          </div>
        </div>

        <Divider className="!my-2" />

        {/* ============================================ */}
        {/* INFORMATIONS SYSTÈME */}
        {/* ============================================ */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-emerald-500" />
            Informations système
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Créé le
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {formatDate(client.createdAt)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Modifié le
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {formatDate(client.updatedAt)}
              </p>
            </div>
          </div>
          {client.createur && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Shield size={10} /> Enregistré par
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {client.createur.prenom} {client.createur.nom}
              </p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ClientDetails;
