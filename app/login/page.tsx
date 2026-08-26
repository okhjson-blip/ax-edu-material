import { loginAction } from "@/app/login/actions";

export const metadata = { title: "접속 확인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">접속 확인</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
        해당 사이트는 삼성전자 상생아카데미 컨설팅센터 소속 컨설턴트 및 관련
        협력사 임직원만 접속할 수 있습니다
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          비밀번호가 올바르지 않습니다.
        </p>
      ) : null}
      <form action={loginAction} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next || "/"} />
        <label className="block text-sm font-medium text-slate-800">
          비밀번호
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none ring-slate-400 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800"
        >
          입장
        </button>
      </form>
    </main>
  );
}
