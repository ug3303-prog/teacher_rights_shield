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

function normalizeApiBase(value: string) {
  let normalized = value.trim().replace(/\/+$/, "");
  normalized = normalized.replace(/(?:\/api)+$/i, "/api");
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
}

const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api"
);

function apiUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "").replace(/^api\/+/i, "");
  return `${API_BASE}/${normalizedPath}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path);
  const method = init?.method ?? "GET";
  const isBrowser = typeof window !== "undefined";
  if (isBrowser) {
    console.info(`[민원방패 API 요청] ${method} ${url}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });
  } catch (error) {
    if (!isBrowser) throw error;
    console.error(`[민원방패 API 네트워크 오류] ${method} ${url}`, error);
    throw new Error(`네트워크 연결 실패 (${url})`);
  }

  const responseBody = await response.text();
  if (isBrowser) {
    console.info(`[민원방패 API 응답] ${method} ${url} -> ${response.status}`);
  }

  if (!response.ok) {
    if (isBrowser) {
      console.error(
        `[민원방패 API 오류 응답] ${method} ${url} -> ${response.status}`,
        responseBody
      );
    }
    throw new Error(
      `HTTP ${response.status}: ${responseBody || response.statusText || "응답 본문 없음"}`
    );
  }

  return (responseBody ? JSON.parse(responseBody) : undefined) as T;
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

export function recordIncidentView(id: number) {
  return request<OperationResult>(`/incident/${id}/view`, { method: "POST" });
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
  return `${API_BASE.replace(/\/api$/i, "")}/${path.replace(/^\/+/, "")}`;
}
