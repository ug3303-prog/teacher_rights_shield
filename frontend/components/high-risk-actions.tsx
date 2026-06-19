"use client";

import { useMemo, useState } from "react";
import { Copy, Download, ShieldQuestion } from "lucide-react";
import type { Incident } from "@/lib/types";
import { pdfUrl } from "@/lib/api";
import { buildAdminSummary } from "@/components/share-summary";

export function HighRiskActions({ incident }: { incident: Incident }) {
  const [message, setMessage] = useState("");
  const summary = useMemo(() => buildAdminSummary(incident), [incident]);

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setMessage("관리자 공유용 요약이 복사되었습니다.");
    window.setTimeout(() => setMessage(""), 1800);
  }

  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copySummary} className="inline-flex items-center rounded-md bg-red-700 px-3 py-2 text-xs font-semibold text-white">
          <Copy className="mr-1.5 h-3.5 w-3.5" /> 관리자 공유용 요약 복사
        </button>
        <a href={pdfUrl(incident.pdf_url)} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-700">
          <Download className="mr-1.5 h-3.5 w-3.5" /> PDF 바로 저장
        </a>
        <span className="inline-flex items-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-700">
          <ShieldQuestion className="mr-1.5 h-3.5 w-3.5" /> 보호센터 문의 안내
        </span>
      </div>
      {message && <p className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-700">{message}</p>}
    </div>
  );
}
