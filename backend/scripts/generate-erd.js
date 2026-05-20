const { sequelize } = require("../models");
const erd = require("sequelize-erd");

erd({ source: sequelize }).then((svg) => {
  require("fs").writeFileSync("diagram.svg", svg);
});
