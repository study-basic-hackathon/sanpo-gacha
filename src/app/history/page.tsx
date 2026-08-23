import Link from "next/link";

const strollHistory = [
  {
    id: 1,
    date: "2026/08/09",
    place: "富岡八幡宮",
    category: "神社・寺",
    duration: "40分",
    distance: "2.8 km",
    steps: "3,920歩",
  },
  {
    id: 2,
    date: "2026/08/08",
    place: "木場公園",
    category: "公園",
    duration: "35分",
    distance: "2.4 km",
    steps: "3,360歩",
  },
  {
    id: 3,
    date: "2026/08/07",
    place: "川沿いカフェ",
    category: "カフェ",
    duration: "25分",
    distance: "1.7 km",
    steps: "2,380歩",
  },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="border-b border-[#b7c2b9] bg-white">
        <div className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-8 px-8 lg:px-16">
          <Link
            href="/home"
            className="shrink-0 text-xl font-bold tracking-wide text-[#285c3d]"
          >
            🌿 さんぽガチャ
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#53675a] lg:flex">
            <Link href="/home" className="transition hover:text-[#2f6544]">
              ホーム
            </Link>

            <Link href="/history" className="text-[#2f6544]">
              散歩履歴
            </Link>

            <Link href="/favorites" className="transition hover:text-[#2f6544]">
              お気に入り
            </Link>

            <Link
              href="/statistics"
              className="transition hover:text-[#2f6544]"
            >
              統計
            </Link>

            <Link href="/settings" className="transition hover:text-[#2f6544]">
              アカウント設定
            </Link>
          </nav>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf4e9] font-bold text-[#2f6544]">
            王
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-6 py-12">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[#719078]">
            STROLL HISTORY
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#24483a]">
            散歩履歴
          </h1>
        </div>

        <div className="mt-8 flex flex-wrap items-end gap-5 rounded-2xl border border-[#c5cec7] bg-white p-5">
          <label>
            <span className="mb-2 block text-xs font-semibold text-[#69766e]">
              期間
            </span>

            <select className="h-11 min-w-36 rounded-xl border border-[#c8d2ca] bg-white px-4 text-sm outline-none focus:border-[#3c7d55]">
              <option>すべて</option>
              <option>今月</option>
              <option>過去3か月</option>
              <option>今年</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-xs font-semibold text-[#69766e]">
              カテゴリ
            </span>

            <select className="h-11 min-w-36 rounded-xl border border-[#c8d2ca] bg-white px-4 text-sm outline-none focus:border-[#3c7d55]">
              <option>すべて</option>
              <option>神社・寺</option>
              <option>公園</option>
              <option>カフェ</option>
              <option>景色</option>
            </select>
          </label>

          <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#c8d2ca] px-4 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#3c7d55]"
            />

            お気に入りのみ
          </label>

          <div className="ml-auto flex h-11 overflow-hidden rounded-xl border border-[#9aaa9e]">
            <button
              type="button"
              className="bg-[#3c7d55] px-5 text-sm font-semibold text-white"
            >
              表
            </button>

            <button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-[#52675a] transition hover:bg-[#f1f6f2]"
            >
              カレンダー
            </button>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-[#cbd5cd] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#eaf4e9]">
                <tr className="text-sm text-[#385843]">
                  <th className="px-6 py-4 font-bold">日付</th>
                  <th className="px-6 py-4 font-bold">訪れた場所</th>
                  <th className="px-6 py-4 font-bold">カテゴリ</th>
                  <th className="px-6 py-4 font-bold">時間</th>
                  <th className="px-6 py-4 font-bold">距離</th>
                  <th className="px-6 py-4 font-bold">歩数</th>
                  <th className="px-6 py-4 text-center font-bold">詳細</th>
                </tr>
              </thead>

              <tbody>
                {strollHistory.map((stroll) => (
                  <tr
                    key={stroll.id}
                    className="border-t border-[#dce3de] text-sm transition hover:bg-[#fafcf9]"
                  >
                    <td className="whitespace-nowrap px-6 py-5 text-[#69766e]">
                      {stroll.date}
                    </td>

                    <td className="px-6 py-5 font-bold text-[#294b35]">
                      {stroll.place}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-[#f2f6f2] px-3 py-1 text-xs text-[#52675a]">
                        {stroll.category}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5">
                      {stroll.duration}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5">
                      {stroll.distance}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5">
                      {stroll.steps}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <Link
                        href={`/history/${stroll.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-[#829789] px-5 text-xs font-semibold text-[#405a48] transition hover:bg-[#eef4ef]"
                      >
                        見る
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-right text-sm text-[#7a867e]">
          全3件の散歩記録
        </p>
      </section>
    </main>
  );
}
