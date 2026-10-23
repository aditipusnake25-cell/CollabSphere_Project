import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createProject, getProject, updateProject, deleteProject , addCollaborator } from '../controllers/projectController.js'
const router = express.Router()

router.post("/", authMiddleware, createProject)

router.get("/", authMiddleware, getProject)

router.put("/:id", authMiddleware, updateProject)

router.delete("/:id", authMiddleware, deleteProject)

router.post("/:id/members", authMiddleware, addCollaborator);

export default router 