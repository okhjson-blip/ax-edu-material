"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SITE_COOKIE,
  createSessionToken,
  verifySitePassword,
} from "@/lib/auth";

/** Secure cookies only on HTTPS (Vercel / explicit flag). Local http must stay non-Secure. */
async function cookieSecure() {
  if (process.env.COOKIE_SECURE === "0") return false;
  if (process.env.COOKIE_SECURE === "1") return true;
  if (process.env.VERCEL === "1") return true;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? h.get("x-forwarded-protocol");
  return proto === "https";
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  if (!verifySitePassword(password)) {
    const q = new URLSearchParams({ error: "1" });
    if (next && next !== "/") q.set("next", next);
    redirect(`/login?${q.toString()}`);
  }
  const jar = await cookies();
  jar.set(SITE_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: await cookieSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
