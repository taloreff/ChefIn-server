// src/models/postModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    profileImgUrl: string;
    title: string;
    description: string;
    image: string;  
    labels: string[];
}

const PostSchema: Schema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    profileImgUrl: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {  
        type: String,
        required: true,
    },
    labels: {
        type: [String],
        required: true,
    },
});

export default mongoose.model<IPost>("Post", PostSchema);
