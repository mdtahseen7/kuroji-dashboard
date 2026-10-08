"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type DbState = {
  size_bytes: number;
  tables: Record<string, number | null>;
  indexer: { id: string; last_page: number; last_pl: number | null; updated_at: string }[];
  error?: string;
} | null;

type LiveState = {
  online: boolean;
  latency_ms: number | null;
  api_url: string;
  stats?: {
    redis?: { used_memory_human?: string };
    vps?: { loadavg_1m?: number; mem_total_mb?: number; mem_free_mb?: number; disk_free_gb?: number };
    indexer?: { running?: boolean; last_page?: number; last_pl?: number | null };
  } | null;
} | null;

function fmtBytes(b: number): string {
  if (b >= 1e9) return (b / 1e9).toFixed(2) + " GB";
  if (b >= 1e6) return (b / 1e6).toFixed(1) + " MB";
  return Math.round(b / 1e3) + " KB";
}
function fmtNum(n: number | null): string {
  return n === null || n === undefined ? "—" : n.toLocaleString("en-US");
}

export default function Dashboard() {
  const [db, setDb] = useState<DbState>(null);
  const [live, setLive] = useState<LiveState>(null);
  const [msg, setMsg] = useState("");
  const [animeId, setAnimeId] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/db");
      setDb(await r.json());
    } catch {
      setDb({ error: "unreachable" } as DbState);
    }
    try {
      const r = await fetch("/api/live");
      setLive(await r.json());
    } catch {
      setLive({ online: false } as LiveState);
    }
  }, []);

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, 15000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refresh]);

  const indexerAction = async (action: "start" | "stop") => {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/actions/indexer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const j = await r.json();
      setMsg(`${action}: ${j.ok ? "ok" : "failed"} — ${j.response || j.error || ""}`);
    } catch {
      setMsg(`${action}: request failed`);
    }
    setBusy(false);
    refresh();
  };

  const updateAnime = async () => {
    const id = parseInt(animeId, 10);
    if (!id || id <= 0) {
      setMsg("enter a valid anilist id");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/actions/update-anime", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      setMsg(`update ${id}: ${j.ok ? "queued" : "failed"} — ${j.response || j.error || ""}`);
    } catch {
      setMsg("request failed");
    }
    setBusy(false);
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/login";
  };

  const idx = db?.indexer?.[0];
  const stats = live?.stats;

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>kuroji dashboard</h1>
          <p>self-hosted anime metadata api</p>
        </div>
        <button onClick={logout}>log out</button>
      </header>

      <div className="grid">
        <div className="card">
          <h2>api</h2>
          <div className="row">
            <span className="k">status</span>
            <span className="v">
              {live === null ? "…" : live.online ? <span className="pill on">online</span> : <span className="pill off">offline</span>}
            </span>
          </div>
          <div className="row"><span className="k">url</span><span className="v" style={{ fontSize: 11 }}>{live?.api_url || "…"}</span></div>
          <div className="row"><span className="k">latency</span><span className="v">{live?.latency_ms != null ? `${live.latency_ms} ms` : "—"}</span></div>
          {stats?.redis && (
            <div className="row"><span className="k">redis mem</span><span className="v">{stats.redis.used_memory_human || "—"}</span></div>
          )}
        </div>

        <div className="card">
          <h2>database (neon)</h2>
          <div className="row"><span className="k">size</span><span className="v">{db ? fmtBytes(db.size_bytes) : "…"}</span></div>
          <div className="row"><span className="k">anime rows</span><span className="v">{db ? fmtNum(db.tables.anime) : "…"}</span></div>
          <div className="row"><span className="k">mappings</span><span className="v">{db ? fmtNum(db.tables.mappings) : "…"}</span></div>
          <div className="row"><span className="k">episodes</span><span className="v">{db ? fmtNum(db.tables.anime_episode) : "…"}</span></div>
          <div className="row"><span className="k">images</span><span className="v">{db ? fmtNum(db.tables.anime_image) : "…"}</span></div>
          {db?.error && <div className="err">db unreachable</div>}
        </div>

        <div className="card">
          <h2>indexer</h2>
          <div className="row">
            <span className="k">state</span>
            <span className="v">
              {stats?.indexer?.running ? <span className="pill on">running</span> : <span className="pill off">idle</span>}
            </span>
          </div>
          <div className="row"><span className="k">last page</span><span className="v">{idx ? idx.last_page : "—"}</span></div>
          <div className="row"><span className="k">last popularity</span><span className="v">{idx?.last_pl ?? "—"}</span></div>
          <div className="actions">
            <button disabled={busy} onClick={() => indexerAction("start")}>start</button>
            <button disabled={busy} className="danger" onClick={() => indexerAction("stop")}>stop</button>
          </div>
        </div>

        {stats?.vps && (
          <div className="card">
            <h2>vps</h2>
            <div className="row"><span className="k">load (1m)</span><span className="v">{stats.vps.loadavg_1m ?? "—"}</span></div>
            <div className="row">
              <span className="k">memory</span>
              <span className="v">
                {stats.vps.mem_total_mb != null && stats.vps.mem_free_mb != null
                  ? `${Math.round(stats.vps.mem_total_mb - stats.vps.mem_free_mb)}/${stats.vps.mem_total_mb} MB`
                  : "—"}
              </span>
            </div>
            <div className="row"><span className="k">disk free</span><span className="v">{stats.vps.disk_free_gb != null ? `${stats.vps.disk_free_gb} GB` : "—"}</span></div>
          </div>
        )}

        <div className="card">
          <h2>update anime</h2>
          <p style={{ color: "var(--muted)", fontSize: 12, margin: "0 0 8px" }}>queue a single anime refresh by anilist id</p>
          <input
            type="number"
            placeholder="anilist id, e.g. 21"
            value={animeId}
            onChange={(e) => setAnimeId(e.target.value)}
          />
          <div className="actions">
            <button disabled={busy} onClick={updateAnime}>queue update</button>
          </div>
        </div>

        <div className="card">
          <h2>tables</h2>
          {db ? (
            Object.entries(db.tables).map(([t, c]) => (
              <div className="row" key={t}><span className="k">{t}</span><span className="v">{fmtNum(c)}</span></div>
            ))
          ) : (
            <p style={{ color: "var(--muted)" }}>…</p>
          )}
        </div>
      </div>

      {msg && <div className="msg">{msg}</div>}
      <div className="updated">auto-refreshes every 15s</div>
    </div>
  );
}
