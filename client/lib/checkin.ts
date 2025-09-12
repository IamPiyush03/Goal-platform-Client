import { api } from "@/lib/api";
import { CheckinConfig, UpdateCheckinConfigRequest, CheckinRecord, RecordCheckinRequest } from "@shared/api";

export async function getCheckinConfigApi(): Promise<CheckinConfig> {
  return api.get<CheckinConfig>("/checkin/config");
}

export async function updateCheckinConfigApi(body: UpdateCheckinConfigRequest): Promise<CheckinConfig> {
  return api.put<CheckinConfig>("/checkin/config", body);
}

export async function recordCheckinApi(body: RecordCheckinRequest): Promise<CheckinRecord> {
  return api.post<CheckinRecord>("/checkin/record", body);
}

export async function getCheckinHistoryApi(goalId: string): Promise<CheckinRecord[]> {
  return api.get<CheckinRecord[]>(`/checkin/history/${goalId}`);
}

export async function getAllCheckinRecordsApi(): Promise<CheckinRecord[]> {
  return api.get<CheckinRecord[]>("/checkin/records");
}