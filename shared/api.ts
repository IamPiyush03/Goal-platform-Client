/**
 * Shared types for the Goal Achievement Platform
 */

// Auth
export interface SignupRequest {
  email: string;
  password: string;
}
export interface SignupResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
}

// Goals
export interface CreateGoalRequest {
  title: string;
  description?: string;
  timeline: string; // e.g., "3 months"
}

export interface Milestone {
  week: number;
  objective: string;
  completed?: boolean;
}

export interface CreateGoalResponse {
  goalId: string;
  milestones: Milestone[];
}

export interface GoalListItem {
  id: string;
  title: string;
  progress: number; // 0-100
}

export type GetGoalsResponse = GoalListItem[];

export interface GoalDetail extends GoalListItem {
  description?: string;
  timeline: string;
  milestones: Milestone[];
}

// Chat
export interface ChatRequest {
  goalId: string;
  message: string;
}
export interface ChatResponse {
  reply: string;
}

// Progress
export interface ProgressResponse {
  completion: number; // 0-100
  velocity: string; // e.g., "2 modules/week"
  summary: string;
}

// Example response type for /api/demo (kept for reference)
export interface DemoResponse {
  message: string;
}
