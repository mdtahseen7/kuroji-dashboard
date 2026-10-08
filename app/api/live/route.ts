import { NextResponse } from "next/server";
import { apiBase, kurojiFetch } from "@/lib/kuroji";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const res = await kurojiFetch("/", {}, 8000);
    const latency_ms = Date.now() - started;
    if (!res.ok) {
      return NextResponse.json({ online: false, latency_ms, api_url: apiBase() });
    }
    let stats: unknown = null;
    try {
      const s = await kurojiFetch("/admin/stats", {}, 8000);
      if (s.ok) stats = await s.json();
    } catch {
      stats = null; // /admin/stats may not exist yet on the deployed branch
    }
    return NextResponse.json({ online: true, latency_ms, api_url: apiBase(), stats });
  } catch {
    return NextResponse.json({ online: false, latency_ms: null, api_url: apiBase() });
  }
}
