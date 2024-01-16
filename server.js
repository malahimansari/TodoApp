const express = require("express");
require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./db");

const app = express();
app.use(express.json({ extended: false }));

connectDB();

// Define Swagger options
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo App API",
      version: "1.0.0",
      description: "API documentation for the Todo App",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /api-docs endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// routes
app.use("/api/v1/users/",require("./routes/users"));
app.use("/api/v1/auth/",require("./routes/auth"));
app.use("/api/v1/todos/",require("./routes/todos"));

// port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is runing ${PORT}`));
