import { RequestHandler } from "express";
import type { ProgressResponse } from "@shared/api";
import { ensureUserGoals, getUserFromToken } from "../store";

function extractToken(req: any): string | null {
  const h = req.headers["authorization"] as string | undefined;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  const x = req.headers["x-token"] as string | undefined;
  return x || null;
}

export const getProgress: RequestHandler = (req, res) => {
  const token = extractToken(req);
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const goals = ensureUserGoals(user.id);
  const goal = goals.get(req.params.goalId);
  if (!goal) return res.status(404).json({ error: "Unknown goal" });

  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completed).length;
  const completion = Math.round((done / total) * 100);
  const velocity = `${Math.max(1, Math.round(done / Math.max(1, Math.ceil(total / 8))))} modules/week`;
  const summary = `You have completed ${done} of ${total} milestones. Keep pushing toward "${goal.title}".`;

  const response: ProgressResponse = {
    completion,
    velocity,
    summary,
  };
  res.json(response);
};
