// src/interfaces/index.ts

import { Agent } from "http";

export type Genre = "HOMME" | "FEMME";
export type ModeChargement = "INDIVIDUEL" | "LOT_UNIQUE";

export type PieceRecord = {
  id?: number;
  rowId?: number;
  valueIds: Record<string, number>;
  values: Record<string, any>;
  files?: any[];
  createdAt?: string;
};

// Dans vos interfaces, ajoutez ou modifiez
// export interface PieceRecord {
//   id: number;
//   rowId: number;
//   valueIds: Record<number, number>;
//   values: Record<number, string>;
//   files?: Array<{
//     id: number;
//     fichier: string;
//     original_name: string;
//     created_at?: string;
//   }>;
//   createdAt?: string;
// }

export interface Permission {
  id: number;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "access";
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ApiResponse {
  message: string;
  error?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyCodePayload {
  code: string;
}

export interface UpdatePasswordPayload {
  newPassword: string;
}

export interface ApiResponses {
  message: string;
  token?: string;
  error?: string;
}

export interface TotalResponse {
  total: number;
}

export interface StatsItem {
  entiteeId?: number;
  entiteeLibelle?: string;
  structureLibelle?: string;
  structureTitre?: string;
  typeNom?: string;
  typeCode?: string;
  mois?: string;
  moisLibelle?: string;
  nombre: number;
}

export interface StatsResponse {
  message?: string;
  error?: string;
}

export interface DroitPermission {
  permissionId: number;
}

export interface Exercice {
  id?: string;
  annee: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Droit {
  id?: string;
  libelle: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pieces {
  id: string;
  code_pieces: string;
  libelle: string;
  division_id: number;
  LiquidationPieces?: {
    disponible: boolean;
  };
  DocumentPieces?: {
    disponible: boolean;
  };

  // ✅ NOUVEAU : Métadonnées associées
  metaFields?: PieceMetaField[];

  createdAt?: string;
  updatedAt?: string;
}

export interface LiquidationPiece {
  piece: Pieces;
  disponible: boolean;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  username: string;
  num_matricule: string;
  createdAt: string;
  updatedAt: string;
  is_on_line?: boolean;
  last_activity?: string;

  // On utilise l'ID pour les formulaires, et l'objet pour l'affichage
  droit?: Droit | string;

  fonction?: number;
  fonction_details?: Fonction;

  agent_access?: AgentEntiteeAccess[];

  photo_profil?: string;
}

export interface InscriptionPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  username: string;
  num_matricule: string;
  photo_profil?: string;
}

export interface Fonction {
  id: number;
  libelle: string;
  service_id?: number;
  division_id?: number;
  section_id?: number;
  entitee_un_id?: number;
  entitee_deux_id?: number;
  entitee_trois_id?: number;
  entitee_un: EntiteeUn;
  entitee_deux: EntiteeDeux;
  entitee_trois: EntiteeTrois;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

// interfaces/index.ts
export interface HistoriqueLog {
  id: number;
  agent_id?: number;
  agent?: User;
  action: string;
  resource: string;
  resource_id?: number | null;

  // NOUVEAUX CHAMPS
  resource_identifier?: string | null; // Identifiant lisible (ex: "Direction Générale (42)")
  description?: string | null; // Description textuelle de l'action
  method: string;
  path: string;
  status: number;
  ip?: string | null;
  user_agent?: string | null;

  // Données additionnelles
  data?: any | null; // Ancien champ (pour compatibilité)

  // NOUVEAUX CHAMPS JSON
  old_data?: any | null; // Données avant modification
  new_data?: any | null; // Données après modification
  deleted_data?: any | null; // Données supprimées

  createdAt: string;
  updatedAt: string;
}

//---------------------DOcument et genration de champs----------------------------------

export interface TypeDocument {
  id: number;
  code: string;
  nom: string;
  cote: string;

  // IDs (pour les formulaires)
  division_id?: number | null;
  entitee_un_id?: number;
  entitee_deux_id?: number;
  entitee_trois_id?: number;

  // Objets joints (pour l'affichage) - on les rend optionnels car ils viennent du "include"
  entitee_un?: EntiteeUn;
  entitee_deux?: EntiteeDeux;
  entitee_trois?: EntiteeTrois;

  // Champs calculés par le backend (getAll)
  structure_libelle?: string;
  structure_niveau?: string;

  metaFields?: MetaField[];
  pieces?: TypeDocumentPiece[]; // Rendu optionnel pour éviter les erreurs si non inclus
  createdAt?: string;
  updatedAt?: string;
}

// Pour la création, on rend tout optionnel sauf code et nom
export interface CreateTypeDocumentPayload {
  code: string;
  nom: string;
  cote: string;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}

export type MetaFieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "file";

export interface MetaField {
  id: number;
  label: string;
  name: string;
  type: MetaFieldType;
  required: boolean;
  options?: string[]; // pour select
  type_document_id: number;
  createdAt?: string;
}

export interface CreateMetaFieldPayload {
  label: string;
  name: string;
  type: MetaFieldType;
  required: boolean;
  options?: string[];
}

export interface DocumentValue {
  id: number;
  meta_field_id: number;
  metaField?: MetaField;
  value: string;
}

export interface Document {
  id: number;
  type_document_id: number;
  typeDocument?: TypeDocument;
  values?: DocumentValue[];
  pieces?: Pieces[];

  // ✅ NOUVEAU : Valeurs des métadonnées des pièces
  pieceValues?: PieceValue[];
  createdAt?: string;
}

export interface CreateDocumentPayload {
  type_document_id: number;
  values: Record<number, any>;
}

export interface UploadResponse {
  success: boolean;
}

export type PieceMetaFieldType = "text" | "number" | "date" | "file";

export interface PieceMetaField {
  id: number;
  piece_id: number;
  name: string;
  label: string;
  field_type: PieceMetaFieldType;
  required: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePieceMetaFieldPayload {
  name: string;
  label: string;
  field_type: PieceMetaFieldType;
  required: boolean;
  position?: number;
}

export interface PieceValue {
  id: number;
  document_id: number;
  piece_id: number;
  piece_meta_field_id: number;
  row_id?: number;
  value: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Associations (optionnelles)
  metaField?: PieceMetaField;
  file?: DocumentFichier;
}

export interface DocumentFichier {
  id: number;
  document_id: number;
  piece_id: number | null;
  piece_value_id: number | null;
  fichier: string;
  original_name: string;
  new_file_name: string;
  mode: "INDIVIDUEL" | "LOT_UNIQUE";
  createdAt?: string;
  updatedAt?: string;

  // Associations
  piece?: Pieces;
  document?: Document;
  pieceValue?: PieceValue;
}

// Payload pour la création de document avec métadonnées de pièces
export interface CreateDocumentWithPiecesPayload {
  type_document_id: number;
  values: Record<number, any>;
  piece_values?: Record<number, Record<number, any>>; // piece_id -> { meta_field_id: value }
}

// Payload pour l'upload de fichier lié à une métadonnée de pièce
export interface UploadPieceFilePayload {
  piece_id: number;
  piece_value_id?: number;
  file: File;
}

export interface Site {
  id?: string;
  nom: string;
  adresse: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Salle {
  id?: string;
  code_salle: string;
  libelle: string;

  mb_rayons?: number;
  mb_trave_rayon?: number;
  mb_Box_trave?: number;
  mb_traves_par_rayon?: number;
  nb_box?: number;
  sigle_rayon: string;
  sigle_trave: string;
  sigle_box: string;

  site: Site;
  site_id: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface Rayon {
  id?: string;
  code: string;
  salle: Salle;
  salle_id: number;

  capacite_max: string;
  current_count: string;
  status: "OCCUPE" | "LIBRE" | "PLIEN" | "RESERVER";

  mb_traves_par_rayon?: number;
  nb_box?: number;
  sigle_trave: string;
  sigle_box: string;

  // trave: Trave[];
  // trave_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trave {
  id?: string;
  code: string;
  rayon: Rayon;
  rayon_id: number;

  capacite_max: string;
  current_count: string;
  status: "OCCUPE" | "LIBRE" | "PLIEN" | "RESERVER";

  // box_id: string; // Foreign Key vers Salle
  // box?: Box[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Box {
  id?: string;
  code_box: string;
  libelle: string;
  capacite_max: string;
  current_count: string;
  status: "OCCUPE" | "LIBRE" | "PLIEN" | "RESERVER";

  trave_id: string; // Foreign Key vers Salle
  trave?: Trave;

  type_document_id: number;
  typeDocument?: TypeDocument;

  entitee_un_id?: number;
  entitee_deux_id?: number;
  entitee_trois_id?: number;
  entitee_un: EntiteeUn;
  entitee_deux: EntiteeDeux;
  entitee_trois: EntiteeTrois;

  document: Document;
  document_id: number;

  createdAt?: string;
  updatedAt?: string;
}
//------------------------------------------------

export interface TypeDocumentPiece {
  id?: string;
  piece: Pieces;
  disponible: boolean;
  // pdfPath?: string;
}

export interface CreateTypeDocumentPayload {
  // codeType: string;
  // nom: string;
}

export interface AddPieceToTypeDocument {
  piece: string; // id de la pièce
  disponible?: boolean;
}

export interface AddPiecesToTypeDocumentPayload {
  pieces: AddPieceToTypeDocument[];
}

export interface PieceFichier {
  id: string;
  document_type_piece_id: TypeDocumentPiece | string;
  fichier: string;
  mode: ModeChargement;

  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentPiece {
  piece: Pieces;
  disponible: boolean;
}

export interface EntiteeUn {
  id: number;
  titre: string;
  code: string;
  libelle: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface EntiteeDeux {
  id: number;
  titre: string;
  code: string;
  libelle: string;
  entitee_un_id: number;
  entitee_un: EntiteeUn;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface EntiteeTrois {
  id: number;
  titre: string;
  code: string;
  libelle: string;
  entitee_deux_id: number;
  entitee_deux: EntiteeDeux;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

// interfaces.ts
export interface AgentEntiteeAccess {
  id: number;
  agent_id: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
  created_at?: string;
  updated_at?: string;

  // Associations
  entitee_un?: EntiteeUn;
  entitee_deux?: EntiteeDeux;
  entitee_trois?: EntiteeTrois;
  agent?: Agent;
}

export interface GrantAccessPayload {
  agent_id: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}

export interface UpdateAccessPayload {
  agent_id?: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}
