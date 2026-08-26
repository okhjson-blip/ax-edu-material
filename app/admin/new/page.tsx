import { CategoryForm } from "@/app/admin/category-form";

export const metadata = { title: "새 카드 등록" };

export default function NewCategoryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">새 카드 등록</h1>
      <CategoryForm />
    </main>
  );
}
