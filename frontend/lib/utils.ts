import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function riskLabel(level: string) {
  return level === "HIGH" ? "긴급" : level === "MEDIUM" ? "주의" : "낮음";
}

export function guideFor(level: string) {
  if (level === "HIGH") return "즉시 관리자 보고 + 교육청 보호센터 문의 + 법률 검토";
  if (level === "MEDIUM") return "관리자 공유 + 민원대응팀 보고";
  return "기록 보관 권장";
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (part: number) => String(part).padStart(2, "0");

  return [
    `${koreaTime.getUTCFullYear()}.`,
    `${pad(koreaTime.getUTCMonth() + 1)}.`,
    `${pad(koreaTime.getUTCDate())}.`,
    `${pad(koreaTime.getUTCHours())}:${pad(koreaTime.getUTCMinutes())}:${pad(koreaTime.getUTCSeconds())}`
  ].join(" ");
}
