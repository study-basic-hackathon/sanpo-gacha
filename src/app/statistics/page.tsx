import Link from "next/link";

const weeklySteps = [
  { day: "月", steps: 4200 },
  { day: "火", steps: 6100 },
  { day: "水", steps: 4700 },
  { day: "木", steps: 2800 },
  { day: "金", steps: 7200 },
  { day: "土", steps: 5100 },
  { day: "日", steps: 6400 },
];

const calendarDays = [
  { day: 1, achieved: false },
  { day: 2, achieved: false },
  { day: 3, achieved: true },
  { day: 4, achieved: false },
  { day: 5, achieved: true },
  { day: 6, achieved: false },
  { day: 7, achieved: true },
  { day: 8, achieved: false },
  { day: 9, achieved: false },
  { day: 10, achieved: true },
  { day: 11, achieved: false },
  { day: 12, achieved: false },
  { day: 13, achieved: false },
  { day: 14, achieved: false },
  { day: 15, achieved: true },
  { day: 16, achieved: false },
  { day: 17, achieved: false },
  { day: 18, achieved: true },
  { day: 19, achieved: false },
  { day: 20, achieved: false },
  { day: 21, achieved: false },
  { day: 22, achieved: false },
  { day: 23, achieved: false },
  { day: 24, achieved: false },
  { day: 25, achieved: true },
  { day: 26, achieved: false },
  { day: 27, achieved: false },
  { day: 28, achieved: false },
  { day: 29, achieved: true },
  { day: 30, achieved: false },
  { day: 31, achieved: false },
];

export default function StatisticsPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="border-b border-[#d7e1d8] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/home"
            className="text-lg font-bold tracking-wide text-[#285c3d]"
          >
            🌿 さんぽガチャ
          </Link>

          <nav className="flex items-center gap-7 text-sm font-medium text-[#42584a]">
            <Link href="/home">ホーム</Link>
            <Link href="/history">散歩履歴</Link>
            <Link href="/favorites">お気に入り</Link>
            <Link href="/statistics" className="text-[#2f7d50]">
              統計
            </Link>
            <Link href="/settings">アカウント設定</Link>
          </nav>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f2e8] font-bold text-[#285c3d]">
            王
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
              YOUR STROLL RECORD
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#173f2d]">
              あなたの散歩記録
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#617068]">
              毎日の散歩を振り返ってみましょう。
            </p>
          </div>

          <div className="rounded-xl border border-[#d7e1d8] bg-white px-5 py-3 text-sm shadow-sm">
            <span className="text-[#718078]">今月の目標：</span>
            <span className="font-bold text-[#285c3d]">
              週3回・合計20km
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard
            label="今月の散歩"
            value="8"
            unit="回"
            icon="👟"
          />

          <StatCard
            label="歩いた距離"
            value="18.4"
            unit="km"
            icon="📍"
          />

          <StatCard
            label="合計歩数"
            value="26,420"
            unit="歩"
            icon="🌿"
          />
        </section>

        <section className="mt-6 rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#214832]">
                今月の目標
              </h2>

              <p className="mt-1 text-sm text-[#6b796f]">
                あと1.6kmで目標達成です。
              </p>
            </div>

            <p className="text-sm font-bold text-[#2f7350]">
              18.4 / 20 km
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e6eee6]">
            <div className="h-full w-[92%] rounded-full bg-[#4c9365]" />
          </div>

          <div className="mt-2 flex justify-between text-xs text-[#7a877e]">
            <span>0 km</span>
            <span>達成率 92%</span>
            <span>20 km</span>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-[#214832]">
                週間の歩数
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                今週の歩数を曜日ごとに表示しています。
              </p>
            </div>

            <div className="mt-8 grid grid-cols-[42px_1fr] gap-4">
              <div className="flex h-64 flex-col justify-between pb-7 text-right text-xs text-[#829087]">
                <span>8,000</span>
                <span>6,000</span>
                <span>4,000</span>
                <span>2,000</span>
                <span>0</span>
              </div>

              <div className="relative h-64">
                <div className="absolute inset-x-0 top-0 border-t border-[#e5ebe5]" />
                <div className="absolute inset-x-0 top-[25%] border-t border-[#e5ebe5]" />
                <div className="absolute inset-x-0 top-[50%] border-t border-[#e5ebe5]" />
                <div className="absolute inset-x-0 top-[75%] border-t border-[#e5ebe5]" />
                <div className="absolute inset-x-0 bottom-7 border-t border-[#d7e1d8]" />

                <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around gap-3">
                  {weeklySteps.map((item) => (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-2 text-xs font-semibold text-[#456550]">
                        {item.steps.toLocaleString()}
                      </span>

                      <div className="flex h-[190px] w-full max-w-12 items-end">
                        <div
                          className="w-full rounded-t-lg bg-[#72a982]"
                          style={{
                            height: `${(item.steps / 8000) * 100}%`,
                          }}
                        />
                      </div>

                      <span className="mt-2 text-xs font-medium text-[#65746a]">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#214832]">
                  達成カレンダー
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  散歩した日に印がつきます。
                </p>
              </div>

              <p className="text-sm font-bold text-[#315f42]">
                2026年8月
              </p>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-medium text-[#718078]">
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span className="text-[#4d7290]">土</span>
              <span className="text-[#b76767]">日</span>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {calendarDays.map((item) => (
                <div
                  key={item.day}
                  className={`relative flex aspect-square items-center justify-center rounded-full text-sm ${
                    item.achieved
                      ? "bg-[#4c9365] font-bold text-white"
                      : "text-[#53655a]"
                  }`}
                >
                  {item.day}

                  {item.achieved && (
                    <span className="sr-only">散歩達成</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 text-xs text-[#6c7a70]">
              <span className="h-3 w-3 rounded-full bg-[#4c9365]" />
              <span>散歩をした日</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
}) {
  return (
    <article className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6d7b72]">{label}</p>

          <p className="mt-3 text-3xl font-bold text-[#24533a]">
            {value}
            <span className="ml-1 text-base font-semibold">{unit}</span>
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf4ed] text-xl">
          {icon}
        </div>
      </div>
    </article>
  );
}
