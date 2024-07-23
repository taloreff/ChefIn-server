import express from "express";
const router = express.Router();
import PostController from "../controllers/postController";
import { authMiddleware } from "../controllers/authController";
import upload from "../config/multerConfig";
import postController from "../controllers/postController";

/**
 * @swagger
 * /post/place-details:
 *   get:
 *     summary: Get place details
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: placeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Place ID to get details for
 *     responses:
 *       200:
 *         description: Place details retrieved successfully
 *       404:
 *         description: Place not found
 */
router.get("/place-details", PostController.getPlaceDetails.bind(PostController));

/**
 * @swagger
 * /post/myposts:
 *   get:
 *     summary: Get my posts
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/myposts", authMiddleware, PostController.get.bind(PostController));

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get("/:id", PostController.get.bind(PostController));

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 */
router.get("/", PostController.get.bind(PostController));

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Post data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, PostController.post.bind(PostController));

/**
 * @swagger
 * /post/{id}/review:
 *   put:
 *     summary: Add a review to a post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       description: Review data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review added successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authMiddleware, upload.single('image'), postController.put.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       description: Post data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authMiddleware, PostController.put.bind(PostController));

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, PostController.delete.bind(PostController));

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         username:
 *           type: string
 *         profileImgUrl:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         image:
 *           type: string
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         overview:
 *           type: string
 *         whatsIncluded:
 *           type: array
 *           items:
 *             type: string
 *         meetingPoint:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             lat:
 *               type: number
 *             lng:
 *               type: number
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *     Review:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         profileImgUrl:
 *           type: string
 */

export default router;
