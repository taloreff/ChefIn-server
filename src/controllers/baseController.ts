import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { logger } from "../services/logger.service";
import { AuthRequest } from "../controllers/authController"; 

class BaseController<ModelInterface> {
    model: mongoose.Model<ModelInterface>;

    constructor(model: mongoose.Model<ModelInterface>) {
        this.model = model;
    }

    async get(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.params.id) {
                const document = await this.model.findById(req.params.id);
                if (!document) {
                    res.status(404).send("Document not found");
                    return;
                }
                res.status(200).json(document);
            } else if (req.user) {
                const userId = new Types.ObjectId(req.user._id);
                const documents = await this.model.find({ userId });
                res.status(200).json(documents);
            } else {
                const filter = req.query as mongoose.FilterQuery<ModelInterface>;
                const documents = await this.model.find(filter);
                res.status(200).json(documents);
            }
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async post(req: AuthRequest, res: Response): Promise<void> {
        const document = req.body;
        try {
            const newDocument = await this.model.create(document);
            res.status(201).json(newDocument);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async put(req: AuthRequest, res: Response): Promise<void> {
        const document = req.body;
        try {
            const updatedDocument = await this.model.findByIdAndUpdate(
                document._id,
                document,
                { new: true }
            );
            res.status(200).json(updatedDocument);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            await this.model.findByIdAndDelete(id);
            res.status(200).send();
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }
}

export default BaseController;
