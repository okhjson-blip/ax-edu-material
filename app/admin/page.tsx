import Link from "next/link";
import { deleteCategoryAction, logoutAction } from "@/app/admin/actions";
import { canWriteContent } from "@/lib/auth";
import { readRegistry } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "관리자" };

export default async function AdminHomePage() {
  const { categories } = await readRegistry();
  const writable = canWriteContent();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        목록으로
      </Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">카테고리 관리</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            새 카드 등록
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-500">
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {!writable ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          배포 환경에서는 저장이 비활성화되어 있습니다. 로컬에서 HTML을 수정한 뒤
          GitHub에 push하세요.
        </p>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          저장하면 <code>content/</code> 폴더가 변경됩니다. 반영하려면 commit 후
          push하세요.
        </p>
      )}

      <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {categories.length === 0 ? (
          <li className="p-6 text-slate-500">등록된 카드가 없습니다.</li>
        ) : (
          categories.map((item) => (
            <li
              key={item.slug}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-500">/{item.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/c/${item.slug}`}
                  className="text-sm text-blue-700 hover:underline"
                >
                  보기
                </Link>
                <Link
                  href={`/admin/${item.slug}/edit`}
                  className="text-sm text-slate-700 hover:underline"
                >
                  수정
                </Link>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="slug" value={item.slug} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
