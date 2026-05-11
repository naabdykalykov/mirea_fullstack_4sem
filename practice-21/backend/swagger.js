const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Товаров (Products)",
      version: "1.0.0",
      description: "CRUD API для управления товарами",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Локальный сервер разработки",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const openapiSpecification = swaggerJsdoc(options);

module.exports = openapiSpecification;
