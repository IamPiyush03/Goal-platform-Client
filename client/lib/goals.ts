import { apiFetch } from "@/lib/api";
import type { CreateGoalRequest, CreateGoalResponse, GetGoalsResponse, GoalDetail, ProgressResponse, ChatRequest, ChatResponse } from "@shared/api";

export function createGoalApi(body: CreateGoalRequest) {
  return apiFetch<CreateGoalResponse>("/goals", { method: "POST", body: JSON.stringify(body) });
}

export function listGoalsApi() {
  return apiFetch<GetGoalsResponse>("/goals");
}

function isValidId(id: string | undefined): id is string {
  return !!id && id !== 'undefined' && id !== 'null';
}

export function getGoalApi(id: string) {
  if (!isValidId(id)) {
    return Promise.reject(new Error('Invalid goal ID'));
  }
  return apiFetch<GoalDetail>(`/goals/${id}`);
}

export function deleteGoalApi(id: string) {
  if (!isValidId(id)) {
    return Promise.reject(new Error('Invalid goal ID'));
  }
  return apiFetch<{ ok: boolean }>(`/goals/${id}`, { method: "DELETE" });
}

export function toggleMilestoneApi(id: string, week: number, completed: boolean) {
  if (!isValidId(id)) {
    return Promise.reject(new Error('Invalid goal ID'));
  }
  return apiFetch<GoalDetail>(`/goals/${id}/milestones`, { 
    method: "PATCH", 
    body: JSON.stringify({ week, completed }) 
  });
}

export function chatApi(body: ChatRequest) {
  return apiFetch<ChatResponse>("/chat", { 
    method: "POST", 
    body: JSON.stringify(body) 
  });
}

export function getProgressApi(goalId: string) {
  if (!isValidId(goalId)) {
    return Promise.reject(new Error('Invalid goal ID'));
  }
  return apiFetch<ProgressResponse>(`/progress/${goalId}`);
}
