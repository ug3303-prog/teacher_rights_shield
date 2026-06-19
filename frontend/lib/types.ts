export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type IncidentStatus = "NEW" | "REPORTED" | "IN_REVIEW" | "CLOSED" | "ESCALATED";

export type IncidentInput = {
  occurred_at: string;
  place: string;
  target_type: string;
  complaint_type: string;
  content: string;
  memo?: string;
  emotion: string;
};

export type AnalysisResult = {
  categories: string[];
  category: string;
  risk_level: RiskLevel;
  risk_score: number;
  matched_keywords: string[];
  reasoning: string[];
  risk_reasons: string[];
  recommended_actions: string[];
  summary: string;
  disclaimer: string;
  disclaimer_version: string;
};

export type AuditLog = {
  id: number;
  incident_id?: number;
  action_type: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
};

export type ParentThread = {
  id: number;
  incident_id: number;
  thread_group_id: string;
  parent_name_masked: string;
  created_at: string;
  incident_summary?: string;
  risk_level?: RiskLevel;
  status?: IncidentStatus;
};

export type ProtectionCenter = {
  id: number;
  region: string;
  name: string;
  phone: string;
  website: string;
  support_type: string;
  available_hours: string;
};

export type Incident = IncidentInput & {
  id: number;
  created_at: string;
  ai_category: string;
  risk_level: RiskLevel;
  risk_score: number;
  ai_summary: string;
  risk_reasons: string[];
  action_guide: string[];
  pdf_url?: string;
  pdf_hash?: string;
  disclaimer_version: string;
  status: IncidentStatus;
  deleted_at?: string;
  repeated_pattern_detected: boolean;
  related_history: ParentThread[];
  timeline: AuditLog[];
  recommended_center?: ProtectionCenter;
};

export type DashboardStats = {
  total: number;
  by_risk: Record<string, number>;
  by_category: Record<string, number>;
  recent_reports: Incident[];
  safety_score: number;
  safety_status: string;
  repeated_active_count: number;
  active_count: number;
  closed_count: number;
  high_risk_count: number;
};

export type OperationResult = {
  ok: boolean;
  message: string;
  deleted_count: number;
};

export type RuntimeConfig = {
  app_mode: string;
  samples_enabled: boolean;
};

export type IncidentQuickContext = {
  risk_level: RiskLevel;
  recommended_center_region?: string;
};
