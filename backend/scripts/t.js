const { Agent, Droit, Permission } = require("../models");

const t = async () => {
  try {
    const users = await Agent.findByPk(4, {
      include: [
        {
          model: Droit,
          as: "droit",
          attributes: ["id", "libelle", "createdAt", "updatedAt"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["id", "resource", "action"],
            },
          ],
        },
      ],
    });
    console.log(users);
  } catch (err) {
    console.log(err);
  }
};

t();
