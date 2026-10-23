import fs from "fs/promises";
import File from "../models/File.js";
import Project from "../models/Project.js";

const uploadFile = async (req, res) => {
    try {
        const { id } = req.params
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a file to upload."
            })
        }
        const project = await Project.findById(id)
        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            })
        }
        // const file = await File.create({
        //     originalName:req.file.originalName,
        //     fileUrl : `/uploads/${req.file.filename}`,
        //     mimeType:req.file.mimeType,
        //     size:req.file.size ,
        //     project:id,
        //     uploadedBy:req.user.id
        // })


        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User ID missing from token."
            });
        }

        const file = await File.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            fileUrl: `/uploads/${req.file.filename}`,
            mimeType: req.file.mimetype,
            size: req.file.size,
            project: id,
            uploadedBy: userId
        });

        return res.status(201).json({
            message: "File uploaded successfully!",
            file
        })
    } catch (error) {
        console.log("File upload error: ", error);
        return res.status(500).json({
            message: "Failed to upload file.",
            error: error.message
        })

    }

}

const getProjectFiles = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            })
        }
        const files = await File.find({ project: id })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: "Project files fetched successfully!",
            files
        })
    } catch (error) {
        console.log("Get project files error: ", error);
        return res.status(500).json({
            message: "Failed to fetch project files.",
            error: error.message
        })

    }

}

const deleteProjectFile = async (req, res) => {
    try {
        const { id, fileId } = req.params
        const project = await Project.findById(id)
        if (!project) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }
        const file = await File.findOne({
            _id: fileId,
            project: id
        })
        if (!file) {
            return res.status(404).json({
                message: "File not found!"
            })
        }
        try {
            await fs.unlink(`uploads/${file.storedName}`)
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error
            }
        }
        await File.findByIdAndDelete(fileId);
        return res.status(200).json({
            message:"File deleted successfully!"
        })
    } catch (error) {
        console.log("Delete file error: ",error.message);
        return res.status(500).json({
            message:"Failed to delete file."
        })
    }
}

export { uploadFile, getProjectFiles , deleteProjectFile }