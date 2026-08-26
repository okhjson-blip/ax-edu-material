import { createHmac, timingSafeEqual } from "crypto";

export const SITE_COOKIE = "edu_access";

/** 사이트 접속 비밀번호 (환경변수 SITE_PASSWORD로 덮어쓸 수 있음) */
const DEFAULT_SITE_PASSWORD = "ax2026h2";

function sitePassword() {
  return process.env.SITE_PASSWORD || DEFAULT_SITE_PASSWORD;
}

function secret() {
  return process.env.SESSION_SECRET || sitePassword();
}

export function createSessionToken() {
  const key = secret();
  return createHmac("sha256", key).update("site-ok").digest("hex");
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const expected = createHmac("sha256", secret()).update("site-ok").digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifySitePassword(password: string) {
  const expected = sitePassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
