import re


PHONE_PATTERN = re.compile(r"(01[016789])[-.\s]?(\d{3,4})[-.\s]?(\d{4})")
ADDRESS_PATTERN = re.compile(
    r"([가-힣A-Za-z0-9]+(?:시|도)\s+[가-힣A-Za-z0-9]+(?:구|군|시)\s+[가-힣A-Za-z0-9\s\-]+(?:로|길)\s*)\d+"
)
NAME_CONTEXT_PATTERN = re.compile(r"\b([가-힣]{2,4})(?=(?:\s*)(학생|보호자|학부모|어머니|아버지|부친|모친|님))")
LABELED_NAME_PATTERN = re.compile(r"((?:학생|보호자|학부모|민원인|이름)\s*[:：]\s*)([가-힣]{2,4})")


def mask_korean_name(name: str) -> str:
    if len(name) <= 1:
        return name
    return name[0] + "*" * (len(name) - 1)


def mask_sensitive_text(value: str | None) -> str | None:
    if value is None:
        return None

    masked = PHONE_PATTERN.sub(r"\1-****-\3", value)
    masked = ADDRESS_PATTERN.sub(r"\1**", masked)
    masked = LABELED_NAME_PATTERN.sub(lambda match: f"{match.group(1)}{mask_korean_name(match.group(2))}", masked)
    masked = NAME_CONTEXT_PATTERN.sub(lambda match: mask_korean_name(match.group(1)), masked)
    return masked
