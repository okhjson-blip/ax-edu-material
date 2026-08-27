import { NextResponse } from "next/server";
import {
  SITE_COOKIE,
  createSessionToken,
  verifySitePassword,
} from "@/lib/auth";

function cookieSecure(request: Request) {
  if (process.env.COOKIE_SECURE === "0") return false;
  if (process.env.COOKIE_SECURE === "1") return true;
  if (process.env.VERCEL === "1") return true;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.headers.get("x-forwarded-protocol") ??
    new URL(request.url).protocol.replace(":", "");
  return proto === "https";
}

function safeNext(raw: string) {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNext(String(form.get("next") ?? "/"));

  if (!verifySitePassword(password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(SITE_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(request),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
