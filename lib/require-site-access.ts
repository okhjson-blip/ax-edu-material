import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SITE_COOKIE, isValidSessionToken } from "@/lib/auth";

/** Server-side gate (defense in depth alongside proxy.ts). */
export async function requireSiteAccess() {
  const jar = await cookies();
  if (!isValidSessionToken(jar.get(SITE_COOKIE)?.value)) {
    redirect("/login");
  }
}

export async function hasSiteAccess() {
  const jar = await cookies();
  return isValidSessionToken(jar.get(SITE_COOKIE)?.value);
}
