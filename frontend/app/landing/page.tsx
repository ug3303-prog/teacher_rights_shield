import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Fingerprint,
  History,
  LockKeyhole,
  MessagesSquare,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  UserRoundX
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { sampleIncidents } from "@/lib/samples";
import { getAppMode } from "@/lib/app-mode";

export const metadata: Metadata = {
  title: "민원방패 | 교권을 지키는 기록과 대응",
  description: "반복 민원과 교육활동 침해 상황을 기록하고 위험도를 분석해 대응 우선순위를 확인하세요."
};

export const dynamic = "force-dynamic";

const problems = [
  {
    title: "반복 민원",
    text: "같은 요구가 이어져도 흩어진 기록만으로는 반복 패턴을 확인하기 어렵습니다.",
    Icon: MessagesSquare
  },
  {
    title: "협박성 민원",
    text: "신고, 언론 제보, 방문 위협이 포함된 상황은 빠른 위험 판단이 필요합니다.",
    Icon: ShieldAlert
  },
  {
    title: "신상 공개 위협",
    text: "교사의 이름과 사진을 공개하겠다는 위협은 즉시 보존하고 공유해야 합니다.",
    Icon: UserRoundX
  },
  {
    title: "관리자 공유 누락",
    text: "구두 보고만으로 끝나면 대응 시점과 조치 내용이 명확하게 남지 않습니다.",
    Icon: Building2
  }
];

const features = [
  {
    step: "01",
    title: "기록",
    text: "발생 일시, 장소, 대상, 감정 상태와 상세 내용을 빠르게 정리합니다.",
    Icon: ClipboardCheck
  },
  {
    step: "02",
    title: "분석",
    text: "특이민원 유형과 위험 요소를 분석해 대응 우선순위를 제안합니다.",
    Icon: ScanSearch
  },
  {
    step: "03",
    title: "보관",
    text: "분석 결과와 무결성 정보를 포함한 PDF 보고서로 안전하게 남깁니다.",
    Icon: FileCheck2
  }
];

const workflow = ["기록", "AI 분석", "PDF 생성", "관리자 공유", "보호센터 연결"];

const trustItems = [
  { title: "개인정보 마스킹", text: "전화번호와 이름 등 민감 정보를 저장 전에 자동 마스킹합니다.", Icon: LockKeyhole },
  { title: "Audit Log", text: "생성, 분석, 조회, 상태 변경 이력을 시간순으로 기록합니다.", Icon: History },
  { title: "PDF Hash", text: "SHA256 해시로 생성된 보고서의 무결성을 확인할 수 있습니다.", Icon: Fingerprint },
  { title: "반복 민원 감지", text: "최근 30일의 동일 보호자 민원 흐름을 연결해 살펴봅니다.", Icon: ShieldCheck }
];

export default function LandingPage() {
  const demoMode = getAppMode() === "demo";

  return (
    <main className="overflow-hidden bg-white text-ink">
      <section className="landing-hero relative isolate min-h-[660px] overflow-hidden bg-navy text-white">
        <div className="landing-grid absolute inset-0 -z-20 opacity-30" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,18,36,0.98)_0%,rgba(20,33,61,0.9)_52%,rgba(20,33,61,0.58)_100%)]" />
        <div className="mx-auto flex min-h-[660px] max-w-6xl items-center px-4 py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100">
              <ShieldCheck className="h-4 w-4 text-gold" />
              교사를 위한 민원 기록 및 대응 보조 도구
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">기록하지 않으면 남지 않습니다.</h1>
            <p className="mt-5 text-xl font-semibold text-[#e7c879] md:text-2xl">
              교권을 지키는 첫 번째 방패, 민원방패
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              반복 민원, 부당 요구, 교육활동 침해 상황을 빠르게 기록하고
              <br className="hidden sm:block" /> 위험도를 분석해 대응 우선순위를 확인하세요.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {demoMode && (
                <Link
                  href="#demo"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-slate-100"
                >
                  샘플 민원 분석해보기
                </Link>
              )}
              <Link
                href="/incidents/new"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-navy transition hover:bg-[#c99a37]"
              >
                지금 기록 시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              {["로그인 없이 바로 사용", "개인정보 자동 마스킹", "PDF 보고서 생성"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#e7c879]" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 md:py-24">
        <ScrollReveal className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-bold text-gold">WHY RECORD</p>
          <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">교사는 왜 기록해야 할까?</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            상황이 커진 뒤 기억에 의존하지 않도록, 발생 순간부터 일관된 기록을 남기는 것이 대응의 출발점입니다.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map(({ title, text, Icon }, index) => (
              <ScrollReveal key={title} delay={index * 80} className="h-full">
                <article className="h-full border-t-4 border-gold bg-white p-6 shadow-panel">
                  <Icon className="h-6 w-6 text-navy" />
                  <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="py-20 md:py-24">
        <ScrollReveal className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-gold">CORE FEATURES</p>
            <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">기록에서 대응까지, 세 단계로</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map(({ step, title, text, Icon }, index) => (
              <ScrollReveal key={title} delay={index * 100}>
                <article className="relative border-l border-line pl-6">
                  <span className="text-sm font-bold text-gold">{step}</span>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-md bg-navy text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-navy">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-navy py-20 text-white md:py-24">
        <ScrollReveal className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-bold text-[#e7c879]">WORKFLOW</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">한 번의 기록이 다음 대응으로 이어집니다</h2>
          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {workflow.map((item, index) => (
              <div key={item} className="relative flex min-h-24 items-center border border-white/15 bg-white/5 p-4">
                <span className="mr-3 text-sm font-bold text-[#e7c879]">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-semibold">{item}</span>
                {index < workflow.length - 1 && (
                  <ArrowRight className="absolute -right-5 z-10 hidden h-4 w-4 text-[#e7c879] md:block" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {demoMode && <section id="demo" className="scroll-mt-20 bg-paper py-20 md:py-24">
        <ScrollReveal className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold text-gold">LIVE DEMO</p>
              <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">샘플 민원으로 바로 확인하세요</h2>
              <p className="mt-4 leading-7 text-slate-600">샘플을 선택하면 기록 화면에 내용이 자동 입력됩니다.</p>
            </div>
            <Link href="/incidents/new" className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-gold">
              직접 기록하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {sampleIncidents.map((sample, index) => (
              <ScrollReveal key={sample.id} delay={(index % 2) * 70}>
                <Link
                  href={`/incidents/new?sample=${sample.id}`}
                  className="group flex min-h-40 h-full flex-col justify-between border border-line bg-white p-6 transition hover:-translate-y-1 hover:border-gold hover:shadow-panel"
                >
                  <div>
                    <span className="text-xs font-bold text-gold">SAMPLE {index + 1}</span>
                    <h3 className="mt-2 text-lg font-bold text-navy">{sample.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{sample.content}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                    이 민원 분석하기
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>}

      <section className="py-20 md:py-24">
        <ScrollReveal className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-sm font-bold text-gold">TRUST & INTEGRITY</p>
              <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">기록의 신뢰성을 설계했습니다</h2>
              <p className="mt-5 leading-7 text-slate-600">
                단순 메모를 넘어, 언제 어떤 조치가 이루어졌는지 확인할 수 있는 기록 체계를 제공합니다.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {trustItems.map(({ title, text, Icon }) => (
                <article key={title} className="flex gap-4 border-b border-line pb-7">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#f3ead7] text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-y border-line bg-[#f3ead7]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-gold">민원 발생 순간, 기록부터 시작하세요.</p>
            <h2 className="mt-2 text-2xl font-bold text-navy md:text-3xl">교권을 지키는 첫 번째 방패를 준비하세요.</h2>
          </div>
          <Link
            href="/incidents/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1a31]"
          >
            지금 기록 시작하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
