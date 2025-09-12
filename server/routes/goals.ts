import { RequestHandler } from "express";
import type { CreateGoalRequest, CreateGoalResponse, GetGoalsResponse, GoalDetail } from "@shared/api";
import { bootstrapGoal, ensureUserGoals, getUserFromToken } from "../store";

function extractToken(req: any): string | null {
  const h = req.headers["authorization"] as string | undefined;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  const x = req.headers["x-token"] as string | undefined;
  return x || null;
}

function requireUser(req: any, res: any) {
  const token = extractToken(req);
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return user;
}

export const createGoal: RequestHandler = (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const body = req.body as CreateGoalRequest;
  if (!body?.title || !body?.timeline) {
    return res.status(400).json({ error: "Missing title or timeline" });
  }
  const goal = bootstrapGoal(user.id, body.title, body.timeline, body.description);
  const response: CreateGoalResponse = {
    goalId: goal.id,
    milestones: goal.milestones,
  };
  res.json(response);
};

export const listGoals: RequestHandler = (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const goalsMap = ensureUserGoals(user.id);
  const list: GetGoalsResponse = Array.from(goalsMap.values()).map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
  }));
  res.json(list);
};

export const getGoal: RequestHandler = (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const goalsMap = ensureUserGoals(user.id);
  const goal = goalsMap.get(req.params.id);
  if (!goal) return res.status(404).json({ error: "Not found" });
  res.json(goal satisfies GoalDetail);
};

export const deleteGoal: RequestHandler = (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const goalsMap = ensureUserGoals(user.id);
  const ok = goalsMap.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};

export const toggleMilestone: RequestHandler = (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const goalsMap = ensureUserGoals(user.id);
  const goal = goalsMap.get(req.params.id);
  if (!goal) return res.status(404).json({ error: "Not found" });
  const week = Number(req.body?.week);
  const ms = goal.milestones.find((m) => m.week === week);
  if (!ms) return res.status(400).json({ error: "Invalid milestone" });
  ms.completed = !!req.body?.completed;
  const completedCount = goal.milestones.filter((m) => m.completed).length;
  goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
  res.json(goal);
};
