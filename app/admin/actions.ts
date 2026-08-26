"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  canWriteContent,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/auth";
import { deleteCategory, saveCategory } from "@/lib/content";

async function requireWrite() {
  if (!canWriteContent()) {
    throw new Error(
      "프로덕션에서는 파일을 저장할 수 없습니다. 로컬에서 수정한 뒤 GitHub에 push하세요.",
    );
  }
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  await requireWrite();
  const slug = String(formData.get("slug") ?? "").trim();
  const previousSlug = String(formData.get("previousSlug") ?? slug).trim();
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const html = String(formData.get("html") ?? "");
  const cover = formData.get("cover");

  let coverFilename: string | undefined;
  let coverBytes: Buffer | undefined;
  if (cover instanceof File && cover.size > 0) {
    coverFilename = cover.name;
    coverBytes = Buffer.from(await cover.arrayBuffer());
  }

  await saveCategory({
    slug,
    previousSlug,
    title,
    description,
    html,
    coverFilename,
    coverBytes,
  });
  redirect("/admin");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireWrite();
  const slug = String(formData.get("slug") ?? "");
  await deleteCategory(slug);
  redirect("/admin");
}
