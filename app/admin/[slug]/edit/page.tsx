import { notFound } from "next/navigation";
import { CategoryForm } from "@/app/admin/category-form";
import { getCategory, readCategoryHtml } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }
  const html = await readCategoryHtml(slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">카드 수정</h1>
      <CategoryForm
        previousSlug={category.slug}
        defaultValues={{
          slug: category.slug,
          title: category.title,
          description: category.description,
          html,
        }}
        coverRequired={false}
      />
    </main>
  );
}
