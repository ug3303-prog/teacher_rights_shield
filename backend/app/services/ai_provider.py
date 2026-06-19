from abc import ABC, abstractmethod

from app.core.config import Settings
from app.schemas.incident import AnalysisResult, IncidentAnalyzeRequest


COMPLAINT_TYPES = [
    "부당 요구형",
    "반복형",
    "시간 지연형",
    "폭언/폭력형",
    "스토킹형",
    "신상 공개형",
    "명예훼손형",
    "협박형",
]

KEYWORD_WEIGHTS = {
    "고소": 30,
    "신고": 20,
    "교육청": 15,
    "언론": 20,
    "찾아가겠다": 25,
    "학교로 가겠다": 25,
    "SNS 공개": 35,
    "인터넷 올리겠다": 35,
    "죽여": 50,
    "협박": 40,
    "녹음했다": 15,
    "증거 있다": 20,
    "민원 넣겠다": 20,
    "담임 바꿔라": 25,
}

CATEGORY_KEYWORDS = {
    "협박형": ["협박", "죽여", "찾아가겠다", "학교로 가겠다", "가만두지", "위협"],
    "신상 공개형": ["SNS 공개", "인터넷 올리겠다", "신상", "주소", "전화번호", "사진", "공개"],
    "폭언/폭력형": ["욕설", "폭언", "고함", "소리", "멱살", "때리", "폭력"],
    "반복형": ["반복", "계속", "매일", "수차례", "여러 번", "지속", "민원 넣겠다"],
    "스토킹형": ["따라", "기다리", "퇴근길", "집 앞", "감시", "찾아가겠다"],
    "명예훼손형": ["허위", "소문", "비방", "명예", "언론", "게시판", "커뮤니티"],
    "시간 지연형": ["밤", "새벽", "업무시간 외", "장시간", "즉시 답", "지연"],
    "부당 요구형": ["부당", "성적", "생활기록부", "특혜", "강요", "담임 바꿔라"],
}

COMPLAINT_TYPE_WEIGHTS = {
    "협박형": 22,
    "폭언/폭력형": 18,
    "신상 공개형": 18,
    "스토킹형": 18,
    "명예훼손형": 10,
    "반복형": 8,
    "부당 요구형": 6,
}


class AIProvider(ABC):
    @abstractmethod
    async def analyze(self, payload: IncidentAnalyzeRequest) -> AnalysisResult:
        raise NotImplementedError


class LocalRuleProvider(AIProvider):
    async def analyze(self, payload: IncidentAnalyzeRequest) -> AnalysisResult:
        text = f"{payload.complaint_type} {payload.content} {payload.memo or ''} {payload.emotion}"
        normalized_text = text.lower()

        matched_keywords: list[str] = []
        score = 0
        for keyword, weight in KEYWORD_WEIGHTS.items():
            if keyword.lower() in normalized_text:
                matched_keywords.append(keyword)
                score += weight

        score += min(len(payload.content) // 45, 10)
        score += COMPLAINT_TYPE_WEIGHTS.get(payload.complaint_type, 0)
        score += {"협박": 20, "압박": 12, "불안": 8, "일반": 0}.get(payload.emotion, 4)
        score = max(0, min(score, 100))

        category_scores: dict[str, int] = {}
        for category, words in CATEGORY_KEYWORDS.items():
            category_scores[category] = sum(1 for word in words if word.lower() in normalized_text)
        selected = [
            name for name, count in sorted(category_scores.items(), key=lambda item: item[1], reverse=True) if count > 0
        ][:2]
        if not selected:
            selected = [payload.complaint_type if payload.complaint_type in COMPLAINT_TYPES else "부당 요구형"]

        if score >= 70:
            level = "HIGH"
            actions = ["즉시 관리자 공유", "PDF 보고서 저장", "교육활동보호센터 문의 안내", "법률 상담 검토 권장"]
        elif score >= 40:
            level = "MEDIUM"
            actions = ["관리자 공유 권장", "민원대응팀 전달 권장", "추가 접촉 내용 시간순 기록"]
        else:
            level = "LOW"
            actions = ["기록 보관 권장", "동일 요구 반복 여부 관찰", "필요 시 관리자에게 경과 공유"]

        reasoning = [
            f"명시적 위험 키워드 {len(matched_keywords)}개가 탐지되었습니다.",
            f"민원 유형 '{payload.complaint_type}'과 감정 상태 '{payload.emotion}'을 가중치에 반영했습니다.",
            "0~39 LOW, 40~69 MEDIUM, 70~100 HIGH 기준으로 최종 위험도를 산정했습니다.",
        ]
        if matched_keywords:
            reasoning.insert(1, f"탐지 키워드: {', '.join(matched_keywords)}")

        return AnalysisResult(
            categories=selected,
            category=selected[0],
            risk_level=level,
            risk_score=score,
            matched_keywords=matched_keywords,
            reasoning=reasoning,
            risk_reasons=reasoning,
            recommended_actions=actions,
            summary=f"{payload.target_type} 관련 민원이 {payload.place}에서 발생한 기록입니다. 현재 위험도는 {level}로 분류됩니다.",
        )


class OpenAIProvider(LocalRuleProvider):
    async def analyze(self, payload: IncidentAnalyzeRequest) -> AnalysisResult:
        return await super().analyze(payload)


class AnthropicProvider(LocalRuleProvider):
    async def analyze(self, payload: IncidentAnalyzeRequest) -> AnalysisResult:
        return await super().analyze(payload)


def build_provider(settings: Settings) -> AIProvider:
    provider = settings.ai_provider.lower()
    if provider == "openai":
        return OpenAIProvider()
    if provider == "anthropic":
        return AnthropicProvider()
    return LocalRuleProvider()
