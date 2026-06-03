-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               9.6.0 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.16.0.7229
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ========================================================
-- PARTIE 1: STRUCTURE DES TABLES (ordre correct des dépendances)
-- ========================================================

-- --------------------------------------------------------
-- Niveau 1: Tables sans dépendances (aucune clé étrangère)
-- --------------------------------------------------------

-- Table: droit
CREATE TABLE IF NOT EXISTS `droit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: entitee_un
CREATE TABLE IF NOT EXISTS `entitee_un` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: sites
CREATE TABLE IF NOT EXISTS `sites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: type_compte
CREATE TABLE IF NOT EXISTS `type_compte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: type_outils_conservation
CREATE TABLE IF NOT EXISTS `type_outils_conservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: expediteur
CREATE TABLE IF NOT EXISTS `expediteur` (
  `idexpediteur` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `raison_sociale` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `adresse` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`idexpediteur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: destinataire_externe
CREATE TABLE IF NOT EXISTS `destinataire_externe` (
  `iddestinataire_externe` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `raison_sociale` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `adresse` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`iddestinataire_externe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_resource_action` (`resource`,`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: pieces
CREATE TABLE IF NOT EXISTS `pieces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_pieces` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: exercice
CREATE TABLE IF NOT EXISTS `exercice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `annee` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `annee` (`annee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Niveau 2: Tables qui dépendent uniquement des tables du niveau 1
-- --------------------------------------------------------

-- Table: agent (dépend de droit, et de lui-même via enregistrer_par)
CREATE TABLE IF NOT EXISTS `agent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `num_matricule` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `droit_id` int DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_on_line` tinyint(1) NOT NULL DEFAULT '0',
  `last_activity` datetime DEFAULT NULL,
  `code_verification` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_code_expiry` datetime DEFAULT NULL,
  `is_verified_for_reset` tinyint(1) DEFAULT '0',
  `photo_profil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `fonction_id` int DEFAULT NULL,
  `enregistrer_par` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telephone` (`telephone`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_agent_droit_id` (`droit_id`),
  KEY `idx_agent_fonction_id` (`fonction_id`),
  KEY `enregistrer_par` (`enregistrer_par`),
  CONSTRAINT `agent_ibfk_droit` FOREIGN KEY (`droit_id`) REFERENCES `droit` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: typedocuments (dépend de type_compte)
CREATE TABLE IF NOT EXISTS `typedocuments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `cote` varchar(255) DEFAULT NULL,
  `nom` text,
  `entitee_un_id` int DEFAULT NULL,
  `entitee_deux_id` int DEFAULT NULL,
  `entitee_trois_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `conserne` enum('Personne physique','Personne morale') DEFAULT NULL,
  `type_compte_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type_compte_id` (`type_compte_id`),
  CONSTRAINT `typedocuments_ibfk_type_compte` FOREIGN KEY (`type_compte_id`) REFERENCES `type_compte` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: entitee_deux (dépend de entitee_un)
CREATE TABLE IF NOT EXISTS `entitee_deux` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entitee_un_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_entitee_deux_un_id` (`entitee_un_id`),
  CONSTRAINT `entitee_deux_ibfk_un` FOREIGN KEY (`entitee_un_id`) REFERENCES `entitee_un` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: salle (dépend de sites)
CREATE TABLE IF NOT EXISTS `salle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_salle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `site_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `site_id` (`site_id`),
  CONSTRAINT `salle_ibfk_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: client (dépend de agent)
CREATE TABLE IF NOT EXISTS `client` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `raison_sociale` varchar(255) DEFAULT NULL,
  `num_matricule` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `sigle` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `conserne` enum('Personne physique','Personne morale') DEFAULT NULL,
  `enregistrer_par` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `lieu_naissance` varchar(255) DEFAULT NULL,
  `nationalite` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `statut_matrimonial` varchar(255) DEFAULT NULL,
  `date_naissance` datetime DEFAULT NULL,
  `numero_registre_commerce` varchar(255) DEFAULT NULL,
  `nif` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `sigle` (`sigle`),
  UNIQUE KEY `telephone` (`telephone`),
  KEY `enregistrer_par` (`enregistrer_par`),
  CONSTRAINT `client_ibfk_agent` FOREIGN KEY (`enregistrer_par`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: type_compte_metafields (dépend de type_compte)
CREATE TABLE IF NOT EXISTS `type_compte_metafields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `field_type` varchar(255) DEFAULT NULL,
  `required` tinyint(1) DEFAULT NULL,
  `options` json DEFAULT NULL,
  `position` int DEFAULT NULL,
  `type_compte_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type_compte_id` (`type_compte_id`),
  CONSTRAINT `type_compte_metafields_ibfk_compte` FOREIGN KEY (`type_compte_id`) REFERENCES `type_compte` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: metafields (dépend de typedocuments)
CREATE TABLE IF NOT EXISTS `metafields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `field_type` varchar(255) DEFAULT NULL,
  `required` tinyint(1) DEFAULT NULL,
  `options` json DEFAULT NULL,
  `position` int DEFAULT NULL,
  `type_document_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type_document_id` (`type_document_id`),
  CONSTRAINT `metafields_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: entitee_trois (dépend de entitee_deux)
CREATE TABLE IF NOT EXISTS `entitee_trois` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entitee_deux_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_entitee_trois_deux_id` (`entitee_deux_id`),
  CONSTRAINT `entitee_trois_ibfk_deux` FOREIGN KEY (`entitee_deux_id`) REFERENCES `entitee_deux` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: fonctions (dépend de entitee_un, entitee_deux, entitee_trois)
CREATE TABLE IF NOT EXISTS `fonctions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entitee_un_id` int DEFAULT NULL,
  `entitee_deux_id` int DEFAULT NULL,
  `entitee_trois_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fonctions_entitee_un_id` (`entitee_un_id`),
  KEY `idx_fonctions_entitee_deux_id` (`entitee_deux_id`),
  KEY `idx_fonctions_entitee_trois_id` (`entitee_trois_id`),
  CONSTRAINT `fonctions_ibfk_un` FOREIGN KEY (`entitee_un_id`) REFERENCES `entitee_un` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fonctions_ibfk_deux` FOREIGN KEY (`entitee_deux_id`) REFERENCES `entitee_deux` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fonctions_ibfk_trois` FOREIGN KEY (`entitee_trois_id`) REFERENCES `entitee_trois` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mise à jour de la contrainte agent.fonction_id après création de fonctions
ALTER TABLE `agent` ADD CONSTRAINT `agent_ibfk_fonction` FOREIGN KEY (`fonction_id`) REFERENCES `fonctions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `agent` ADD CONSTRAINT `agent_ibfk_enregistreur` FOREIGN KEY (`enregistrer_par`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Table: courrier (dépend de expediteur, agent, destinataire_externe, entitee_deux, entitee_un)
CREATE TABLE IF NOT EXISTS `courrier` (
  `idcourrier` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) NOT NULL,
  `type` enum('ARRIVE','DEPART') NOT NULL DEFAULT 'ARRIVE',
  `nature` varchar(255) DEFAULT NULL,
  `type_support` varchar(255) DEFAULT NULL,
  `objet` varchar(255) NOT NULL,
  `corps` text,
  `expediteur` varchar(255) DEFAULT NULL,
  `destinataire` varchar(255) DEFAULT NULL,
  `expediteur_id` int DEFAULT NULL,
  `destinataire_idagent` int DEFAULT NULL,
  `destinataire_externe_id` int DEFAULT NULL,
  `destinataire_entitee_id` int DEFAULT NULL,
  `destinataire_entitee_type` varchar(255) DEFAULT NULL,
  `entitee_id` int NOT NULL COMMENT 'Direction principale',
  `statut` enum('EN_ATTENTE','VALIDE','REJETE','ATTRIBUE','EN_COURS','TRAITE','ARCHIVE','RENVOYE') DEFAULT 'EN_ATTENTE',
  `date_reception` datetime DEFAULT NULL,
  `date_limite_traitement` datetime DEFAULT NULL,
  `date_attribution` datetime DEFAULT NULL,
  `date_traitement` datetime DEFAULT NULL,
  `date_modification` datetime DEFAULT NULL,
  `agent_id` int NOT NULL,
  `attribue_par_agent_id` int DEFAULT NULL,
  `traite_par_agent_id` int DEFAULT NULL,
  `modifie_par_agent_id` int DEFAULT NULL,
  `motif_traitement` text,
  `date_creation` datetime NOT NULL,
  `numero_courrier` varchar(255) DEFAULT NULL,
  `date_enregistrement` datetime DEFAULT NULL,
  PRIMARY KEY (`idcourrier`),
  UNIQUE KEY `reference` (`reference`),
  KEY `expediteur_id` (`expediteur_id`),
  KEY `destinataire_idagent` (`destinataire_idagent`),
  KEY `destinataire_externe_id` (`destinataire_externe_id`),
  KEY `destinataire_entitee_id` (`destinataire_entitee_id`),
  KEY `entitee_id` (`entitee_id`),
  KEY `agent_id` (`agent_id`),
  KEY `attribue_par_agent_id` (`attribue_par_agent_id`),
  KEY `traite_par_agent_id` (`traite_par_agent_id`),
  KEY `modifie_par_agent_id` (`modifie_par_agent_id`),
  CONSTRAINT `courrier_ibfk_expediteur` FOREIGN KEY (`expediteur_id`) REFERENCES `expediteur` (`idexpediteur`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_dest_agent` FOREIGN KEY (`destinataire_idagent`) REFERENCES `agent` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_dest_externe` FOREIGN KEY (`destinataire_externe_id`) REFERENCES `destinataire_externe` (`iddestinataire_externe`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_dest_entitee` FOREIGN KEY (`destinataire_entitee_id`) REFERENCES `entitee_deux` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_entitee` FOREIGN KEY (`entitee_id`) REFERENCES `entitee_un` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_attribue_par` FOREIGN KEY (`attribue_par_agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_traite_par` FOREIGN KEY (`traite_par_agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courrier_ibfk_modifie_par` FOREIGN KEY (`modifie_par_agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: rayons (dépend de salle)
CREATE TABLE IF NOT EXISTS `rayons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salle_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('OCCUPE','LIBRE','PLIEN','RESERVER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LIBRE',
  `capacite_max` int NOT NULL,
  `current_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `salle_id` (`salle_id`),
  CONSTRAINT `rayons_ibfk_salle` FOREIGN KEY (`salle_id`) REFERENCES `salle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: traves (dépend de rayons)
CREATE TABLE IF NOT EXISTS `traves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rayon_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('OCCUPE','LIBRE','PLIEN','RESERVER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LIBRE',
  `capacite_max` int NOT NULL,
  `current_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `rayon_id` (`rayon_id`),
  CONSTRAINT `traves_ibfk_rayon` FOREIGN KEY (`rayon_id`) REFERENCES `rayons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: box (dépend de typedocuments, traves, entitee_un, entitee_deux, entitee_trois, type_outils_conservation)
CREATE TABLE IF NOT EXISTS `box` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_box` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacite_max` int NOT NULL,
  `current_count` int DEFAULT '0',
  `type_document_id` int DEFAULT NULL,
  `trave_id` int DEFAULT NULL,
  `entitee_un_id` int DEFAULT NULL,
  `entitee_deux_id` int DEFAULT NULL,
  `entitee_trois_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('OCCUPE','LIBRE','PLIEN','RESERVER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LIBRE',
  `type_outils_conservation_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_box_trave_id` (`trave_id`),
  KEY `idx_box_type_document_id` (`type_document_id`),
  KEY `idx_box_entitee_un_id` (`entitee_un_id`),
  KEY `idx_box_entitee_deux_id` (`entitee_deux_id`),
  KEY `idx_box_entitee_trois_id` (`entitee_trois_id`),
  KEY `type_outils_conservation_id` (`type_outils_conservation_id`),
  CONSTRAINT `box_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `box_ibfk_trave` FOREIGN KEY (`trave_id`) REFERENCES `traves` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `box_ibfk_entitee_un` FOREIGN KEY (`entitee_un_id`) REFERENCES `entitee_un` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `box_ibfk_entitee_deux` FOREIGN KEY (`entitee_deux_id`) REFERENCES `entitee_deux` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `box_ibfk_entitee_trois` FOREIGN KEY (`entitee_trois_id`) REFERENCES `entitee_trois` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `box_ibfk_outils_conservation` FOREIGN KEY (`type_outils_conservation_id`) REFERENCES `type_outils_conservation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: documents (dépend de box, typedocuments, agent)
CREATE TABLE IF NOT EXISTS `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `box_id` int DEFAULT NULL,
  `type_document_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `agent_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_documents_box_id` (`box_id`),
  KEY `idx_documents_type_document_id` (`type_document_id`),
  KEY `idx_documents_created_at` (`created_at`),
  KEY `fk_agent` (`agent_id`),
  CONSTRAINT `documents_ibfk_box` FOREIGN KEY (`box_id`) REFERENCES `box` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `documents_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `documents_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: documentvalues (dépend de documents, metafields)
CREATE TABLE IF NOT EXISTS `documentvalues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` text COLLATE utf8mb4_unicode_ci,
  `document_id` int DEFAULT NULL,
  `meta_field_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_docvalues_document_id` (`document_id`),
  KEY `idx_docvalues_meta_field_id` (`meta_field_id`),
  CONSTRAINT `documentvalues_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `documentvalues_ibfk_metafield` FOREIGN KEY (`meta_field_id`) REFERENCES `metafields` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: droit_permission (dépend de droit, permissions)
CREATE TABLE IF NOT EXISTS `droit_permission` (
  `droit_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`droit_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `droit_permission_ibfk_droit` FOREIGN KEY (`droit_id`) REFERENCES `droit` (`id`) ON DELETE CASCADE,
  CONSTRAINT `droit_permission_ibfk_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: piece_meta_fields (dépend de pieces)
CREATE TABLE IF NOT EXISTS `piece_meta_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `piece_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_type` enum('text','date','file') COLLATE utf8mb4_unicode_ci NOT NULL,
  `required` tinyint(1) DEFAULT '0',
  `position` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_piece_meta_fields_piece_id` (`piece_id`),
  CONSTRAINT `piece_meta_fields_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: type_compte_metafield_values (dépend de comptes, type_compte_metafields)
CREATE TABLE IF NOT EXISTS `type_compte_metafield_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `compte_id` int DEFAULT NULL,
  `meta_field_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `compte_id` (`compte_id`),
  KEY `meta_field_id` (`meta_field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: comptes (dépend de type_compte, client, agent) - après client
CREATE TABLE IF NOT EXISTS `comptes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_compte_id` int NOT NULL,
  `client_id` int NOT NULL,
  `agent_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type_compte_id` (`type_compte_id`),
  KEY `client_id` (`client_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `comptes_ibfk_type_compte` FOREIGN KEY (`type_compte_id`) REFERENCES `type_compte` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `comptes_ibfk_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comptes_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Mise à jour de la contrainte type_compte_metafield_values après création de comptes
ALTER TABLE `type_compte_metafield_values` ADD CONSTRAINT `type_compte_metafield_values_ibfk_compte` FOREIGN KEY (`compte_id`) REFERENCES `comptes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `type_compte_metafield_values` ADD CONSTRAINT `type_compte_metafield_values_ibfk_metafield` FOREIGN KEY (`meta_field_id`) REFERENCES `type_compte_metafields` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Table: piece_values (dépend de documents, pieces, piece_meta_fields)
CREATE TABLE IF NOT EXISTS `piece_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `piece_id` int NOT NULL,
  `piece_meta_field_id` int NOT NULL,
  `row_id` int DEFAULT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_piece_values_document_id` (`document_id`),
  KEY `idx_piece_values_piece_id` (`piece_id`),
  KEY `idx_piece_values_meta_field_id` (`piece_meta_field_id`),
  CONSTRAINT `piece_values_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `piece_values_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `piece_values_ibfk_meta_field` FOREIGN KEY (`piece_meta_field_id`) REFERENCES `piece_meta_fields` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: attribution_courrier (dépend de courrier, agent, entitee_deux)
CREATE TABLE IF NOT EXISTS `attribution_courrier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courrier_id` int NOT NULL,
  `attribue_par_agent_id` int NOT NULL,
  `attribue_a_agent_id` int DEFAULT NULL,
  `attribue_a_entitee_id` int DEFAULT NULL,
  `delai_heures_applique` int DEFAULT NULL,
  `date_limite_traitement` datetime DEFAULT NULL,
  `instructions_copiees` text,
  `commentaire` text,
  `date_attribution` datetime DEFAULT NULL,
  `est_transfert` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_id` (`courrier_id`),
  KEY `attribue_par_agent_id` (`attribue_par_agent_id`),
  KEY `attribue_a_agent_id` (`attribue_a_agent_id`),
  KEY `attribue_a_entitee_id` (`attribue_a_entitee_id`),
  CONSTRAINT `attribution_courrier_ibfk_courrier` FOREIGN KEY (`courrier_id`) REFERENCES `courrier` (`idcourrier`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attribution_courrier_ibfk_par_agent` FOREIGN KEY (`attribue_par_agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `attribution_courrier_ibfk_a_agent` FOREIGN KEY (`attribue_a_agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `attribution_courrier_ibfk_a_entitee` FOREIGN KEY (`attribue_a_entitee_id`) REFERENCES `entitee_deux` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: piece_jointe (dépend de courrier, agent)
CREATE TABLE IF NOT EXISTS `piece_jointe` (
  `idpiece_jointe` int NOT NULL AUTO_INCREMENT,
  `nom_fichier` varchar(255) DEFAULT NULL,
  `fichier_url` varchar(255) DEFAULT NULL,
  `date_ajout` datetime DEFAULT NULL,
  `courrier_idcourrier` int DEFAULT NULL,
  `agent_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`idpiece_jointe`),
  KEY `courrier_idcourrier` (`courrier_idcourrier`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `piece_jointe_ibfk_courrier` FOREIGN KEY (`courrier_idcourrier`) REFERENCES `courrier` (`idcourrier`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_jointe_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: audit_courrier (dépend de courrier, agent)
CREATE TABLE IF NOT EXISTS `audit_courrier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courrier_id` int NOT NULL,
  `agent_id` int DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `details` text,
  `date_action` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_id` (`courrier_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `audit_courrier_ibfk_courrier` FOREIGN KEY (`courrier_id`) REFERENCES `courrier` (`idcourrier`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `audit_courrier_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: traitement_courrier (dépend de courrier, attribution_courrier, agent)
CREATE TABLE IF NOT EXISTS `traitement_courrier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courrier_id` int NOT NULL,
  `attribution_id` int DEFAULT NULL,
  `agent_id` int NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `nouveau_statut` varchar(255) DEFAULT NULL,
  `motif` text,
  `date_action` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_id` (`courrier_id`),
  KEY `attribution_id` (`attribution_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `traitement_courrier_ibfk_courrier` FOREIGN KEY (`courrier_id`) REFERENCES `courrier` (`idcourrier`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `traitement_courrier_ibfk_attribution` FOREIGN KEY (`attribution_id`) REFERENCES `attribution_courrier` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `traitement_courrier_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: historiquelog (dépend de agent)
CREATE TABLE IF NOT EXISTS `historiquelog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` int DEFAULT NULL,
  `resource_identifier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` int NOT NULL,
  `ip` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `deleted_data` json DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_historique_agent_id` (`agent_id`),
  KEY `idx_historique_action` (`action`),
  KEY `idx_historique_resource` (`resource`),
  KEY `idx_historique_created_at` (`created_at`),
  CONSTRAINT `historiquelog_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: token (dépend de agent)
CREATE TABLE IF NOT EXISTS `token` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agent_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `token_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: entity_custom_fields (dépend de typedocuments)
CREATE TABLE IF NOT EXISTS `entity_custom_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_document_id` int NOT NULL,
  `entity_type` enum('EntiteeUn','EntiteeDeux','EntiteeTrois') NOT NULL,
  `entity_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `label` varchar(255) NOT NULL,
  `field_type` enum('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT','MULTISELECT','RADIO','CHECKBOX','FILE','EMAIL','PHONE') NOT NULL,
  `required` tinyint(1) DEFAULT '0',
  `position` int DEFAULT '0',
  `options` json DEFAULT NULL,
  `placeholder` varchar(255) DEFAULT NULL,
  `description` text,
  `default_value` varchar(255) DEFAULT NULL,
  `hidden` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_entity_field_per_entity` (`type_document_id`,`entity_type`,`entity_id`,`name`),
  CONSTRAINT `entity_custom_fields_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: entity_custom_field_values (dépend de entity_custom_fields, documents)
CREATE TABLE IF NOT EXISTS `entity_custom_field_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_custom_field_id` int NOT NULL,
  `document_id` int NOT NULL,
  `value` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `entity_custom_field_id` (`entity_custom_field_id`),
  KEY `document_id` (`document_id`),
  CONSTRAINT `entity_custom_field_values_ibfk_field` FOREIGN KEY (`entity_custom_field_id`) REFERENCES `entity_custom_fields` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `entity_custom_field_values_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: client_type_documents (dépend de client, typedocuments)
CREATE TABLE IF NOT EXISTS `client_type_documents` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `client_id` int NOT NULL,
  `type_document_id` int NOT NULL,
  PRIMARY KEY (`client_id`,`type_document_id`),
  KEY `type_document_id` (`type_document_id`),
  CONSTRAINT `client_type_documents_ibfk_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `client_type_documents_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: entitee_deux_type_documents (dépend de typedocuments, entitee_deux)
CREATE TABLE IF NOT EXISTS `entitee_deux_type_documents` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `type_document_id` int NOT NULL,
  `entitee_deux_id` int NOT NULL,
  PRIMARY KEY (`type_document_id`,`entitee_deux_id`),
  KEY `entitee_deux_id` (`entitee_deux_id`),
  CONSTRAINT `entitee_deux_type_documents_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `entitee_deux_type_documents_ibfk_entitee` FOREIGN KEY (`entitee_deux_id`) REFERENCES `entitee_deux` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: entitee_trois_type_documents (dépend de typedocuments, entitee_trois)
CREATE TABLE IF NOT EXISTS `entitee_trois_type_documents` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `type_document_id` int NOT NULL,
  `entitee_trois_id` int NOT NULL,
  PRIMARY KEY (`type_document_id`,`entitee_trois_id`),
  KEY `entitee_trois_id` (`entitee_trois_id`),
  CONSTRAINT `entitee_trois_type_documents_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `entitee_trois_type_documents_ibfk_entitee` FOREIGN KEY (`entitee_trois_id`) REFERENCES `entitee_trois` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: entitee_un_type_documents (dépend de typedocuments, entitee_un)
CREATE TABLE IF NOT EXISTS `entitee_un_type_documents` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `type_document_id` int NOT NULL,
  `entitee_un_id` int NOT NULL,
  PRIMARY KEY (`type_document_id`,`entitee_un_id`),
  KEY `entitee_un_id` (`entitee_un_id`),
  CONSTRAINT `entitee_un_type_documents_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `entitee_un_type_documents_ibfk_entitee` FOREIGN KEY (`entitee_un_id`) REFERENCES `entitee_un` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: document_type_pieces (dépend de typedocuments, pieces)
CREATE TABLE IF NOT EXISTS `document_type_pieces` (
  `document_type_id` int NOT NULL,
  `piece_id` int NOT NULL,
  PRIMARY KEY (`document_type_id`,`piece_id`),
  KEY `piece_id` (`piece_id`),
  CONSTRAINT `document_type_pieces_ibfk_typedoc` FOREIGN KEY (`document_type_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_type_pieces_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: document_pieces (dépend de documents, pieces)
CREATE TABLE IF NOT EXISTS `document_pieces` (
  `document_id` int NOT NULL,
  `piece_id` int NOT NULL,
  `disponible` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`document_id`,`piece_id`),
  KEY `piece_id` (`piece_id`),
  CONSTRAINT `document_pieces_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_pieces_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: document_fichiers (dépend de documents, pieces, piece_values, documentvalues)
CREATE TABLE IF NOT EXISTS `document_fichiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `piece_id` int DEFAULT NULL,
  `piece_value_id` int DEFAULT NULL,
  `document_value_id` int DEFAULT NULL,
  `fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` enum('INDIVIDUEL','LOT_UNIQUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INDIVIDUEL',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_document_fichiers_document_id` (`document_id`),
  KEY `idx_document_fichiers_piece_id` (`piece_id`),
  KEY `piece_value_id` (`piece_value_id`),
  KEY `document_value_id` (`document_value_id`),
  CONSTRAINT `document_fichiers_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `document_fichiers_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `document_fichiers_ibfk_piece_value` FOREIGN KEY (`piece_value_id`) REFERENCES `piece_values` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `document_fichiers_ibfk_docvalue` FOREIGN KEY (`document_value_id`) REFERENCES `documentvalues` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: document_files (dépend de documents, documentvalues)
CREATE TABLE IF NOT EXISTS `document_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int DEFAULT NULL,
  `mimetype` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_id` int NOT NULL,
  `document_value_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `document_id` (`document_id`),
  KEY `document_value_id` (`document_value_id`),
  CONSTRAINT `document_files_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `document_files_ibfk_docvalue` FOREIGN KEY (`document_value_id`) REFERENCES `documentvalues` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: pieces_fichiers (dépend de documents, pieces, piece_values)
CREATE TABLE IF NOT EXISTS `pieces_fichiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `piece_id` int DEFAULT NULL,
  `piece_value_id` int DEFAULT NULL,
  `fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` enum('INDIVIDUEL','LOT_UNIQUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INDIVIDUEL',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pieces_fichiers_document_id` (`document_id`),
  KEY `idx_pieces_fichiers_piece_id` (`piece_id`),
  KEY `piece_value_id` (`piece_value_id`),
  CONSTRAINT `pieces_fichiers_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pieces_fichiers_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `pieces_fichiers_ibfk_piece_value` FOREIGN KEY (`piece_value_id`) REFERENCES `piece_values` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: pieces_files (dépend de piece_values, pieces)
CREATE TABLE IF NOT EXISTS `pieces_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int DEFAULT NULL,
  `mimetype` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_id` int NOT NULL,
  `pieces_value_id` int DEFAULT NULL,
  `pieces_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pieces_value_id` (`pieces_value_id`),
  KEY `pieces_id` (`pieces_id`),
  CONSTRAINT `pieces_files_ibfk_piece_value` FOREIGN KEY (`pieces_value_id`) REFERENCES `piece_values` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `pieces_files_ibfk_piece` FOREIGN KEY (`pieces_id`) REFERENCES `pieces` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: document_entities (dépend de documents)
CREATE TABLE IF NOT EXISTS `document_entities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `entity_type` enum('entitee_un','entitee_deux','entitee_trois','client') NOT NULL,
  `entity_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `client_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `document_id` (`document_id`),
  CONSTRAINT `document_entities_ibfk_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: meta_field_overrides (dépend de typedocuments, metafields)
CREATE TABLE IF NOT EXISTS `meta_field_overrides` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_document_id` int NOT NULL,
  `meta_field_id` int NOT NULL,
  `entity_type` enum('EntiteeUn','EntiteeDeux','EntiteeTrois') NOT NULL,
  `entity_id` int NOT NULL,
  `label_override` varchar(255) DEFAULT NULL,
  `required_override` tinyint(1) DEFAULT NULL,
  `hidden` tinyint(1) DEFAULT '0',
  `position_override` int DEFAULT NULL,
  `options_override` json DEFAULT NULL,
  `default_value_override` varchar(255) DEFAULT NULL,
  `placeholder_override` varchar(255) DEFAULT NULL,
  `description_override` varchar(255) DEFAULT NULL,
  `validation_rules_override` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_override_per_entity` (`type_document_id`,`meta_field_id`,`entity_type`,`entity_id`),
  KEY `meta_field_id` (`meta_field_id`),
  CONSTRAINT `meta_field_overrides_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `meta_field_overrides_ibfk_metafield` FOREIGN KEY (`meta_field_id`) REFERENCES `metafields` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: agent_entitee_access (dépend de agent, entitee_un, entitee_deux, entitee_trois)
CREATE TABLE IF NOT EXISTS `agent_entitee_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int DEFAULT NULL,
  `entitee_un_id` int DEFAULT NULL,
  `entitee_deux_id` int DEFAULT NULL,
  `entitee_trois_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_agent_access_agent_id` (`agent_id`),
  KEY `idx_agent_access_entitee_un` (`entitee_un_id`),
  KEY `idx_agent_access_entitee_deux` (`entitee_deux_id`),
  KEY `idx_agent_access_entitee_trois` (`entitee_trois_id`),
  CONSTRAINT `agent_entitee_access_ibfk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agent_entitee_access_ibfk_entitee_un` FOREIGN KEY (`entitee_un_id`) REFERENCES `entitee_un` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agent_entitee_access_ibfk_entitee_deux` FOREIGN KEY (`entitee_deux_id`) REFERENCES `entitee_deux` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agent_entitee_access_ibfk_entitee_trois` FOREIGN KEY (`entitee_trois_id`) REFERENCES `entitee_trois` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: entity_type_document_pieces (dépend de typedocuments, pieces)
CREATE TABLE IF NOT EXISTS `entity_type_document_pieces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(255) NOT NULL,
  `entity_id` int NOT NULL,
  `type_document_id` int NOT NULL,
  `piece_id` int NOT NULL,
  `action` enum('ADD','REMOVE') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`,`entity_type`),
  KEY `type_document_id` (`type_document_id`),
  KEY `piece_id` (`piece_id`),
  CONSTRAINT `entity_type_document_pieces_ibfk_typedoc` FOREIGN KEY (`type_document_id`) REFERENCES `typedocuments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `entity_type_document_pieces_ibfk_piece` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================================
-- PARTIE 2: INSERTIONS DES DONNÉES (uniquement les insertions)
-- ========================================================

-- --------------------------------------------------------
-- Insertion dans droit
-- --------------------------------------------------------
INSERT INTO `droit` (`id`, `libelle`, `created_at`, `updated_at`) VALUES
(4, 'Administrateur', '2026-03-16 01:36:29', '2026-03-16 01:36:29'),
(5, 'Archiviste ', '2026-03-16 12:00:39', '2026-03-16 12:00:39');

-- --------------------------------------------------------
-- Insertion dans entitee_un
-- --------------------------------------------------------
INSERT INTO `entitee_un` (`id`, `titre`, `code`, `libelle`, `created_at`, `updated_at`) VALUES
(1, 'Direction', 'DIR-001', 'Direction générale', '2026-03-16 01:45:28', '2026-03-23 10:14:24'),
(4, 'Direction', 'DIR-002', 'DIRECTION DE LA COMPTABILITE ET DES FINANCES', '2026-03-23 10:15:30', '2026-03-23 10:15:30'),
(5, 'Direction', 'DIR-003', 'DIRECTION DE L\'EXPLOITATION', '2026-03-23 10:17:20', '2026-03-23 10:17:20'),
(6, 'Direction', 'DIR-004', 'DIRECTION DE LA DIGITALISATION ET DES SYSTÈMES D\'INFORMATIONS', '2026-03-23 10:17:55', '2026-03-23 10:17:55'),
(7, 'Direction', 'DIR-005', 'DIRECTION DU CONTRÔLE PERMANENT', '2026-03-23 10:18:29', '2026-03-23 10:18:29'),
(8, 'Direction', 'DIR-006', 'DIRECTION DE LA GESTION DES RISQUES', '2026-03-23 10:18:42', '2026-03-23 10:18:42'),
(9, 'Direction', 'DIR-007', 'DIRECTION DE L\'AUDIT INTERNE ', '2026-03-23 10:18:58', '2026-03-23 10:18:58'),
(10, 'Direction', 'DIR-008', 'DIRECTION DE L\'ADMINISTRATION ET DE LA LOGISTIQUE ', '2026-03-23 10:19:17', '2026-03-23 10:19:17'),
(11, 'Direction', 'DIR-009', 'DIRECTION DES RESSOURCES HUMAINES ', '2026-03-23 10:19:31', '2026-03-23 10:19:31'),
(14, 'Direction', 'DIR-012', 'AGENCES', '2026-03-23 11:49:58', '2026-03-23 11:49:58');

-- --------------------------------------------------------
-- Insertion dans entitee_deux
-- --------------------------------------------------------
INSERT INTO `entitee_deux` (`id`, `titre`, `code`, `libelle`, `entitee_un_id`, `created_at`, `updated_at`) VALUES
(2, 'Service', 'SER-001', 'CELLULE DE LA SECURITE DU SYSTÈME D\'INFORMATION', 1, '2026-03-23 10:10:54', '2026-03-23 10:14:41'),
(3, 'Service', 'SER-002', 'CELLULE DE LA CONFORMITE ET DE LA LCBCFT', 1, '2026-03-23 10:11:41', '2026-03-23 10:12:15'),
(4, 'Service', 'SER-003', 'SERVICE DE LA COMPTABILITE ', 4, '2026-03-23 11:23:53', '2026-03-23 11:24:44'),
(5, 'Service', 'SER-004', 'SERVICE DE LA TRESORERIE ET DES FINANCEMENTS', 4, '2026-03-23 11:25:28', '2026-03-23 11:25:28'),
(6, 'Service', 'SER-005', 'SERVICE DU BUDGET ET DU CONTRÔLE DE GESTION', 4, '2026-03-23 11:25:48', '2026-03-23 11:25:48'),
(7, 'Service', 'SER-006', 'SERVICE DU CREDIT ', 5, '2026-03-23 11:26:29', '2026-03-23 11:26:29'),
(8, 'Service', 'SER-007', 'SERVICE DE L\'EPARGNE ET DES OPERATIONS DIVERSES', 5, '2026-03-23 11:26:59', '2026-03-23 11:26:59'),
(9, 'Service', 'SER-008', 'SERVICE DU MARKETING ET DU DEVELOPPEMENT DES PRODUITS ', 5, '2026-03-23 11:27:24', '2026-03-23 11:27:24'),
(10, 'Service', 'SER-009', 'SERVICE DU SUPPORT, DE L\'ASSISTANCE ET DE LA VEILLE TECHNOLOGIQUE', 6, '2026-03-23 11:27:50', '2026-03-23 11:27:50'),
(11, 'Service', 'SER-010', 'SERVICE DU DEVELOPPEMENT ET DE LA TRANSFORMATION DIGITALE ', 6, '2026-03-23 11:28:02', '2026-03-23 11:28:02'),
(12, 'Service', 'SER-011', 'SERVICE DE LA GESTION ET DE LA SECURISATION DES SYSTEMES D\'INFORMATIONS ', 6, '2026-03-23 11:28:14', '2026-03-23 11:28:14'),
(13, 'Service', 'SER-012', 'SERVICE DU CONTRÔLE DES ACTIVITES DE LA DIRECTION GENERALE ', 7, '2026-03-23 11:28:36', '2026-03-23 11:28:36'),
(14, 'Service', 'SER-013', 'SERVICE DU CONTRÔLE DES ACTIVITES DES AGENCES ', 7, '2026-03-23 11:28:48', '2026-03-23 11:28:48'),
(15, 'Service', 'SER-014', 'SERVICE DE L\'ANALYSE DES RISQUES ', 8, '2026-03-23 11:29:10', '2026-03-23 11:29:10'),
(16, 'Service', 'SER-015', 'SERVICE DU SUIVI DES RISQUES ', 8, '2026-03-23 11:29:20', '2026-03-23 11:29:20'),
(17, 'Service', 'SER-016', 'POLE D\'AUDITEURS INTERNE ', 9, '2026-03-23 11:29:39', '2026-03-23 11:29:39'),
(18, 'Service', 'SER-017', 'SERVICE DU SECRETARIAT ADMINISTRATIF ', 10, '2026-03-23 11:29:58', '2026-03-23 11:29:58'),
(19, 'Service', 'SER-018', 'SERVICE DU PATRIMOINE ET DE LA LOGISTIQUE ', 10, '2026-03-23 11:30:13', '2026-03-23 11:30:13'),
(20, 'Service', 'SER-019', 'SERVICE DES ARCHIVES ', 10, '2026-03-23 11:30:24', '2026-03-23 11:30:24'),
(21, 'Service', 'SER-020', 'SERVICE DE L\'ADMINISTRATION DU PERSONNEL ET DES RELATIONS SOCIALES', 10, '2026-03-23 11:30:45', '2026-03-23 11:30:45'),
(22, 'Service', 'SER-021', 'SERVICE DU RECRUTEMENT DE LA GESTION DES PERFORMANCES ET DE LA MOBILITE ', 11, '2026-03-23 11:30:56', '2026-03-23 11:30:56'),
(23, 'Service', 'SER-022', 'SERVICE DE LA FORMATION ', 11, '2026-03-23 11:31:09', '2026-03-23 11:31:09'),
(24, 'Service', 'SER-023', 'CELLULE JURIDIQUE ', 1, '2026-03-23 12:20:35', '2026-03-23 12:20:35');

-- --------------------------------------------------------
-- Insertion dans fonctions
-- --------------------------------------------------------
INSERT INTO `fonctions` (`id`, `libelle`, `entitee_un_id`, `entitee_deux_id`, `entitee_trois_id`, `created_at`, `updated_at`) VALUES
(1, 'Directeur Général', 1, NULL, NULL, '2026-03-16 01:47:03', '2026-03-23 10:05:38'),
(2, 'Assistant du Directeur Général', 1, NULL, NULL, '2026-03-16 12:05:05', '2026-03-23 10:05:07'),
(3, 'DIRECTEUR DE LA COMPTABILITE ET DES FINANCES', 4, NULL, NULL, '2026-03-23 11:43:08', '2026-03-23 11:43:08'),
(4, 'DIRECTEUR DE L\'EXPLOITATION', 5, NULL, NULL, '2026-03-23 11:43:33', '2026-03-23 11:43:33'),
(5, 'DIRECTEUR DE LA DIGITALISATION ET DES SYSTÈMES D\'INFORMATIONS', 6, NULL, NULL, '2026-03-23 11:44:09', '2026-03-23 11:44:09'),
(6, 'DIRECTEUR DU CONTRÔLE PERMANENT', 7, NULL, NULL, '2026-03-23 11:44:35', '2026-03-23 11:44:35'),
(7, 'DIRECTEUR DE LA GESTION DES RISQUES', 8, NULL, NULL, '2026-03-23 11:44:53', '2026-03-23 11:44:53'),
(8, 'DIRECTEUR DE L\'AUDIT INTERNE', 9, NULL, NULL, '2026-03-23 11:45:07', '2026-03-23 11:45:07'),
(9, 'DIRECTEUR DE L\'ADMINISTRATION ET DE LA LOGISTIQUE', 10, NULL, NULL, '2026-03-23 11:45:21', '2026-03-23 11:45:21'),
(10, 'DIRECTEUR DES RESSOURCES HUMAINES', 11, NULL, NULL, '2026-03-23 11:45:36', '2026-03-23 11:45:36'),
(15, 'Chef d’Agence', 14, NULL, NULL, '2026-03-23 11:50:23', '2026-03-23 11:50:23'),
(16, 'Assistant au Chef d’Agence', 14, NULL, NULL, '2026-03-23 11:50:32', '2026-03-23 11:50:32'),
(17, 'Agent Administratif', 14, NULL, NULL, '2026-03-23 11:50:42', '2026-03-23 11:50:42'),
(18, 'Agent Comptable', 14, NULL, NULL, '2026-03-23 11:50:56', '2026-03-23 11:50:56'),
(19, 'Superviseur des Recouvrements', 14, NULL, NULL, '2026-03-23 11:51:05', '2026-03-23 11:51:05'),
(20, 'Agent de Recouvrement', 14, NULL, NULL, '2026-03-23 11:51:14', '2026-03-23 11:51:14'),
(21, 'Agent de liaison', 14, NULL, NULL, '2026-03-23 11:51:25', '2026-03-23 11:51:25'),
(22, 'Conducteur de véhicule', 14, NULL, NULL, '2026-03-23 11:51:35', '2026-03-23 11:51:35'),
(23, 'Chef de Bureau', 14, NULL, NULL, '2026-03-23 11:51:46', '2026-03-23 11:51:46'),
(24, 'Agent de Bureau', 14, NULL, NULL, '2026-03-23 11:51:56', '2026-03-23 11:51:56'),
(25, 'Animateur', 14, NULL, NULL, '2026-03-23 11:52:06', '2026-03-23 11:52:06'),
(26, 'Caissier', 14, NULL, NULL, '2026-03-23 11:52:16', '2026-03-23 11:52:16'),
(27, 'Chargé de prêt', 14, NULL, NULL, '2026-03-23 11:52:25', '2026-03-23 11:52:25'),
(28, 'Superviseur d’Épargne', 14, NULL, NULL, '2026-03-23 11:52:38', '2026-03-23 11:52:38'),
(29, 'Collecteur d’Épargne', 14, NULL, NULL, '2026-03-23 11:52:49', '2026-03-23 11:52:49'),
(30, 'Chef du Service de la Comptabilité', NULL, 4, NULL, '2026-03-23 11:54:45', '2026-03-23 11:54:45'),
(31, 'Chargé de la Comptabilité Générale', NULL, 4, NULL, '2026-03-23 11:54:59', '2026-03-23 11:54:59'),
(32, 'Agents d\'appui à la comptabilité', NULL, 4, NULL, '2026-03-23 11:55:09', '2026-03-23 11:55:09'),
(33, 'Chef du Service de la Trésorerie et des Financements', NULL, 5, NULL, '2026-03-23 11:55:45', '2026-03-23 11:55:45'),
(34, 'Chargé de la Trésorerie Opérationnelle', NULL, 5, NULL, '2026-03-23 11:55:58', '2026-03-23 11:55:58'),
(35, 'Chargé de Mobilisation des Fonds', NULL, 5, NULL, '2026-03-23 11:56:08', '2026-03-23 11:56:08'),
(36, 'Chargé des Financements et Relations Bancaires', NULL, 5, NULL, '2026-03-23 11:56:20', '2026-03-23 11:56:20'),
(37, 'Agents d\'appui aux finances', NULL, 5, NULL, '2026-03-23 11:56:31', '2026-03-23 11:56:31'),
(38, 'Chef du Service du Budget et du Contrôle de Gestion', NULL, 6, NULL, '2026-03-23 11:56:53', '2026-03-23 11:56:53'),
(39, 'Chargé de la Comptabilité Analytique', NULL, 6, NULL, '2026-03-23 11:57:04', '2026-03-23 11:57:04'),
(40, 'Chargé de l’Élaboration et du Suivi Budgétaire', NULL, 6, NULL, '2026-03-23 11:57:14', '2026-03-23 11:57:14'),
(41, 'Chargé du Contrôle de Gestion et de la Performance Financière', NULL, 6, NULL, '2026-03-23 11:57:24', '2026-03-23 11:57:24'),
(42, 'Chef du Service du Crédit', NULL, 7, NULL, '2026-03-23 11:57:45', '2026-03-23 11:57:45'),
(43, 'Chargé du Crédit Classique', NULL, 7, NULL, '2026-03-23 11:57:55', '2026-03-23 11:57:55'),
(44, 'Agents d\'appui au crédit classique', NULL, 7, NULL, '2026-03-23 11:58:22', '2026-03-23 11:58:22'),
(45, 'Chargé du Crédit Agricole', NULL, 7, NULL, '2026-03-23 11:58:39', '2026-03-23 11:58:39'),
(46, 'Agents d\'appui au crédit agricole', NULL, 7, NULL, '2026-03-23 11:58:49', '2026-03-23 11:58:49'),
(47, 'Chargé des Crédits Spécifiques', NULL, 7, NULL, '2026-03-23 11:58:59', '2026-03-23 11:58:59'),
(48, 'Agents d\'appui aux crédits spécifiques', NULL, 7, NULL, '2026-03-23 11:59:09', '2026-03-23 11:59:09'),
(49, 'Chef du Service de l’Épargne et des Opérations Diverses', NULL, 8, NULL, '2026-03-23 11:59:29', '2026-03-23 11:59:29'),
(50, 'Chargé de l’Épargne Planifiée', NULL, 8, NULL, '2026-03-23 11:59:37', '2026-03-23 11:59:37'),
(51, 'Agents d\'appui à l’épargne', NULL, 8, NULL, '2026-03-23 11:59:45', '2026-03-23 11:59:45'),
(52, 'Chargé de l’Épargne Non Planifiée', NULL, 8, NULL, '2026-03-23 11:59:53', '2026-03-23 11:59:53'),
(53, 'Agents d\'appui à l’épargne', NULL, 8, NULL, '2026-03-23 12:00:02', '2026-03-23 12:00:02'),
(54, 'Chargé des Opérations Diverses', NULL, 8, NULL, '2026-03-23 12:00:12', '2026-03-23 12:00:12'),
(55, 'Agents d\'appui aux opérations diverses', NULL, 8, NULL, '2026-03-23 12:00:21', '2026-03-23 12:00:21'),
(56, 'Chef du Service Marketing et du Développement des Produits', NULL, 9, NULL, '2026-03-23 12:00:42', '2026-03-23 12:00:42'),
(57, 'Chargé du Développement des Produits', NULL, 9, NULL, '2026-03-23 12:01:00', '2026-03-23 12:01:00'),
(58, 'Chargé de la Promotion des Produits', NULL, 9, NULL, '2026-03-23 12:01:11', '2026-03-23 12:01:11'),
(59, 'Chargé de la Communication et de la Gestion de la Relation Client', NULL, 9, NULL, '2026-03-23 12:01:21', '2026-03-23 12:01:21'),
(60, 'Agents d\'appui au marketing', NULL, 9, NULL, '2026-03-23 12:01:32', '2026-03-23 12:01:32'),
(61, 'Agents d’appui à la communication digitale', NULL, 9, NULL, '2026-03-23 12:01:42', '2026-03-23 12:01:42'),
(62, 'Chef du Service de l\'Analyse des Risques', NULL, 15, NULL, '2026-03-23 12:02:19', '2026-03-23 12:02:19'),
(63, 'Chargés de l’analyse des risques', NULL, 15, NULL, '2026-03-23 12:02:31', '2026-03-23 12:02:31'),
(64, 'Chef du Service du Suivi des Risques', NULL, 16, NULL, '2026-03-23 12:05:25', '2026-03-23 12:05:25'),
(65, 'Chargés du suivi des risques', NULL, 16, NULL, '2026-03-23 12:05:48', '2026-03-23 12:05:48'),
(66, 'Chargé du Recouvrement', NULL, 16, NULL, '2026-03-23 12:06:01', '2026-03-23 12:06:01'),
(67, 'Agents d\'appui au recouvrement', NULL, 16, NULL, '2026-03-23 12:06:09', '2026-03-23 12:06:09'),
(68, 'Auditeurs', NULL, 17, NULL, '2026-03-23 12:06:44', '2026-03-23 12:06:44'),
(69, 'Chef du Service du Support, de l’Assistance et de la Veille Technologique', NULL, 10, NULL, '2026-03-23 12:07:17', '2026-03-23 12:07:17'),
(70, 'Chargé du Support Utilisateurs et de la Maintenance Informatique', NULL, 10, NULL, '2026-03-23 12:07:35', '2026-03-23 12:07:35'),
(71, 'Informaticiens', NULL, 10, NULL, '2026-03-23 12:07:59', '2026-03-23 12:07:59'),
(72, 'Chargé de la Veille Technologique et de l’Innovation', NULL, 10, NULL, '2026-03-23 12:08:12', '2026-03-23 12:08:12'),
(73, 'Chef du Service du Développement et de la Transformation Digitale', NULL, 11, NULL, '2026-03-23 12:08:43', '2026-03-23 12:08:43'),
(74, 'Chargé du Développement Applicatif et de l’Intégration', NULL, 11, NULL, '2026-03-23 12:08:54', '2026-03-23 12:08:54'),
(75, 'Informaticiens', NULL, 11, NULL, '2026-03-23 12:09:04', '2026-03-23 12:09:04'),
(76, 'Chargé de la Transformation Digitale et de la Digitalisation des Processus', NULL, 11, NULL, '2026-03-23 12:09:13', '2026-03-23 12:09:13'),
(77, 'Chef du Service de la Gestion et de la Sécurisation des Systèmes d’Information', NULL, 12, NULL, '2026-03-23 12:09:40', '2026-03-23 12:09:40'),
(78, 'Chargé de l’Infrastructure Systèmes et des Réseaux', NULL, 12, NULL, '2026-03-23 12:09:49', '2026-03-23 12:09:49'),
(79, 'Informaticiens', NULL, 12, NULL, '2026-03-23 12:09:59', '2026-03-23 12:09:59'),
(80, 'Chargé de la Sécurité Informatique', NULL, 12, NULL, '2026-03-23 12:10:09', '2026-03-23 12:10:09'),
(81, 'Chef du Service du Contrôle des Activités de la Direction Générale', NULL, 13, NULL, '2026-03-23 12:10:41', '2026-03-23 12:10:41'),
(82, 'Contrôleur Permanent des Activités de la Direction Générale', NULL, 13, NULL, '2026-03-23 12:10:50', '2026-03-23 12:10:50'),
(83, 'Chef du Service du Contrôle des Activités d\'Agence', NULL, 14, NULL, '2026-03-23 12:11:10', '2026-03-23 12:11:10'),
(84, 'Contrôleur Permanent des Activités d\'Agence', NULL, 14, NULL, '2026-03-23 12:11:25', '2026-03-23 12:11:25'),
(85, 'Chef du Service du Secrétariat Administratif', NULL, 18, NULL, '2026-03-23 12:12:23', '2026-03-23 12:12:23'),
(86, 'Agent d\'appui au secrétariat', NULL, 18, NULL, '2026-03-23 12:12:33', '2026-03-23 12:12:33'),
(87, 'Agent de liaison', NULL, 18, NULL, '2026-03-23 12:12:42', '2026-03-23 12:12:42'),
(88, 'Chef du Service du Patrimoine et de la Logistique', NULL, 19, NULL, '2026-03-23 12:12:57', '2026-03-23 12:12:57'),
(89, 'Chargé des Achats', NULL, 19, NULL, '2026-03-23 12:13:07', '2026-03-23 12:13:07'),
(90, 'Agent d\'appui aux achats', NULL, 19, NULL, '2026-03-23 12:13:17', '2026-03-23 12:13:17'),
(91, 'Chargé de la Logistique', NULL, 19, NULL, '2026-03-23 12:13:28', '2026-03-23 12:13:28'),
(92, 'Agent d\'appui à la logistique', NULL, 19, NULL, '2026-03-23 12:13:37', '2026-03-23 12:13:37'),
(93, 'Chargé de la Gestion du Patrimoine', NULL, 19, NULL, '2026-03-23 12:13:50', '2026-03-23 12:13:50'),
(94, 'Agent d\'appui à la gestion du patrimoine', NULL, 19, NULL, '2026-03-23 12:13:59', '2026-03-23 12:13:59'),
(95, 'Conducteur de véhicule', NULL, 19, NULL, '2026-03-23 12:14:12', '2026-03-23 12:14:12'),
(96, 'Chef du Service de la Documentation et des Archives', NULL, 20, NULL, '2026-03-23 12:14:28', '2026-03-23 12:14:28'),
(97, 'Chargé de la documentation', NULL, 20, NULL, '2026-03-23 12:14:37', '2026-03-23 12:14:37'),
(98, 'Chargé des archives', NULL, 20, NULL, '2026-03-23 12:14:46', '2026-03-23 12:14:46'),
(99, 'Agent d\'appui aux archives', NULL, 20, NULL, '2026-03-23 12:14:55', '2026-03-23 12:14:55'),
(100, 'Chef du Service de l’Administration du Personnel et des Relations Sociales', NULL, 21, NULL, '2026-03-23 12:15:24', '2026-03-23 12:15:24'),
(101, 'Chargé de la Gestion Administrative et des Contrats', NULL, 21, NULL, '2026-03-23 12:15:39', '2026-03-23 12:15:39'),
(102, 'Chargé des Relations Sociales', NULL, 21, NULL, '2026-03-23 12:15:50', '2026-03-23 12:15:50'),
(103, 'Chargé de la Paie et de la Gestion des Temps de Travail', NULL, 21, NULL, '2026-03-23 12:15:59', '2026-03-23 12:15:59'),
(104, 'Agents d\'appui aux RH', NULL, 21, NULL, '2026-03-23 12:16:07', '2026-03-23 12:16:07'),
(105, 'Chef du Service du Recrutement, de la Gestion des Performances et de la Mobilité', NULL, 22, NULL, '2026-03-23 12:16:43', '2026-03-23 12:16:43'),
(106, 'Chargé du Recrutement, de l’évaluation et de la Mobilité', NULL, 22, NULL, '2026-03-23 12:16:51', '2026-03-23 12:16:51'),
(107, 'Agents d\'appui aux RH', NULL, 22, NULL, '2026-03-23 12:17:01', '2026-03-23 12:17:01'),
(108, 'Chef du Service de la Formation', 11, 23, NULL, '2026-03-23 12:17:11', '2026-03-25 09:29:19'),
(109, 'Chargé de la Gestion des Formations', 11, 23, NULL, '2026-03-23 12:17:20', '2026-03-25 09:29:36'),
(110, 'Agents d\'appui aux RH', 11, 23, NULL, '2026-03-23 12:17:28', '2026-03-25 09:30:25'),
(111, 'Responsable de la Cellule Juridique', NULL, 24, NULL, '2026-03-23 12:20:56', '2026-03-23 12:20:56'),
(112, 'Chargés de l’Analyse Juridique', NULL, 24, NULL, '2026-03-23 12:21:10', '2026-03-23 12:21:10'),
(113, 'Responsable de la Cellule de la Sécurité du Système d’Information', NULL, 2, NULL, '2026-03-23 12:21:35', '2026-03-23 12:21:35'),
(114, 'Chargés de l’Analyse des risques de Sécurité du Système d’Information', NULL, 2, NULL, '2026-03-23 12:21:45', '2026-03-23 12:21:45'),
(115, 'Responsable de la Cellule de la Conformité et de la LCBCFT', NULL, 3, NULL, '2026-03-23 12:22:03', '2026-03-23 12:22:03'),
(116, 'Chargés de l’Analyse des risques de Conformité et de LCBCFT', NULL, 3, NULL, '2026-03-23 12:22:13', '2026-03-23 12:22:13');

-- --------------------------------------------------------
-- Insertion dans agent (après création de droit et fonctions)
-- --------------------------------------------------------
INSERT INTO `agent` (`id`, `nom`, `prenom`, `num_matricule`, `email`, `password`, `telephone`, `droit_id`, `username`, `is_on_line`, `last_activity`, `code_verification`, `reset_code_expiry`, `is_verified_for_reset`, `photo_profil`, `fonction_id`, `enregistrer_par`, `created_at`, `updated_at`, `is_active`) VALUES
(4, 'Diouma', 'Mamadou', 'ADMIN001', 'mamadoudiouma@gmail.com', '$2b$10$zo.MJ0y0KNHuc1fotcDaSO3ZJkjZEvMxtK5duiWWw9X4cBl4.qdCi', '0000000000', 4, 'mamadou1', 1, '2026-06-02 14:42:15', NULL, NULL, 1, 'user-1773625695085-596440493.jpg', 1, NULL, '2026-03-16 01:36:29', '2026-06-02 14:42:15', 1),
(5, 'Coulibaly', 'Moussa', 'SCRT0001', 'mc7922779@gmail.com', '$2b$10$SiPXzb56PL/1WL5QOhaoV.bt1mH4UcDbch0kv3.s.zxBgyakhGZlC', '1111111111', 5, 'coulibaly11', 0, '2026-05-19 14:01:09', NULL, NULL, 0, '', 2, NULL, '2026-03-16 12:08:43', '2026-05-19 14:16:19', 1);

-- Mise à jour de la référence circulaire (enregistrer_par)
UPDATE `agent` SET `enregistrer_par` = 4 WHERE `id` = 5;

-- --------------------------------------------------------
-- Insertion dans permissions
-- --------------------------------------------------------
INSERT INTO `permissions` (`id`, `resource`, `action`, `created_at`, `updated_at`) VALUES
(1, 'exercice', 'access', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(2, 'exercice', 'create', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(3, 'exercice', 'read', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(4, 'exercice', 'update', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(5, 'exercice', 'delete', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(6, 'agent', 'access', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(7, 'agent', 'create', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(8, 'agent', 'read', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(9, 'agent', 'update', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(10, 'agent', 'delete', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(11, 'pieces', 'access', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(12, 'pieces', 'create', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(13, 'pieces', 'read', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(14, 'pieces', 'update', '2026-03-16 01:23:39', '2026-03-16 01:23:39'),
(15, 'pieces', 'delete', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(16, 'statistique', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(17, 'statistique', 'create', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(18, 'statistique', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(19, 'statistique', 'update', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(20, 'droit', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(21, 'droit', 'create', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(22, 'droit', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(23, 'droit', 'update', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(24, 'droit', 'delete', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(25, 'fonction', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(26, 'fonction', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(27, 'fonction', 'create', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(28, 'fonction', 'update', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(29, 'fonction', 'delete', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(30, 'document', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(31, 'document', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(32, 'document', 'create', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(33, 'document', 'update', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(34, 'document', 'delete', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(35, 'documentType', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(36, 'documentType', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(37, 'documentType', 'create', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(38, 'documentType', 'update', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(39, 'documentType', 'delete', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(40, 'historique', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(41, 'historique', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(42, 'entiteeUn', 'access', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(43, 'entiteeUn', 'create', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(44, 'entiteeUn', 'read', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(45, 'entiteeUn', 'update', '2026-03-16 01:23:40', '2026-03-16 01:23:40'),
(46, 'entiteeUn', 'delete', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(47, 'entiteeDeux', 'access', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(48, 'entiteeDeux', 'create', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(49, 'entiteeDeux', 'read', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(50, 'entiteeDeux', 'update', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(51, 'entiteeDeux', 'delete', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(52, 'entiteeTrois', 'access', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(53, 'entiteeTrois', 'create', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(54, 'entiteeTrois', 'read', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(55, 'entiteeTrois', 'update', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(56, 'entiteeTrois', 'delete', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(57, 'salle', 'access', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(58, 'salle', 'create', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(59, 'salle', 'read', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(60, 'salle', 'update', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(61, 'salle', 'delete', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(62, 'rayon', 'access', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(63, 'rayon', 'create', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(64, 'rayon', 'read', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(65, 'rayon', 'update', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(66, 'rayon', 'delete', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(67, 'box', 'access', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(68, 'box', 'create', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(69, 'box', 'read', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(70, 'box', 'update', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(71, 'box', 'delete', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(72, 'trave', 'access', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(73, 'trave', 'create', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(74, 'trave', 'read', '2026-03-16 01:23:41', '2026-03-16 01:23:41'),
(75, 'trave', 'update', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(76, 'trave', 'delete', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(77, 'site', 'access', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(78, 'site', 'create', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(79, 'site', 'read', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(80, 'site', 'update', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(81, 'site', 'delete', '2026-03-16 01:23:42', '2026-03-16 01:23:42'),
(82, 'courrier', 'access', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(83, 'courrier', 'create', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(84, 'courrier', 'read', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(85, 'courrier', 'update', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(86, 'courrier', 'delete', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(87, 'destinataire_externe', 'access', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(88, 'destinataire_externe', 'create', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(89, 'destinataire_externe', 'read', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(90, 'destinataire_externe', 'update', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(91, 'destinataire_externe', 'delete', '2026-04-27 10:26:55', '2026-04-27 10:26:55'),
(92, 'expediteur', 'access', '2026-04-27 10:47:49', '2026-04-27 10:47:49'),
(93, 'expediteur', 'create', '2026-04-27 10:47:49', '2026-04-27 10:47:49'),
(94, 'expediteur', 'read', '2026-04-27 10:47:49', '2026-04-27 10:47:49'),
(95, 'expediteur', 'update', '2026-04-27 10:47:49', '2026-04-27 10:47:49'),
(96, 'expediteur', 'delete', '2026-04-27 10:47:49', '2026-04-27 10:47:49'),
(97, 'peutVoirCourrierEntiteeUn', 'read', '2026-04-27 12:24:42', '2026-04-27 12:24:42'),
(98, 'peutVoirCourrierEntiteeDeux', 'read', '2026-04-27 12:24:42', '2026-04-27 12:24:42'),
(99, 'peutVoirCourrierEntiteeTrois', 'read', '2026-04-27 12:24:42', '2026-04-27 12:24:42'),
(100, 'courrier', 'validate', '2026-04-27 23:29:40', '2026-04-27 23:29:40'),
(101, 'courrier', 'reject', '2026-04-27 23:29:40', '2026-04-27 23:29:40'),
(102, 'courrier', 'assign', '2026-04-27 23:29:40', '2026-04-27 23:29:40'),
(103, 'courrier', 'process', '2026-04-27 23:29:40', '2026-04-27 23:29:40'),
(104, 'courrier', 'transfer', '2026-04-27 23:29:40', '2026-04-27 23:29:40'),
(105, 'courrier', 'upload_files', '2026-04-27 23:29:40', '2026-04-27 23:29:40'),
(106, 'courrier', 'download_files', '2026-04-27 23:29:41', '2026-04-27 23:29:41'),
(107, 'mesCourrier', 'update', '2026-04-28 11:40:05', '2026-04-28 11:40:05'),
(108, 'client', 'access', '2026-05-21 12:38:37', '2026-05-21 12:38:37'),
(109, 'client', 'create', '2026-05-21 12:38:37', '2026-05-21 12:38:37'),
(110, 'client', 'read', '2026-05-21 12:38:37', '2026-05-21 12:38:37'),
(111, 'client', 'update', '2026-05-21 12:38:37', '2026-05-21 12:38:37'),
(112, 'client', 'delete', '2026-05-21 12:38:37', '2026-05-21 12:38:37'),
(113, 'compte', 'access', '2026-05-23 23:39:37', '2026-05-23 23:39:37'),
(114, 'compte', 'create', '2026-05-23 23:39:37', '2026-05-23 23:39:37'),
(115, 'compte', 'read', '2026-05-23 23:39:37', '2026-05-23 23:39:37'),
(116, 'compte', 'update', '2026-05-23 23:39:37', '2026-05-23 23:39:37'),
(117, 'compte', 'delete', '2026-05-23 23:39:37', '2026-05-23 23:39:37'),
(118, 'type_document', 'access', '2026-05-24 17:11:08', '2026-05-24 17:11:08'),
(119, 'type_document', 'create', '2026-05-24 17:11:08', '2026-05-24 17:11:08'),
(120, 'type_document', 'read', '2026-05-24 17:11:09', '2026-05-24 17:11:09'),
(121, 'type_document', 'update', '2026-05-24 17:11:09', '2026-05-24 17:11:09'),
(122, 'type_document', 'delete', '2026-05-24 17:11:09', '2026-05-24 17:11:09'),
(123, 'typeCompte', 'access', '2026-05-24 17:13:17', '2026-05-24 17:13:17'),
(124, 'typeCompte', 'create', '2026-05-24 17:13:17', '2026-05-24 17:13:17'),
(125, 'typeCompte', 'read', '2026-05-24 17:13:17', '2026-05-24 17:13:17'),
(126, 'typeCompte', 'update', '2026-05-24 17:13:17', '2026-05-24 17:13:17'),
(127, 'typeCompte', 'delete', '2026-05-24 17:13:17', '2026-05-24 17:13:17');

-- --------------------------------------------------------
-- Insertion dans droit_permission
-- --------------------------------------------------------
INSERT INTO `droit_permission` (`droit_id`, `permission_id`) VALUES
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10),
(4, 11), (4, 12), (4, 13), (4, 14), (4, 15), (4, 16), (4, 17), (4, 18), (4, 19), (4, 20),
(4, 21), (4, 22), (4, 23), (4, 24), (4, 25), (4, 26), (4, 27), (4, 28), (4, 29), (4, 30),
(4, 31), (4, 32), (4, 33), (4, 34), (4, 35), (4, 36), (4, 37), (4, 38), (4, 39), (4, 40),
(4, 41), (4, 42), (4, 43), (4, 44), (4, 45), (4, 46), (4, 47), (4, 48), (4, 49), (4, 50),
(4, 51), (4, 52), (4, 53), (4, 54), (4, 55), (4, 56), (4, 57), (4, 58), (4, 59), (4, 60),
(4, 61), (4, 62), (4, 63), (4, 64), (4, 65), (4, 66), (4, 67), (4, 68), (4, 69), (4, 70),
(4, 71), (4, 72), (4, 73), (4, 74), (4, 75), (4, 76), (4, 77), (4, 78), (4, 79), (4, 80),
(4, 81), (4, 82), (4, 83), (4, 84), (4, 85), (4, 86), (4, 87), (4, 88), (4, 89), (4, 90),
(4, 91), (4, 92), (4, 93), (4, 94), (4, 95), (4, 96), (4, 97), (4, 98), (4, 99), (4, 100),
(4, 101), (4, 102), (4, 103), (4, 104), (4, 105), (4, 106), (4, 107), (4, 108), (4, 109), (4, 110),
(4, 111), (4, 112), (4, 113), (4, 114), (4, 115), (4, 116), (4, 117), (4, 123), (4, 124), (4, 125),
(4, 126), (4, 127),
(5, 30), (5, 31), (5, 32), (5, 33), (5, 34), (5, 36), (5, 44), (5, 49), (5, 54), (5, 84),
(5, 85), (5, 94), (5, 105), (5, 106), (5, 107);

-- --------------------------------------------------------
-- Insertion dans typedocuments
-- --------------------------------------------------------
INSERT INTO `typedocuments` (`id`, `code`, `cote`, `nom`, `entitee_un_id`, `entitee_deux_id`, `entitee_trois_id`, `created_at`, `updated_at`, `conserne`, `type_compte_id`) VALUES
(3, 'TD-001', NULL, 'Fiche initiée/affectée/reçue', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(4, 'TD-002', NULL, 'Courrier initié/affecté/départ/arrivée', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(5, 'TD-003', NULL, 'Document de synthèse et d\'analyse', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(6, 'TD-004', NULL, 'Notes de Service', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(7, 'TD-005', NULL, 'Notes d\'information', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(8, 'TD-006', NULL, 'Décision', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(9, 'TD-007', NULL, 'Communiqué', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(10, 'TD-008', NULL, 'Registre de courrier Départ/Arrivée et registre des contrats des prestataires', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(11, 'TD-009', NULL, 'Bordereau de transmission', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(12, 'TD-010', NULL, 'Ordre de mission', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(13, 'TD-011', NULL, 'Terme de Référence de mission (TDR)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(14, 'TD-012', NULL, 'Contrat', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(15, 'TD-013', NULL, 'Bons de réception (souche)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(16, 'TD-014', NULL, 'Bons de commande (souche)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(17, 'TD-015', NULL, 'Demande d\'approvisionnement (souche)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(18, 'TD-016', NULL, 'Carnet de demande de fournitures', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(19, 'TD-017', NULL, 'Procès-verbal de réception', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(20, 'TD-018', NULL, 'Dossier d\'incorporation', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(21, 'TD-019', NULL, 'Bordereau de livraison', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(22, 'TD-020', NULL, 'Fiche (sortie, mise à disposition, transfert, inventaire, signalisation des pannes)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(23, 'TD-021', NULL, 'Dossier de marché', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(24, 'TD-022', NULL, 'Plan et avis général de passation des Marchés Publics', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(25, 'TD-023', NULL, 'Document de synthèse et d\'analyse d\'activité trimestrielle', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(26, 'TD-024', NULL, 'PV de réception technique, provisoire et définitive', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(27, 'TD-025', NULL, 'Contrat et Avenant', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(28, 'TD-026', NULL, 'Outils de gestion des archives', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(29, 'TD-027', NULL, 'Fiche typologique de documents', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(30, 'TD-028', NULL, 'Registre de communication', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(31, 'TD-029', NULL, 'Bordereau de versement', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(32, 'TD-030', NULL, 'Fiche de prêt de document', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(33, 'TD-031', NULL, 'Ouvrages pédagogiques acquis par la Société', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(34, 'TD-032', NULL, 'Documents relatifs aux travaux d\'élimination de documents', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(35, 'TD-033', NULL, 'Fiche de poste', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(36, 'TD-034', NULL, 'Demande de stage / Emploi', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(37, 'TD-035', NULL, 'Autorisation de stage', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(38, 'TD-036', NULL, 'Attestation / Certificat de travail', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(39, 'TD-037', NULL, 'Sécurité sociale', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(40, 'TD-038', NULL, 'Dossier du personnel inactif', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(41, 'TD-039', NULL, 'Assurance', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(42, 'TD-040', NULL, 'Fiche d\'évaluation', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(43, 'TD-041', NULL, 'Dossiers des stagiaires (académique et professionnel)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(44, 'TD-042', NULL, 'Document de synthèse et d\'analyse (productivité, rentabilité, qualité, réclamations)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(45, 'TD-043', NULL, 'Certification de produit et/ou services', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(46, 'TD-044', NULL, 'Formation du personnel / Modules', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(47, 'TD-045', NULL, 'État de rapprochement guichet', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(48, 'TD-046', NULL, 'État de rapprochement bancaire Siège', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(49, 'TD-047', NULL, 'État de rapprochement Comptabilité - Informatique', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(50, 'TD-048', NULL, 'État de rapprochement ligne de crédit et fonctionnement (Agences)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(51, 'TD-049', NULL, 'État de rapprochement Épargne', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(52, 'TD-050', NULL, 'Pièce de Caisse Menues Dépenses', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(53, 'TD-051', NULL, 'Note sur états financiers', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(54, 'TD-052', NULL, 'Dossier de déclarations fiscales et sociales (fiscalité)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(55, 'TD-053', NULL, 'Dossier de paiements des fournisseurs', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(56, 'TD-054', NULL, 'Grand-livre et balance', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(57, 'TD-055', NULL, 'Convention (crédit, nantissement, DAT)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(58, 'TD-056', NULL, 'Indicateurs périodiques', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(59, 'TD-057', NULL, 'Ordre de virement', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(60, 'TD-058', NULL, 'Avis de crédit', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(61, 'TD-059', NULL, 'État financier', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(62, 'TD-060', NULL, 'État de paiement', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(63, 'TD-061', NULL, 'Relevé de compte bancaire', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(64, 'TD-062', NULL, 'Ordre d\'émission de chèque', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(65, 'TD-063', NULL, 'Talon de chèque, souche, carnet', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(66, 'TD-064', NULL, 'Salaire', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(67, 'TD-065', NULL, 'Fiche de paie', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(68, 'TD-066', NULL, 'Plan de travail annuel et Budget général', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(69, 'TD-067', NULL, 'Tableau de bord des indicateurs et données significatives de gestion', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(70, 'TD-068', NULL, 'Relevé de décision (réallocation budgétaire, approbation budget)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(71, 'TD-069', NULL, 'Plan stratégique et plan d\'affaires', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(72, 'TD-070', NULL, 'Pièces de caisse', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(73, 'TD-071', NULL, 'Pièces comptables Agences', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(74, 'TD-072', NULL, 'Dossier de partenariat', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(75, 'TD-073', NULL, 'Registre (gestion cartes NFC, comptes clients)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(76, 'TD-074', NULL, 'Questionnaires', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(77, 'TD-075', NULL, 'Guide (Focus Group)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(78, 'TD-076', NULL, 'Carte (vœux, visite, invitation)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(79, 'TD-077', NULL, 'Avis et propositions sur dossier de sponsoring', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(80, 'TD-078', NULL, 'Encarts publicitaires, flyers, prémaquettes', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(81, 'TD-079', NULL, 'Cérémonie officielle et activité spéciale', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(82, 'TD-080', NULL, 'Manuel de formation', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(83, 'TD-081', NULL, 'Synthèse d\'information', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(84, 'TD-082', NULL, 'Rapport de contrôle', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(85, 'TD-083', NULL, 'Données statistiques, bulletin des chiffres, fichier des gros débiteurs', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(86, 'TD-084', NULL, 'Dossier de contentieux', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(87, 'TD-085', NULL, 'Dossier de prêt au personnel', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(88, 'TD-086', NULL, 'Dossier de client concernant sa garantie', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(89, 'TD-087', NULL, 'Convention de garantie réelle', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(90, 'TD-088', NULL, 'Avis juridique / Acte de cautionnement', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(91, 'TD-089', NULL, 'Actes officiels (Loi, Ordonnance, Décret, etc.)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(92, 'TD-090', NULL, 'Document de l\'Assemblée Générale et du Conseil d\'Administration', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(93, 'TD-091', NULL, 'Documentation (monographies, journaux, magazines, audiovisuel)', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(94, 'TD-092', NULL, 'Manuel de procédures, politiques, statut, règlement intérieur', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(95, 'TD-093', NULL, 'Registres de présence', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(96, 'TD-094', NULL, 'Document appartenant à la Direction Générale', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(97, 'TD-095', NULL, 'Document appartenant au Secrétariat du Directeur Général', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(98, 'TD-096', NULL, 'Document appartenant à la Cellule de la Sécurité du Système d\'Information', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(99, 'TD-097', NULL, 'Document appartenant à la Cellule de la Conformité et de la LBCFT', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(100, 'TD-098', NULL, 'Document appartenant à la Cellule Juridique', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(101, 'TD-099', NULL, 'Document appartenant à la Direction de l\'Administration et des Finances', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(102, 'TD-100', NULL, 'Document appartenant à la Direction des Ressources Humaines', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(103, 'TD-101', NULL, 'Document appartenant à la Direction de la Comptabilité et des Finances', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(104, 'TD-102', NULL, 'Document appartenant à la Direction de l\'Exploitation', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(105, 'TD-103', NULL, 'Document appartenant à la Direction de la Digitalisation et des Systèmes d\'Information', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(106, 'TD-104', NULL, 'Document appartenant à la Direction des Contrôles Permanents', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(107, 'TD-105', NULL, 'Document appartenant à la Direction de la Gestion des Risques', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(108, 'TD-106', NULL, 'Document appartenant à la Direction de l\'Audit Interne', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL),
(109, 'TD-107', NULL, 'Document appartenant au syndicat et associations professionnelles', NULL, NULL, NULL, '2026-05-19 12:53:32', '2026-05-19 12:53:32', NULL, NULL);

-- --------------------------------------------------------
-- Insertion dans metafields
-- --------------------------------------------------------
INSERT INTO `metafields` (`id`, `name`, `label`, `field_type`, `required`, `options`, `position`, `type_document_id`) VALUES
(1, 'Date', 'Date', 'date', 1, NULL, NULL, NULL),
(2, 'Numéro', 'Numéro', 'text', 0, NULL, NULL, NULL),
(3, 'numero_fiche', 'N° fiche', 'text', 1, NULL, 1, 3),
(4, 'objet', 'Objet', 'text', 1, NULL, 2, 3),
(5, 'expediteur_destinataire', 'Expéditeur/Destinataire', 'text', 1, NULL, 3, 3),
(6, 'date', 'Date', 'date', 1, NULL, 4, 3),
(7, 'numero_courrier', 'N° courrier', 'text', 1, NULL, 1, 4),
(8, 'objet', 'Objet', 'text', 1, NULL, 2, 4),
(9, 'expediteur_destinataire', 'Expéditeur/Destinataire', 'text', 1, NULL, 3, 4),
(10, 'date', 'Date', 'date', 1, NULL, 4, 4),
(11, 'type', 'Type (mensuel/trimestriel/annuel)', 'select', 1, '["mensuel", "trimestriel", "annuel"]', 1, 5),
(12, 'periode', 'Période', 'text', 1, NULL, 2, 5),
(13, 'service', 'Service', 'text', 1, NULL, 3, 5),
(14, 'date', 'Date', 'date', 1, NULL, 4, 5),
(15, 'numero', 'N°', 'text', 1, NULL, 1, 6),
(16, 'objet', 'Objet', 'text', 1, NULL, 2, 6),
(17, 'date', 'Date', 'date', 1, NULL, 3, 6),
(18, 'numero', 'N°', 'text', 1, NULL, 1, 7),
(19, 'objet', 'Objet', 'text', 1, NULL, 2, 7),
(20, 'date', 'Date', 'date', 1, NULL, 3, 7),
(21, 'numero', 'N°', 'text', 1, NULL, 1, 8),
(22, 'objet', 'Objet', 'text', 1, NULL, 2, 8),
(23, 'date', 'Date', 'date', 1, NULL, 3, 8),
(24, 'numero', 'N°', 'text', 1, NULL, 1, 9),
(25, 'objet', 'Objet', 'text', 1, NULL, 2, 9),
(26, 'date', 'Date', 'date', 1, NULL, 3, 9),
(27, 'periode', 'Période', 'text', 1, NULL, 1, 10),
(28, 'numero', 'N°', 'text', 0, NULL, 1, 11),
(29, 'service_emetteur', 'Service émetteur', 'text', 0, NULL, 2, 11),
(30, 'date', 'Date', 'date', 1, NULL, 3, 11),
(31, 'numero', 'N°', 'text', 1, NULL, 1, 12),
(32, 'objet', 'Objet', 'text', 1, NULL, 2, 12),
(33, 'date', 'Date', 'date', 1, NULL, 3, 12),
(34, 'date', 'Date', 'date', 1, NULL, 1, 13),
(35, 'objet', 'Objet', 'text', 1, NULL, 2, 13),
(36, 'numero_contrat', 'N° contrat', 'text', 0, NULL, 1, 14),
(37, 'parties_contractantes', 'Parties contractantes', 'text', 1, NULL, 2, 14),
(38, 'objet', 'Objet', 'text', 1, NULL, 3, 14),
(39, 'date', 'Date', 'date', 1, NULL, 4, 14),
(40, 'numero_extreme', 'N° et date extrême', 'text', 1, NULL, 1, 15),
(41, 'numero_extreme', 'N° et date extrême', 'text', 1, NULL, 1, 16),
(42, 'numero_extreme', 'N° et date extrême', 'text', 1, NULL, 1, 17),
(43, 'numero_extreme', 'N° et date extrême', 'text', 1, NULL, 1, 18),
(44, 'numero', 'N°', 'text', 0, NULL, 1, 19),
(45, 'date', 'Date', 'date', 1, NULL, 2, 19),
(46, 'fournisseur', 'Fournisseur', 'text', 1, NULL, 3, 19),
(47, 'numero', 'N°', 'text', 0, NULL, 1, 20),
(48, 'bien', 'Bien', 'text', 1, NULL, 2, 20),
(49, 'date', 'Date', 'date', 1, NULL, 3, 20),
(50, 'date', 'Date', 'date', 1, NULL, 1, 21),
(51, 'reference', 'Référence', 'text', 1, NULL, 2, 21),
(52, 'numero', 'N°', 'text', 0, NULL, 1, 22),
(53, 'type_fiche', 'Type', 'text', 1, NULL, 2, 22),
(54, 'bien', 'Bien', 'text', 1, NULL, 3, 22),
(55, 'numero', 'N°', 'text', 0, NULL, 1, 23),
(56, 'objet', 'Objet', 'text', 1, NULL, 2, 23),
(57, 'fournisseur', 'Fournisseur', 'text', 1, NULL, 3, 23),
(58, 'date', 'Date', 'date', 1, NULL, 4, 23),
(59, 'date', 'Date', 'date', 1, NULL, 1, 24),
(60, 'objet', 'Objet', 'text', 1, NULL, 2, 24),
(61, 'type', 'Type', 'select', 1, '["trimestrielle"]', 1, 25),
(62, 'periode', 'Période', 'text', 1, NULL, 2, 25),
(63, 'service', 'Service', 'text', 1, NULL, 3, 25),
(64, 'date', 'Date', 'date', 1, NULL, 4, 25),
(65, 'date', 'Date', 'date', 1, NULL, 1, 26),
(66, 'objet', 'Objet', 'text', 1, NULL, 2, 26),
(67, 'numero', 'N°', 'text', 0, NULL, 1, 27),
(68, 'parties', 'Parties', 'text', 1, NULL, 2, 27),
(69, 'objet', 'Objet', 'text', 1, NULL, 3, 27),
(70, 'date', 'Date', 'date', 1, NULL, 4, 27),
(71, 'modele_type', 'Modèle type', 'text', 0, NULL, 1, 28),
(72, 'modele_type', 'Modèle type', 'text', 0, NULL, 1, 29),
(73, 'periode', 'Période', 'text', 1, NULL, 1, 30),
(74, 'numero', 'N°', 'text', 0, NULL, 1, 31),
(75, 'service', 'Service', 'text', 1, NULL, 2, 31),
(76, 'date', 'Date', 'date', 1, NULL, 3, 31),
(77, 'date', 'Date', 'date', 1, NULL, 1, 32),
(78, 'numero', 'N°', 'text', 0, NULL, 1, 33),
(79, 'date', 'Date', 'date', 1, NULL, 2, 33),
(80, 'periode', 'Période', 'text', 1, NULL, 1, 34),
(81, 'poste', 'Poste', 'text', 1, NULL, 1, 35),
(82, 'service', 'Service', 'text', 1, NULL, 2, 35),
(83, 'nom', 'Nom', 'text', 1, NULL, 1, 36),
(84, 'periode', 'Période', 'text', 1, NULL, 2, 36),
(85, 'service', 'Service', 'text', 1, NULL, 3, 36),
(86, 'nom', 'Nom', 'text', 1, NULL, 1, 37),
(87, 'periode', 'Période', 'text', 1, NULL, 2, 37),
(88, 'service', 'Service', 'text', 1, NULL, 3, 37),
(89, 'nom', 'Nom', 'text', 1, NULL, 1, 38),
(90, 'type', 'Type', 'text', 1, NULL, 2, 38),
(91, 'objet', 'Objet', 'text', 1, NULL, 1, 39),
(92, 'organisme', 'Organisme', 'text', 1, NULL, 2, 39),
(93, 'date', 'Date', 'date', 1, NULL, 3, 39),
(94, 'matricule', 'Matricule', 'text', 1, NULL, 1, 40),
(95, 'nom', 'Nom', 'text', 1, NULL, 2, 40),
(96, 'objet', 'Objet', 'text', 1, NULL, 1, 41),
(97, 'periode', 'Période', 'text', 1, NULL, 2, 41),
(98, 'agent', 'Agent', 'text', 1, NULL, 1, 42),
(99, 'periode', 'Période', 'text', 1, NULL, 2, 42),
(100, 'nom', 'Nom', 'text', 1, NULL, 1, 43),
(101, 'periode', 'Période', 'text', 1, NULL, 2, 43),
(102, 'type', 'Type (mensuel/trimestriel/annuel)', 'select', 1, '["mensuel", "trimestriel", "annuel"]', 1, 44),
(103, 'periode', 'Période', 'text', 1, NULL, 2, 44),
(104, 'service', 'Service', 'text', 1, NULL, 3, 44),
(105, 'date', 'Date', 'date', 1, NULL, 4, 44),
(106, 'produit', 'Produit', 'text', 1, NULL, 1, 45),
(107, 'date', 'Date', 'date', 1, NULL, 2, 45),
(108, 'theme', 'Thème', 'text', 1, NULL, 1, 46),
(109, 'periode', 'Période', 'text', 1, NULL, 2, 46),
(110, 'responsable', 'Responsable', 'text', 1, NULL, 3, 46),
(111, 'periode', 'Période', 'text', 1, NULL, 1, 47),
(112, 'agence', 'Agence', 'text', 0, NULL, 2, 47),
(113, 'date', 'Date', 'date', 0, NULL, 3, 47),
(114, 'periode', 'Période', 'text', 1, NULL, 1, 48),
(115, 'date', 'Date', 'date', 0, NULL, 2, 48),
(116, 'periode', 'Période', 'text', 1, NULL, 1, 49),
(117, 'date', 'Date', 'date', 0, NULL, 2, 49),
(118, 'periode', 'Période', 'text', 1, NULL, 1, 50),
(119, 'date', 'Date', 'date', 0, NULL, 2, 50),
(120, 'periode', 'Période', 'text', 1, NULL, 1, 51),
(121, 'date', 'Date', 'date', 0, NULL, 2, 51),
(122, 'bureau', 'Bureau', 'text', 1, NULL, 1, 52),
(123, 'date', 'Date', 'date', 1, NULL, 2, 52),
(124, 'exercice', 'Exercice', 'text', 1, NULL, 1, 53),
(125, 'auteur', 'Auteur', 'text', 0, NULL, 2, 53),
(126, 'date', 'Date', 'date', 1, NULL, 3, 53),
(127, 'type_impot', 'Type impôt', 'text', 1, NULL, 1, 54),
(128, 'periode', 'Période', 'text', 1, NULL, 2, 54),
(129, 'fournisseur', 'Fournisseur', 'text', 1, NULL, 1, 55),
(130, 'montant', 'Montant', 'number', 1, NULL, 2, 55),
(131, 'date', 'Date', 'date', 1, NULL, 3, 55),
(132, 'reference_facture', 'Référence facture', 'text', 0, NULL, 4, 55),
(133, 'exercice', 'Exercice', 'text', 1, NULL, 1, 56),
(134, 'periode', 'Période', 'text', 1, NULL, 2, 56),
(135, 'date', 'Date', 'date', 0, NULL, 3, 56),
(136, 'montant', 'Montant', 'number', 0, NULL, 1, 57),
(137, 'date', 'Date', 'date', 1, NULL, 2, 57),
(138, 'periode', 'Période', 'text', 1, NULL, 1, 58),
(139, 'date', 'Date', 'date', 1, NULL, 1, 59),
(140, 'beneficiaires', 'Bénéficiaires', 'text', 1, NULL, 2, 59),
(141, 'numero_avis', 'N° avis', 'text', 0, NULL, 1, 60),
(142, 'montant', 'Montant', 'number', 1, NULL, 2, 60),
(143, 'date', 'Date', 'date', 1, NULL, 3, 60),
(144, 'type', 'Type', 'text', 1, NULL, 1, 61),
(145, 'exercice', 'Exercice', 'text', 1, NULL, 2, 61),
(146, 'date', 'Date', 'date', 0, NULL, 3, 61),
(147, 'periode', 'Période', 'text', 1, NULL, 1, 62),
(148, 'montant', 'Montant', 'number', 1, NULL, 2, 62),
(149, 'date', 'Date', 'date', 0, NULL, 3, 62),
(150, 'banque', 'Banque', 'text', 1, NULL, 1, 63),
(151, 'numero_compte', 'N° compte', 'text', 1, NULL, 2, 63),
(152, 'periode', 'Période', 'text', 1, NULL, 3, 63),
(153, 'numero', 'N°', 'text', 0, NULL, 1, 64),
(154, 'montant', 'Montant', 'number', 1, NULL, 2, 64),
(155, 'beneficiaire', 'Bénéficiaire', 'text', 1, NULL, 3, 64),
(156, 'date', 'Date', 'date', 1, NULL, 4, 64),
(157, 'numero_extreme', 'N° extrême', 'text', 1, NULL, 1, 65),
(158, 'date', 'Date', 'date', 0, NULL, 2, 65),
(159, 'periode', 'Période', 'text', 1, NULL, 1, 66),
(160, 'periode', 'Période', 'text', 1, NULL, 1, 67),
(161, 'annee', 'Année', 'text', 1, NULL, 1, 68),
(162, 'service', 'Service', 'text', 0, NULL, 2, 68),
(163, 'periode', 'Période', 'text', 1, NULL, 1, 69),
(164, 'service', 'Service', 'text', 1, NULL, 2, 69),
(165, 'date', 'Date', 'date', 0, NULL, 3, 69),
(166, 'numero', 'N°', 'text', 0, NULL, 1, 70),
(167, 'objet', 'Objet', 'text', 1, NULL, 2, 70),
(168, 'date', 'Date', 'date', 1, NULL, 3, 70),
(169, 'modele_type', 'Modèle type', 'text', 0, NULL, 1, 71),
(170, 'date', 'Date', 'date', 1, NULL, 1, 72),
(171, 'bureau', 'Bureau', 'text', 1, NULL, 2, 72),
(172, 'date', 'Date', 'date', 1, NULL, 1, 73),
(173, 'agence', 'Agence', 'text', 1, NULL, 2, 73),
(174, 'partenaire', 'Partenaire', 'text', 1, NULL, 1, 74),
(175, 'date', 'Date', 'date', 0, NULL, 2, 74),
(176, 'periode', 'Période', 'text', 1, NULL, 1, 75),
(177, 'theme', 'Thème', 'text', 1, NULL, 1, 76),
(178, 'date', 'Date', 'date', 0, NULL, 2, 76),
(179, 'cible', 'Cible', 'text', 0, NULL, 3, 76),
(180, 'theme', 'Thème', 'text', 1, NULL, 1, 77),
(181, 'periode', 'Période', 'text', 1, NULL, 1, 78),
(182, 'numero', 'N°', 'text', 0, NULL, 1, 79),
(183, 'objet', 'Objet', 'text', 1, NULL, 2, 79),
(184, 'date', 'Date', 'date', 1, NULL, 3, 79),
(185, 'campagne', 'Campagne', 'text', 1, NULL, 1, 80),
(186, 'date', 'Date', 'date', 0, NULL, 2, 80),
(187, 'objet', 'Objet', 'text', 1, NULL, 1, 81),
(188, 'date', 'Date', 'date', 1, NULL, 2, 81),
(189, 'lieu', 'Lieu', 'text', 1, NULL, 3, 81),
(190, 'theme', 'Thème', 'text', 1, NULL, 1, 82),
(191, 'periode', 'Période', 'text', 1, NULL, 2, 82),
(192, 'service', 'Service', 'text', 1, NULL, 3, 82),
(193, 'responsable', 'Responsable', 'text', 1, NULL, 4, 82),
(194, 'periode', 'Période', 'text', 1, NULL, 1, 83),
(195, 'date', 'Date', 'date', 0, NULL, 2, 83),
(196, 'type', 'Type (mensuel/trimestriel/annuel)', 'select', 1, '["mensuel", "trimestriel", "annuel"]', 1, 84),
(197, 'periode', 'Période', 'text', 1, NULL, 2, 84),
(198, 'service', 'Service', 'text', 1, NULL, 3, 84),
(199, 'date', 'Date', 'date', 0, NULL, 4, 84),
(200, 'periode', 'Période', 'text', 1, NULL, 1, 85),
(201, 'source', 'Source', 'text', 1, NULL, 2, 85),
(202, 'objet', 'Objet', 'text', 0, NULL, 3, 85),
(203, 'numero', 'N°', 'text', 0, NULL, 1, 86),
(204, 'parties', 'Parties', 'text', 1, NULL, 2, 86),
(205, 'type_litige', 'Type litige', 'text', 1, NULL, 3, 86),
(206, 'nom_personnel', 'Nom du personnel', 'text', 1, NULL, 1, 87),
(207, 'numero_extreme', 'N° et date extrême', 'text', 1, NULL, 1, 88),
(208, 'numero', 'N°', 'text', 0, NULL, 1, 89),
(209, 'client', 'Client', 'text', 1, NULL, 2, 89),
(210, 'date', 'Date', 'date', 1, NULL, 3, 89),
(211, 'objet', 'Objet', 'text', 1, NULL, 1, 90),
(212, 'date', 'Date', 'date', 1, NULL, 2, 90),
(213, 'auteur', 'Auteur', 'text', 1, NULL, 3, 90),
(214, 'type', 'Type', 'text', 1, NULL, 1, 91),
(215, 'numero', 'N°', 'text', 1, NULL, 2, 91),
(216, 'date', 'Date', 'date', 1, NULL, 3, 91),
(217, 'autorite', 'Autorité', 'text', 1, NULL, 4, 91),
(218, 'type', 'Type', 'text', 1, NULL, 1, 92),
(219, 'date', 'Date', 'date', 1, NULL, 2, 92),
(220, 'instance', 'Instance', 'text', 1, NULL, 3, 92),
(221, 'objet', 'Objet', 'text', 1, NULL, 4, 92),
(222, 'titre', 'TITRE', 'text', 1, NULL, 1, 93),
(223, 'titre', 'Titre', 'text', 1, NULL, 1, 94),
(224, 'version', 'Version', 'text', 0, NULL, 2, 94),
(225, 'date', 'Date', 'date', 0, NULL, 3, 94),
(226, 'service', 'Service', 'text', 0, NULL, 4, 94),
(227, 'date', 'Date', 'date', 1, NULL, 1, 95),
(228, 'service', 'Service', 'text', 0, NULL, 2, 95),
(229, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 96),
(230, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 97),
(231, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 98),
(232, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 99),
(233, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 100),
(234, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 101),
(235, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 102),
(236, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 103),
(237, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 104),
(238, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 105),
(239, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 106),
(240, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 107),
(241, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 108),
(242, 'description_libre', 'Toutes descriptions pouvant faciliter l\'identification', 'textarea', 0, NULL, 1, 109);

-- --------------------------------------------------------
-- Insertion dans entitee_deux_type_documents
-- --------------------------------------------------------
INSERT INTO `entitee_deux_type_documents` (`created_at`, `updated_at`, `type_document_id`, `entitee_deux_id`) VALUES
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 6),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 7), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 8), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 9),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 10), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 11), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 12),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 13), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 14), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 15),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 16), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 17), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 18),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 21),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 22), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 23), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 3, 24),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 6),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 7), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 8), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 9),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 10), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 11), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 12),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 13), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 14), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 15),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 16), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 17), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 18),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 21),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 22), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 23), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 4, 24),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 6),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 7), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 8), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 9),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 10), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 11), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 12),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 15), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 16), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 17),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 18), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 20),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 22), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 23),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 5, 24), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 6, 18), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 7, 18),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 8, 18), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 9, 18), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 10, 18),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 11, 18), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 11, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 12, 19),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 13, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 14, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 14, 24),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 15, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 16, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 17, 19),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 18, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 19, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 20, 19),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 21, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 22, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 23, 19),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 24, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 25, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 26, 19),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 27, 19), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 28, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 29, 20),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 30, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 31, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 32, 20),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 33, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 34, 20), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 35, 21),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 36, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 37, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 37, 22),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 38, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 39, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 40, 21),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 41, 21), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 42, 22), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 43, 22),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 44, 22), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 45, 22), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 46, 23),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 47, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 48, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 49, 4),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 50, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 51, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 52, 4),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 53, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 54, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 54, 5),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 55, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 56, 4), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 57, 5),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 58, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 58, 16), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 59, 5),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 60, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 61, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 62, 5),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 63, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 64, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 65, 5),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 66, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 67, 5), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 68, 6),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 69, 6), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 70, 6), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 71, 6),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 72, 7), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 73, 7), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 74, 7),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 75, 8), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 76, 9), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 77, 9),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 78, 9), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 79, 9), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 80, 9),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 81, 9), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 82, 10), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 82, 11),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 82, 12), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 83, 12), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 83, 17),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 84, 13), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 84, 14), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 85, 16),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 86, 24), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 87, 24), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 88, 24),
('2026-05-19 13:12:29', '2026-05-19 13:12:29', 89, 24), ('2026-05-19 13:12:29', '2026-05-19 13:12:29', 90, 24), ('2026-05-19 13:17:10', '2026-05-19 13:17:10', 99, 3),
('2026-05-20 10:24:07', '2026-05-20 10:24:07', 109, 2);

-- --------------------------------------------------------
-- Insertion dans entitee_un_type_documents
-- --------------------------------------------------------
INSERT INTO `entitee_un_type_documents` (`created_at`, `updated_at`, `type_document_id`, `entitee_un_id`) VALUES
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 91, 1), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 92, 1),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 93, 1), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 94, 1),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 95, 1), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 96, 1),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 97, 1), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 98, 1),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 99, 1), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 100, 1),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 101, 4), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 101, 10),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 102, 10), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 102, 11),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 103, 4), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 104, 5),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 104, 14), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 105, 6),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 106, 7), ('2026-05-19 13:10:36', '2026-05-19 13:10:36', 107, 8),
('2026-05-19 13:10:36', '2026-05-19 13:10:36', 108, 9);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;