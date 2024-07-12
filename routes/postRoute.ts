import express from "express";
const router = express.Router();
import PostController from "../controllers/postController";
import { authMiddleware } from "../controllers/authController";

router.get("/", PostController.get.bind(PostController));
router.get("/:id", PostController.get.bind(PostController));

//post
router.post("/", authMiddleware, PostController.post.bind(PostController));

//put
router.put("/", authMiddleware, PostController.put.bind(PostController));

//delete
router.delete("/", authMiddleware, PostController.delete.bind(PostController));

export default router;