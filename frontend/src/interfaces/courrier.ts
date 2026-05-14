export interface Courrier {
  idcourrier: number;
  reference: string;
  numero_courrier?: string; // Nouveau champ
  type: 'ARRIVE' | 'DEPART';
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
  statut: 'EN_ATTENTE' | 'VALIDÉ' | 'REJETÉ' | 'ATTRIBUÉ' | 'EN_COURS' | 'TRAITE' | 'ARCHIVE' | 'RENVOYE';
  date_reception: string;
  date_enregistrement?: string; // Nouveau champ
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
  pieces_jointes?: Array<{ idpiece_jointe: number; nom_fichier: string; fichier_url: string }>;
  attributions?: any[];
  historique_traitements?: any[];
  audit?: any[];
  statut_delai?: 'NORMAL' | 'URGENT' | 'EN_RETARD';
  heures_restantes?: number | null;
}

export type CourrierCreatePayload = {
  type: 'ARRIVE' | 'DEPART';
  reference: string; // Maintenant requis (plus de génération auto)
  numero_courrier: string; // Nouveau champ requis
  objet: string;
  nature?: string;
  corps?: string;
  type_support?: string;
  expediteur?: string;
  destinataire?: string;
  expediteur_id?: number;
  destinataire_idagent?: number;
  destinataire_externe_id?: number;
  date_reception?: Date | string; // Optionnel, défaut = NOW()
  date_enregistrement?: Date | string; // Nouveau champ optionnel, défaut = NOW()
};