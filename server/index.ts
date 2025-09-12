import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { signup, login } from "./routes/auth";
import { createGoal, listGoals, getGoal, deleteGoal, toggleMilestone } from "./routes/goals";
import { chat } from "./routes/chat";
import { getProgress } from "./routes/progress";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health/demo
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);

  // Goals
  app.post("/api/goals", createGoal);
  app.get("/api/goals", listGoals);
  app.get("/api/goals/:id", getGoal);
  app.delete("/api/goals/:id", deleteGoal);
  app.patch("/api/goals/:id/milestones", toggleMilestone);

  // Chat
  app.post("/api/chat", chat);

  // Progress
  app.get("/api/progress/:goalId", getProgress);

  return app;
}
