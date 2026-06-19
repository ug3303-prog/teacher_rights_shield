"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteIncident } from "@/lib/api";
import { ConfirmModal } from "@/components/confirm-modal";

export function DeleteIncidentButton({ incidentId }: { incidentId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setBusy(true);
    setError("");
    try {
      await deleteIncident(incidentId);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("기록을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700">
          <Trash2 className="h-4 w-4" /> 기록 삭제
        </button>
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      </div>
      <ConfirmModal
        open={open}
        title="기록 삭제"
        description="이 기록을 삭제하면 복구할 수 없습니다. 삭제하시겠습니까?"
        confirmLabel="기록 삭제"
        busy={busy}
        onCancel={() => !busy && setOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
