import Link from "next/link";
import { HomeScrollTop } from "./home-scroll-top";
import { publicCoverUrl, readRegistry } from "@/lib/content";
import { requireSiteAccess } from "@/lib/require-site-access";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireSiteAccess();
  const { categories } = await readRegistry();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <HomeScrollTop />
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home-bg.jpg?v=20260826c')" }}
        aria-hidden
      />
      <div className="fixed inset-0 bg-slate-950/35" aria-hidden />

      <p className="fixed right-3 top-2 z-20 text-[22px] font-light tracking-wide text-white/70 drop-shadow">
        All rights reserved. Created and owned by Heejung Son
      </p>

      <div className="relative z-10 flex min-h-screen w-full justify-center px-[4vw] pb-8 pt-[42vh]">
          {categories.length === 0 ? (
            <p className="rounded-xl border border-white/30 bg-white/80 p-8 text-slate-700">
              등록된 카테고리가 없습니다.
            </p>
          ) : (
            <ul className="grid w-[min(62.4vw,1200px)] min-w-[256px] grid-cols-3 gap-3 self-start">
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
                        <h2 className="text-[1.2em] font-semibold leading-snug text-white drop-shadow">
                          {item.title}
                        </h2>
                        {item.description ? (
                          <p className="mt-[0.3em] line-clamp-2 break-keep wrap-break-word text-[70%] leading-snug text-white/90 drop-shadow">
                            {item.description.split("\n").flatMap((line, i) =>
                              i === 0 ? [line] : [<br key={i} />, line],
                            )}
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
    </main>
  );
}
