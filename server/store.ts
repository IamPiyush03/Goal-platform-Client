import crypto from "crypto";
import type { GoalDetail, Milestone } from "@shared/api";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface Session {
  token: string;
  userId: string;
}

interface Store {
  users: Map<string, User>;
  sessions: Map<string, Session>; // token->session
  goalsByUser: Map<string, Map<string, GoalDetail>>; // userId -> (goalId -> goal)
}

export const store: Store = {
  users: new Map(),
  sessions: new Map(),
  goalsByUser: new Map(),
};

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function getUserFromToken(token?: string | null): User | null {
  if (!token) return null;
  const session = store.sessions.get(token);
  if (!session) return null;
  return store.users.get(session.userId) || null;
}

export function ensureUserGoals(userId: string) {
  if (!store.goalsByUser.has(userId)) {
    store.goalsByUser.set(userId, new Map());
  }
  return store.goalsByUser.get(userId)!;
}

export function bootstrapGoal(
  userId: string,
  title: string,
  timeline: string,
  description?: string,
): GoalDetail {
  const id = crypto.randomUUID();
  const milestones: Milestone[] = Array.from({ length: 8 }).map((_, i) => ({
    week: i + 1,
    objective: `Milestone ${i + 1} for ${title}`,
    completed: i < 2,
  }));
  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / milestones.length) * 100);
  const goal: GoalDetail = {
    id,
    title,
    description,
    timeline,
    milestones,
    progress,
  };
  const userGoals = ensureUserGoals(userId);
  userGoals.set(id, goal);
  return goal;
}
