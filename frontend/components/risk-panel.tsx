import { AlertTriangle, CheckCircle2, Download, FileWarning, ShieldAlert } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { guideFor, riskLabel } from "@/lib/utils";
import { Badge, Card } from "@/components/ui";

export function RiskPanel({ analysis }: { analysis: AnalysisResult }) {
  const tone = analysis.risk_level === "HIGH" ? "high" : analysis.risk_level === "MEDIUM" ? "medium" : "low";
  const Icon = analysis.risk_level === "HIGH" ? AlertTriangle : analysis.risk_level === "MEDIUM" ? FileWarning : CheckCircle2;

  return (
    <Card className="p-5">
      {analysis.risk_level === "HIGH" && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">고위험 민원입니다. 즉시 관리자 공유를 권장합니다.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-red-700 px-3 py-2 text-xs font-semibold text-white">관리자 공유하기</span>
                <button
                  type="button"
                  disabled
                  title="먼저 기록을 저장해야 PDF 생성이 가능합니다."
                  className="inline-flex cursor-not-allowed items-center gap-1 rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-400 opacity-70"
                >
                  <Download className="h-3.5 w-3.5" /> PDF 바로 저장
                </button>
                <span className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-700">보호센터 문의 안내</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">AI 위험도 분석</p>
          <div className="mt-2 flex items-center gap-2">
            <Icon className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-bold text-navy">{riskLabel(analysis.risk_level)}</h2>
            <Badge tone={tone}>{analysis.risk_score}점</Badge>
          </div>
        </div>
        <Badge tone={tone}>{analysis.categories.join(" / ")}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{analysis.summary}</p>
      {analysis.matched_keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.matched_keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-slate-700">
              {keyword}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold text-navy">위험 근거</h3>
          <ul className="mt-2 grid gap-2 text-sm text-slate-700">
            {analysis.reasoning.map((reason) => <li key={reason}>- {reason}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-navy">대응 가이드</h3>
          <p className="mt-2 text-sm font-semibold text-gold">{guideFor(analysis.risk_level)}</p>
          <ul className="mt-2 grid gap-2 text-sm text-slate-700">
            {analysis.recommended_actions.map((action) => <li key={action}>- {action}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-5 rounded-md border border-line bg-paper px-3 py-2 text-xs text-slate-600">
        {analysis.disclaimer} 고지 버전: {analysis.disclaimer_version}
      </p>
    </Card>
  );
}
