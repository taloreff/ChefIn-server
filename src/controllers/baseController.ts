import { Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "../services/logger.service";

class BaseController<ModelInterface>{
    model: mongoose.Model<ModelInterface>;

    constructor(model: mongoose.Model<ModelInterface>) {
        this.model = model;
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            if (req.params.id != null) {
                const users = await this.model.findById(req.params.id);
                res.status(200).send(users);
            } else {
                if (req.query.name != null) {
                    const users = await this.model.find({ name: req.query.name });
                    res.status(200).send(users);
                } else {
                    const users = await this.model.find();
                    res.status(200).send(users);
                }
            }
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async post(req: Request, res: Response): Promise<void> {
        const user = req.body;
        try {
            const newUser = await this.model.create(user);
            res.status(201).json(newUser);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async put(req: Request, res: Response): Promise<void> {
        const user = req.body;
        try {
            const updatedUser = await this.model.findByIdAndUpdate(
                user._id,
                user,
                { new: true }
            );
            res.status(200).json(updatedUser);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        const user = req.body;
        try {
            await this.model.findByIdAndDelete(user._id);
            res.status(200).send();
        } catch (err) {
            logger.error(err);
            res.status(500).send(err.message);
        }
    }
}

export default BaseController;
