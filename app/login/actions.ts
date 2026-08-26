"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SITE_COOKIE,
  createSessionToken,
  verifySitePassword,
} from "@/lib/auth";

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
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
