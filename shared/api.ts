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
  type?: 'chat' | 'learning_module' | 'practice_problem'; // Added optional type field
}
export interface ChatResponse {
  reply: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

// Progress
export interface ProgressResponse {
  completion: number; // 0-100
  velocity: string; // e.g., "2 modules/week"
  summary: string;
  progress: number; // Alias for compatibility
  milestonesCompleted: number;
  totalMilestones: number;
  lastUpdated: string;
}

// Check-in System
export interface CheckinConfig {
  userId: string;
  interval: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM
  remindersEnabled: boolean;
  lastCheckin?: string; // ISO date string
  nextCheckin?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCheckinConfigRequest {
  interval?: 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM
  remindersEnabled?: boolean;
}

export interface CheckinRecord {
  _id: string;
  userId: string;
  goalId: string | { _id: string; title: string }; // Can be string or populated object
  checkinDate: string; // ISO date string
  mood?: string;
  notes?: string;
  progressUpdate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecordCheckinRequest {
  goalId: string;
  mood?: string;
  notes?: string;
  progressUpdate?: number;
}

export type CheckinHistoryResponse = CheckinRecord[];

// Example response type for /api/demo (kept for reference)
export interface DemoResponse {
  message: string;
}
