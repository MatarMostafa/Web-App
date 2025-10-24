import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

export const createServer = (): Express => {
  const app = express();

  // --- Core middlewares ---
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors());

  // --- Test routes ---
  app.get("/message/:name", (req, res) => {
    return res.json({ message: `hello ${req.params.name}` });
  });

  app.get("/status", (_, res) => {
    return res.json({ ok: true });
  });

  // --- API routes ---
  app.use("/api", routes);

  // --- Swagger documentation setup ---
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Employee Manager API",
        version: "1.0.0",
        description: "API documentation for employee management system",
      },
      servers: [
        {
          url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api`,
        },
      ],
    },
    apis: [path.join(__dirname, "../api-docs/*.yaml")], // load all yaml files
  };

  const specs = swaggerJsdoc(options);
  // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  return app;
};

// Default export for Vercel
export default createServer();
