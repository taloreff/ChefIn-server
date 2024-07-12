import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { logger } from "../services/logger.service";

const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email === undefined || password === undefined) {
        return res.status(400).send("Email and password are required");
    }
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).send("User already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ email: email, password: hashedPassword });
        return res.send(newUser);
    } catch (err) {
        logger.error(err);
        return res.status(400).send(err.message);
    }
};

const generateTokens = async (user: Document<unknown, object, IUser> & IUser & Required<{ _id: string; }>): Promise<{ "accessToken": string, "refreshToken": string }> => {
    const accessToken = jwt.sign({ "_id": user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    const random = Math.floor(Math.random() * 1000000).toString();
    const refreshToken = jwt.sign({ "_id": user._id, "random": random }, process.env.TOKEN_SECRET, {});
    if (user.tokens == null) {
        user.tokens = [];
    }
    user.tokens.push(refreshToken);
    try {
        await user.save();
        return {
            "accessToken": accessToken,
            "refreshToken": refreshToken
        };
    } catch (err) {
        logger.error(err);
        return null;
    }
};

const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email === undefined || password === undefined) {
        logger.error("Email and password are required");
        return res.status(400).send("Email and password are required");
    }

    try {
        const user = await User.findOne({ email: email }) as Document<unknown, object, IUser> & IUser & Required<{ _id: string }>;
        if (user == null) {
            logger.error("User does not exist");
            return res.status(400).send("User does not exist");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.error("Invalid credentials");
            return res.status(400).send("Invalid credentials");
        }

        const tokens = await generateTokens(user);
        if (tokens == null) {
            return res.status(400).send("Error generating tokens");
        }
        return res.status(200).send(tokens);
    } catch (err) {
        logger.error(err);
        return res.status(400).send(err.message);
    }
};

const refresh = async (req: Request, res: Response) => {
    const refreshToken = extractToken(req);
    if (refreshToken == null) {
        return res.sendStatus(401);
    }
    try {
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err, data: jwt.JwtPayload) => {
            if (err) {
                return res.sendStatus(403);
            }
            const user = await User.findOne({ _id: data._id }) as Document<unknown, object, IUser> & IUser & Required<{ _id: string }>;
            if (user == null) {
                return res.sendStatus(403);
            }
            if (!user.tokens.includes(refreshToken)) {
                user.tokens = [];
                await user.save();
                return res.sendStatus(403);
            }
            user.tokens = user.tokens.filter((token) => token !== refreshToken);
            const tokens = await generateTokens(user);
            if (tokens == null) {
                logger.error("Error generating tokens");
                return res.status(400).send("Error generating tokens");
            }
            return res.status(200).send(tokens);
        });
    } catch (err) {
        logger.error(err);
        return res.status(400).send(err.message);
    }
};

const extractToken = (req: Request): string | null => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    return token ? token : null;
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = extractToken(req);
    if (refreshToken == null) {
        return res.sendStatus(401);
    }
    try {
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err, data: jwt.JwtPayload) => {
            if (err) {
                return res.sendStatus(403);
            }
            const user = await User.findOne({ _id: data._id }) as Document<unknown, object, IUser> & IUser & Required<{ _id: string }>;
            if (user == null) {
                return res.sendStatus(403);
            }
            if (!user.tokens.includes(refreshToken)) {
                user.tokens = [];
                await user.save();
                return res.sendStatus(403);
            }
            user.tokens = user.tokens.filter((token) => token !== refreshToken);
            await user.save();
            return res.status(200).send();
        });
    } catch (err) {
        logger.error(err);
        return res.status(400).send(err.message);
    }
};

export type AuthRequest = Request & { user: { _id: string } };

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, data: jwt.JwtPayload) => {
        if (err) {
            logger.error(err);
            return res.sendStatus(401);
        }
        const id = data._id;
        req.user = { _id: id };
        return next();
    });
};

export default { register, login, logout, authMiddleware, refresh };