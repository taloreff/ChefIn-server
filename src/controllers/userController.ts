import multer from 'multer';
import path from 'path';
import User, { IUser } from "../models/userModel";
import BaseController from "./baseController";
import { Request, Response } from "express";
import { logger } from "../services/logger.service";
import upload from "../config/multerConfig";

class UserController extends BaseController<IUser> {
    constructor() {
        super(User);
    }

    async put(req: Request, res: Response): Promise<void> {
        upload.single('profileImgUrl')(req, res, async (err: any) => {
            if (err) {
                logger.error(err);
                return res.status(500).send({ message: 'Error uploading image' });
            }

            const { username } = req.body;
            const userId = req.params.id;
            const profileImgUrl = req.file ? req.file.filename : undefined;

            const updateData: Partial<IUser> = {
                username,
            };

            if (profileImgUrl) {
                updateData.profileImgUrl = profileImgUrl;
            }

            try {
                const updatedUser = await this.model.findByIdAndUpdate(
                    userId,
                    updateData,
                    { new: true }
                );
                res.status(200).json(updatedUser);
            } catch (error) {
                logger.error(error);
                res.status(500).send(error.message);
            }
        });
    }
}

export default new UserController();
