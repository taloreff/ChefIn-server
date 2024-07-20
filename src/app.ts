import express, { Express } from "express";
import https from 'https';
import http from 'http';
import selfsigned from 'selfsigned';
import userRoute from "./routes/userRoutes";
import postRoute from "./routes/postRoute";
import authRoute from "./routes/authRoute";
import env from "dotenv";
import path from "path";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import mongoose from "mongoose";
import bodyParser from "body-parser";

env.config();

const app: Express = express();

const init = (): Promise<{ app: Express, httpsServer: https.Server, httpServer: http.Server }> => {
  return new Promise((resolve) => {
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("connected to database"));

    mongoose.connect(process.env.MONGO_URL).then(() => {
      const corsOptions = {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
      };

      app.use(cors(corsOptions));
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(express.static(path.resolve('public')));

      app.use("/api/auth", authRoute);
      app.use("/api/user", userRoute);
      app.use("/api/post", postRoute);

      // Swagger setup for HTTP server
      const options = {
        definition: {
          openapi: "3.0.0",
          info: {
            title: "ChefIn Project API",
            version: "1.0.0",
            description: "API documentation for ChefIn project",
          },
          servers: [
            {
              url: `http://localhost:${process.env.HTTP_PORT}/api`,
            },
          ],
        },
        apis: [path.join(__dirname, './routes/*.ts')],
      };
      const specs = swaggerJsdoc(options);
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

      app.get("/**", (req, res) => {
        res.sendFile(path.resolve('public/index.html'));
      });

      // Generate self-signed certificate
      const pems = selfsigned.generate(null, {
        algorithm: 'sha256',
        days: 30,
        keySize: 2048,
        extensions: [{ name: 'basicConstraints', cA: true }]
      });

      // Create HTTPS server
      const httpsServer = https.createServer({
        key: pems.private,
        cert: pems.cert
      }, app);

      // Create HTTP server
      const httpServer = http.createServer(app);

      resolve({ app, httpsServer, httpServer });
    });
  });
};

export { app, init };
