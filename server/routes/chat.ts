import { RequestHandler } from "express";
import type { ChatRequest, ChatResponse } from "@shared/api";
import { ensureUserGoals, getUserFromToken } from "../store";

function extractToken(req: any): string | null {
  const h = req.headers["authorization"] as string | undefined;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  const x = req.headers["x-token"] as string | undefined;
  return x || null;
}

export const chat: RequestHandler = (req, res) => {
  const token = extractToken(req);
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body as ChatRequest;
  const goals = ensureUserGoals(user.id);
  const goal = goals.get(body.goalId);
  if (!goal) return res.status(404).json({ error: "Unknown goal" });

  const replyText = `For "${goal.title}": ${
    body.message
  } — Focus on the next milestone: "${goal.milestones.find((m) => !m.completed)?.objective ?? goal.milestones[0].objective}". Keep sessions short (45–60 min) and end with a quick recap.`;

  const response: ChatResponse = { reply: replyText };
  res.json(response);
};
