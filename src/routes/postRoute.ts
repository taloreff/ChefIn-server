import express from "express";
const router = express.Router();
import PostController from "../controllers/postController";
import { authMiddleware } from "../controllers/authController";

router.get("/", PostController.get.bind(PostController));

router.get("/:id", PostController.get.bind(PostController));

router.post("/", authMiddleware, PostController.post.bind(PostController));

router.put("/:id", authMiddleware, PostController.put.bind(PostController));

router.delete("/:id", authMiddleware, PostController.delete.bind(PostController));

export default router;