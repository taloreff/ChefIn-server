import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { logger } from '../services/logger.service';

export type AuthRequest = Request & { user: { _id: string } };

const register = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).send("Email, password, and username are required");
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ email, password: hashedPassword, username }) as IUser & Document;

        const tokens = await generateTokens(newUser);
        if (!tokens) {
            return res.status(400).send("Error generating tokens");
        }

        return res.status(200).send({ user: newUser, ...tokens });
    } catch (err) {
        logger.error(err);
        return res.status(400).send(err.message);
    }
};

const generateTokens = async (user: IUser & Document): Promise<{ accessToken: string, refreshToken: string } | null> => {
    const accessToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET!, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    const random = Math.floor(Math.random() * 1000000).toString();
    const refreshToken = jwt.sign({ _id: user._id, random }, process.env.TOKEN_SECRET!);

    user.tokens = user.tokens || [];
    user.tokens.push(refreshToken);
    try {
        await user.save();
        return { accessToken, refreshToken };
    } catch (err) {
        logger.error(err);
        return null;
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        logger.error("Email and password are required");
        return res.status(400).send("Email and password are required");
    }

    try {
        const user = await User.findOne({ email }) as IUser & Document;
        if (!user) {
            logger.error("User does not exist");
            return res.status(400).send("User does not exist");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.error("Invalid credentials");
            return res.status(400).send("Invalid credentials");
        }

        const tokens = await generateTokens(user);
        if (!tokens) {
            return res.status(400).send("Error generating tokens");
        }
        return res.status(200).send({ user, ...tokens });
    } catch (err) {
        logger.error(err);
        return res.status(400).send(err.message);
    }
};

export const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    try {
        jwt.verify(refreshToken, process.env.TOKEN_SECRET!, async (err, data: jwt.JwtPayload) => {
            if (err) {
                return res.sendStatus(403);
            }
            const user = await User.findOne({ _id: data._id }) as IUser & Document;
            if (!user || !user.tokens.includes(refreshToken)) {
                return res.sendStatus(403);
            }
            user.tokens = user.tokens.filter((token) => token !== refreshToken);
            const tokens = await generateTokens(user);
            if (!tokens) {
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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    return token || null;
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = extractToken(req);
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    try {
        jwt.verify(refreshToken, process.env.TOKEN_SECRET!, async (err, data: jwt.JwtPayload) => {
            if (err) {
                return res.sendStatus(403);
            }
            const user = await User.findOne({ _id: data._id }) as IUser & Document;
            if (!user || !user.tokens.includes(refreshToken)) {
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

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.TOKEN_SECRET!, (err, data: jwt.JwtPayload) => {
        if (err) {
            console.log("its failing here");
            logger.error(err);
            return res.sendStatus(401);
        }
        req.user = { _id: data._id };
        return next();
    });
};

export default { register, login, logout, authMiddleware, refresh };
