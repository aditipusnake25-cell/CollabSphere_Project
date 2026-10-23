import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
        trim: true
    },
       storedName: {
        type: String,
        required: true,
        unique: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true,
        enum: [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "text/plain"
        ]
    },
    size: {
        type: Number,
        required: true,
        min: 1,
        max: 5242880
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const File = mongoose.model("File", fileSchema);

export default File;