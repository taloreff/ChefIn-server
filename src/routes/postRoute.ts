import express from "express";
const router = express.Router();
import PostController from "../controllers/postController";
import { authMiddleware } from "../controllers/authController";

router.get("/place-details", PostController.getPlaceDetails.bind(PostController));
router.get("/myposts", authMiddleware, PostController.get.bind(PostController));
router.get("/:id", PostController.get.bind(PostController));
router.get("/", PostController.get.bind(PostController));
router.post("/", authMiddleware, PostController.post.bind(PostController));
router.put("/:id/review", authMiddleware, PostController.addReview.bind(PostController)); // Update to handle adding review
router.put("/:id", authMiddleware, PostController.put.bind(PostController));
router.delete("/:id", authMiddleware, PostController.delete.bind(PostController));

export default router;
