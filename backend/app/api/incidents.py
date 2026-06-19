import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.incident import IncidentAuditLog, IncidentLog, ParentThread, ProtectionCenter
from app.schemas.incident import (
    DISCLAIMER_VERSION,
    INCIDENT_STATUSES,
    AuditLogResponse,
    DashboardStats,
    EmailReportRequest,
    EmailReportResponse,
    IncidentAnalyzeRequest,
    IncidentResponse,
    IncidentSaveRequest,
    OperationResponse,
    ParentThreadResponse,
    ProtectionCenterResponse,
    RuntimeConfigResponse,
    StatusUpdateRequest,
)
from app.services.ai_provider import build_provider
from app.services.audit import write_audit_log
from app.services.email_service import send_report
from app.services.masking import mask_korean_name, mask_sensitive_text
from app.services.pdf_service import create_incident_pdf, generate_incident_pdf

router = APIRouter(prefix="/incident", tags=["incident"])


def _json_list(value: str) -> list[str]:
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else [str(parsed)]
    except json.JSONDecodeError:
        return [value]


def _masked_parent_name(payload: IncidentSaveRequest) -> str:
    text = f"{payload.content} {payload.memo or ''}"
    labeled = re.search(r"(?:보호자|학부모|민원인|이름)\s*[:：]\s*([가-힣]{2,4})", text)
    contextual = re.search(r"\b([가-힣]{2,4})(?=\s*(?:보호자|학부모|어머니|아버지|님))", text)
    if labeled:
        return mask_korean_name(labeled.group(1))
    if contextual:
        return mask_korean_name(contextual.group(1))
    return "보호자미상"


def _thread_group_id(parent_name_masked: str) -> str:
    return hashlib.sha256(parent_name_masked.encode("utf-8")).hexdigest()[:16]


def _center_for_place(db: Session, place: str) -> ProtectionCenter | None:
    for region in ["서울", "경기", "부산", "대구", "인천"]:
        if region in place:
            center = db.query(ProtectionCenter).filter(ProtectionCenter.region == region).first()
            if center:
                return center
    return db.query(ProtectionCenter).filter(ProtectionCenter.region == "서울").first()


def _related_history(db: Session, incident: IncidentLog) -> list[ParentThreadResponse]:
    thread = db.query(ParentThread).filter(ParentThread.incident_id == incident.id).first()
    if not thread:
        return []
    rows = (
        db.query(ParentThread, IncidentLog)
        .join(IncidentLog, IncidentLog.id == ParentThread.incident_id)
        .filter(
            ParentThread.thread_group_id == thread.thread_group_id,
            IncidentLog.deleted_at.is_(None),
        )
        .order_by(ParentThread.created_at.asc())
        .all()
    )
    return [
        ParentThreadResponse(
            id=item.id,
            incident_id=item.incident_id,
            thread_group_id=item.thread_group_id,
            parent_name_masked=item.parent_name_masked,
            created_at=item.created_at,
            incident_summary=incident_row.ai_summary,
            risk_level=incident_row.risk_level,
            status=incident_row.status,
        )
        for item, incident_row in rows
    ]


def _repeated_pattern_detected(db: Session, incident: IncidentLog) -> bool:
    thread = db.query(ParentThread).filter(ParentThread.incident_id == incident.id).first()
    if not thread:
        return False
    cutoff = datetime.utcnow() - timedelta(days=30)
    count = (
        db.query(ParentThread)
        .join(IncidentLog, IncidentLog.id == ParentThread.incident_id)
        .filter(
            ParentThread.thread_group_id == thread.thread_group_id,
            ParentThread.created_at >= cutoff,
            IncidentLog.deleted_at.is_(None),
        )
        .count()
    )
    return count >= 3


def _timeline(db: Session, incident_id: int) -> list[AuditLogResponse]:
    logs = (
        db.query(IncidentAuditLog)
        .filter(IncidentAuditLog.incident_id == incident_id)
        .order_by(IncidentAuditLog.timestamp.asc())
        .all()
    )
    return [
        AuditLogResponse(
            id=log.id,
            incident_id=log.incident_id,
            action_type=log.action_type,
            timestamp=log.timestamp,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            metadata=log.metadata_json,
        )
        for log in logs
    ]


def _center_response(center: ProtectionCenter | None) -> ProtectionCenterResponse | None:
    return ProtectionCenterResponse.model_validate(center) if center else None


def _remove_incident_pdfs(incident_id: int) -> list[str]:
    report_dir = get_settings().report_dir
    removed: list[str] = []
    for path in report_dir.glob(f"민원방패_{incident_id}_*.pdf"):
        removed.append(path.name)
        path.unlink(missing_ok=True)
    return removed


def _active_incident(db: Session, incident_id: int) -> IncidentLog:
    incident = (
        db.query(IncidentLog)
        .filter(IncidentLog.id == incident_id, IncidentLog.deleted_at.is_(None))
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


def to_response(db: Session, incident: IncidentLog, include_details: bool = False) -> IncidentResponse:
    center = _center_for_place(db, incident.place) if incident.risk_level == "HIGH" else None
    return IncidentResponse(
        id=incident.id,
        created_at=incident.created_at,
        occurred_at=incident.occurred_at,
        place=incident.place,
        target_type=incident.target_type,
        complaint_type=incident.complaint_type,
        content=incident.content,
        memo=incident.memo,
        emotion=incident.emotion,
        ai_category=incident.ai_category,
        risk_level=incident.risk_level,
        risk_score=incident.risk_score,
        ai_summary=incident.ai_summary,
        risk_reasons=_json_list(incident.risk_reasons),
        action_guide=_json_list(incident.action_guide),
        pdf_url=incident.pdf_url,
        pdf_hash=incident.pdf_hash,
        disclaimer_version=incident.disclaimer_version,
        status=incident.status,
        deleted_at=incident.deleted_at,
        repeated_pattern_detected=_repeated_pattern_detected(db, incident),
        related_history=_related_history(db, incident) if include_details else [],
        timeline=_timeline(db, incident.id) if include_details else [],
        recommended_center=_center_response(center),
    )


def safety_score_for(incidents: list[IncidentLog]) -> tuple[int, str]:
    score = 100
    for incident in incidents:
        score -= {"LOW": 5, "MEDIUM": 10, "HIGH": 20}.get(incident.risk_level, 0)
    score = max(0, min(score, 100))
    if score >= 90:
        return score, "안정"
    if score >= 70:
        return score, "주의"
    return score, "위험"


@router.post("/analyze")
async def analyze_incident(payload: IncidentAnalyzeRequest, request: Request, db: Session = Depends(get_db)):
    provider = build_provider(get_settings())
    result = await provider.analyze(payload)
    write_audit_log(db, request, "analyze")
    db.commit()
    return result


@router.post("/save", response_model=IncidentResponse)
async def save_incident(payload: IncidentSaveRequest, request: Request, db: Session = Depends(get_db)):
    analysis = payload.analysis or await build_provider(get_settings()).analyze(
        IncidentAnalyzeRequest(**payload.model_dump(exclude={"analysis"}))
    )
    incident = IncidentLog(
        occurred_at=payload.occurred_at,
        place=mask_sensitive_text(payload.place) or payload.place,
        target_type=payload.target_type,
        complaint_type=payload.complaint_type,
        content=mask_sensitive_text(payload.content) or payload.content,
        memo=mask_sensitive_text(payload.memo),
        emotion=payload.emotion,
        ai_category=", ".join(analysis.categories),
        risk_level=analysis.risk_level,
        risk_score=analysis.risk_score,
        ai_summary=analysis.summary,
        risk_reasons=json.dumps(analysis.reasoning, ensure_ascii=False),
        action_guide=json.dumps(analysis.recommended_actions, ensure_ascii=False),
        disclaimer_version=analysis.disclaimer_version or DISCLAIMER_VERSION,
        status="NEW",
    )
    db.add(incident)
    db.flush()
    parent_name = _masked_parent_name(payload)
    if parent_name == "보호자미상":
        parent_name = f"보호자미상-{incident.id}"
    db.add(
        ParentThread(
            incident_id=incident.id,
            parent_name_masked=parent_name,
            thread_group_id=_thread_group_id(parent_name),
        )
    )
    write_audit_log(db, request, "create", incident.id)
    incident.pdf_url, incident.pdf_hash = generate_incident_pdf(incident)
    write_audit_log(db, request, "pdf_generate", incident.id)
    db.commit()
    db.refresh(incident)
    return to_response(db, incident, include_details=True)


@router.get("/list", response_model=list[IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    incidents = (
        db.query(IncidentLog)
        .filter(IncidentLog.deleted_at.is_(None))
        .order_by(IncidentLog.created_at.desc())
        .all()
    )
    return [to_response(db, item) for item in incidents]


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    incidents = (
        db.query(IncidentLog)
        .filter(IncidentLog.deleted_at.is_(None))
        .order_by(IncidentLog.created_at.desc())
        .all()
    )
    by_risk = Counter(item.risk_level for item in incidents)
    by_category = Counter(category.strip() for item in incidents for category in item.ai_category.split(","))
    recent_cutoff = datetime.utcnow() - timedelta(days=30)
    recent_incidents = [item for item in incidents if item.created_at >= recent_cutoff]
    safety_score, safety_status = safety_score_for(recent_incidents)

    repeated_groups = (
        db.query(ParentThread.thread_group_id)
        .join(IncidentLog, IncidentLog.id == ParentThread.incident_id)
        .filter(
            ParentThread.created_at >= recent_cutoff,
            IncidentLog.deleted_at.is_(None),
        )
        .group_by(ParentThread.thread_group_id)
        .having(func.count(ParentThread.id) >= 3)
        .all()
    )
    repeated_active_count = len(repeated_groups)

    active_statuses = {"NEW", "REPORTED", "IN_REVIEW", "ESCALATED"}
    return DashboardStats(
        total=len(incidents),
        by_risk=dict(by_risk),
        by_category=dict(by_category),
        recent_reports=[to_response(db, item) for item in incidents[:4]],
        safety_score=safety_score,
        safety_status=safety_status,
        repeated_active_count=repeated_active_count,
        active_count=sum(1 for item in incidents if item.status in active_statuses),
        closed_count=sum(1 for item in incidents if item.status == "CLOSED"),
        high_risk_count=by_risk.get("HIGH", 0),
    )


@router.get("/runtime", response_model=RuntimeConfigResponse)
def runtime_config():
    settings = get_settings()
    return RuntimeConfigResponse(app_mode=settings.app_mode, samples_enabled=settings.is_demo)


@router.get("/protection-centers", response_model=list[ProtectionCenterResponse])
def list_protection_centers(db: Session = Depends(get_db)):
    centers = db.query(ProtectionCenter).order_by(ProtectionCenter.id.asc()).all()
    return [ProtectionCenterResponse.model_validate(center) for center in centers]


@router.get("/{incident_id}/quick-context")
def incident_quick_context(incident_id: int, db: Session = Depends(get_db)):
    incident = _active_incident(db, incident_id)
    center = _center_for_place(db, incident.place) if incident.risk_level == "HIGH" else None
    return {
        "risk_level": incident.risk_level,
        "recommended_center_region": center.region if center else None,
    }


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = _active_incident(db, incident_id)
    return to_response(db, incident, include_details=True)


@router.post("/{incident_id}/view", response_model=OperationResponse)
def record_incident_view(incident_id: int, request: Request, db: Session = Depends(get_db)):
    incident = _active_incident(db, incident_id)
    write_audit_log(db, request, "view", incident.id)
    db.commit()
    return OperationResponse(ok=True, message="조회 기록이 저장되었습니다.")


@router.post("/{incident_id}/status", response_model=IncidentResponse)
def update_status(incident_id: int, payload: StatusUpdateRequest, request: Request, db: Session = Depends(get_db)):
    if payload.status not in INCIDENT_STATUSES:
        raise HTTPException(status_code=400, detail="Unsupported status")
    incident = _active_incident(db, incident_id)
    previous_status = incident.status
    incident.status = payload.status
    write_audit_log(
        db,
        request,
        "status_change",
        incident.id,
        metadata={"from": previous_status, "to": payload.status},
    )
    db.commit()
    db.refresh(incident)
    return to_response(db, incident, include_details=True)


@router.post("/{incident_id}/email", response_model=EmailReportResponse)
def email_report(incident_id: int, payload: EmailReportRequest, request: Request, db: Session = Depends(get_db)):
    incident = _active_incident(db, incident_id)
    file_path, document_hash = create_incident_pdf(incident)
    incident.pdf_hash = document_hash
    incident.pdf_url = f"/api/incident/{incident.id}/pdf"
    result = send_report(payload.email, file_path)
    write_audit_log(
        db,
        request,
        "email_send",
        incident.id,
        metadata={"recipient": payload.email, "pdf": file_path.name},
    )
    db.commit()
    return EmailReportResponse(ok=bool(result["ok"]), message=str(result["message"]))


@router.get("/{incident_id}/pdf")
def get_pdf(incident_id: int, request: Request, db: Session = Depends(get_db)):
    incident = _active_incident(db, incident_id)
    if not incident.pdf_url or not incident.pdf_hash:
        incident.pdf_url, incident.pdf_hash = generate_incident_pdf(incident)
    file_path, document_hash = create_incident_pdf(incident)
    incident.pdf_hash = document_hash
    write_audit_log(
        db,
        request,
        "pdf_generate",
        incident.id,
        metadata={"pdf": file_path.name},
    )
    db.commit()
    return FileResponse(file_path, media_type="application/pdf", filename=file_path.name)


@router.delete("/reset", response_model=OperationResponse)
def reset_incidents(request: Request, db: Session = Depends(get_db)):
    settings = get_settings()
    if not settings.is_demo:
        raise HTTPException(status_code=403, detail="Record reset is only available in demo mode")
    deleted_count = db.query(IncidentLog).count()
    db.query(ParentThread).delete(synchronize_session=False)
    db.query(IncidentAuditLog).delete(synchronize_session=False)
    db.query(IncidentLog).delete(synchronize_session=False)
    for path in settings.report_dir.glob("*.pdf"):
        path.unlink(missing_ok=True)
    write_audit_log(
        db,
        request,
        "delete",
        metadata={"reset": True, "deleted_count": deleted_count},
    )
    db.commit()
    return OperationResponse(ok=True, message="모든 데모 기록이 삭제되었습니다.", deleted_count=deleted_count)


@router.delete("/{incident_id}", response_model=OperationResponse)
def delete_incident(incident_id: int, request: Request, db: Session = Depends(get_db)):
    incident = _active_incident(db, incident_id)
    removed_pdf_files = _remove_incident_pdfs(incident_id)
    incident.deleted_at = datetime.utcnow()
    write_audit_log(
        db,
        request,
        "delete",
        incident.id,
        metadata={
            "deleted_at": incident.deleted_at.isoformat(),
            "pdf": removed_pdf_files[0] if len(removed_pdf_files) == 1 else removed_pdf_files,
        },
    )
    db.commit()
    return OperationResponse(ok=True, message="기록이 삭제되었습니다.", deleted_count=1)
