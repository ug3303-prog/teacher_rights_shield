import type {
  AnalysisResult,
  DashboardStats,
  Incident,
  IncidentInput,
  IncidentQuickContext,
  IncidentStatus,
  OperationResult,
  ProtectionCenter,
  RuntimeConfig
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function analyzeIncident(payload: IncidentInput) {
  return request<AnalysisResult>("/incident/analyze", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function saveIncident(payload: IncidentInput, analysis: AnalysisResult) {
  return request<Incident>("/incident/save", {
    method: "POST",
    body: JSON.stringify({ ...payload, analysis })
  });
}

export function listIncidents() {
  return request<Incident[]>("/incident/list");
}

export function getDashboard() {
  return request<DashboardStats>("/incident/dashboard");
}

export function getIncident(id: string) {
  return request<Incident>(`/incident/${id}`);
}

export function updateIncidentStatus(id: number, status: IncidentStatus) {
  return request<Incident>(`/incident/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status })
  });
}

export function sendReportEmail(id: number, email: string) {
  return request<{ ok: boolean; message: string }>(`/incident/${id}/email`, {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function deleteIncident(id: number) {
  return request<OperationResult>(`/incident/${id}`, { method: "DELETE" });
}

export function resetIncidents() {
  return request<OperationResult>("/incident/reset", { method: "DELETE" });
}

export function getRuntimeConfig() {
  return request<RuntimeConfig>("/incident/runtime");
}

export function getProtectionCenters() {
  return request<ProtectionCenter[]>("/incident/protection-centers");
}

export function getIncidentQuickContext(id: number) {
  return request<IncidentQuickContext>(`/incident/${id}/quick-context`);
}

export function pdfUrl(path?: string) {
  if (!path) return "#";
  return `${API_BASE.replace(/\/api$/, "")}${path}`;
}
