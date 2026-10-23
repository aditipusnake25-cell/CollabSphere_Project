import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { explainCode , generateReadme,generateDocumentation } from "../controllers/geminiController.js"

const router = express.Router()

router.post("/explain-code", authMiddleware, explainCode)

router.post("/generate-readme",authMiddleware,generateReadme)

router.post("/generate-documentation", authMiddleware,generateDocumentation)

export default router 
