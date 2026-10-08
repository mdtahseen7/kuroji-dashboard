import { createHash, timingSafeEqual } from "crypto";

export const AUTH_COOKIE = "kd_auth";

function expectedToken(): string {
  const pw = process.env.DASHBOARD_PASSWORD || "";
  return createHash("sha256").update(pw + ":kuroji-dashboard").digest("hex");
}

export function isAuthed(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const expected = Buffer.from(expectedToken());
  const actual = Buffer.from(cookieValue);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function checkPassword(password: string): boolean {
  const expected = Buffer.from(process.env.DASHBOARD_PASSWORD || "");
  const actual = Buffer.from(password);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function authToken(): string {
  return expectedToken();
}
