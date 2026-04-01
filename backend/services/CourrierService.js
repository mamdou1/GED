// backend/services/CourrierService.js
const { Courrier, PieceJointe, AttributionCourrier, TraitementCourrier, AuditCourrier, Agent, Expediteur, DestinataireExterne } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const HistoriqueService = require("./historique.service");

class CourrierService {

  // ===================== GET ALL =====================
  static async getAll(filters = {}, reqUser) {
    if (!reqUser?.entitee_un_id) throw new Error("Utilisateur sans direction");

    const where = { entitee_un_id: reqUser.entitee_un_id };

    // Agent simple → ne voit que ses courriers attribués
    if (!reqUser.peutVoirTousLesCourriers) {
      where.destinataire_idagent = reqUser.id;
    }

    if (filters.statut) {
      where.statut = Array.isArray(filters.statut) ? { [Op.in]: filters.statut } : filters.statut;
    }
    if (filters.type) where.type = filters.type;
    if (filters.date_debut && filters.date_fin) {
      where.date_reception = { [Op.between]: [filters.date_debut, filters.date_fin] };
    }

    const include = [
      { model: Agent, as: "createur", attributes: ["id", "nom", "prenom"] },
      { model: Agent, as: "destinataire_agent", attributes: ["id", "nom", "prenom"] },
      { model: Expediteur, as: "expediteur_details" },
      { model: PieceJointe, as: "pieces_jointes", attributes: ["idpiece_jointe", "nom_fichier", "fichier_url"] },
    ];

    const courriers = await Courrier.findAll({
      where,
      include,
      order: [[sequelize.literal("COALESCE(`date_attribution`, `date_creation`)"), "DESC"]],
    });

    return courriers.map(c => {
      const row = c.toJSON();
      let statut_delai = "NORMAL";
      let heures_restantes = null;

      if (row.date_limite_traitement && row.statut === "ATTRIBUÉ") {
        heures_restantes = Math.floor((new Date(row.date_limite_traitement) - new Date()) / (1000 * 60 * 60));
        if (heures_restantes < 0) statut_delai = "EN_RETARD";
        else if (heures_restantes < 24) statut_delai = "URGENT";
      }

      return { ...row, statut_delai, heures_restantes };
    });
  }

  // ===================== GET BY ID =====================
  static async getById(idcourrier, reqUser) {
    const courrier = await Courrier.findByPk(idcourrier, {
      include: [
        { model: Agent, as: "createur" },
        { model: Agent, as: "destinataire_agent" },
        { model: Agent, as: "attribue_par" },
        { model: Agent, as: "traite_par" },
        { model: Agent, as: "modifie_par" },
        { model: Expediteur, as: "expediteur_details" },
        { model: DestinataireExterne, as: "destinataire_externe" },
        { model: PieceJointe, as: "pieces_jointes" },
        { model: AttributionCourrier, as: "attributions", include: [{ model: Agent, as: "attribue_par" }] },
        { model: TraitementCourrier, as: "historique_traitements", include: [{ model: Agent, as: "agent" }] },
        { model: AuditCourrier, as: "audit", include: [{ model: Agent, as: "agent" }] },
      ]
    });

    if (!courrier) throw new Error("Courrier non trouvé");

    if (courrier.entitee_un_id !== reqUser.entitee_un_id) {
      throw new Error("Accès refusé : ce courrier appartient à une autre direction");
    }

    if (!reqUser.peutVoirTousLesCourriers && courrier.destinataire_idagent !== reqUser.id) {
      throw new Error("Accès refusé : ce courrier ne vous est pas attribué");
    }

    return courrier;
  }

  // ===================== CREATE =====================
  static async create(data, agentId, reqUser) {
    const transaction = await sequelize.transaction();
    try {
      const courrier = await Courrier.create({
        ...data,
        agent_id: agentId,
        entitee_un_id: reqUser.entitee_un_id,   // Le courrier appartient à la direction de l'agent
        statut: "EN_ATTENTE",
        modifie_par_agent_id: agentId,
      }, { transaction });

      await transaction.commit();
      return courrier.idcourrier;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ===================== VALIDER =====================
  static async valider(idcourrier, agentId) {
    const [affected] = await Courrier.update(
      { statut: "VALIDÉ", modifie_par_agent_id: agentId },
      { where: { idcourrier, statut: "EN_ATTENTE" } }
    );
    return affected > 0;
  }

  // ===================== REJETER =====================
  static async rejeter(idcourrier, agentId, motif) {
    if (!motif || !motif.trim()) throw new Error("Motif de rejet obligatoire");

    const transaction = await sequelize.transaction();
    try {
      await Courrier.update(
        { statut: "REJETÉ", modifie_par_agent_id: agentId },
        { where: { idcourrier, statut: "EN_ATTENTE" }, transaction }
      );

      await AuditCourrier.create({
        courrier_id: idcourrier,
        agent_id: agentId,
        action: "REJET",
        details: `Rejeté avec motif: ${motif}`,
      }, { transaction });

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ===================== ATTRIBUER =====================
  static async attribuer(idcourrier, destinataire_idagent, commentaire, instructions, dateLimiteTraitement) {
    const transaction = await sequelize.transaction();
    try {
      const dateLimite = new Date(dateLimiteTraitement);
      if (isNaN(dateLimite.getTime()) || dateLimite <= new Date()) {
        throw new Error("Date limite invalide ou dans le passé");
      }

      const delaiHeures = Math.round((dateLimite - new Date()) / (1000 * 60 * 60));

      await AttributionCourrier.create({
        courrier_id: idcourrier,
        attribue_a_agent_id: destinataire_idagent || null,
        delai_heures_applique: delaiHeures,
        date_limite_traitement: dateLimite,
        instructions_copiees: instructions || "Instructions par défaut",
        commentaire: commentaire || null,
      }, { transaction });

      await Courrier.update({
        statut: "ATTRIBUÉ",
        date_attribution: new Date(),
        date_limite_traitement: dateLimite,
        motif_traitement: instructions || "Instructions par défaut",
        destinataire_idagent: destinataire_idagent || null,
        modifie_par_agent_id: destinataire_idagent,
      }, { where: { idcourrier }, transaction });

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ===================== TRAITER =====================
  static async traiter(idcourrier, agentId, action, nouveauStatut = null, motif = null) {
    const transaction = await sequelize.transaction();
    try {
      await TraitementCourrier.create({
        courrier_id: idcourrier,
        agent_id: agentId,
        action,
        nouveau_statut: nouveauStatut,
        motif: motif || `Action: ${action}`,
      }, { transaction });

      if (nouveauStatut) {
        const updateData = { statut: nouveauStatut, modifie_par_agent_id: agentId };
        if (nouveauStatut === "TRAITE") {
          updateData.traite_par_agent_id = agentId;
          updateData.date_traitement = new Date();
        }
        await Courrier.update(updateData, { where: { idcourrier }, transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ===================== GET MES ATTRIBUÉS =====================
  static async getMesAttribues(agentId) {
    return await Courrier.findAll({
      where: {
        destinataire_idagent: agentId,
        statut: { [Op.in]: ["ATTRIBUÉ", "EN_COURS"] },
      },
      include: [
        { model: Agent, as: "createur" },
        { model: PieceJointe, as: "pieces_jointes" },
      ],
    });
  }

  // ===================== ADD PIECES JOINTES =====================
  static async addPiecesJointes(courrierId, files) {
    const values = files.map(file => ({
      nom_fichier: file.originalname,
      fichier_url: `/uploads/courriers/${courrierId}/${file.filename}`,
      courrier_idcourrier: courrierId,
      agent_id: null,
    }));
    return await PieceJointe.bulkCreate(values);
  }

  // ===================== TRANSFERT INTER-DIRECTION =====================
  static async transfererVersAutreDirection(idcourrier, nouvelleDirectionId, reqUser, motif = null) {
    const transaction = await sequelize.transaction();
    try {
      const courrier = await Courrier.findByPk(idcourrier, { transaction });

      if (courrier.entitee_un_id !== reqUser.entitee_un_id) {
        throw new Error("Vous ne pouvez transférer que les courriers de votre direction");
      }

      await Courrier.update({
        entitee_un_id: nouvelleDirectionId,
        statut: "RENVOYE",
        modifie_par_agent_id: reqUser.id,
        motif_traitement: motif || `Transféré vers direction ${nouvelleDirectionId}`
      }, { where: { idcourrier }, transaction });

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ===================== SEARCH =====================
  static async search(searchTerm, filters = {}, reqUser) {
    const where = {
      entitee_un_id: reqUser.entitee_un_id,
      [Op.or]: [
        { objet: { [Op.like]: `%${searchTerm}%` } },
        { reference: { [Op.like]: `%${searchTerm}%` } },
        { corps: { [Op.like]: `%${searchTerm}%` } },
      ],
    };

    if (!reqUser.peutVoirTousLesCourriers) {
      where.destinataire_idagent = reqUser.id;
    }

    if (filters.type) where.type = filters.type;
    if (filters.statut) where.statut = filters.statut;

    return await Courrier.findAll({
      where,
      include: [{ model: Agent, as: "createur", attributes: ["nom", "prenom"] }],
      limit: 100,
      order: [["date_reception", "DESC"]],
    });
  }

  // ===================== GET AUDIT =====================
  static async getAudit(idcourrier, reqUser) {
    const courrier = await Courrier.findByPk(idcourrier);
    if (courrier.entitee_un_id !== reqUser.entitee_un_id) {
      throw new Error("Accès refusé");
    }
    return await AuditCourrier.findAll({
      where: { courrier_id: idcourrier },
      include: [{ model: Agent, as: "agent", attributes: ["nom", "prenom"] }],
      order: [["date_action", "DESC"]],
    });
  }

  // ===================== GET COURRIERS EN RETARD =====================
  static async getCourriersEnRetard(reqUser) {
    const where = {
      entitee_un_id: reqUser.entitee_un_id,
      statut: { [Op.in]: ["ATTRIBUÉ", "EN_COURS"] },
      date_limite_traitement: { [Op.lt]: new Date() },
    };

    if (!reqUser.peutVoirTousLesCourriers) {
      where.destinataire_idagent = reqUser.id;
    }

    return await Courrier.findAll({
      where,
      include: [{ model: Agent, as: "destinataire_agent" }],
      order: [["date_limite_traitement", "ASC"]],
    });
  }
}

module.exports = CourrierService;