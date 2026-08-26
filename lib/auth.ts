import { createHmac, timingSafeEqual } from "crypto";

export const ACCESS_COOKIE = "edu_access";

/** Site gate password. Override with SITE_PASSWORD on Vercel if needed. */
export const SITE_PASSWORD = process.env.SITE_PASSWORD || "ax2026h2";

function secret() {
  return process.env.SESSION_SECRET || SITE_PASSWORD;
}

export function createSessionToken() {
  const key = secret();
  if (!key) {
    throw new Error("SITE_PASSWORD 환경 변수가 필요합니다.");
  }
  return createHmac("sha256", key).update("site-access-ok").digest("hex");
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const key = secret();
  if (!key) return false;
  const expected = createHmac("sha256", key)
    .update("site-access-ok")
    .digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifySitePassword(password: string) {
  const expected = SITE_PASSWORD;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
