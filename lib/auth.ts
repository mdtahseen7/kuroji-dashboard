// Edge-safe auth: uses Web Crypto (crypto.subtle), no Node 'crypto' import,
// so this module works in middleware (Edge runtime) and in API routes.
// Token scheme is unchanged (SHA-256 hex of password + salt), so existing
// login cookies stay valid.
export const AUTH_COOKIE = "kd_auth";

const TOKEN_SALT = ":kuroji-dashboard";

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function expectedToken(): Promise<string> {
  return sha256Hex((process.env.DASHBOARD_PASSWORD || "") + TOKEN_SALT);
}

export async function isAuthed(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  return constantTimeEqual(await expectedToken(), cookieValue);
}

export async function checkPassword(password: string): Promise<boolean> {
  return constantTimeEqual(process.env.DASHBOARD_PASSWORD || "", password || "");
}

export async function authToken(): Promise<string> {
  return expectedToken();
}
