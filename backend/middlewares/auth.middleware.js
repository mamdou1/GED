// backend/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const {
  Agent,
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Droit,
  Permission,
} = require("../models");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalide" });

    try {
      const agent = await Agent.findByPk(decoded.id, {
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
          {
            model: Droit,
            as: "droit",
            include: [
              {
                model: Permission,
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!agent) {
        return res.status(401).json({ message: "Agent non trouvé" });
      }

      const fonction = agent?.fonction_details;
      const permissions = agent?.droit?.Permissions || [];

      // Récupérer les IDs des entités
      let entitee_un_id = null;
      let entitee_deux_id = null;
      let entitee_trois_id = null;

      if (fonction) {
        if (fonction.entitee_trois?.entitee_deux?.entitee_un?.id) {
          entitee_un_id = fonction.entitee_trois.entitee_deux.entitee_un.id;
          entitee_deux_id = fonction.entitee_trois.entitee_deux.id;
          entitee_trois_id = fonction.entitee_trois.id;
        } else if (fonction.entitee_deux?.entitee_un?.id) {
          entitee_un_id = fonction.entitee_deux.entitee_un.id;
          entitee_deux_id = fonction.entitee_deux.id;
        } else if (fonction.entitee_un?.id) {
          entitee_un_id = fonction.entitee_un.id;
        }
      }

      // Vérifier les permissions de visualisation
      // Dans auth.middleware.js, remplacer les noms des permissions
      const peutVoirDirection = permissions.some(
        (p) => p.resource === "courrier" && p.action === "read_direction",
      );
      const peutVoirService = permissions.some(
        (p) => p.resource === "courrier" && p.action === "read_service",
      );
      const peutVoirBureau = permissions.some(
        (p) => p.resource === "courrier" && p.action === "read_bureau",
      );

      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: agent.email,
        nom: agent.nom,
        prenom: agent.prenom,
        entitee_un_id: entitee_un_id,
        entitee_deux_id: entitee_deux_id,
        entitee_trois_id: entitee_trois_id,
        fonction: fonction,
        droit: agent.droit,
        permissions: permissions,
        peutVoirDirection: peutVoirDirection,
        peutVoirService: peutVoirService,
        peutVoirBureau: peutVoirBureau,
      };

      next();
    } catch (error) {
      console.error("Erreur dans verifyToken:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  });
};
