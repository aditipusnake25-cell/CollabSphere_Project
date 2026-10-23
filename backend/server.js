
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const PORT = process.env.PORT || 5000;

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", noteRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ai", geminiRoutes);

app.get("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("name email role bio profileImage");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      message: "Profile loaded successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load profile.",
      error: error.message,
    });
  }
});

// Serve the built React frontend
const frontendDist = path.resolve(__dirname, "../frontend/dist");

app.use(express.static(frontendDist));

// React Router fallback
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(frontendDist, "index.html"));
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Connection error:", error.message);
  }
};

startServer();
