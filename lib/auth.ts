import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "edu_admin";

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function createSessionToken() {
  const key = secret();
  if (!key) {
    throw new Error("ADMIN_PASSWORD 환경 변수가 필요합니다.");
  }
  return createHmac("sha256", key).update("admin-ok").digest("hex");
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const key = secret();
  if (!key) return false;
  const expected = createHmac("sha256", key).update("admin-ok").digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function canWriteContent() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_CONTENT_WRITE === "true"
  );
}
