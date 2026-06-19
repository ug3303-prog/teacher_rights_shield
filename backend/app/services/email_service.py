from pathlib import Path


def send_report(email: str, pdf: Path | str) -> dict[str, str | bool]:
    return {
        "ok": True,
        "message": f"SMTP mock: {email} 주소로 보고서 전송을 기록했습니다.",
        "pdf": str(pdf),
    }
