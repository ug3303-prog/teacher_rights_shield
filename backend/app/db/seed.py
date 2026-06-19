from datetime import datetime, timedelta
import json

from app.db.session import SessionLocal
from app.models.incident import IncidentLog, MembershipPlan, ProtectionCenter


def seed_reference_data():
    db = SessionLocal()
    try:
        if db.query(MembershipPlan).count() == 0:
            db.add_all(
                [
                    MembershipPlan(name="Free", monthly_price=0, max_reports=5, ai_enabled=True),
                    MembershipPlan(name="Basic", monthly_price=9900, max_reports=50, ai_enabled=True),
                    MembershipPlan(name="Pro", monthly_price=29000, max_reports=300, ai_enabled=True),
                ]
            )

        if db.query(ProtectionCenter).count() == 0:
            db.add_all(
                [
                    ProtectionCenter(region="서울", name="서울특별시교육청 교육활동보호센터", phone="02-399-0000", website="https://www.sen.go.kr", support_type="상담 및 사안 지원", available_hours="09:00~18:00"),
                    ProtectionCenter(region="경기", name="경기도교육청 교육활동보호센터", phone="031-249-0000", website="https://www.goe.go.kr", support_type="교육활동 침해 상담", available_hours="09:00~18:00"),
                    ProtectionCenter(region="부산", name="부산광역시교육청 교육활동보호센터", phone="051-860-0000", website="https://www.pen.go.kr", support_type="교원 보호 상담", available_hours="09:00~18:00"),
                    ProtectionCenter(region="대구", name="대구광역시교육청 교육활동보호센터", phone="053-231-0000", website="https://www.dge.go.kr", support_type="사안 접수 및 상담", available_hours="09:00~18:00"),
                    ProtectionCenter(region="인천", name="인천광역시교육청 교육활동보호센터", phone="032-420-0000", website="https://www.ice.go.kr", support_type="교육활동 보호 지원", available_hours="09:00~18:00"),
                ]
            )
        db.commit()
    finally:
        db.close()


def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(IncidentLog).filter(IncidentLog.deleted_at.is_(None)).count() == 0:
            samples = [
                ("보호자", "반복형", "보호자가 업무시간 이후에도 같은 요구를 여러 번 반복하며 민원 넣겠다고 말했습니다.", "MEDIUM", 58),
                ("보호자", "협박형", "민원인이 학교로 가겠다며 고소와 SNS 공개를 언급했습니다.", "HIGH", 86),
                ("학생", "부당 요구형", "평가 결과 변경과 담임 교체를 요구하는 연락이 있었습니다.", "LOW", 32),
            ]
            for idx, (target, category, content, level, score) in enumerate(samples):
                db.add(
                    IncidentLog(
                        occurred_at=datetime.utcnow() - timedelta(days=idx + 1),
                        place="교무실",
                        target_type=target,
                        complaint_type=category,
                        content=content,
                        memo="데모 데이터",
                        emotion="압박" if level != "LOW" else "일반",
                        ai_category=category,
                        risk_level=level,
                        risk_score=score,
                        ai_summary=f"{category} 성격의 민원 기록입니다.",
                        risk_reasons=json.dumps(
                            ["반복성 또는 압박 표현이 확인됩니다.", "업무 대응 부담이 있습니다.", "관리자 공유 필요성을 검토해야 합니다."],
                            ensure_ascii=False,
                        ),
                        action_guide=json.dumps(["관리자 공유 권장", "기록 보관 권장"], ensure_ascii=False),
                        disclaimer_version="v1.0",
                        status="NEW",
                    )
                )
        db.commit()
    finally:
        db.close()
