// backend/services/CourrierService.js
const {
  Courrier,
  PieceJointe,
  AttributionCourrier,
  TraitementCourrier,
  AuditCourrier,
  Agent,
  Expediteur,
  DestinataireExterne,
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} = require("../models");

const { Op } = require("sequelize");
const sequelize = require("../config/database");
const logger = require("../config/logger.config");

class CourrierService {
  // ===================== UTILITAIRES =====================

  static async getAgentEntiteeId(agentId) {
    try {
      const agent = await Agent.findByPk(agentId, {
        include: [
          {
            model: Fonction,
            as: "fonction_details",
            include: [{ model: EntiteeUn, as: "entitee_un" }],
          },
        ],
      });
      return agent?.fonction_details?.entitee_un?.id || null;
    } catch (error) {
      logger.error("Erreur getAgentEntiteeId:", error);
      return null;
    }
  }

  static async getAgentEntiteeUnId(agentId) {
    try {
      const agent = await Agent.findByPk(agentId, {
        include: [
          {
            model: Fonction,
            as: "fonction_details",
            include: [
              { model: EntiteeUn, as: "entitee_un" },
              {
                model: EntiteeDeux,
                as: "entitee_deux",
                include: [{ model: EntiteeUn, as: "entitee_un" }],
              },
              {
                model: EntiteeTrois,
                as: "entitee_trois",
                include: [
                  {
                    model: EntiteeDeux,
                    as: "entitee_deux",
                    include: [{ model: EntiteeUn, as: "entitee_un" }],
                  },
                ],
              },
            ],
          },
        ],
      });

      const fonction = agent?.fonction_details;
      if (!fonction) return null;

      if (fonction.entitee_trois?.entitee_deux?.entitee_un?.id) {
        return fonction.entitee_trois.entitee_deux.entitee_un.id;
      }
      if (fonction.entitee_deux?.entitee_un?.id) {
        return fonction.entitee_deux.entitee_un.id;
      }
      if (fonction.entitee_un?.id) {
        return fonction.entitee_un.id;
      }
      return null;
    } catch (error) {
      logger.error("Erreur getAgentEntiteeUnId:", error);
      return null;
    }
  }

  static async getChefEntitee(entiteeId, entiteeType) {
    try {
      let chef = null;
      if (entiteeType === "EntiteeDeux") {
        chef = await Agent.findOne({
          include: [
            {
              model: Fonction,
              as: "fonction_details",
              where: { entitee_deux_id: entiteeId },
              required: true,
            },
          ],
        });
      } else if (entiteeType === "EntiteeTrois") {
        chef = await Agent.findOne({
          include: [
            {
              model: Fonction,
              as: "fonction_details",
              where: { entitee_trois_id: entiteeId },
              required: true,
            },
          ],
        });
      }
      return chef;
    } catch (error) {
      logger.error("Erreur getChefEntitee:", error);
      return null;
    }
  }

  static async isChefOfEntitee(agentId, entiteeId, entiteeType) {
    try {
      const agent = await Agent.findByPk(agentId, {
        include: [{ model: Fonction, as: "fonction_details" }],
      });
      if (!agent?.fonction_details) return false;
      if (entiteeType === "EntiteeDeux") {
        return agent.fonction_details.entitee_deux_id === entiteeId;
      } else if (entiteeType === "EntiteeTrois") {
        return agent.fonction_details.entitee_trois_id === entiteeId;
      }
      return false;
    } catch (error) {
      logger.error("Erreur isChefOfEntitee:", error);
      return false;
    }
  }

  // ===================== GET ALL =====================
  static async getAll(filters = {}, reqUser) {
    try {
      const where = {};

      if (reqUser.peutVoirCourrierEntiteeUn && reqUser.entitee_un_id) {
        where.entitee_id = reqUser.entitee_un_id;
      } else if (
        reqUser.peutVoirCourrierEntiteeDeux &&
        reqUser.entitee_deux_id
      ) {
        where.entitee_id = reqUser.entitee_un_id;
        where.destinataire_entitee_id = reqUser.entitee_deux_id;
        where.destinataire_entitee_type = "EntiteeDeux";
      } else if (
        reqUser.peutVoirCourrierEntiteeTrois &&
        reqUser.entitee_trois_id
      ) {
        where.entitee_id = reqUser.entitee_un_id;
        where.destinataire_entitee_id = reqUser.entitee_trois_id;
        where.destinataire_entitee_type = "EntiteeTrois";
      } else if (reqUser.entitee_un_id) {
        where.entitee_id = reqUser.entitee_un_id;
        where.destinataire_idagent = reqUser.id;
      } else {
        return [];
      }

      if (filters.statut) {
        where.statut = Array.isArray(filters.statut)
          ? { [Op.in]: filters.statut }
          : filters.statut;
      }
      if (filters.type) where.type = filters.type;
      if (filters.date_debut && filters.date_fin) {
        where.date_reception = {
          [Op.between]: [filters.date_debut, filters.date_fin],
        };
      }

      const include = [
        {
          model: Agent,
          as: "createur",
          attributes: ["id", "nom", "prenom"],
        },
        {
          model: Agent,
          as: "destinataire_agent",
          attributes: ["id", "nom", "prenom"],
        },
        {
          model: Expediteur,
          as: "expediteur_details",
        },
        {
          model: PieceJointe,
          as: "pieces_jointes",
          attributes: ["idpiece_jointe", "nom_fichier", "fichier_url"],
        },
        {
          model: AuditCourrier,
          as: "audit",
          separate: true,
        },
      ];

      const courriers = await Courrier.findAll({
        where,
        attributes: {
          include: ["motif_traitement"], // ✅ AJOUTÉ : pour avoir le motif de rejet
        },
        include,
        order: [
          [
            sequelize.literal(
              "COALESCE(`Courrier`.`date_attribution`, `Courrier`.`date_creation`)",
            ),
            "DESC",
          ],
        ],
      });

      return courriers.map((c) => {
        const row = c.toJSON();
        let statut_delai = "NORMAL";
        let heures_restantes = null;

        if (row.date_limite_traitement && row.statut === "ATTRIBUE") {
          heures_restantes = Math.floor(
            (new Date(row.date_limite_traitement) - new Date()) /
              (1000 * 60 * 60),
          );
          if (heures_restantes < 0) statut_delai = "EN_RETARD";
          else if (heures_restantes < 24) statut_delai = "URGENT";
        }

        // ✅ Renommer motif_traitement en motif_rejet pour le frontend
        return {
          ...row,
          statut_delai,
          heures_restantes,
          motif_rejet: row.motif_traitement, // ← Transformation pour le frontend
        };
      });
    } catch (error) {
      logger.error("Erreur getAll:", error);
      throw error;
    }
  }
  // backend/services/CourrierService.js

  static async getById(idcourrier, reqUser) {
  try {
    const entitee_id = reqUser.entitee_un_id;
    if (!entitee_id) throw new Error("Utilisateur sans direction");

    // 1. Récupérer le courrier SANS les associations problématiques
    const courrier = await Courrier.findByPk(idcourrier, {
      include: [
        { model: Agent, as: "createur" },
        { model: Agent, as: "destinataire_agent" },
        { model: Agent, as: "attribue_par" },
        { model: Agent, as: "traite_par" },
        { model: Agent, as: "modifie_par" },
        { model: Expediteur, as: "expediteur_details" },
        { model: DestinataireExterne, as: "destinataire_externe" },
        {
          model: PieceJointe,
          as: "pieces_jointes",
          attributes: ["idpiece_jointe", "nom_fichier", "fichier_url"],
        },
      ],
    });

    if (!courrier) throw new Error("Courrier non trouvé");
    if (courrier.entitee_id !== entitee_id) throw new Error("Accès refusé : direction différente");

    const estCreateur = courrier.agent_id === reqUser.id;
    const estDestinataire = courrier.destinataire_idagent === reqUser.id;
    const peutVoirCourrierEntiteeUn = reqUser.peutVoirCourrierEntiteeUn;

    if (!peutVoirCourrierEntiteeUn && !estCreateur && !estDestinataire) {
      throw new Error("Accès refusé : ce courrier ne vous est pas attribué");
    }

    // 2. Récupérer les attributions avec leurs agents (requête séparée)
    const attributions = await AttributionCourrier.findAll({
      where: { courrier_id: idcourrier },
      include: [
        { model: Agent, as: "attribue_par", attributes: ["id", "nom", "prenom"] },
        { model: Agent, as: "attribue_a", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 3. Récupérer les traitements avec leurs agents (requête séparée)
    const traitements = await TraitementCourrier.findAll({
      where: { courrier_id: idcourrier },
      include: [
        { model: Agent, as: "agent", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 4. Récupérer l'audit avec ses agents (requête séparée)
    const audit = await AuditCourrier.findAll({
      where: { courrier_id: idcourrier },
      include: [
        { model: Agent, as: "agent", attributes: ["id", "nom", "prenom"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 5. Attacher les données au courrier
    courrier.dataValues.attributions = attributions;
    courrier.dataValues.historique_traitements = traitements;
    courrier.dataValues.audit = audit;

    return courrier;
  } catch (error) {
    logger.error("Erreur getById:", error);
    throw error;
  }
}

  // ===================== CREATE =====================
  static async create(data, agentId, reqUser) {
    const entitee_id = reqUser.entitee_un_id;
    if (!entitee_id) {
      throw new Error(
        "Impossible de créer un courrier : utilisateur sans direction",
      );
    }

    const transaction = await sequelize.transaction();
    try {
      const prefix = data.type === "ARRIVE" ? "AR" : "DP";
      const annee = new Date().getFullYear();

      const count = await Courrier.count({
        where: {
          type: data.type,
          entitee_id: entitee_id,
          reference: {
            [Op.like]: `${prefix}-${annee}-%`,
          },
        },
        transaction,
      });

      const sequence = count + 1;
      const reference = `${prefix}-${annee}-${String(sequence).padStart(
        4,
        "0",
      )}`;

      const courrier = await Courrier.create(
        {
          ...data,
          reference,
          agent_id: agentId,
          entitee_id: entitee_id,
          statut: "EN_ATTENTE",
          modifie_par_agent_id: agentId,
          date_creation: new Date(),
          date_reception: new Date(),
        },
        { transaction },
      );

      await AuditCourrier.create(
        {
          courrier_id: courrier.idcourrier,
          agent_id: agentId,
          action: "CREATION",
          details: `Création du courrier ${reference}`,
        },
        { transaction },
      );

      await transaction.commit();
      return courrier;
    } catch (err) {
      await transaction.rollback();
      logger.error("Erreur create:", err);
      throw err;
    }
  }

  // ===================== GET MES ATTRIBUÉS =====================

  // backend/services/CourrierService.js

  static async getMesAttribues(agentId, reqUser) {
    try {
      const entitee_id = reqUser?.entitee_un_id;
      if (!entitee_id) return [];

      return await Courrier.findAll({
        where: {
          entitee_id,
          destinataire_idagent: agentId,
          statut: { [Op.in]: ["ATTRIBUE", "EN_COURS", "VALIDE", "TRAITE"] },
        },
        include: [
          {
            model: Agent,
            as: "createur",
            attributes: ["id", "nom", "prenom"],
          },
          // ✅ Expéditeur
          {
            model: Expediteur,
            as: "expediteur_details",
          },
          // ✅ Pièces jointes
          {
            model: PieceJointe,
            as: "pieces_jointes",
            attributes: ["idpiece_jointe", "nom_fichier", "fichier_url"],
          },
          // ✅ Attributions - SANS include imbriqué pour éviter l'erreur
          //    Les détails des agents seront chargés séparément si nécessaire
          {
            model: AttributionCourrier,
            as: "attributions",
            // ✅ Ne pas inclure Agent ici pour éviter l'erreur d'association multiple
          },
          // ✅ Traitements - SANS include imbriqué
          {
            model: TraitementCourrier,
            as: "historique_traitements",
          },
          // ✅ Audit - SANS include imbriqué
          {
            model: AuditCourrier,
            as: "audit",
          },
        ],
        order: [["date_attribution", "DESC"]],
      });
    } catch (error) {
      logger.error("Erreur getMesAttribues:", error);
      throw error;
    }
  }
  // ===================== VALIDER =====================
  static async valider(idcourrier, agentId) {
    const transaction = await sequelize.transaction();
    try {
      const [affected] = await Courrier.update(
        { statut: "VALIDE", modifie_par_agent_id: agentId },
        { where: { idcourrier, statut: "EN_ATTENTE" }, transaction },
      );

      if (affected > 0) {
        await AuditCourrier.create(
          {
            courrier_id: idcourrier,
            agent_id: agentId,
            action: "VALIDATION",
            details: "Courrier validé",
          },
          { transaction },
        );
      }

      await transaction.commit();
      return affected > 0;
    } catch (error) {
      await transaction.rollback();
      logger.error("Erreur valider:", error);
      throw error;
    }
  }

  // ===================== REJETER =====================
  static async rejeter(idcourrier, agentId, motif) {
    if (!motif || !motif.trim()) throw new Error("Motif de rejet obligatoire");

    const transaction = await sequelize.transaction();
    try {
      const [affected] = await Courrier.update(
        {
          statut: "REJETE",
          modifie_par_agent_id: agentId,
          motif_traitement: motif,
        },
        { where: { idcourrier, statut: "EN_ATTENTE" }, transaction },
      );

      if (affected > 0) {
        await AuditCourrier.create(
          {
            courrier_id: idcourrier,
            agent_id: agentId,
            action: "REJET",
            details: `Rejeté avec motif: ${motif}`,
          },
          { transaction },
        );
      }

      await transaction.commit();
      return affected > 0;
    } catch (err) {
      await transaction.rollback();
      logger.error("Erreur rejeter:", err);
      throw err;
    }
  }

  // ===================== ATTRIBUER À UN AGENT =====================
  static async attribuer(
    idcourrier,
    destinataire_idagent,
    commentaire,
    instructions,
    dateLimiteTraitement,
  ) {
    const transaction = await sequelize.transaction();
    try {
      const courrier = await Courrier.findByPk(idcourrier, { transaction });
      if (!courrier) throw new Error("Courrier non trouvé");

      if (courrier.statut !== "VALIDE" && courrier.statut !== "ATTRIBUE") {
        throw new Error(
          "Seul un courrier validé ou déjà attribué peut recevoir une attribution",
        );
      }

      const dateLimite = new Date(dateLimiteTraitement);
      if (isNaN(dateLimite.getTime()) || dateLimite <= new Date()) {
        throw new Error("Date limite invalide ou dans le passé");
      }

      const delaiHeures = Math.round(
        (dateLimite - new Date()) / (1000 * 60 * 60),
      );

      const agent = await Agent.findByPk(destinataire_idagent);

      await AttributionCourrier.create(
        {
          courrier_id: idcourrier,
          attribue_a_agent_id: destinataire_idagent,
          attribue_par_agent_id: courrier.modifie_par_agent_id,
          delai_heures_applique: delaiHeures,
          date_limite_traitement: dateLimite,
          instructions_copiees: instructions || "Instructions par défaut",
          commentaire: commentaire || null,
        },
        { transaction },
      );

      if (courrier.statut !== "ATTRIBUE") {
        await Courrier.update(
          {
            statut: "ATTRIBUE",
            date_attribution: new Date(),
            date_limite_traitement: dateLimite,
            motif_traitement: instructions || "Instructions par défaut",
            destinataire_idagent: destinataire_idagent,
            attribue_par_agent_id: courrier.modifie_par_agent_id,
            modifie_par_agent_id: destinataire_idagent,
          },
          { where: { idcourrier }, transaction },
        );
      }

      await AuditCourrier.create(
        {
          courrier_id: idcourrier,
          agent_id: destinataire_idagent,
          action: "ATTRIBUTION",
          details: `Attribué à l'agent ( ${destinataire_idagent} ) ${agent.prenom} ${agent.nom} avec délai de ${delaiHeures}h`,
        },
        { transaction },
      );

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      logger.error("Erreur attribuer:", err);
      throw err;
    }
  }

  // ===================== ATTRIBUER À UNE ENTITÉ =====================
  static async attribuerAEntite(
    idcourrier,
    entiteeId,
    entiteeType,
    reqUser,
    motif = null,
  ) {
    const transaction = await sequelize.transaction();
    try {
      const courrier = await Courrier.findByPk(idcourrier, { transaction });
      if (!courrier) throw new Error("Courrier non trouvé");

      if (courrier.statut !== "VALIDE" && courrier.statut !== "ATTRIBUE") {
        throw new Error(
          "Seul un courrier validé ou déjà attribué peut être attribué à une entité",
        );
      }

      const chef = await this.getChefEntitee(entiteeId, entiteeType);
      if (!chef) {
        throw new Error(
          `Aucun chef trouvé pour cette ${
            entiteeType === "EntiteeDeux" ? "division" : "section"
          }`,
        );
      }

      if (courrier.statut !== "ATTRIBUE") {
        await Courrier.update(
          {
            destinataire_entitee_id: entiteeId,
            destinataire_entitee_type: entiteeType,
            destinataire_idagent: chef.id,
            statut: "ATTRIBUE",
            date_attribution: new Date(),
            motif_traitement:
              motif ||
              `Attribué à ${
                entiteeType === "EntiteeDeux" ? "la division" : "la section"
              }`,
            attribue_par_agent_id: reqUser.id,
            modifie_par_agent_id: chef.id,
          },
          { where: { idcourrier }, transaction },
        );
      }

      await AttributionCourrier.create(
        {
          courrier_id: idcourrier,
          attribue_a_agent_id: chef.id,
          attribue_par_agent_id: reqUser.id,
          commentaire:
            motif ||
            `Attribué à ${
              entiteeType === "EntiteeDeux" ? "la division" : "la section"
            }`,
        },
        { transaction },
      );

      await AuditCourrier.create(
        {
          courrier_id: idcourrier,
          agent_id: reqUser.id,
          action: "ATTRIBUTION_ENTITE",
          details: `Courrier attribué à ${
            entiteeType === "EntiteeDeux" ? "la division" : "la section"
          } (ID: ${entiteeId}), chef: ${chef.nom} ${chef.prenom}`,
        },
        { transaction },
      );

      await transaction.commit();
      return {
        success: true,
        chef,
        message: `Courrier attribué à ${chef.nom} ${chef.prenom} (chef de l'entité)`,
      };
    } catch (err) {
      await transaction.rollback();
      logger.error("Erreur attribuerAEntite:", err);
      throw err;
    }
  }

  // ===================== ATTRIBUER MULTIPLE =====================
  static async attribuerMultiple(idcourrier, attributions, reqUser) {
    const transaction = await sequelize.transaction();
    try {
      const courrier = await Courrier.findByPk(idcourrier, { transaction });
      if (!courrier) throw new Error("Courrier non trouvé");

      if (courrier.statut !== "VALIDE") {
        throw new Error("Seul un courrier validé peut être attribué");
      }

      const results = [];
      let premierDestinataire = null;

      for (const attribution of attributions) {
        if (attribution.type === "agent") {
          const dateLimite = new Date(attribution.date_limite_traitement);
          if (isNaN(dateLimite.getTime()) || dateLimite <= new Date()) {
            throw new Error(
              `Date limite invalide pour l'agent ${attribution.id}`,
            );
          }

          const delaiHeures = Math.round(
            (dateLimite - new Date()) / (1000 * 60 * 60),
          );

          await AttributionCourrier.create(
            {
              courrier_id: idcourrier,
              attribue_a_agent_id: attribution.id,
              attribue_par_agent_id: reqUser.id,
              delai_heures_applique: delaiHeures,
              date_limite_traitement: dateLimite,
              instructions_copiees:
                attribution.instructions || "Instructions par défaut",
              commentaire: attribution.commentaire || null,
            },
            { transaction },
          );

          await AuditCourrier.create(
            {
              courrier_id: idcourrier,
              agent_id: attribution.id,
              action: "ATTRIBUTION",
              details: `Attribué à l'agent ( ${attribution.id} ) ${attribution.prenom} ${attribution.nom} avec délai de ${delaiHeures}h`,
            },
            { transaction },
          );

          if (!premierDestinataire) {
            premierDestinataire = attribution.id;
          }
          results.push({ type: "agent", id: attribution.id, success: true });
        } else if (attribution.type === "entiteeDeux") {
          const chef = await this.getChefEntitee(attribution.id, "EntiteeDeux");
          if (!chef) {
            throw new Error(
              `Aucun chef trouvé pour le service ${attribution.id}`,
            );
          }

          await AttributionCourrier.create(
            {
              courrier_id: idcourrier,
              attribue_a_agent_id: chef.id,
              attribue_par_agent_id: reqUser.id,
              commentaire:
                attribution.commentaire ||
                `Attribué au service ${attribution.id}`,
            },
            { transaction },
          );

          await AuditCourrier.create(
            {
              courrier_id: idcourrier,
              agent_id: reqUser.id,
              action: "ATTRIBUTION_ENTITE",
              details: `Courrier attribué au service ${attribution.id}, chef: ${chef.nom} ${chef.prenom}`,
            },
            { transaction },
          );

          if (!premierDestinataire) {
            premierDestinataire = chef.id;
          }
          results.push({
            type: "entiteeDeux",
            id: attribution.id,
            chef: chef.id,
            success: true,
          });
        } else if (attribution.type === "entiteeTrois") {
          const chef = await this.getChefEntitee(
            attribution.id,
            "EntiteeTrois",
          );
          if (!chef) {
            throw new Error(
              `Aucun chef trouvé pour le bureau ${attribution.id}`,
            );
          }

          await AttributionCourrier.create(
            {
              courrier_id: idcourrier,
              attribue_a_agent_id: chef.id,
              attribue_par_agent_id: reqUser.id,
              commentaire:
                attribution.commentaire ||
                `Attribué au bureau ${attribution.id}`,
            },
            { transaction },
          );

          await AuditCourrier.create(
            {
              courrier_id: idcourrier,
              agent_id: reqUser.id,
              action: "ATTRIBUTION_ENTITE",
              details: `Courrier attribué au bureau ${attribution.id}, chef: ${chef.nom} ${chef.prenom}`,
            },
            { transaction },
          );

          if (!premierDestinataire) {
            premierDestinataire = chef.id;
          }
          results.push({
            type: "entiteeTrois",
            id: attribution.id,
            chef: chef.id,
            success: true,
          });
        }
      }

      if (premierDestinataire) {
        await Courrier.update(
          {
            statut: "ATTRIBUE",
            date_attribution: new Date(),
            destinataire_idagent: premierDestinataire,
            attribue_par_agent_id: reqUser.id,
            modifie_par_agent_id: premierDestinataire,
          },
          { where: { idcourrier }, transaction },
        );
      }

      await transaction.commit();
      return { success: true, results, count: attributions.length };
    } catch (err) {
      await transaction.rollback();
      logger.error("Erreur attribuerMultiple:", err);
      throw err;
    }
  }

  // ===================== TRAITER =====================
  static async traiter(
    idcourrier,
    agentId,
    action,
    nouveauStatut = null,
    motif = null,
  ) {
    const transaction = await sequelize.transaction();
    try {
      const courrier = await Courrier.findByPk(idcourrier, { transaction });
      if (!courrier) throw new Error("Courrier non trouvé");

      if (courrier.destinataire_idagent !== agentId) {
        throw new Error("Vous n'êtes pas le destinataire de ce courrier");
      }

      await TraitementCourrier.create(
        {
          courrier_id: idcourrier,
          agent_id: agentId,
          action,
          nouveau_statut: nouveauStatut,
          motif: motif || `Action: ${action}`,
        },
        { transaction },
      );

      if (nouveauStatut) {
        const updateData = {
          statut: nouveauStatut,
          modifie_par_agent_id: agentId,
        };
        if (nouveauStatut === "TRAITE") {
          updateData.traite_par_agent_id = agentId;
          updateData.date_traitement = new Date();
        }
        await Courrier.update(updateData, {
          where: { idcourrier },
          transaction,
        });

        await AuditCourrier.create(
          {
            courrier_id: idcourrier,
            agent_id: agentId,
            action: "TRAITEMENT",
            details: `Courrier ${
              nouveauStatut === "TRAITE"
                ? "traité"
                : `passé en statut ${nouveauStatut}`
            }`,
          },
          { transaction },
        );
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      logger.error("Erreur traiter:", err);
      throw err;
    }
  }

  // ===================== ADD PIECES JOINTES =====================
  static async addPiecesJointes(courrierId, files) {
    try {
      const values = files.map((file) => ({
        nom_fichier: file.originalname,
        fichier_url: `/uploads/courriers/${courrierId}/${file.filename}`,
        courrier_idcourrier: courrierId,
        agent_id: null,
      }));
      return await PieceJointe.bulkCreate(values);
    } catch (error) {
      logger.error("Erreur addPiecesJointes:", error);
      throw error;
    }
  }

  // ===================== SEARCH =====================
  static async search(searchTerm, filters = {}, reqUser) {
    try {
      const entitee_id = reqUser.entitee_un_id;
      if (!entitee_id) return [];

      const where = {
        entitee_id,
        [Op.or]: [
          { objet: { [Op.like]: `%${searchTerm}%` } },
          { reference: { [Op.like]: `%${searchTerm}%` } },
          { corps: { [Op.like]: `%${searchTerm}%` } },
        ],
      };

      if (
        !reqUser.peutVoirCourrierEntiteeUn &&
        !reqUser.peutVoirCourrierEntiteeDeux &&
        !reqUser.peutVoirCourrierEntiteeTrois
      ) {
        where.destinataire_idagent = reqUser.id;
      }

      if (filters.type) where.type = filters.type;
      if (filters.statut) where.statut = filters.statut;

      return await Courrier.findAll({
        where,
        include: [
          { model: Agent, as: "createur", attributes: ["id", "nom", "prenom"] },
        ],
        limit: 100,
        order: [["date_reception", "DESC"]],
      });
    } catch (error) {
      logger.error("Erreur search:", error);
      throw error;
    }
  }

  // ===================== GET AUDIT =====================
  static async getAudit(idcourrier, reqUser) {
    try {
      const entitee_id = reqUser.entitee_un_id;
      if (!entitee_id) throw new Error("Utilisateur sans direction");

      const courrier = await Courrier.findByPk(idcourrier);
      if (!courrier) throw new Error("Courrier non trouvé");
      if (courrier.entitee_id !== entitee_id) throw new Error("Accès refusé");

      return await AuditCourrier.findAll({
        where: { courrier_id: idcourrier },
        include: [
          { model: Agent, as: "agent", attributes: ["id", "nom", "prenom"] },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Erreur getAudit:", error);
      throw error;
    }
  }

  // ===================== GET COURRIERS EN RETARD =====================
  static async getCourriersEnRetard(reqUser) {
    try {
      const entitee_id = reqUser.entitee_un_id;
      if (!entitee_id) return [];

      const where = {
        entitee_id,
        statut: { [Op.in]: ["ATTRIBUE", "EN_COURS"] },
        date_limite_traitement: { [Op.lt]: new Date() },
      };

      if (
        !reqUser.peutVoirCourrierEntiteeUn &&
        !reqUser.peutVoirCourrierEntiteeDeux &&
        !reqUser.peutVoirCourrierEntiteeTrois
      ) {
        where.destinataire_idagent = reqUser.id;
      }

      return await Courrier.findAll({
        where,
        include: [{ model: Agent, as: "destinataire_agent" }],
        order: [["date_limite_traitement", "ASC"]],
      });
    } catch (error) {
      logger.error("Erreur getCourriersEnRetard:", error);
      throw error;
    }
  }

  // ===================== GET COURRIERS D'UNE ENTITÉ =====================
  static async getCourriersByEntitee(entiteeId, entiteeType, reqUser) {
    try {
      const isChef = await this.isChefOfEntitee(
        reqUser.id,
        entiteeId,
        entiteeType,
      );
      if (!isChef && !reqUser.peutVoirCourrierEntiteeUn) {
        throw new Error(
          "Accès refusé : vous n'êtes pas le chef de cette entité",
        );
      }

      const where = {
        destinataire_entitee_id: entiteeId,
        destinataire_entitee_type: entiteeType,
      };

      return await Courrier.findAll({
        where,
        include: [
          { model: Agent, as: "createur", attributes: ["id", "nom", "prenom"] },
          {
            model: Agent,
            as: "destinataire_agent",
            attributes: ["id", "nom", "prenom"],
          },
          { model: PieceJointe, as: "pieces_jointes" },
        ],
        order: [["date_creation", "DESC"]],
      });
    } catch (error) {
      logger.error("Erreur getCourriersByEntitee:", error);
      throw error;
    }
  }

  // ===================== GET STATISTIQUES =====================
  static async getStatistiques(reqUser) {
    try {
      const entitee_id = reqUser.entitee_un_id;
      if (!entitee_id) {
        return {
          total: 0,
          parStatut: {
            en_attente: 0,
            valides: 0,
            rejetes: 0,
            attribues: 0,
            traites: 0,
            archives: 0,
            renvoyes: 0,
          },
          parType: { arrive: 0, depart: 0 },
          en_retard: 0,
          taux_traitement: 0,
        };
      }

      const where = { entitee_id };

      if (
        !reqUser.peutVoirCourrierEntiteeUn &&
        !reqUser.peutVoirCourrierEntiteeDeux &&
        !reqUser.peutVoirCourrierEntiteeTrois
      ) {
        where.destinataire_idagent = reqUser.id;
      }

      const [
        total,
        enAttente,
        valides,
        rejetes,
        attribues,
        traites,
        archives,
        renvoyes,
        arrive,
        depart,
        enRetard,
      ] = await Promise.all([
        Courrier.count({ where }),
        Courrier.count({ where: { ...where, statut: "EN_ATTENTE" } }),
        Courrier.count({ where: { ...where, statut: "VALIDE" } }),
        Courrier.count({ where: { ...where, statut: "REJETE" } }),
        Courrier.count({ where: { ...where, statut: "ATTRIBUE" } }),
        Courrier.count({ where: { ...where, statut: "TRAITE" } }),
        Courrier.count({ where: { ...where, statut: "ARCHIVE" } }),
        Courrier.count({ where: { ...where, statut: "RENVOYE" } }),
        Courrier.count({ where: { ...where, type: "ARRIVE" } }),
        Courrier.count({ where: { ...where, type: "DEPART" } }),
        Courrier.count({
          where: {
            ...where,
            statut: { [Op.in]: ["ATTRIBUE", "EN_COURS"] },
            date_limite_traitement: { [Op.lt]: new Date() },
          },
        }),
      ]);

      return {
        total,
        parStatut: {
          en_attente: enAttente,
          valides,
          rejetes,
          attribues,
          traites,
          archives,
          renvoyes,
        },
        parType: {
          arrive,
          depart,
        },
        en_retard: enRetard,
        taux_traitement: total > 0 ? ((traites / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error("Erreur getStatistiques:", error);
      throw error;
    }
  }

  // ===================== GET PIECES JOINTES =====================
  static async getPiecesJointes(courrierId) {
    try {
      const pieces = await PieceJointe.findAll({
        where: { courrier_idcourrier: courrierId },
        order: [["date_upload", "DESC"]],
      });
      return pieces;
    } catch (error) {
      logger.error("Erreur getPiecesJointes:", error);
      throw error;
    }
  }
}

module.exports = CourrierService;
