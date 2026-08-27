import Link from "next/link";
import { publicCoverUrl, readRegistry } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { categories } = await readRegistry();

  return (
    <main className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home-bg.jpg?v=20260826c')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-slate-950/35" aria-hidden />

      <div className="relative z-10 grid min-h-screen w-full grid-rows-3">
        <div aria-hidden />
        <div className="row-span-2 flex items-center justify-center px-4 pb-10 pt-2">
          {categories.length === 0 ? (
            <p className="rounded-xl border border-white/30 bg-white/80 p-8 text-slate-700">
              등록된 카테고리가 없습니다.
            </p>
          ) : (
            <ul className="grid w-[62.4%] min-w-[256px] max-w-5xl translate-y-10 grid-cols-3 gap-3">
              {categories.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/c/${item.slug}`}
                    className="@container group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-white/20 shadow-xl ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${publicCoverUrl(item.slug, item.cover)}?v=20260827a`}
                      alt={item.title}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                    />
                    {item.showCaption !== false ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 px-[6%] text-center text-[clamp(0.7rem,6cqi,1.12rem)]">
                        <h2 className="font-semibold leading-snug text-white drop-shadow">
                          {item.title}
                        </h2>
                        {item.description ? (
                          <p className="mt-[0.3em] line-clamp-2 text-[70%] leading-snug text-white/90 drop-shadow">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
