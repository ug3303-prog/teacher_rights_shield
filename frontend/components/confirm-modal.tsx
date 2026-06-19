"use client";

import { AlertTriangle, X } from "lucide-react";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  busy,
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
            <div>
              <h2 id="confirm-title" className="font-bold text-navy">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} disabled={busy} aria-label="닫기" className="text-slate-500 hover:text-navy">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="min-h-10 rounded-md border border-line px-4 text-sm font-semibold text-slate-700">
            취소
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className="min-h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
