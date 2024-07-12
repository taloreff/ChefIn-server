import express from "express";
const router = express.Router();
import userController from "../controllers/userController";
import { authMiddleware } from "../controllers/authController";

router.get("/", authMiddleware, userController.get.bind(userController));
router.get("/:id", authMiddleware, userController.get.bind(userController));

//post
router.post("/", authMiddleware, userController.post.bind(userController));

//put
router.put("/", authMiddleware, userController.put.bind(userController));

//delete
router.delete("/", authMiddleware, userController.delete.bind(userController));

export default router;