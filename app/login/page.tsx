"use client";
import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      location.href = "/";
    } else {
      setErr("wrong password");
    }
  };

  return (
    <div className="wrap">
      <div className="login-wrap">
        <div className="card">
          <h1>kuroji dashboard</h1>
          <form onSubmit={submit}>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" style={{ width: "100%" }}>log in</button>
          </form>
          {err && <div className="err">{err}</div>}
        </div>
      </div>
    </div>
  );
}
