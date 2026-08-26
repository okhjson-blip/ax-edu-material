import Link from "next/link";
import { loginAction } from "@/app/admin/actions";

export const metadata = { title: "관리자 로그인" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        목록으로
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">관리자 로그인</h1>
      <p className="mt-2 text-sm text-slate-600">
        컨텐츠 등록은 관리자만 할 수 있습니다.
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          비밀번호가 올바르지 않습니다.
        </p>
      ) : null}
      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next || "/admin"} />
        <label className="block text-sm font-medium">
          비밀번호
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          로그인
        </button>
      </form>
    </main>
  );
}
