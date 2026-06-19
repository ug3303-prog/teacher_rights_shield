from fastapi import Request
from sqlalchemy.orm import Session

from app.models.incident import IncidentAuditLog


ALLOWED_ACTION_TYPES = {
    "create",
    "update",
    "analyze",
    "pdf_generate",
    "view",
    "status_change",
    "email_send",
    "delete",
}


def write_audit_log(
    db: Session,
    request: Request,
    action_type: str,
    incident_id: int | None = None,
    metadata: dict | None = None,
) -> None:
    if action_type not in ALLOWED_ACTION_TYPES:
        raise ValueError(f"Unsupported audit action: {action_type}")

    db.add(
        IncidentAuditLog(
            incident_id=incident_id,
            action_type=action_type,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata_json=metadata,
        )
    )
