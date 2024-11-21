const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Endpoints for managing scan results',
    },
  },
  apis: ['./routes/*.js'], // Adjust the path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
