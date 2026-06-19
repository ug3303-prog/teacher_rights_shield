from datetime import datetime
from pydantic import BaseModel, Field


DISCLAIMER_VERSION = "v1.0"
DISCLAIMER_TEXT = "본 결과는 참고용이며 법적 판단이 아닙니다."
INCIDENT_STATUSES = {"NEW", "REPORTED", "IN_REVIEW", "CLOSED", "ESCALATED"}


class IncidentBase(BaseModel):
    occurred_at: datetime
    place: str = Field(min_length=1, max_length=120)
    target_type: str
    complaint_type: str
    content: str = Field(min_length=10)
    memo: str | None = None
    emotion: str


class AnalysisResult(BaseModel):
    categories: list[str]
    category: str
    risk_level: str
    risk_score: int
    matched_keywords: list[str] = []
    reasoning: list[str]
    risk_reasons: list[str]
    recommended_actions: list[str]
    summary: str
    disclaimer: str = DISCLAIMER_TEXT
    disclaimer_version: str = DISCLAIMER_VERSION


class IncidentAnalyzeRequest(IncidentBase):
    pass


class IncidentSaveRequest(IncidentBase):
    analysis: AnalysisResult | None = None


class AuditLogResponse(BaseModel):
    id: int
    incident_id: int | None
    action_type: str
    timestamp: datetime
    ip_address: str | None = None
    user_agent: str | None = None
    metadata: dict | None = None

    model_config = {"from_attributes": True}


class ParentThreadResponse(BaseModel):
    id: int
    incident_id: int
    thread_group_id: str
    parent_name_masked: str
    created_at: datetime
    incident_summary: str | None = None
    risk_level: str | None = None
    status: str | None = None

    model_config = {"from_attributes": True}


class ProtectionCenterResponse(BaseModel):
    id: int
    region: str
    name: str
    phone: str
    website: str
    support_type: str
    available_hours: str

    model_config = {"from_attributes": True}


class IncidentResponse(IncidentBase):
    id: int
    created_at: datetime
    ai_category: str
    risk_level: str
    risk_score: int
    ai_summary: str
    risk_reasons: list[str]
    action_guide: list[str]
    pdf_url: str | None = None
    pdf_hash: str | None = None
    disclaimer_version: str = DISCLAIMER_VERSION
    status: str = "NEW"
    deleted_at: datetime | None = None
    repeated_pattern_detected: bool = False
    related_history: list[ParentThreadResponse] = []
    timeline: list[AuditLogResponse] = []
    recommended_center: ProtectionCenterResponse | None = None

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total: int
    by_risk: dict[str, int]
    by_category: dict[str, int]
    recent_reports: list[IncidentResponse]
    safety_score: int
    safety_status: str
    repeated_active_count: int
    active_count: int
    closed_count: int
    high_risk_count: int


class StatusUpdateRequest(BaseModel):
    status: str


class EmailReportRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class EmailReportResponse(BaseModel):
    ok: bool
    message: str


class OperationResponse(BaseModel):
    ok: bool
    message: str
    deleted_count: int = 0


class RuntimeConfigResponse(BaseModel):
    app_mode: str
    samples_enabled: bool
