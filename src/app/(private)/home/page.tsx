import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import RecentStrolls from "@/components/home/RecentStrolls";

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

        <RecentStrolls />
      </section>
    </main>
  );
}
