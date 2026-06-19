export type AppMode = "demo" | "production";

export function getAppMode(): AppMode {
  const mode = process.env.APP_MODE ?? process.env.NEXT_PUBLIC_APP_MODE;
  return mode?.toLowerCase() === "production" ? "production" : "demo";
}
