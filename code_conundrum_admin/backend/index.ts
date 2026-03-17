import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import redisClient from "./config/redis.js";

import userRoutes from "./routes/user.routes.js";
import teamRoutes from "./routes/team.routes.js";
import roundRouters from "./routes/round.routes.js";
import questionRoutes from "./routes/question.routes.js";
import answerRoutes from "./routes/answer.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import submissionRoutes from "./routes/submission.routes.js";

dotenv.config();
const port = process.env.PORT || 5000;
export const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:5173", "http://127.0.0.1:8080"];
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// Connect to MongoDB
connectDB();

// Connect to Redis
try {
  await redisClient.connect();
  console.log("Redis connected successfully");
} catch (error) {
  console.error("Redis connection failed:", error);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/admin/teams", teamRoutes);
app.use("/api/admin/round", roundRouters);
app.use("/api/admin/questions", questionRoutes);
app.use("/api/admin/answers", answerRoutes);
app.use("/api/admin/leaderboard", leaderboardRoutes);
app.use("/api/submissions", submissionRoutes);

app.listen(port, () => console.log(`app running on port ${port}`));
