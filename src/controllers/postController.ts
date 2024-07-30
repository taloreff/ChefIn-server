import Post, { IPost } from "../models/postModel";
import BaseController from "./baseController";
import { Response, Request } from "express";
import { AuthRequest } from "./authController";
import User from "../models/userModel";
import { logger } from "../services/logger.service";
import upload from "../config/multerConfig"; 
import path from "path";
import fs from "fs";

class PostController extends BaseController<IPost> {
    constructor() {
        super(Post);
    }

    async post(req: AuthRequest, res: Response): Promise<void> {
        upload.single('image')(req, res, async (err: any) => {
            if (err) {
                return res.status(500).send({ message: 'Error uploading image' });
            }
            try {
                const { title, description, overview, meetingPoint, labels, whatsIncluded, reviews } = req.body;
                const userId = req.user._id;
                const image = req.file ? req.file.filename : undefined;

                const parsedLabels = Array.isArray(labels) ? labels : JSON.parse(labels);
                const parsedWhatsIncluded = Array.isArray(whatsIncluded) ? whatsIncluded : JSON.parse(whatsIncluded);
                const parsedReviews = Array.isArray(reviews) ? reviews.map((r) => JSON.parse(r)) : [];

                const newPost = await this.model.create({
                    userId,
                    title,
                    description,
                    image,
                    reviews: parsedReviews,
                    overview,
                    meetingPoint: meetingPoint ? JSON.parse(meetingPoint) : {},
                    labels: parsedLabels,
                    whatsIncluded: parsedWhatsIncluded
                });
                res.status(201).json(newPost);
            } catch (err) {
                logger.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    

    async addReview(req: AuthRequest, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            const userId = req.user._id;
            const user = await User.findById(userId);
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
            const updatedPost = await post.save();
            res.status(200).json(updatedPost);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async getMyPosts(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user._id;
            const posts = await this.model.find({ userId }).populate('userId', 'username profileImgUrl');
            res.status(200).json(posts);
        } catch (err) {
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
        const apiKey = process.env.GOOGLE_API_KEY;
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            logger.error(error);
            res.status(500).send('Error fetching place details');
        }
    }
}

export default new PostController();
