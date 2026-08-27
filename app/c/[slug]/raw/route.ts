import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  categorySlugFromRequest,
  getCategory,
  prepareCategoryHtml,
  readCategoryHtml,
} from "@/lib/content";
import { SITE_COOKIE, isValidSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const jar = await cookies();
  if (!isValidSessionToken(jar.get(SITE_COOKIE)?.value)) {
    return Response.redirect(new URL("/login", request.url), 307);
  }

  const { slug: paramSlug } = await params;
  const slug = categorySlugFromRequest(request, paramSlug, "raw");
  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }
  const html = prepareCategoryHtml(await readCategoryHtml(slug));
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
