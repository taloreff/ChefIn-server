import express, { Express } from "express";
const app = express();
import userRoute from "./routes/userRoutes";
import postRoute from "./routes/postRoute";
import authRoute from "./routes/authRoute";
import env from "dotenv"
env.config();

import mongoose from "mongoose";
import bodyParser from "body-parser";

const init = () => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("connected to database"));
    mongoose.connect(process.env.MONGO_URL).then(() => {
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());

      app.use("/auth", authRoute);
      app.use("/user", userRoute);
      app.use("/post", postRoute);
      resolve(app);
    });
  });
  return promise;
};

export default init;