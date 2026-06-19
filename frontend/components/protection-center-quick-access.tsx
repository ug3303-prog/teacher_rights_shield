"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock3, MapPin, Phone, ShieldAlert, X } from "lucide-react";
import { getIncidentQuickContext, getProtectionCenters } from "@/lib/api";
import type { IncidentQuickContext, ProtectionCenter } from "@/lib/types";

export function ProtectionCenterQuickAccess() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [centers, setCenters] = useState<ProtectionCenter[]>([]);
  const [context, setContext] = useState<IncidentQuickContext | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const match = pathname.match(/^\/incidents\/(\d+)$/);
    if (!match) {
      setContext(null);
      return;
    }
    getIncidentQuickContext(Number(match[1])).then(setContext).catch(() => setContext(null));
  }, [pathname]);

  async function showCenters() {
    setOpen(true);
    if (centers.length > 0) return;
    setLoading(true);
    try {
      setCenters(await getProtectionCenters());
    } finally {
      setLoading(false);
    }
  }

  const isHigh = context?.risk_level === "HIGH";

  return (
    <>
      <button
        type="button"
        onClick={showCenters}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
          isHigh ? "border-red-300 bg-red-50 text-red-700" : "border-line bg-paper text-navy hover:border-gold"
        }`}
      >
        {isHigh ? <ShieldAlert className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
        보호센터
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-navy">교육활동보호센터 Quick Access</h2>
                <p className="mt-1 text-sm text-slate-600">지역별 보호센터 연락처를 확인하세요.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {isHigh && (
              <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                HIGH 사건입니다. 추천 지역 보호센터를 강조해 표시합니다.
              </div>
            )}

            <div className="mt-4 grid gap-3">
              {loading && <p className="text-sm text-slate-600">보호센터 정보를 불러오는 중입니다.</p>}
              {centers.map((center) => {
                const recommended = isHigh && center.region === context?.recommended_center_region;
                return (
                  <article key={center.id} className={`rounded-md border p-4 ${recommended ? "border-red-300 bg-red-50" : "border-line bg-white"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy">{center.region}</span>
                          {recommended && <span className="rounded-full bg-red-700 px-2 py-0.5 text-[11px] font-bold text-white">추천</span>}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{center.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{center.support_type}</p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Clock3 className="h-3.5 w-3.5" /> 운영시간 {center.available_hours}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a href={`tel:${center.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line px-3 text-xs font-semibold text-navy">
                          <Phone className="h-3.5 w-3.5" /> {center.phone}
                        </a>
                        <a href={center.website} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-md bg-navy px-3 text-xs font-semibold text-white">
                          홈페이지
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
