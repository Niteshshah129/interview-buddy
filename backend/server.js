import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import resumeAnalyzeRoutes from "./routes/resumeAnalyzeRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    /\.vercel\.app$/,
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/resume", resumeAnalyzeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/resource", resourceRoutes);

app.get("/", (req, res) =>
  res.json({ message: "Interview Buddy API Running" })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));