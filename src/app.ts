import express, { Express } from "express";
const app = express();
import userRoute from "./routes/userRoutes";
import postRoute from "./routes/postRoute";
import authRoute from "./routes/authRoute";
import env from "dotenv"
import path from "path";
import cors from "cors";
env.config();

import mongoose from "mongoose";
import bodyParser from "body-parser";

const init = () => {
  const promise = new Promise<Express>((resolve) => {
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
      app.use(express.static(path.resolve('public')))

      app.use("/api/auth", authRoute);
      app.use("/api/user", userRoute);
      app.use("/api/post", postRoute);
      app.get("/**", (req, res) => {
        res.sendFile(path.resolve('public/index.html'));
    });
      resolve(app);
    });
  });
  return promise;
};

export default init;