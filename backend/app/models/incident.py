from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class IncidentLog(Base):
    __tablename__ = "incident_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    place: Mapped[str] = mapped_column(String(120), nullable=False)
    target_type: Mapped[str] = mapped_column(String(40), nullable=False)
    parent_name: Mapped[Optional[str]] = mapped_column(String(80), nullable=True, index=True)
    complaint_type: Mapped[str] = mapped_column(String(80), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    memo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emotion: Mapped[str] = mapped_column(String(40), nullable=False)
    ai_category: Mapped[str] = mapped_column(String(120), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_summary: Mapped[str] = mapped_column(Text, nullable=False)
    risk_reasons: Mapped[str] = mapped_column(Text, nullable=False)
    action_guide: Mapped[str] = mapped_column(Text, nullable=False)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(240), nullable=True)
    pdf_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    disclaimer_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="NEW", nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)

    audit_logs: Mapped[list["IncidentAuditLog"]] = relationship(back_populates="incident")
    parent_threads: Mapped[list["ParentThread"]] = relationship(back_populates="incident")


class IncidentAuditLog(Base):
    __tablename__ = "incident_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[Optional[int]] = mapped_column(ForeignKey("incident_logs.id"), nullable=True, index=True)
    action_type: Mapped[str] = mapped_column(String(30), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(260), nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)

    incident: Mapped[Optional["IncidentLog"]] = relationship(back_populates="audit_logs")


class MembershipPlan(Base):
    __tablename__ = "membership_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    monthly_price: Mapped[int] = mapped_column(Integer, nullable=False)
    max_reports: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class ParentThread(Base):
    __tablename__ = "parent_threads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incident_logs.id"), nullable=False, index=True)
    thread_group_id: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    parent_name_masked: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    incident: Mapped["IncidentLog"] = relationship(back_populates="parent_threads")


class ProtectionCenter(Base):
    __tablename__ = "protection_centers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    region: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    website: Mapped[str] = mapped_column(String(240), nullable=False)
    support_type: Mapped[str] = mapped_column(String(120), nullable=False)
    available_hours: Mapped[str] = mapped_column(String(40), default="09:00~18:00", nullable=False)
