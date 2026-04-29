export interface Expediteur {
  idexpediteur: number;
  type: "PERSONNE" | "STRUCTURE";
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string;
  telephone: string;
  adresse: string;
  created_at?: string;
  updated_at?: string;
}