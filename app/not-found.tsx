import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-slate-600">요청한 카테고리가 없습니다.</p>
      <Link href="/" className="mt-6 inline-block text-blue-700 hover:underline">
        메인으로
      </Link>
    </main>
  );
}
