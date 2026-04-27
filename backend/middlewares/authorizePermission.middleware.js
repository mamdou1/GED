// // middlewares/authorizePermission.middleware.js
// const { Agent, Droit, Permission } = require("../models");

// const authorizePermission = (resource, action) => {
//   return async (req, res, next) => {
//     try {
//       const agent = await Agent.findByPk(req.user.id, {
//         include: {
//           model: Droit,
//           as: "droit",
//           include: Permission,
//         },
//       });

//       if (!agent || !agent.droit) {
//         return res.status(403).json({
//           message: "Aucun droit associé à cet agent",
//         });
//       }

//       const hasPermission = agent.droit.Permissions.some(
//         (p) => p.resource === resource && p.action === action,
//       );

//       if (!hasPermission) {
//         return res.status(403).json({
//           message: "Permission refusée",
//         });
//       }

//       next();
//     } catch (err) {
//       console.error("authorizePermission error:", err);
//       res.status(500).json({ message: "Erreur serveur" });
//     }
//   };
// };

// module.exports = { authorizePermission };

// middlewares/authorizePermission.middleware.js
const { Agent, Droit, Permission } = require("../models");

const authorizePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const agent = await Agent.findByPk(req.user.id, {
        include: [
          {
            model: Droit,
            as: "droit",
            include: [
              {
                model: Permission,
                as: "Permissions", // ← AJOUTEZ L'ALIAS !
                through: { attributes: [] }, // Optionnel : cache la table de liaison
              },
            ],
          },
        ],
      });

      if (!agent) {
        return res.status(404).json({ message: "Agent non trouvé" });
      }

      if (!agent.droit) {
        return res.status(403).json({
          message: "Aucun droit associé à cet agent",
        });
      }

      // console.log(
      //   "📋 Permissions disponibles:",
      //   agent.droit.Permissions?.map((p) => `${p.resource}.${p.action}`),
      // );

      const hasPermission = agent.droit.Permissions?.some(
        (p) => p.resource === resource && p.action === action,
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Permission refusée: ${action} ${resource}`,
        });
      }

      next();
    } catch (err) {
      console.error("authorizePermission error:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
};

module.exports = { authorizePermission };
