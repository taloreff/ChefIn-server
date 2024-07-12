import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    profileImgUrl: string;
    tokens: string[];
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: false,
    },
    profileImgUrl: {
        type: String,
        required: false,
    },
    tokens: {
        type: [String],
    },
});

export default mongoose.model<IUser>("User", UserSchema);
