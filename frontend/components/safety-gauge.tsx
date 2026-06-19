export function SafetyGauge({ score, status }: { score: number; status: string }) {
  const color = score >= 90 ? "#16a34a" : score >= 70 ? "#ca8a04" : "#dc2626";
  const track = "#e5dfd0";
  const clamped = Math.max(0, Math.min(score, 100));

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${clamped * 3.6}deg, ${track} 0deg)` }}
        aria-label={`교권 안전 점수 ${score}점`}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white">
          <span className="text-xl font-bold text-navy">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500">최근 30일 기준</p>
        <p className="text-lg font-bold" style={{ color }}>{status}</p>
        <p className="mt-1 text-xs text-slate-600">90~100 안정 · 70~89 주의 · 0~69 위험</p>
      </div>
    </div>
  );
}
