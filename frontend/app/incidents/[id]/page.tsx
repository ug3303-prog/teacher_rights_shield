import Link from "next/link";
import { Clock3, Download, MapPin, Repeat2, ShieldAlert } from "lucide-react";
import { getIncident, pdfUrl } from "@/lib/api";
import { EmailReportForm } from "@/components/email-report-form";
import { HighRiskActions } from "@/components/high-risk-actions";
import { ShareSummary } from "@/components/share-summary";
import { StatusControl } from "@/components/status-control";
import { DeleteIncidentButton } from "@/components/delete-incident-button";
import { IncidentViewAudit } from "@/components/incident-view-audit";
import { Badge, Card } from "@/components/ui";
import { formatDateTime, guideFor, riskLabel } from "@/lib/utils";
import { getAppMode } from "@/lib/app-mode";

const actionLabels: Record<string, string> = {
  create: "생성",
  update: "수정",
  analyze: "분석",
  pdf_generate: "PDF 생성",
  view: "조회",
  status_change: "상태 변경",
  email_send: "이메일 전송",
  delete: "삭제"
};

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = await getIncident(id);
  const tone = incident.risk_level === "HIGH" ? "high" : incident.risk_level === "MEDIUM" ? "medium" : "low";
  const demoMode = getAppMode() === "demo";

  return (
    <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6">
      <IncidentViewAudit incidentId={incident.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gold">분석 결과</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">기록 #{incident.id}</h1>
            <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-navy">{incident.status}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={pdfUrl(incident.pdf_url)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
            <Download className="h-4 w-4" /> PDF 바로 저장
          </a>
          <DeleteIncidentButton incidentId={incident.id} />
        </div>
      </div>

      {incident.repeated_pattern_detected && (
        <Card className="border-amber-300 bg-amber-50 p-5 text-amber-900">
          <div className="flex items-start gap-3">
            <Repeat2 className="mt-0.5 h-5 w-5" />
            <p className="font-semibold">반복 민원 패턴이 감지되었습니다.</p>
          </div>
        </Card>
      )}

      {incident.risk_level === "HIGH" && (
        <Card className="border-red-300 bg-red-50 p-5 text-red-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-6 w-6" />
            <div>
              <p className="font-semibold">고위험 민원입니다. 즉시 관리자 공유를 권장합니다.</p>
              <HighRiskActions incident={incident} />
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-gold" />
          <h2 className="text-2xl font-bold text-navy">{riskLabel(incident.risk_level)}</h2>
          <Badge tone={tone}>{incident.risk_score}점</Badge>
          <Badge tone={tone}>{incident.ai_category}</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{incident.ai_summary}</p>
        <p className="mt-3 rounded-md border border-line bg-paper px-3 py-2 text-sm font-semibold text-navy">{guideFor(incident.risk_level)}</p>
      </Card>

      <div className={`grid gap-5 ${demoMode ? "md:grid-cols-2" : ""}`}>
        <Card className="p-5">
          <h3 className="font-semibold text-navy">사건 상태</h3>
          <p className="mt-2 text-sm text-slate-600">학교 내부 보고 흐름에 맞춰 사건 상태를 변경합니다.</p>
          <div className="mt-3">
            <StatusControl incidentId={incident.id} initialStatus={incident.status} />
          </div>
        </Card>
        {demoMode && <EmailReportForm incidentId={incident.id} />}
      </div>

      {incident.recommended_center && (
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-navy">추천 교육활동보호센터</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {incident.recommended_center.region} · {incident.recommended_center.name}
              </p>
              <p className="text-sm text-slate-700">{incident.recommended_center.phone} · {incident.recommended_center.support_type}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Clock3 className="h-3.5 w-3.5" /> 운영시간 {incident.recommended_center.available_hours}
              </p>
            </div>
            <a href={incident.recommended_center.website} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy">
              <MapPin className="h-4 w-4" /> 보호센터 확인
            </a>
          </div>
        </Card>
      )}

      <div id="share-summary">
        <ShareSummary incident={incident} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-navy">사건 개요</h3>
          <dl className="mt-3 grid gap-2 text-sm text-slate-700">
            <div>발생 일시: {formatDateTime(incident.occurred_at)}</div>
            <div>장소: {incident.place}</div>
            <div>대상: {incident.target_type}</div>
            <div>민원 유형: {incident.complaint_type}</div>
            <div>감정 상태: {incident.emotion}</div>
          </dl>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-navy">대응 권장사항</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            {incident.action_guide.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-navy">관련 민원 히스토리</h3>
        <div className="mt-4 grid gap-3">
          {incident.related_history.length === 0 && <p className="text-sm text-slate-600">연결된 보호자 thread가 아직 없습니다.</p>}
          {incident.related_history.map((item) => (
            <div key={item.id} className="rounded-md border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-navy">{item.parent_name_masked}</p>
                <span className="text-xs text-slate-500">{formatDateTime(item.created_at)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.incident_summary}</p>
              <p className="mt-1 text-xs text-slate-500">기록 #{item.incident_id} · {item.risk_level} · {item.status}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-navy">Timeline</h3>
        <div className="mt-4 grid gap-3">
          {incident.timeline.map((item) => (
            <div key={item.id} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
              <span className="text-slate-500">{formatDateTime(item.timestamp)}</span>
              <span className="font-semibold text-navy">{actionLabels[item.action_type] ?? item.action_type}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-navy">입력 원문</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{incident.content}</p>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-navy">기록 무결성</h3>
        <dl className="mt-3 grid gap-2 break-all text-sm text-slate-700">
          <div>PDF SHA256: {incident.pdf_hash ?? "생성 전"}</div>
          <div>Disclaimer Version: {incident.disclaimer_version}</div>
        </dl>
        <p className="mt-5 rounded-md border border-line bg-paper px-3 py-2 text-xs text-slate-600">본 결과는 참고용이며 법적 판단이 아닙니다.</p>
      </Card>
      <Link href="/dashboard" className="text-sm font-semibold text-navy">대시보드로 돌아가기</Link>
    </main>
  );
}
