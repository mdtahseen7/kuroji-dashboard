import { NextResponse } from "next/server";
import { kurojiFetch } from "@/lib/kuroji";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { id } = (await req.json().catch(() => ({}))) as { id?: number };
  if (!id || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "id must be a positive integer (anilist id)" }, { status: 400 });
  }
  try {
    const res = await kurojiFetch(`/anime/update/update?id=${id}`, { method: "PUT" }, 15000);
    const body = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, response: body.slice(0, 500) });
  } catch {
    return NextResponse.json({ ok: false, error: "kuroji api unreachable" }, { status: 502 });
  }
}
