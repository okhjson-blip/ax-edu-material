import { notFound } from "next/navigation";
import { getCategory } from "@/lib/content";
import { requireSiteAccess } from "@/lib/require-site-access";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    return { title: "페이지를 찾을 수 없습니다" };
  }
  return { title: category.title, description: category.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSiteAccess();
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }

  // Real document URL (not srcDoc) so <base> / absolute asset paths resolve reliably.
  return (
    <iframe
      title={category.title}
      src={`/c/${slug}/raw`}
      className="block h-screen w-full border-0 bg-white"
    />
  );
}
