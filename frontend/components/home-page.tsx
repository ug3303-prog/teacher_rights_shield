"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ClipboardPenLine, FileText, Scale, X } from "lucide-react";
import { Card } from "@/components/ui";
import { sampleIncidents } from "@/lib/samples";

const riskInfo = {
  LOW: {
    title: "LOW: 기록 보관 권장",
    body: "일반 문의 또는 단순 민원 예시입니다. 기록을 남겨 두고 동일한 요구가 반복되는지 관찰합니다."
  },
  MEDIUM: {
    title: "MEDIUM: 관리자 공유 + 민원대응팀 보고",
    body: "반복 항의, 부당 요구, 업무시간 외 압박처럼 대응 부담이 커지는 상황입니다."
  },
  HIGH: {
    title: "HIGH: 즉시 보고 + 보호센터 문의",
    body: "협박, 신상 공개, 물리적 위협처럼 즉시 관리자 공유와 보호 조치 검토가 필요한 상황입니다."
  }
};

export function HomePage({ showSamples }: { showSamples: boolean }) {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<keyof typeof riskInfo | null>(null);
  const features = [
    { title: "긴급 기록", text: "민원 발생 상황을 빠르게 기록하고 감정 상태까지 함께 저장합니다.", Icon: ClipboardPenLine },
    { title: "AI 분류", text: "교육부 특이민원 유형 기준으로 위험 요소를 분석하고 대응 우선순위를 제안합니다.", Icon: Scale },
    { title: "PDF 보고서", text: "기록 내용을 분석 결과와 함께 PDF 보고서로 저장하고 관리자 공유에 활용할 수 있습니다.", Icon: FileText }
  ];

  return (
    <main>
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-gold">교권보호 도우미</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">민원방패</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
              학부모 민원, 반복적 부당 요구, 교육활동 침해 정황을 빠르게 기록하고 위험도와 대응 우선순위를 확인하는 웹 기반 MVP입니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/incidents/new" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-navy">
                기록 시작 <ArrowRight className="h-4 w-4" />
              </Link>
              {showSamples && (
                <button onClick={() => setSamplesOpen(true)} className="inline-flex min-h-11 items-center rounded-md bg-white px-5 py-2 text-sm font-semibold text-navy">
                  샘플 민원 분석해보기
                </button>
              )}
              <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-md border border-white/25 px-5 py-2 text-sm font-semibold text-white">
                대시보드 보기
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {features.map(({ title, text, Icon }) => (
              <Card key={title} className="border-white/10 bg-white/10 p-4 text-white shadow-none">
                <Icon className="h-5 w-5 text-gold" />
                <h2 className="mt-3 font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-200">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(riskInfo) as Array<keyof typeof riskInfo>).map((key) => (
            <button key={key} onClick={() => setSelectedRisk(key)} className="text-left">
              <Card className="h-full p-4 text-sm font-semibold text-navy transition hover:border-gold hover:shadow-none">
                {riskInfo[key].title}
                <p className="mt-2 text-xs font-normal leading-5 text-slate-600">클릭해서 예시 보기</p>
              </Card>
            </button>
          ))}
        </div>
      </section>

      {showSamples && samplesOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy">샘플 민원 선택</h2>
              <button onClick={() => setSamplesOpen(false)} aria-label="닫기"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 grid gap-3">
              {sampleIncidents.map((sample) => (
                <Link key={sample.id} href={`/incidents/new?sample=${sample.id}`} className="rounded-md border border-line p-4 transition hover:border-gold">
                  <p className="font-semibold text-navy">{sample.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{sample.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRisk && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy">{riskInfo[selectedRisk].title}</h2>
              <button onClick={() => setSelectedRisk(null)} aria-label="닫기"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{riskInfo[selectedRisk].body}</p>
          </div>
        </div>
      )}
    </main>
  );
}
