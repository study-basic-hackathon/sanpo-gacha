import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";

const strollHistory = [
  {
    id: 1,
    icon: "⛩️",
    place: "富岡八幡宮",
    duration: "32分",
    distance: "2.3 km",
    category: "神社",
    date: "8月18日",
    background: "linear-gradient(135deg, #dcebdc, #b9d5bd)",
  },
  {
    id: 2,
    icon: "🌳",
    place: "木場公園",
    duration: "45分",
    distance: "3.1 km",
    category: "公園",
    date: "8月15日",
    background: "linear-gradient(135deg, #e8f1d8, #c8dda7)",
  },
  {
    id: 3,
    icon: "☕",
    place: "川沿いカフェ",
    duration: "24分",
    distance: "1.8 km",
    category: "カフェ",
    date: "8月10日",
    background: "linear-gradient(135deg, #f3e7d5, #dec6a5)",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader active="home" />

      <section className="bg-[#eaf4e9] px-6 py-16">
        <div className="mx-auto max-w-[1200px] text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#4f765d]">
            GOOD AFTERNOON, 王さん
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#254d35] sm:text-4xl lg:text-5xl">
            今日、どこへ散歩に行きますか？
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#53675a]">
            時間や気分に合わせて、近くの散歩先を見つけましょう。
          </p>

          <Link
            href="/search-stroll"
            className="mx-auto mt-8 flex h-12 w-fit items-center justify-center rounded-xl bg-[#3c7d55] px-8 font-semibold text-white transition hover:bg-[#2f6544]"
          >
            散歩先を探す
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.15em] text-[#719078]">
              RECENT STROLLS
            </p>

            <h2 className="mt-2 text-2xl font-bold">散歩履歴</h2>
          </div>

          <Link
            href="/history"
            className="flex h-11 w-fit items-center justify-center rounded-xl border border-[#829789] bg-white px-6 text-sm font-semibold text-[#415b49] transition hover:bg-[#eef4ef]"
          >
            散歩履歴一覧を見る
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {strollHistory.map((stroll) => (
            <article
              key={stroll.id}
              className="overflow-hidden rounded-2xl border border-[#c5cec7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="flex h-36 items-center justify-center text-5xl"
                style={{ background: stroll.background }}
              >
                <span aria-hidden="true">{stroll.icon}</span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">{stroll.place}</h3>

                  <span className="shrink-0 text-xs text-[#7a877e]">
                    {stroll.date}
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#607066]">
                  {stroll.duration}・{stroll.distance}・{stroll.category}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-[#6e7d73]">今月の散歩</p>
            <p className="mt-2 text-2xl font-bold text-[#2f6544]">8回</p>
          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-[#6e7d73]">合計距離</p>
            <p className="mt-2 text-2xl font-bold text-[#2f6544]">12.4 km</p>
          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-[#6e7d73]">合計時間</p>
            <p className="mt-2 text-2xl font-bold text-[#2f6544]">3時間20分</p>
          </div>
        </div>
      </section>
    </main>
  );
}