"use client";

import { useState } from "react";
import { updateIncidentStatus } from "@/lib/api";
import type { IncidentStatus } from "@/lib/types";
import { inputClass } from "@/components/ui";

const statuses: IncidentStatus[] = ["NEW", "REPORTED", "IN_REVIEW", "CLOSED", "ESCALATED"];

export function StatusControl({ incidentId, initialStatus }: { incidentId: number; initialStatus: IncidentStatus }) {
  const [status, setStatus] = useState<IncidentStatus>(initialStatus);
  const [message, setMessage] = useState("");

  async function changeStatus(next: IncidentStatus) {
    setStatus(next);
    setMessage("");
    try {
      await updateIncidentStatus(incidentId, next);
      setMessage("상태가 변경되었습니다.");
    } catch {
      setMessage("상태 변경에 실패했습니다.");
      setStatus(status);
    }
  }

  return (
    <div className="grid gap-2 text-sm">
      <select className={inputClass} value={status} onChange={(event) => changeStatus(event.target.value as IncidentStatus)}>
        {statuses.map((item) => <option key={item}>{item}</option>)}
      </select>
      {message && <p className="text-xs text-slate-600">{message}</p>}
    </div>
  );
}
