import { notFound } from "next/navigation";
import { getCategory, publicCoverUrl } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }
  return Response.redirect(
    new URL(publicCoverUrl(slug, category.cover), request.url),
    308,
  );
}
