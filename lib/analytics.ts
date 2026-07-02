import { track as vercelTrack } from "@vercel/analytics";

export function track(name: string, props?: Record<string, string | number>): void {
  try {
    vercelTrack(name, props);
  } catch {
    // silent no-op when analytics isn't initialized (local dev, SSR, blocked)
  }
}
