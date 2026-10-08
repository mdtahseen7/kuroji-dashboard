import { NextResponse } from "next/server";
import { kurojiFetch } from "@/lib/kuroji";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action !== "start" && action !== "stop") {
    return NextResponse.json({ error: "action must be start or stop" }, { status: 400 });
  }
  try {
    const res = await kurojiFetch(`/anime/indexer/${action}`, { method: "POST" }, 15000);
    const body = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, response: body.slice(0, 500) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "kuroji api unreachable" }, { status: 502 });
  }
}
