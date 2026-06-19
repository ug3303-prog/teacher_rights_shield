import { HomePage } from "@/components/home-page";
import { getAppMode } from "@/lib/app-mode";

export const dynamic = "force-dynamic";

export default function Page() {
  return <HomePage showSamples={getAppMode() === "demo"} />;
}
