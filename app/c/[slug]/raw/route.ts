import { notFound } from "next/navigation";
import {
  getCategory,
  prepareCategoryHtml,
  readCategoryHtml,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }
  const html = prepareCategoryHtml(await readCategoryHtml(slug));
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
