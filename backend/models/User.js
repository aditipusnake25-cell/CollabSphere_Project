import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    role: {
        type: String,
        default: "user"
    },
    profileImage: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
        maxlength: 200,
        trim: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema)

export default User;