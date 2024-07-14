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
    reviews: {
        user: string;
        rating: number;
        comment: string;
    }[];
    overview: string;
    whatsIncluded: string[];
    meetingPoint: {
        address: string;
        lat: number;
        lng: number;
    };
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
    reviews: [{
        user: String,
        rating: Number,
        comment: String
    }],
    overview: {
        type: String,
        required: true,
    },
    whatsIncluded: {
        type: [String],
        required: true,
    },
    meetingPoint: {
        address: String,
        lat: Number,
        lng: Number
    }
});

export default mongoose.model<IPost>("Post", PostSchema);