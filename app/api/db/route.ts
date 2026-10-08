import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const TABLES = [
  "anime",
  "mappings",
  "indexer_state",
  "anime_episode",
  "anime_image",
  "anime_title",
  "anime_video",
  "anime_screenshot",
  "anime_link",
  "anime_chronology",
];

export async function GET() {
  const pool = getPool();
  try {
    const size = await pool.query("SELECT pg_database_size(current_database()) AS size_bytes");
    const tables: Record<string, number | null> = {};
    for (const t of TABLES) {
      try {
        const r = await pool.query(`SELECT count(*)::int AS c FROM "${t}"`);
        tables[t] = r.rows[0].c;
      } catch {
        tables[t] = null; // table may not exist yet (e.g. mappings before migration)
      }
    }
    let indexer: unknown[] = [];
    try {
      const r = await pool.query("SELECT id, last_page, last_pl, updated_at FROM indexer_state");
      indexer = r.rows;
    } catch {
      indexer = [];
    }
    return NextResponse.json({
      size_bytes: Number(size.rows[0].size_bytes),
      tables,
      indexer,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "db query failed", detail: String(e).slice(0, 200) },
      { status: 500 }
    );
  }
}
