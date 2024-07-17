import Post, { IPost } from "../models/postModel";
import BaseController from "./baseController";
import { Response, Request } from "express";
import { AuthRequest } from "./authController";
import User from "../models/userModel";
import { logger } from "../services/logger.service";

class PostController extends BaseController<IPost> {
    constructor() {
        super(Post);
    }

    async post(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).send("User not found");
                return;
            }

            const newPost = await this.model.create({
                userId: user._id,
                username: user.username,
                profileImgUrl: user.profileImgUrl,
                image: req.body.image,
                ...req.body
            });
            res.status(201).json(newPost);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async addReview(req: AuthRequest, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            const post = await this.model.findById(postId);
            console.log("post found")
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            const userId = req.user._id;
            const user = await User.findById(userId);
            console.log("userfound")
            if (!user) {
                res.status(404).send("User not found");
                return;
            }

            const { rating, comment } = req.body;
            const review = {
                user: user.username,
                rating,
                comment,
            };

            post.reviews.push(review);
            console.log("post.userId", post.userId)
            const updatedPost = await post.save();
            console.log("post saved")
            res.status(200).json(updatedPost);
        } catch (err) {
            console.log("Error saving post:", err);
            logger.error(err);
            res.status(500).send(err.message);
        }
    }
}

export default new PostController();
