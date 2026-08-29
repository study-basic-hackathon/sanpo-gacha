import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";

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
      <AppHeader />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] lg:grid-cols-[380px_1fr]">
        <aside className="border-r border-[#d1d9d3] bg-white px-7 py-9 lg:px-9">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#6d8b74]">
            STROLL CONDITIONS
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#24483a]">散歩条件</h1>

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
                <p className="mt-1 text-xs text-[#78847c]">複数選択できます</p>
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
      </div>
    </main>
  );
}
