import { Expediteur } from "./expediteur";

export interface Courrier {
  idcourrier: number;
  reference: string;
  type: "ARRIVE" | "DEPART";
  nature?: string;
  type_support?: string;
  objet: string;
  corps?: string;
  expediteur?: string;
  destinataire?: string;
  expediteur_id?: number;
  destinataire_idagent?: number;
  destinataire_externe_id?: number;
  entitee_id: number;
  statut:
    | "EN_ATTENTE"
    | "VALIDE"
    | "REJETE"
    | "ATTRIBUE"
    | "EN_COURS"
    | "TRAITE"
    | "ARCHIVE"
    | "RENVOYE";
  date_reception: string;
  date_limite_traitement?: string;
  date_attribution?: string;
  date_traitement?: string;
  date_creation?: string;
  date_modification?: string;
  agent_id: number;
  attribue_par_agent_id?: number;
  traite_par_agent_id?: number;
  modifie_par_agent_id?: number;
  motif_traitement?: string;
  createur?: { id: number; nom: string; prenom: string };
  destinataire_agent?: { id: number; nom: string; prenom: string };
  expediteur_details?: any;
  destinataire_externe?: any;
  pieces_jointes?: Array<{
    idpiece_jointe: number;
    nom_fichier: string;
    fichier_url: string;
  }>;
  attributions?: any[];
  historique_traitements?: any[];
  audit?: any[];
  statut_delai?: "NORMAL" | "URGENT" | "EN_RETARD";
  heures_restantes?: number | null;
}

export type CourrierCreatePayload = {
  type: "ARRIVE" | "DEPART";
  objet: string;
  nature?: string;
  corps?: string;
  type_support?: string;
  expediteur?: string;
  destinataire?: string;
  expediteur_id?: number;
  destinataire_idagent?: number;
  destinataire_externe_id?: number;
};
