const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gestion Documents",
      version: "1.0.0",
      description: "Documentation de ton API",
    },
    servers: [
      {
        url:  "http://localhost:5001",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // tes routes
};

module.exports = swaggerJsdoc(options);