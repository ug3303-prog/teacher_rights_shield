import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ProtectionCenterQuickAccess } from "@/components/protection-center-quick-access";
import "./globals.css";

export const metadata: Metadata = {
  title: "교권보호 도우미 - 민원방패",
  description: "교사 민원 기록 및 대응 보조 MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/landing" className="flex items-center gap-2 font-semibold text-navy">
              <ShieldCheck className="h-6 w-6 text-gold" />
              민원방패
            </Link>
            <nav className="flex items-center gap-2 text-sm text-slate-600 sm:gap-4">
              <Link href="/landing" className="hidden hover:text-navy sm:inline">서비스 소개</Link>
              <Link href="/incidents/new" className="hidden hover:text-navy sm:inline">기록 시작</Link>
              <Link href="/dashboard" className="hover:text-navy">대시보드</Link>
              <ProtectionCenterQuickAccess />
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mt-10 border-t border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-5 text-xs leading-6 text-slate-600">
            본 서비스는 법률 자문 또는 법적 대리를 제공하지 않으며, 기록 보조 및 대응 참고를 위한 도구입니다.
            실제 법적 판단은 학교 관리자, 교육청 또는 변호사와 상담하십시오.
          </div>
        </footer>
      </body>
    </html>
  );
}
