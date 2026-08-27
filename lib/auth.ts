import { createHmac, timingSafeEqual } from "crypto";

export const SITE_COOKIE = "edu_access";

/**
 * 토큰 버전. 이 값을 올리면 기존에 발급된 모든 쿠키가 무효화되어
 * 모든 사용자에게 로그인 페이지가 다시 표시된다.
 */
const TOKEN_VERSION = "v2";

/** 사이트 접속 비밀번호 (환경변수 SITE_PASSWORD로 덮어쓸 수 있음) */
const DEFAULT_SITE_PASSWORD = "ax2026h2";

function cleanSecret(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function sitePassword() {
  return cleanSecret(process.env.SITE_PASSWORD || DEFAULT_SITE_PASSWORD);
}

function secret() {
  return cleanSecret(process.env.SESSION_SECRET || sitePassword());
}

export function createSessionToken() {
  const key = secret();
  return createHmac("sha256", key)
    .update(`site-ok:${TOKEN_VERSION}`)
    .digest("hex");
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const expected = createHmac("sha256", secret())
    .update(`site-ok:${TOKEN_VERSION}`)
    .digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifySitePassword(password: string) {
  const expected = sitePassword();
  const given = password.trim();
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
