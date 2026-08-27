import { redirect } from "next/navigation";
import { hasSiteAccess } from "@/lib/require-site-access";

export const metadata = { title: "접근 비밀번호" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (await hasSiteAccess()) {
    redirect("/");
  }

  const { error, next } = await searchParams;

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-white px-8 py-9 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e4fd6] text-[15px] font-bold tracking-tight text-white"
          aria-hidden
        >
          AX
        </div>
        <p className="text-[15px] font-medium text-slate-500">Education</p>
      </div>

      <h1 className="mt-8 text-[28px] font-bold tracking-tight text-slate-900">
        접근 비밀번호
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
        해당 사이트는 삼성전자 상생아카데미 컨설팅센터 소속 컨설턴트 및 관련
        협력사 임직원만 접속할 수 있습니다
      </p>

      {error ? (
        <p
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          비밀번호가 올바르지 않습니다.
        </p>
      ) : null}

      <form
        action="/api/login"
        method="post"
        encType="application/x-www-form-urlencoded"
        className="mt-7 space-y-5"
      >
        <input type="hidden" name="next" value={next || "/"} />
        <label className="block text-[13px] font-semibold text-slate-700">
          비밀번호
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="접근 비밀번호를 입력하세요"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1e4fd6] focus:ring-2 focus:ring-[#1e4fd6]/20"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-[#1e4fd6] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#1843b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4fd6]"
        >
          접속
        </button>
      </form>
    </div>
  );
}
