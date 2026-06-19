"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import type { Incident } from "@/lib/types";
import { Button, Card } from "@/components/ui";
import { formatDateTime, riskLabel } from "@/lib/utils";

export function buildAdminSummary(incident: Incident) {
  return [
    "[민원 요약]",
    `발생일: ${formatDateTime(incident.occurred_at)}`,
    `유형: ${incident.ai_category}`,
    `위험도: ${riskLabel(incident.risk_level)} (${incident.risk_score}점)`,
    `핵심 위험 요소: ${incident.risk_reasons.join(" / ")}`,
    `권장 대응: ${incident.action_guide.join(" / ")}`
  ].join("\n");
}

export function ShareSummary({ incident }: { incident: Incident }) {
  const [toast, setToast] = useState("");
  const summary = useMemo(() => buildAdminSummary(incident), [incident]);

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setToast("관리자 공유용 요약이 복사되었습니다.");
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-navy">관리자 공유용 요약</h3>
        <Button className="bg-gold text-navy hover:bg-[#a77925]" onClick={copySummary}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-md border border-line bg-paper p-3 text-sm leading-6 text-slate-700">
        {summary}
      </pre>
      {toast && <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{toast}</p>}
    </Card>
  );
}
