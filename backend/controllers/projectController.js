import Project from "../models/Project.js";
import User from "../models/User.js";

const createProject = async (req, res) => {
    try {
        const { title, description } = req.body
        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "project detailes are required!"
            })
        }
        const project = await Project.create({
            title: title.trim(),
            description: description || "",
            owner: req.user.userId,
            members: [req.user.userId]
        })
        res.status(201).json({
            message: "Project created successfully!",
            project
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to creat project",
            error: error.message
        })
    }

}

const getProject = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user.userId },
                { members: req.user.userId }
            ]
        }).populate("members", "name email role").sort({ createdAt: -1 })
        res.status(200).json({
            count: projects.length,
            projects
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects",
            error: error.message
        })
    }
}


const updateProject = async (req, res) => {
    try {
        const { title, description } = req.body
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.userId
        })
        if (!project) {
            return res.status(404).json({
                message: "Project not found or you are not the owner"
            })
        }
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: "Project title cannot be empty"
                })
            }
            project.title = title.trim()
        }
        if (description !== undefined) {
            project.description = description
        }
        await project.save()
        res.status(200).json({
            message: "Project updated successfully!",
            project
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to update project",
            error: error.message
        })
    }

}


const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.userId
        })
        if (!project) {
            return res.status(404).json({
                message: "Project not found or you ar enot the owner!"
            })
        }
        res.status(200).json({
            message: "Project deleted successfully!"
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete project",
            error: error.message
        })
    }

}

const addCollaborator = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({
                message: "Collaborator email is required!"
            })
        }
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.userId
        })
        if (!project) {
            return res.status(404).json({
                message: "Project not found or you are not the owner"
            })
        }
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        })
        if (!user) {
            return res.status(404).json({
                message: "User not found. They must register first."
            })
        }
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You are already the project owner"
            })
        }

        if (project.members.some(
            member => member.toString() === user._id.toString()
        )) {
            return res.status(400).json({
                message: "User is already a project member"
            })
        }
        project.members.push(user._id)

        await project.save()
        res.status(200).json({
            message: "Collaborator added successfully!",
            collaborator: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            project
        })

    } catch (error) {
        console.error("Add collaborator error: ", error.message);

        res.status(500).json({
            message: "Failed to add collaborator!",
            error: error.message
        })
    }

}


export { createProject, getProject, updateProject, deleteProject, addCollaborator }