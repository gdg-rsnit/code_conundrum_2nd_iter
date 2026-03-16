import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import teamRoutes from "./routes/team.routes.js";
import roundRouters from "./routes/round.routes.js"

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/admin/teams", teamRoutes);
app.use("/api/admin/round", roundRouters);

app.listen(port, () => console.log(`app running on port ${port}`));


