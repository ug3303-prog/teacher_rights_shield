import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, FolderClock, HeartPulse, PieChart, Repeat2, ShieldAlert } from "lucide-react";
import { getDashboard } from "@/lib/api";
import { SafetyGauge } from "@/components/safety-gauge";
import { Badge, Card } from "@/components/ui";
import { riskLabel } from "@/lib/utils";
import { getAppMode } from "@/lib/app-mode";
import { ResetRecordsButton } from "@/components/reset-records-button";

export default async function DashboardPage() {
  const stats = await getDashboard();
  const incidents = stats.recent_reports;
  const demoMode = getAppMode() === "demo";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gold">운영 대시보드</p>
          <h1 className="text-2xl font-bold text-navy">민원 기록 현황</h1>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          {demoMode && <ResetRecordsButton />}
          <Link href="/incidents/new" className="rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white">새 기록</Link>
        </div>
      </div>
      <section className="mt-5 grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <FileText className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">전체 기록</p>
          <p className="text-3xl font-bold text-navy">{stats.total}</p>
        </Card>
        <Card className="p-5">
          <Repeat2 className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">반복 민원 진행중</p>
          <p className="text-3xl font-bold text-navy">{stats.repeated_active_count}</p>
        </Card>
        <Card className="p-5">
          <FolderClock className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">진행중 사건</p>
          <p className="text-3xl font-bold text-navy">{stats.active_count}</p>
        </Card>
        <Card className="p-5">
          <CheckCircle2 className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">종료된 사건</p>
          <p className="text-3xl font-bold text-navy">{stats.closed_count}</p>
        </Card>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <AlertTriangle className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">고위험 사건</p>
          <p className="text-3xl font-bold text-navy">{stats.high_risk_count}</p>
        </Card>
        <Card className="p-5">
          <ShieldAlert className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">HIGH 기록</p>
          <p className="text-3xl font-bold text-navy">{stats.by_risk.HIGH ?? 0}</p>
        </Card>
        <Card className="p-5">
          <PieChart className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">유형 수</p>
          <p className="text-3xl font-bold text-navy">{Object.keys(stats.by_category).length}</p>
        </Card>
        <Card className="p-5">
          <HeartPulse className="h-5 w-5 text-gold" />
          <p className="mt-3 text-sm text-slate-500">교권 안전 점수</p>
          <p className="text-3xl font-bold text-navy">{stats.safety_score}점</p>
          <p className="mt-1 text-sm font-semibold text-gold">{stats.safety_status}</p>
        </Card>
      </section>
      <Card className="mt-5 p-5">
        <h2 className="mb-4 font-semibold text-navy">교권 안전 점수 시각화</h2>
        <SafetyGauge score={stats.safety_score} status={stats.safety_status} />
      </Card>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <h2 className="font-semibold text-navy">최근 기록</h2>
          <div className="mt-4 grid gap-3">
            {incidents.map((incident) => {
              const tone = incident.risk_level === "HIGH" ? "high" : incident.risk_level === "MEDIUM" ? "medium" : "low";
              return (
                <Link key={incident.id} href={`/incidents/${incident.id}`} className="rounded-md border border-line p-4 transition hover:border-gold">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-navy">{incident.ai_category}</p>
                    <div className="flex gap-2">
                      <Badge tone={tone}>{riskLabel(incident.risk_level)} {incident.risk_score}점</Badge>
                      <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-slate-700">{incident.status}</span>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{incident.content}</p>
                </Link>
              );
            })}
          </div>
        </Card>
        <div className="grid content-start gap-5">
          <Card className="p-5">
            <h2 className="font-semibold text-navy">위험도별 분류</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              {["LOW", "MEDIUM", "HIGH"].map((key) => <div key={key} className="flex justify-between"><span>{riskLabel(key)}</span><strong>{stats.by_risk[key] ?? 0}</strong></div>)}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-navy">유형별 통계</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              {Object.entries(stats.by_category).map(([key, value]) => <div key={key} className="flex justify-between"><span>{key}</span><strong>{value}</strong></div>)}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-navy">최근 생성 보고서</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              {incidents.map((item) => <Link key={item.id} href={`/incidents/${item.id}`}>민원방패 기록 #{item.id}</Link>)}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
