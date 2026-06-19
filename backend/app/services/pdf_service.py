from datetime import datetime
import hashlib
import json
from pathlib import Path
from zoneinfo import ZoneInfo

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from xml.sax.saxutils import escape

from app.core.config import get_settings
from app.models.incident import IncidentLog
from app.schemas.incident import DISCLAIMER_TEXT

FONT_NAME = "NanumGothic"
FONT_PATH = Path(__file__).resolve().parents[1] / "assets" / "fonts" / "NanumGothic-Regular.ttf"


def _safe_text(value: str | None) -> str:
    return escape(value or "-").replace("\n", "<br/>")


def _register_pdf_font() -> None:
    if FONT_NAME in pdfmetrics.getRegisteredFontNames():
        return
    if not FONT_PATH.exists():
        raise FileNotFoundError(f"PDF font not found: {FONT_PATH}")
    pdfmetrics.registerFont(TTFont(FONT_NAME, str(FONT_PATH)))


def calculate_document_hash(incident: IncidentLog, generated_at: str) -> str:
    payload = {
        "incident_id": incident.id,
        "created_at": incident.created_at.isoformat(),
        "occurred_at": incident.occurred_at.isoformat(),
        "place": incident.place,
        "target_type": incident.target_type,
        "parent_name": incident.parent_name,
        "complaint_type": incident.complaint_type,
        "content": incident.content,
        "memo": incident.memo,
        "emotion": incident.emotion,
        "ai_category": incident.ai_category,
        "risk_level": incident.risk_level,
        "risk_score": incident.risk_score,
        "status": incident.status,
        "ai_summary": incident.ai_summary,
        "risk_reasons": incident.risk_reasons,
        "action_guide": incident.action_guide,
        "generated_at": generated_at,
        "disclaimer_version": incident.disclaimer_version,
    }
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def create_incident_pdf(incident: IncidentLog) -> tuple[Path, str]:
    _register_pdf_font()
    settings = get_settings()
    generated_datetime = datetime.now(ZoneInfo("Asia/Seoul"))
    generated_at = generated_datetime.strftime("%Y-%m-%d %H:%M:%S")
    generated_at_korean = generated_datetime.strftime("%Y년 %m월 %d일 %H시 %M분")
    document_hash = calculate_document_hash(incident, generated_at)
    filename = f"민원방패_{incident.id}_{generated_datetime.strftime('%Y%m%d_%H%M%S')}.pdf"
    path: Path = settings.report_dir / filename
    styles = getSampleStyleSheet()
    for style_name in styles.byName:
        styles[style_name].fontName = FONT_NAME

    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = [
        Paragraph("교권보호 도우미 - 민원방패 기록 보고서", styles["Title"]),
        Paragraph(DISCLAIMER_TEXT, styles["Normal"]),
        Spacer(1, 14),
    ]
    rows = [
        ["사건 ID", str(incident.id)],
        ["상태", incident.status],
        ["발생 일시", incident.occurred_at.strftime("%Y-%m-%d %H:%M")],
        ["장소", incident.place],
        ["대상", incident.target_type],
        ["보호자명", incident.parent_name or "미입력"],
        ["민원 유형", incident.complaint_type],
        ["AI 추천 유형", incident.ai_category],
        ["위험도", f"{incident.risk_level} / {incident.risk_score}점"],
    ]
    table = Table(rows, colWidths=[95, 365])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f2efe6")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#17233c")),
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d8d2c3")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(table)
    for title, body in [
        ("입력 원문", incident.content),
        ("첨부 메모", incident.memo),
        ("위험 근거", incident.risk_reasons),
        ("대응 권장사항", incident.action_guide),
        ("AI 요약", incident.ai_summary),
    ]:
        story.extend([Spacer(1, 12), Paragraph(title, styles["Heading2"]), Paragraph(_safe_text(body), styles["BodyText"])])

    story.extend(
        [
            Spacer(1, 18),
            Paragraph("보고서 생성일시", styles["Heading3"]),
            Paragraph(generated_at_korean, styles["BodyText"]),
        ]
    )
    doc.build(story)
    return path, document_hash


def generate_incident_pdf(incident: IncidentLog) -> tuple[str, str]:
    _, document_hash = create_incident_pdf(incident)
    return f"/api/incident/{incident.id}/pdf", document_hash
