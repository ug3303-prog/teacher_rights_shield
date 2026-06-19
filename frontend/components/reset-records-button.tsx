"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { resetIncidents } from "@/lib/api";
import { ConfirmModal } from "@/components/confirm-modal";

export function ResetRecordsButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function confirmReset() {
    setBusy(true);
    setMessage("");
    try {
      const result = await resetIncidents();
      setOpen(false);
      setMessage(result.message);
      router.refresh();
    } catch {
      setMessage("초기화하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="text-right">
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700">
          <RotateCcw className="h-4 w-4" />
          전체 기록 초기화
        </button>
        {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
      </div>
      <ConfirmModal
        open={open}
        title="전체 기록을 초기화할까요?"
        description="모든 데모 기록이 삭제됩니다. 계속하시겠습니까?"
        confirmLabel="전체 기록 초기화"
        busy={busy}
        onCancel={() => !busy && setOpen(false)}
        onConfirm={confirmReset}
      />
    </>
  );
}
