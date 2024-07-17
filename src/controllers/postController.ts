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
            const { title, description, image, reviews, overview, meetingPoint, labels, whatsIncluded } = req.body;
            console.log("creating post")
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
                title, description, image, reviews, overview, meetingPoint, labels, whatsIncluded
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

    async getPlaceDetails(req: Request, res: Response): Promise<void> {
        const { placeId } = req.query;
        if (!placeId) {
            res.status(400).send('placeId query parameter is required');
            return;
        }
        const apiKey = 'AIzaSyB24fmoFy0PfYJeqW1F7Ida3Ok3IlwDZUw';
        try {
            console.log("fetching place details")
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`);
            const data = await response.json();
            console.log("place details fetched ", data)
            res.json(data);
        } catch (error) {
            logger.error(error);
            res.status(500).send('Error fetching place details');
        }
    }
}

export default new PostController();
