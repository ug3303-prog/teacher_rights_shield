import { NewIncidentPage } from "@/components/new-incident-page";
import { getAppMode } from "@/lib/app-mode";

export const dynamic = "force-dynamic";

export default function Page() {
  return <NewIncidentPage allowSamples={getAppMode() === "demo"} />;
}
