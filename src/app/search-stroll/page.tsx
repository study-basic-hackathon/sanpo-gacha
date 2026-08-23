import Link from "next/link";

const durations = ["15分", "30分", "45分", "60分"];

const categories = [
  { name: "神社・寺", icon: "⛩️" },
  { name: "公園", icon: "🌳" },
  { name: "カフェ", icon: "☕" },
  { name: "景色", icon: "🌇" },
];

export default function SearchStrollPage() {
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

            <Link href="/history" className="transition hover:text-[#2f6544]">
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

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] lg:grid-cols-[380px_1fr]">
        <aside className="border-r border-[#d1d9d3] bg-white px-7 py-9 lg:px-9">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#6d8b74]">
            STROLL CONDITIONS
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#24483a]">
            散歩条件
          </h1>

          <section className="mt-9">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf4e9]"
              >
                ⏱️
              </span>

              <div>
                <h2 className="font-bold">散歩時間</h2>
                <p className="mt-1 text-xs text-[#78847c]">
                  今日歩ける時間を選んでください
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {durations.map((duration) => (
                <label
                  key={duration}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#cad4cc] bg-white px-4 py-3 transition hover:border-[#3c7d55] hover:bg-[#f1f7f2]"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={duration}
                    defaultChecked={duration === "30分"}
                    className="h-4 w-4 accent-[#3c7d55]"
                  />

                  <span className="font-semibold">{duration}</span>
                </label>
              ))}
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-[#cad4cc] px-4 py-3 transition hover:border-[#3c7d55] hover:bg-[#f1f7f2]">
              <input
                type="radio"
                name="duration"
                value="custom"
                className="h-4 w-4 accent-[#3c7d55]"
              />

              <span className="font-semibold">時間を指定する</span>
            </label>
          </section>

          <div className="my-8 h-px bg-[#e1e6e2]" />

          <section>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6eee3]"
              >
                🧭
              </span>

              <div>
                <h2 className="font-bold">カテゴリ</h2>
                <p className="mt-1 text-xs text-[#78847c]">
                  複数選択できます
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <label
                  key={category.name}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-[#d2dad4] px-4 py-3 transition hover:border-[#3c7d55] hover:bg-[#f1f7f2]"
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className="text-xl">
                      {category.icon}
                    </span>

                    <span className="font-semibold">{category.name}</span>
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked={category.name === "神社・寺"}
                    className="h-4 w-4 rounded accent-[#3c7d55]"
                  />
                </label>
              ))}
            </div>
          </section>

          <Link
            href="/storoll/new"
            className="mt-9 flex h-13 w-full items-center justify-center rounded-xl bg-[#3c7d55] px-6 font-semibold text-white shadow-[0_8px_24px_rgba(60,125,85,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2f6544]"
          >
            この条件で検索
          </Link>
        </aside>

        <section className="relative min-h-[650px] overflow-hidden bg-[#e8efe2]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgba(109,139,116,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(109,139,116,0.13) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div
            aria-hidden="true"
            className="absolute left-[8%] top-[20%] h-8 w-[65%] rotate-12 rounded-full bg-white/60"
          />

          <div
            aria-hidden="true"
            className="absolute right-[4%] top-[48%] h-10 w-[72%] -rotate-12 rounded-full bg-white/60"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[8%] left-[30%] h-7 w-[60%] rotate-6 rounded-full bg-white/50"
          />

          <div className="absolute left-8 top-8 rounded-2xl border border-white/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#719078]">
              CURRENT LOCATION
            </p>

            <p className="mt-1 font-bold text-[#2c4f38]">
              ● 現在地：門前仲町
            </p>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#3c7d55]/15">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#3c7d55] text-2xl text-white shadow-lg">
                📍
              </div>

              <span className="absolute -bottom-9 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-[#31533c] shadow-md">
                門前仲町
              </span>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 rounded-2xl border border-white/80 bg-white/90 px-5 py-4 text-sm text-[#627268] shadow-sm backdrop-blur">
            <p className="font-semibold text-[#31533c]">
              選択した条件から
            </p>
            <p className="mt-1">おすすめの散歩先を提案します。</p>
          </div>
        </section>
      </div>
    </main>
  );
}