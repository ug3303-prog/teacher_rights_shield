"use client";

import { useEffect } from "react";
import { recordIncidentView } from "@/lib/api";

export function IncidentViewAudit({ incidentId }: { incidentId: number }) {
  useEffect(() => {
    recordIncidentView(incidentId).catch(() => undefined);
  }, [incidentId]);

  return null;
}
