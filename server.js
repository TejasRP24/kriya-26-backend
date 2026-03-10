import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import adminRoutes from "./routes/AdminRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import actionCardRoutes from "./routes/actionCardRoutes.js";
import algorithmRoutes from "./routes/algorithmRoutes.js";
import round1Routes from "./routes/round1Routes.js";
import round2Routes from "./routes/round2Routes.js";
import round1SubmissionRoutes from "./routes/round1submissionRoutes.js";
import round2SubmissionRoutes from "./routes/round2submissionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error ❌", err));

// Routes
const mainRouter = express.Router();

// Health check
mainRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Admin routes (existing — includes nested round1/2 questions, leaderboard, teams, algorithm cards)
mainRouter.use("/api/admin", adminRoutes);

// Team routes
mainRouter.use("/api/teams", teamRoutes);

// OTP routes
mainRouter.use("/api/otp", otpRoutes);

// Standalone Round 1 & Round 2 question routes
mainRouter.use("/api/round1", round1Routes);
mainRouter.use("/api/round2", round2Routes);

// Submission routes
mainRouter.use("/api/round1/submissions", round1SubmissionRoutes);
mainRouter.use("/api/round2/submissions", round2SubmissionRoutes);

// Algorithm card routes (standalone)
mainRouter.use("/api/algorithms", algorithmRoutes);

// Action card routes
mainRouter.use("/api/action-cards", actionCardRoutes);

// Leaderboard routes (standalone)
mainRouter.use("/api/leaderboard", leaderboardRoutes);

app.use("/kriyabe", mainRouter);

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
