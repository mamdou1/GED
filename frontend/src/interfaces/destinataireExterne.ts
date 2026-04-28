// src/interfaces/destinataireExterne.ts
export interface DestinataireExterne {
  iddestinataire_externe: number;
  type: "PERSONNE" | "STRUCTURE";
  nom: string | null;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  created_at?: string;
  updated_at?: string;
}