
import express from "express";

import {
  createNote,
  getProjectNotes,
  updateNote,
  deleteNote
} from "../controllers/noteController.js";

import authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/projects/:id/notes",  authMiddleware, createNote);

router.get("/projects/:id/notes",  authMiddleware, getProjectNotes);
router.put("/notes/:id", authMiddleware, updateNote);
router.delete("/notes/:id", authMiddleware, deleteNote);

export default router;
