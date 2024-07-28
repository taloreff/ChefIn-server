// app.ts

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
import fs from "fs";

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
        allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept", "headers"],
        credentials: true,
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
              url: `http://node01.cs.colman.ac.il:${process.env.HTTP_PORT}/api`,
            },
          ],
        },
        apis: [path.join(__dirname, './routes/*.ts')],
      };
      const specs = swaggerJsdoc(options);
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

      app.use('/uploads', express.static('uploads'));

      app.get("/**", (req, res) => {
        res.sendFile(path.resolve('public/index.html'));
      });

      // Read certificate and key files
      const key = fs.readFileSync(path.resolve('node01.cs.colman.ac.il.key'));
      const cert = fs.readFileSync(path.resolve('node01.cs.colman.ac.il.crt'));

      // Create HTTPS server
      const httpsServer = https.createServer({
        key: key,
        cert: cert
      }, app);

      // Create HTTP server
      const httpServer = http.createServer(app);

      resolve({ app, httpsServer, httpServer });
    });
  });
};

export { app, init };
