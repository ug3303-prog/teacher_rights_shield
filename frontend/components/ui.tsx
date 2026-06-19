import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-white shadow-panel", className)} {...props} />;
}

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1a31] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ children, tone = "low" }: { children: React.ReactNode; tone?: "low" | "medium" | "high" }) {
  const styles = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    high: "border-red-200 bg-red-50 text-red-700"
  };
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", styles[tone])}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-md border border-line bg-white px-3 py-2 text-slate-900 outline-none ring-gold/30 transition focus:ring-4";
