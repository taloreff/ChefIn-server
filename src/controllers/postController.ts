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
}

export default new PostController();
