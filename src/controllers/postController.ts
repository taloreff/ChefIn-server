import Post, { IPost } from "../models/postModel";
import BaseController from "./baseController";
import { Response } from "express";
import { AuthRequest } from "./authController";

class PostController extends BaseController<IPost>{
    constructor() {
        super(Post);
    }

    async post(req: AuthRequest, res: Response) {
        const _id = req.user._id;
        req.body.owner = _id;
        super.post(req, res);
    }
}

export default new PostController();